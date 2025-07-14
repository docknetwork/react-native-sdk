let instanceCounter = 0;
// Global shared ping timeouts map across all instances
const globalPingTimeouts = new Map();

export class WebViewHealthChecker {
  constructor(eventHandler) {
    this.instanceId = ++instanceCounter;
    console.log(`[WebViewHealthChecker] Creating instance #${this.instanceId}`);
    
    this.eventHandler = eventHandler;
    this.healthCheckInterval = null;
    this.lastPongTimestamp = Date.now();
    this.isHealthy = true;
    this.onHealthChange = null;
    this.pingTimeouts = globalPingTimeouts; // Use shared map
    
    // Override delete method to debug what's deleting entries
    const originalDelete = this.pingTimeouts.delete.bind(this.pingTimeouts);
    const originalClear = this.pingTimeouts.clear.bind(this.pingTimeouts);
    
    this.pingTimeouts.delete = (key) => {
      console.log(`[WebViewHealthChecker #${this.instanceId}] DELETE called for ping: ${key}`);
      console.trace();
      return originalDelete(key);
    };
    
    this.pingTimeouts.clear = () => {
      console.log(`[WebViewHealthChecker #${this.instanceId}] CLEAR called on map`);
      console.trace();
      return originalClear();
    };
    
    this.config = {
      pingInterval: 5000,
      pongTimeout: 3000,
      maxRecoveryAttempts: 3,
      recoveryDelay: 1000
    };
    this.recoveryAttempts = 0;
    this.isPaused = false;
  }

  start(config = {}) {
    this.config = { ...this.config, ...config };
    this.stop(); // Clear any existing interval
    
    console.log('[WebViewHealthChecker] Starting health check with config:', this.config);
    
    // Wait a bit before starting health checks to ensure WebView is fully ready
    setTimeout(() => {
      if (!this.healthCheckInterval) { // Only start if not already stopped
        console.log('[WebViewHealthChecker] Starting periodic health checks');
        this.healthCheckInterval = setInterval(() => {
          if (!this.isPaused) {
            this.sendPing();
          }
        }, this.config.pingInterval);
      }
    }, 2000); // Wait 2 seconds before starting
  }

  stop() {
    console.log(`[WebViewHealthChecker] Stopping health checks, clearing ${this.pingTimeouts.size} timeouts`);
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Clear all pending timeouts
    this.pingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pingTimeouts.clear();
    
    console.log(`[WebViewHealthChecker] Stopped - map size now: ${this.pingTimeouts.size}`);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.checkHealthNow(); // Immediate check on resume
  }

  sendPing() {
    const pingId = `ping-${Date.now()}-${Math.random()}`;
    const timestamp = Date.now();
    
    console.log(`[WebViewHealthChecker #${this.instanceId}] Sending ping: ${pingId}`);
    
    // Set timeout for pong response
    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      console.log(`[WebViewHealthChecker] TIMEOUT FIRED for: ${pingId} after ${elapsed}ms (expected: ${this.config.pongTimeout}ms), map has ping: ${this.pingTimeouts.has(pingId)}`);
      // Double-check that this ping hasn't been handled already
      if (this.pingTimeouts.has(pingId)) {
        console.log(`[WebViewHealthChecker] Ping timeout for: ${pingId}`);
        this.pingTimeouts.delete(pingId);
        this.setHealthStatus(false, 'Ping timeout');
      } else {
        console.log(`[WebViewHealthChecker] Timeout fired but ping ${pingId} not in map`);
      }
    }, this.config.pongTimeout);
    
    console.log(`[WebViewHealthChecker] Set timeout for ${this.config.pongTimeout}ms for ping: ${pingId}`);

    // Store timeout BEFORE sending ping to avoid race condition
    this.pingTimeouts.set(pingId, timeoutId);
    console.log(`[WebViewHealthChecker] Stored timeout for ping: ${pingId}, map size: ${this.pingTimeouts.size}`);
    
    // Add debug to detect if entry gets deleted unexpectedly
    setTimeout(() => {
      if (!this.pingTimeouts.has(pingId)) {
        console.log(`[WebViewHealthChecker] WARNING: Ping ${pingId} was deleted from map unexpectedly after 1ms!`);
      }
    }, 1);
    
    setTimeout(() => {
      if (!this.pingTimeouts.has(pingId)) {
        console.log(`[WebViewHealthChecker] WARNING: Ping ${pingId} was deleted from map unexpectedly after 5ms!`);
      }
    }, 5);

    // Send ping to webview
    this.eventHandler._dispatchEvent('health-check-ping', { 
      id: pingId,
      timestamp: timestamp
    });
  }

  handlePong(data) {
    const { id, timestamp } = data.body;
    
    console.log(`[WebViewHealthChecker #${this.instanceId}] Received pong: ${id}, map size: ${this.pingTimeouts.size}`);
    console.log(`[WebViewHealthChecker #${this.instanceId}] Map contents:`, Array.from(this.pingTimeouts.keys()));
    
    // Clear timeout for this ping immediately
    if (this.pingTimeouts.has(id)) {
      console.log(`[WebViewHealthChecker] Clearing timeout for: ${id}`);
      clearTimeout(this.pingTimeouts.get(id));
      this.pingTimeouts.delete(id);
      
      this.lastPongTimestamp = Date.now();
      const latency = this.lastPongTimestamp - timestamp;
      
      this.setHealthStatus(true, 'Healthy', { latency });
    } else {
      console.log(`[WebViewHealthChecker] Pong received for unknown ping: ${id}`);
      console.log(`[WebViewHealthChecker] Map size: ${this.pingTimeouts.size}`);
      console.log(`[WebViewHealthChecker] Map keys:`, Array.from(this.pingTimeouts.keys()));
    }
  }

  setHealthStatus(isHealthy, reason = '', metadata = {}) {
    const previousStatus = this.isHealthy;
    this.isHealthy = isHealthy;
    
    if (previousStatus !== isHealthy) {
      console.log(`WebView health status changed: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'} - ${reason}`);
      
      if (!isHealthy) {
        this.attemptRecovery();
      } else {
        this.recoveryAttempts = 0;
      }
      
      this.onHealthChange?.(isHealthy, reason, metadata);
    }
  }

  attemptRecovery() {
    if (this.recoveryAttempts >= this.config.maxRecoveryAttempts) {
      console.error('Max recovery attempts reached for WebView - stopping health checks');
      this.stop(); // Stop health checks to prevent infinite loop
      return;
    }

    this.recoveryAttempts++;
    console.log(`Attempting WebView recovery (attempt ${this.recoveryAttempts}/${this.config.maxRecoveryAttempts})`);

    // Stop health checks during recovery
    this.stop();

    setTimeout(() => {
      this.eventHandler.reloadWebViews();
      // Health checks will restart when onLoadEnd fires again
    }, this.config.recoveryDelay);
  }

  checkHealthNow() {
    this.sendPing();
  }

  getStatus() {
    return {
      isHealthy: this.isHealthy,
      lastPongTimestamp: this.lastPongTimestamp,
      recoveryAttempts: this.recoveryAttempts
    };
  }
}