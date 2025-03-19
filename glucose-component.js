AFRAME.registerComponent("glucose-monitor", {
  schema: {
    value: { type: "number", default: 18.0 },
    threshold: { type: "number", default: 20.0 },
    position: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    color: { type: "color", default: "#000000" },
    backgroundColor: { type: "color", default: "#FFFFFF" }
  },
  
  init() {
    this.notificationShown = false;
    this.createGlucoseDisplay();
  },
  
  update(oldData) {
    // Update the displayed value when it changes
    if (this.data.value !== oldData.value) {
      this.valueText.setAttribute("value", `${this.data.value.toFixed(1)}`);
    }
    
    // Show notification if value exceeds threshold
    if (this.data.value > this.data.threshold && !this.notificationShown) {
      this.showNotification();
    }
  },
  
  createGlucoseDisplay() {
    // Create background panel
    const panel = document.createElement("a-plane");
    panel.setAttribute("width", 0.6);
    panel.setAttribute("height", 0.3);
    panel.setAttribute("color", this.data.backgroundColor);
    this.el.appendChild(panel);
    
    // Create title text
    const titleText = document.createElement("a-text");
    titleText.setAttribute("value", "Glucose");
    titleText.setAttribute("align", "center");
    titleText.setAttribute("position", { x: 0, y: 0.08, z: 0.01 });
    titleText.setAttribute("color", this.data.color);
    titleText.setAttribute("scale", { x: 0.2, y: 0.2, z: 0.2 });
    this.el.appendChild(titleText);
    
    // Create value text
    this.valueText = document.createElement("a-text");
    this.valueText.setAttribute("value", `${this.data.value.toFixed(1)}`);
    this.valueText.setAttribute("align", "center");
    this.valueText.setAttribute("position", { x: 0, y: -0.05, z: 0.01 });
    this.valueText.setAttribute("color", this.data.color);
    this.valueText.setAttribute("scale", { x: 0.4, y: 0.4, z: 0.4 });
    this.el.appendChild(this.valueText);
    
    // Create units text
    const unitsText = document.createElement("a-text");
    unitsText.setAttribute("value", "mmol/L");
    unitsText.setAttribute("align", "center");
    unitsText.setAttribute("position", { x: 0, y: -0.12, z: 0.01 });
    unitsText.setAttribute("color", this.data.color);
    unitsText.setAttribute("scale", { x: 0.15, y: 0.15, z: 0.15 });
    this.el.appendChild(unitsText);
  },

  showNotification() {
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
      value: "Glucose level too high! Take action...",
      color: "black",
      align: "center",
      width: 1.4,
    });

    const camera = document.querySelector("a-camera");
    camera.appendChild(notification);

    // Animate notification down
    notification.setAttribute("animation", {
      property: "position",
      to: { x: 0, y: 0.2, z: -1.5 },
      dur: 1000,
      easing: "easeOutQuad",
    });

    // Animate notification up and remove after 5 seconds
    setTimeout(() => {
      notification.setAttribute("animation", {
        property: "position",
        to: { x: 0, y: 1.5, z: -1.5 },
        dur: 1000,
        easing: "easeInQuad",
      });
      setTimeout(() => {
        camera.removeChild(notification);
      }, 1000);
    }, 5000);
  },
  
  // Helper method to update glucose value programmatically
  updateGlucoseValue(newValue) {
    this.el.setAttribute("glucose-monitor", "value", newValue);
  }
});