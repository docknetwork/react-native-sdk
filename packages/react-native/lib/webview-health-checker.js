export class WebViewHealthChecker {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
    this.healthCheckInterval = null;
    this.lastPongTimestamp = Date.now();
    this.isHealthy = true;
    this.onHealthChange = null;
    this.pingTimeouts = new Map();
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
    
    this.healthCheckInterval = setInterval(() => {
      if (!this.isPaused) {
        this.sendPing();
      }
    }, this.config.pingInterval);
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Clear all pending timeouts
    this.pingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pingTimeouts.clear();
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
    
    // Send ping to webview
    this.eventHandler._dispatchEvent('health-check-ping', { 
      id: pingId,
      timestamp: Date.now()
    });
    
    // Set timeout for pong response
    const timeoutId = setTimeout(() => {
      this.pingTimeouts.delete(pingId);
      this.setHealthStatus(false, 'Ping timeout');
    }, this.config.pongTimeout);
    
    this.pingTimeouts.set(pingId, timeoutId);
  }

  handlePong(data) {
    const { id, timestamp } = data.body;
    
    // Clear timeout for this ping
    if (this.pingTimeouts.has(id)) {
      clearTimeout(this.pingTimeouts.get(id));
      this.pingTimeouts.delete(id);
    }
    
    this.lastPongTimestamp = Date.now();
    const latency = this.lastPongTimestamp - timestamp;
    
    this.setHealthStatus(true, 'Healthy', { latency });
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
      console.error('Max recovery attempts reached for WebView');
      return;
    }

    this.recoveryAttempts++;
    console.log(`Attempting WebView recovery (attempt ${this.recoveryAttempts}/${this.config.maxRecoveryAttempts})`);

    setTimeout(() => {
      this.eventHandler.reloadWebViews();
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