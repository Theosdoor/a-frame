/* global AFRAME */

AFRAME.registerComponent('glucose-monitor', {
  schema: {
    status: { type: 'string', default: 'disconnected' },
    value: { type: 'number', default: -1 },
    minHealthy: { type: 'number', default: 0.12 },
    maxHealthy: { type: 'number', default: 0.15 }
  },

  init: function () {
    const el = this.el;
    
    // Create monitor container with proper rounded corners and shadow
    const backgroundPlane = document.createElement('a-entity');
    backgroundPlane.setAttribute('geometry', {
      primitive: 'plane',
      width: 1.5,
      height: 1
    });
    backgroundPlane.setAttribute('material', {
      color: '#ffffff',
      opacity: 0.95,
      shader: 'flat'
    });
    backgroundPlane.setAttribute('position', '0 0 0.01');
    
    // Add shadow with the style from CSS (box-shadow: 0 0 10px rgba(0, 0, 0, 0.1))
    const shadowPlane = document.createElement('a-entity');
    shadowPlane.setAttribute('geometry', {
      primitive: 'plane',
      width: 1.55,
      height: 1.05
    });
    shadowPlane.setAttribute('material', {
      color: '#000000',
      opacity: 0.1,
      shader: 'flat'
    });
    shadowPlane.setAttribute('position', '0 -0.01 0');
    
    el.appendChild(shadowPlane);
    el.appendChild(backgroundPlane);
    
    // Create text entities
    this.createTextEntities();
    
    // Initialize arrow indicators (for high/low glucose)
    this.createArrowIndicators();
    
    // Initialize tracking variables
    this.notificationShown = false;
    this.currentGlucoseState = 'normal'; // 'normal', 'low', or 'high'
    this.activeNotification = null;
    this.normalGlucoseTimerId = null;
    
    this.updateDisplay();
  },
  
  createTextEntities: function() {
    const el = this.el;
    
    // Status text - matches the CSS .status class (color: #666, font-size: 14px)
    this.statusTextEntity = document.createElement('a-text');
    this.statusTextEntity.setAttribute('value', 'Device status: disconnected.');
    this.statusTextEntity.setAttribute('color', '#666666');
    this.statusTextEntity.setAttribute('position', '-0.65 0.3 0.02');
    this.statusTextEntity.setAttribute('width', '1.4');
    this.statusTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.statusTextEntity.setAttribute('anchor', 'left');
    this.statusTextEntity.setAttribute('baseline', 'center');
    el.appendChild(this.statusTextEntity);
    
    // Glucose level text - matches the CSS .glucose-level class
    this.glucoseTextEntity = document.createElement('a-text');
    this.glucoseTextEntity.setAttribute('value', 'Sweat glucose: -.-- mMol');
    this.glucoseTextEntity.setAttribute('color', '#000000');
    this.glucoseTextEntity.setAttribute('position', '-0.65 0.05 0.02');
    this.glucoseTextEntity.setAttribute('width', '2.2'); 
    this.glucoseTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.glucoseTextEntity.setAttribute('font-weight', 'bold');
    this.glucoseTextEntity.setAttribute('anchor', 'left');
    this.glucoseTextEntity.setAttribute('baseline', 'center');
    el.appendChild(this.glucoseTextEntity);
    
    // Healthy range text - matches the CSS .healthy-range class
    this.rangeTextEntity = document.createElement('a-text');
    this.rangeTextEntity.setAttribute('value', `Your healthy glucose range is: ${this.data.minHealthy.toFixed(2)} - ${this.data.maxHealthy.toFixed(2)} mMol`);
    this.rangeTextEntity.setAttribute('color', '#666666');
    this.rangeTextEntity.setAttribute('position', '-0.65 -0.2 0.02');
    this.rangeTextEntity.setAttribute('width', '1.4');
    this.rangeTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.rangeTextEntity.setAttribute('anchor', 'left');
    this.rangeTextEntity.setAttribute('baseline', 'center');
    this.rangeTextEntity.setAttribute('visible', 'false');
    el.appendChild(this.rangeTextEntity);
  },
  
  createArrowIndicators: function() {
    const el = this.el;
    
    // Up arrow for high glucose (initially hidden)
    this.arrowUp = document.createElement('a-entity');
    this.arrowUp.setAttribute('position', '-0.85 0.05 0.03');
    
    const arrowUpTriangle = document.createElement('a-triangle');
    arrowUpTriangle.setAttribute('vertex-a', '0 0.1 0');
    arrowUpTriangle.setAttribute('vertex-b', '-0.05 0 0');
    arrowUpTriangle.setAttribute('vertex-c', '0.05 0 0');
    arrowUpTriangle.setAttribute('material', {
      color: 'red',
      shader: 'flat'
    });
    this.arrowUp.appendChild(arrowUpTriangle);
    this.arrowUp.setAttribute('visible', 'false');
    
    // Down arrow for low glucose (initially hidden)
    this.arrowDown = document.createElement('a-entity');
    this.arrowDown.setAttribute('position', '-0.85 0.05 0.03');
    
    const arrowDownTriangle = document.createElement('a-triangle');
    arrowDownTriangle.setAttribute('vertex-a', '0 -0.1 0');
    arrowDownTriangle.setAttribute('vertex-b', '-0.05 0 0');
    arrowDownTriangle.setAttribute('vertex-c', '0.05 0 0');
    arrowDownTriangle.setAttribute('material', {
      color: 'red',
      shader: 'flat'
    });
    this.arrowDown.appendChild(arrowDownTriangle);
    this.arrowDown.setAttribute('visible', 'false');
    
    el.appendChild(this.arrowUp);
    el.appendChild(this.arrowDown);
  },
  
  showNotification: function(message) {
    // If we already have an active notification, remove it
    if (this.activeNotification) {
      const camera = document.querySelector("a-camera");
      if (camera && this.activeNotification.parentNode === camera) {
        camera.removeChild(this.activeNotification);
      }
      this.activeNotification = null;
    }
    
    // Clear any pending timers for normal glucose detection
    if (this.normalGlucoseTimerId) {
      clearTimeout(this.normalGlucoseTimerId);
      this.normalGlucoseTimerId = null;
    }
    
    this.notificationShown = true;
    const notification = document.createElement("a-entity");
    notification.setAttribute("geometry", {
      primitive: "plane",
      width: 1.5,
      height: 0.3,
    });
    notification.setAttribute("material", { color: "orange" });
    notification.setAttribute("position", { x: 0, y: 1, z: -1 });
    notification.setAttribute("text", {
      value: message,
      color: "black",
      align: "center",
      width: 1.4,
    });

    const camera = document.querySelector("a-camera");
    camera.appendChild(notification);
    this.activeNotification = notification;

    // Animate notification down
    notification.setAttribute("animation", {
      property: "position",
      to: { x: 0, y: 0.2, z: -1.5 },
      dur: 1000,
      easing: "easeOutQuad",
    });
  },
  
  hideNotification: function() {
    if (!this.activeNotification) return;
    
    const notification = this.activeNotification;
    const camera = document.querySelector("a-camera");
    
    // Animate notification up
    notification.setAttribute("animation", {
      property: "position",
      to: { x: 0, y: 1.5, z: -1.5 },
      dur: 1000,
      easing: "easeInQuad",
    });
    
    // Remove after animation completes
    setTimeout(() => {
      if (camera && camera.contains(notification)) {
        camera.removeChild(notification);
      }
      if (this.activeNotification === notification) {
        this.activeNotification = null;
        this.notificationShown = false;
      }
    }, 1000);
  },
  
  update: function () {
    this.updateDisplay();
  },
  
  updateDisplay: function () {
    // Update status text with period at the end
    this.statusTextEntity.setAttribute('value', `Device status: ${this.data.status}.`);
    
    // Update glucose value
    const glucoseValue = this.data.value >= 0 ? this.data.value.toFixed(2) : '-.--';
    this.glucoseTextEntity.setAttribute('value', `Sweat glucose: ${glucoseValue} mMol`);
    
    // Update healthy range text
    if (this.data.status == 'connected') {
      this.rangeTextEntity.setAttribute('visible', 'true');
    }
    else {
      this.rangeTextEntity.setAttribute('visible', 'false');
    }
      
    // Check glucose levels and update notification
    this.updateGlucoseIndicators();
  },
  
  updateGlucoseIndicators: function() {
    // Hide both arrows by default
    this.arrowUp.setAttribute('visible', 'false');
    this.arrowDown.setAttribute('visible', 'false');
    
    // Check current status
    let newGlucoseState = 'normal';
    let message = '';
    
    // Show appropriate indicators if connected and have a valid reading
    if (this.data.status == 'connected' && this.data.value >= 0) {
      if (this.data.value < this.data.minHealthy) {
        // Low glucose - show down arrow and notification
        this.arrowDown.setAttribute('visible', 'true');
        message = 'Warning! Your glucose level is below the healthy range.';
        newGlucoseState = 'low';
      } else if (this.data.value > this.data.maxHealthy) {
        // High glucose - show up arrow and notification
        this.arrowUp.setAttribute('visible', 'true');
        message = 'Warning! Your glucose level is above the healthy range.';
        newGlucoseState = 'high';
      }
    }
    
    // Handle notification state transitions
    if (newGlucoseState !== 'normal') {
      // Glucose is outside healthy range
      
      if (this.currentGlucoseState === 'normal' || newGlucoseState !== this.currentGlucoseState) {
        // Either:
        // 1. Going from normal to abnormal - show notification
        // 2. Changing between different abnormal states - update message
        this.showNotification(message);
      }
      
      // Clear any pending normal glucose timer
      if (this.normalGlucoseTimerId) {
        clearTimeout(this.normalGlucoseTimerId);
        this.normalGlucoseTimerId = null;
      }
    } 
    else if (newGlucoseState === 'normal' && this.currentGlucoseState !== 'normal') {
      // Going from abnormal to normal - hide notification
      if (!this.normalGlucoseTimerId) {
        this.normalGlucoseTimerId = setTimeout(() => {
          this.hideNotification();
          this.normalGlucoseTimerId = null;
        }, 0); // option to wait before hiding
      }
    }
    
    // Update current state
    this.currentGlucoseState = newGlucoseState;
  },
  
  // Example method to simulate receiving new glucose data
  updateGlucose: function (value) {
    this.el.setAttribute('glucose-monitor', 'value', value);
  },
  
  // Example method to update connection status
  updateStatus: function (status) {
    this.el.setAttribute('glucose-monitor', 'status', status);
  },
  
  // Clean up when the component is removed
  remove: function() {
    if (this.normalGlucoseTimerId) {
      clearTimeout(this.normalGlucoseTimerId);
      this.normalGlucoseTimerId = null;
    }
    
    if (this.activeNotification) {
      const camera = document.querySelector("a-camera");
      if (camera && camera.contains(this.activeNotification)) {
        camera.removeChild(this.activeNotification);
      }
      this.activeNotification = null;
    }
  }
});