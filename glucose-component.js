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
    
    // Create a rounded rectangle background with drop shadow effect
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
    // Add rounded corners using a specific material or shader if available
    // For now, using basic plane with shadow
    backgroundPlane.setAttribute('position', '0 0 0.01');
    
    // Add subtle shadow effect with a slightly darker plane behind
    const shadowPlane = document.createElement('a-entity');
    shadowPlane.setAttribute('geometry', {
      primitive: 'plane',
      width: 1.52,
      height: 1.02
    });
    shadowPlane.setAttribute('material', {
      color: '#e0e0e0',
      opacity: 0.8,
      shader: 'flat'
    });
    shadowPlane.setAttribute('position', '0 -0.01 0');
    
    el.appendChild(shadowPlane);
    el.appendChild(backgroundPlane);
    
    // Create text entities
    this.createTextEntities();
    
    // Initialize the notification visibility
    this.notificationVisible = false;
    
    this.updateDisplay();
  },
  
  createTextEntities: function() {
    const el = this.el;
    
    // Status text - lighter gray, smaller font
    this.statusTextEntity = document.createElement('a-text');
    this.statusTextEntity.setAttribute('value', 'Device status: disconnected.');
    this.statusTextEntity.setAttribute('color', '#666666');
    this.statusTextEntity.setAttribute('position', '-0.65 0.3 0.02');
    this.statusTextEntity.setAttribute('width', '1.4');
    this.statusTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.statusTextEntity.setAttribute('anchor', 'left');
    this.statusTextEntity.setAttribute('baseline', 'center');
    el.appendChild(this.statusTextEntity);
    
    // Glucose level text - large, bold, black font
    this.glucoseTextEntity = document.createElement('a-text');
    this.glucoseTextEntity.setAttribute('value', 'Sweat glucose: -.-- mMol');
    this.glucoseTextEntity.setAttribute('color', '#000000');
    this.glucoseTextEntity.setAttribute('position', '-0.65 0.05 0.02');
    this.glucoseTextEntity.setAttribute('width', '2.2'); // Wider for larger text
    this.glucoseTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.glucoseTextEntity.setAttribute('font-weight', 'bold');
    this.glucoseTextEntity.setAttribute('anchor', 'left');
    this.glucoseTextEntity.setAttribute('baseline', 'center');
    el.appendChild(this.glucoseTextEntity);
    
    // Healthy range text - darker green
    this.rangeTextEntity = document.createElement('a-text');
    this.rangeTextEntity.setAttribute('value', `Your healthy glucose range is: ${this.data.minHealthy.toFixed(2)} - ${this.data.maxHealthy.toFixed(2)} mMol`);
    this.rangeTextEntity.setAttribute('color', '#666666'); // Matching the status text color
    this.rangeTextEntity.setAttribute('position', '-0.65 -0.2 0.02');
    this.rangeTextEntity.setAttribute('width', '1.4');
    this.rangeTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.rangeTextEntity.setAttribute('anchor', 'left');
    this.rangeTextEntity.setAttribute('baseline', 'center');
    this.rangeTextEntity.setAttribute('visible', 'false');
    el.appendChild(this.rangeTextEntity);
    
    // Notification text (initially hidden)
    this.notificationTextEntity = document.createElement('a-text');
    this.notificationTextEntity.setAttribute('value', '');
    this.notificationTextEntity.setAttribute('color', '#856404');
    this.notificationTextEntity.setAttribute('position', '-0.65 -0.3 0.03');
    this.notificationTextEntity.setAttribute('width', '1.3');
    this.notificationTextEntity.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
    this.notificationTextEntity.setAttribute('visible', 'false');
    el.appendChild(this.notificationTextEntity);
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
      
    // Show notification with appropriate message if glucose is outside healthy range
    if (this.data.value >= 0) {
      if (this.data.value < this.data.minHealthy) {
        this.showNotification('Your glucose level is below the healthy range.');
      } else if (this.data.value > this.data.maxHealthy) {
        this.showNotification('Your glucose level is above the healthy range.');
      } else {
        this.hideNotification();
      }
    } else {
      this.hideNotification();
    }
  },
  
  showNotification: function (message) {
    this.notificationTextEntity.setAttribute('value', message);
    this.notificationTextEntity.setAttribute('visible', 'true');
    this.notificationVisible = true;
  },
  
  hideNotification: function () {
    this.notificationTextEntity.setAttribute('visible', 'false');
    this.notificationVisible = false;
  },
  
  // Example method to simulate receiving new glucose data
  updateGlucose: function (value) {
    this.el.setAttribute('glucose-monitor', 'value', value);
  },
  
  // Example method to update connection status
  updateStatus: function (status) {
    this.el.setAttribute('glucose-monitor', 'status', status);
  }
});