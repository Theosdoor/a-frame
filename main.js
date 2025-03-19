document.addEventListener("DOMContentLoaded", () => {
  // Wait for A-Frame to finish loading
  document.querySelector('a-scene').addEventListener('loaded', function () {
    // Get the glucose monitor component
    const glucoseMonitorEntity = document.querySelector('#glucoseMonitor');
    const glucoseMonitorComponent = glucoseMonitorEntity.components['glucose-monitor'];
    
    if (!glucoseMonitorComponent) {
      console.error('Could not find glucose-monitor component');
      return;
    }
    
    console.log('Glucose monitor component initialized');
    
    // Update status to connected
    glucoseMonitorComponent.updateStatus('connected');
    
    // Simulate glucose values trending up and down over time
    let direction = 1; // 1 = increasing, -1 = decreasing
    let currentValue = 0.13; // Start in the middle of healthy range
    let autoUpdateEnabled = true;
    
    // Set up interval for automatic updates
    const autoUpdateInterval = setInterval(() => {
      if (!autoUpdateEnabled) return;
      
      // Add some randomness to the value
      const change = (Math.random() * 0.01) * direction;
      currentValue += change;
      
      // Ensure values stay within a reasonable range (0.08 to 0.22)
      if (currentValue > 0.22) {
        direction = -1;
        currentValue = 0.22;
      } else if (currentValue < 0.08) {
        direction = 1;
        currentValue = 0.08;
      }
      
      // Occasionally reverse direction
      if (Math.random() < 0.2) {
        direction *= -1;
      }
      
      // Update the glucose value
      glucoseMonitorComponent.updateGlucose(currentValue);
      console.log(`Updated glucose value: ${currentValue.toFixed(2)}`);
    }, 5000); // Update every 5 seconds
    
    // Set up demo control buttons
    document.getElementById('lowGlucose').addEventListener('click', () => {
      autoUpdateEnabled = false;
      const lowValue = 0.09 + (Math.random() * 0.02); // Between 0.09 and 0.11
      glucoseMonitorComponent.updateGlucose(lowValue);
      console.log(`Simulating low glucose: ${lowValue.toFixed(2)}`);
    });
    
    document.getElementById('normalGlucose').addEventListener('click', () => {
      autoUpdateEnabled = false;
      const normalValue = 0.13 + (Math.random() * 0.01); // Between 0.13 and 0.14
      glucoseMonitorComponent.updateGlucose(normalValue);
      console.log(`Simulating normal glucose: ${normalValue.toFixed(2)}`);
    });
    
    document.getElementById('highGlucose').addEventListener('click', () => {
      autoUpdateEnabled = false;
      const highValue = 0.16 + (Math.random() * 0.03); // Between 0.16 and 0.19
      glucoseMonitorComponent.updateGlucose(highValue);
      console.log(`Simulating high glucose: ${highValue.toFixed(2)}`);
    });
    
    let isConnected = true;
    document.getElementById('toggleConnection').addEventListener('click', () => {
      isConnected = !isConnected;
      const status = isConnected ? 'connected' : 'disconnected';
      glucoseMonitorComponent.updateStatus(status);
      console.log(`Device status changed to: ${status}`);
      
      // If disconnected, show a placeholder value
      if (!isConnected) {
        glucoseMonitorComponent.updateGlucose(-1);
      } else {
        // If reconnected, show a value in the normal range
        glucoseMonitorComponent.updateGlucose(0.13);
        // Re-enable auto updates
        autoUpdateEnabled = true;
      }
    });
  });
});