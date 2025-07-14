import { WebViewHealthChecker } from './webview-health-checker';

// Mock timers for controlled testing
jest.useFakeTimers();

describe('WebViewHealthChecker', () => {
  let healthChecker;
  let mockEventHandler;
  let onHealthChange;

  beforeEach(() => {
    // Reset all mocks and timers
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Mock event handler
    mockEventHandler = {
      _dispatchEvent: jest.fn(),
      reloadWebViews: jest.fn()
    };

    // Mock health change callback
    onHealthChange = jest.fn();

    // Create health checker instance
    healthChecker = new WebViewHealthChecker(mockEventHandler);
    healthChecker.onHealthChange = onHealthChange;
  });

  afterEach(() => {
    healthChecker.stop();
  });

  describe('Basic functionality', () => {
    test('should initialize with healthy status', () => {
      expect(healthChecker.isHealthy).toBe(true);
      expect(healthChecker.recoveryAttempts).toBe(0);
    });

    test('should start health checks with default config', () => {
      healthChecker.start();
      
      // Fast-forward past the initial 2-second delay
      jest.advanceTimersByTime(2000);
      
      // Should have started periodic checks
      expect(healthChecker.healthCheckInterval).toBeTruthy();
    });

    test('should send ping with correct format', () => {
      healthChecker.sendPing();
      
      expect(mockEventHandler._dispatchEvent).toHaveBeenCalledWith(
        'health-check-ping',
        expect.objectContaining({
          id: expect.stringMatching(/^ping-\d+-0\.\d+$/),
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Ping-Pong mechanism', () => {
    test('should handle successful pong response', () => {
      // Send a ping
      healthChecker.sendPing();
      
      // Get the ping ID from the mock call
      const pingCall = mockEventHandler._dispatchEvent.mock.calls[0];
      const pingData = pingCall[1];
      const pingId = pingData.id;
      
      // Simulate pong response
      const pongData = {
        body: {
          id: pingId,
          timestamp: pingData.timestamp
        }
      };
      
      healthChecker.handlePong(pongData);
      
      // Should remain healthy
      expect(healthChecker.isHealthy).toBe(true);
      expect(healthChecker.pingTimeouts.has(pingId)).toBe(false);
    });

    test('should trigger timeout when no pong received', () => {
      // Send a ping
      healthChecker.sendPing();
      
      // Fast-forward past the pong timeout
      jest.advanceTimersByTime(3000);
      
      // Should be marked as unhealthy
      expect(healthChecker.isHealthy).toBe(false);
      expect(onHealthChange).toHaveBeenCalledWith(false, 'Ping timeout', {});
    });

    test('should handle race condition - pong arrives just before timeout', () => {
      // Send a ping
      healthChecker.sendPing();
      
      // Get the ping data
      const pingCall = mockEventHandler._dispatchEvent.mock.calls[0];
      const pingData = pingCall[1];
      const pingId = pingData.id;
      
      // Fast-forward to just before timeout (2999ms)
      jest.advanceTimersByTime(2999);
      
      // Send pong response at the last moment
      const pongData = {
        body: {
          id: pingId,
          timestamp: pingData.timestamp
        }
      };
      
      healthChecker.handlePong(pongData);
      
      // Advance the remaining 1ms to see if timeout still fires
      jest.advanceTimersByTime(1);
      
      // Should remain healthy (pong should win the race)
      expect(healthChecker.isHealthy).toBe(true);
      // The health status was already true, so onHealthChange might not be called
      // Let's just check that it's healthy
    });

    test('should handle race condition - timeout fires despite pong received', () => {
      console.log = jest.fn(); // Mock console.log to capture logs
      
      // Send a ping
      healthChecker.sendPing();
      
      // Get the ping data
      const pingCall = mockEventHandler._dispatchEvent.mock.calls[0];
      const pingData = pingCall[1];
      const pingId = pingData.id;
      
      // Simulate the race condition by manually triggering both events
      const pongData = {
        body: {
          id: pingId,
          timestamp: pingData.timestamp
        }
      };
      
      // Process pong first
      healthChecker.handlePong(pongData);
      expect(healthChecker.isHealthy).toBe(true);
      
      // Then advance time to trigger timeout
      jest.advanceTimersByTime(3000);
      
      // The timeout should NOT change the health status because ping was already handled
      expect(healthChecker.isHealthy).toBe(true);
      
      // Check that timeout log didn't fire (because ping was already handled)
      const timeoutLogs = console.log.mock.calls.filter(call => 
        call[0] && call[0].includes('Ping timeout for:')
      );
      expect(timeoutLogs).toHaveLength(0);
    });

    test('should handle multiple concurrent pings', () => {
      // Send multiple pings
      healthChecker.sendPing();
      healthChecker.sendPing();
      healthChecker.sendPing();
      
      expect(mockEventHandler._dispatchEvent).toHaveBeenCalledTimes(3);
      expect(healthChecker.pingTimeouts.size).toBe(3);
      
      // Get all ping IDs
      const pingIds = mockEventHandler._dispatchEvent.mock.calls.map(call => call[1].id);
      
      // Respond to first ping
      healthChecker.handlePong({
        body: {
          id: pingIds[0],
          timestamp: Date.now()
        }
      });
      
      expect(healthChecker.pingTimeouts.size).toBe(2);
      expect(healthChecker.isHealthy).toBe(true);
      
      // Let other pings timeout
      jest.advanceTimersByTime(3000);
      
      // Should be unhealthy due to remaining timeouts
      expect(healthChecker.isHealthy).toBe(false);
    });
  });

  describe('Recovery mechanism', () => {
    test('should attempt recovery on health failure', () => {
      // First need to start health checks to have an interval to stop
      healthChecker.start();
      jest.advanceTimersByTime(2000); // Past initial delay
      
      // Trigger health failure - this should trigger recovery
      healthChecker.setHealthStatus(false, 'Test failure');
      
      expect(healthChecker.recoveryAttempts).toBe(1);
      
      // Fast-forward past recovery delay to trigger reload
      jest.advanceTimersByTime(1000);
      expect(mockEventHandler.reloadWebViews).toHaveBeenCalled();
    });

    test('should stop after max recovery attempts', () => {
      // Start health checks first
      healthChecker.start();
      jest.advanceTimersByTime(2000);
      
      // Trigger multiple failures - only health status changes should increment attempts
      const originalHealthy = healthChecker.isHealthy;
      
      // First failure
      healthChecker.setHealthStatus(false, 'Test failure 1');
      expect(healthChecker.recoveryAttempts).toBe(1);
      
      // Advance past recovery delay and simulate restart
      jest.advanceTimersByTime(1000);
      
      // Second failure
      healthChecker.setHealthStatus(false, 'Test failure 2'); 
      expect(healthChecker.recoveryAttempts).toBe(2);
      
      // Advance past recovery delay
      jest.advanceTimersByTime(1000);
      
      // Third failure
      healthChecker.setHealthStatus(false, 'Test failure 3');
      expect(healthChecker.recoveryAttempts).toBe(3);
      
      // Advance past recovery delay
      jest.advanceTimersByTime(1000);
      
      // Fourth failure should stop health checks
      healthChecker.setHealthStatus(false, 'Test failure 4');
      
      expect(healthChecker.healthCheckInterval).toBe(null);
    });
  });

  describe('Pause and resume', () => {
    test('should pause and resume health checks', () => {
      healthChecker.start();
      jest.advanceTimersByTime(2000); // Past initial delay
      
      // Pause
      healthChecker.pause();
      expect(healthChecker.isPaused).toBe(true);
      
      // Advance time - no pings should be sent while paused
      const initialCallCount = mockEventHandler._dispatchEvent.mock.calls.length;
      jest.advanceTimersByTime(10000);
      expect(mockEventHandler._dispatchEvent.mock.calls.length).toBe(initialCallCount);
      
      // Resume
      healthChecker.resume();
      expect(healthChecker.isPaused).toBe(false);
      
      // Should send immediate ping on resume
      expect(mockEventHandler._dispatchEvent.mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  describe('Configuration', () => {
    test('should use custom config', () => {
      const customConfig = {
        pingInterval: 10000,
        pongTimeout: 5000,
        maxRecoveryAttempts: 5
      };
      
      healthChecker.start(customConfig);
      
      expect(healthChecker.config).toEqual(expect.objectContaining(customConfig));
    });
  });

  describe('Edge cases', () => {
    test('should handle pong for unknown ping ID', () => {
      // Send pong for non-existent ping
      healthChecker.handlePong({
        body: {
          id: 'non-existent-ping',
          timestamp: Date.now()
        }
      });
      
      // Should not crash or change health status
      expect(healthChecker.isHealthy).toBe(true);
    });

    test('should clear all timeouts on stop', () => {
      // Send multiple pings
      healthChecker.sendPing();
      healthChecker.sendPing();
      
      expect(healthChecker.pingTimeouts.size).toBe(2);
      
      // Stop health checker
      healthChecker.stop();
      
      expect(healthChecker.pingTimeouts.size).toBe(0);
      expect(healthChecker.healthCheckInterval).toBe(null);
    });

    test('should handle rapid start/stop cycles', () => {
      healthChecker.start();
      healthChecker.stop();
      healthChecker.start();
      healthChecker.stop();
      
      expect(healthChecker.healthCheckInterval).toBe(null);
      expect(healthChecker.pingTimeouts.size).toBe(0);
    });
  });
});