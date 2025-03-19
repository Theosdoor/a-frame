AFRAME.registerComponent("glucose-monitor", {
  schema: {
    dataPoints: { type: "string", default: "[]" },
    width: { type: "number", default: 2 },
    height: { type: "number", default: 1 },
    color: { type: "color", default: "#FFFFFF" },
    xrange: { type: "number", default: 300 },
    startFrom: { type: "number", default: 0 },
  },
  
  init() {
    this.trace_colours = [
      // from seaborn crayons
      "#1f75fe",
      "#ff7538",
      "#1cac78", // blue, orange, green
      "#ee204d",
      "#926eae", // red, purple
    ];
    this.notificationShown = false;
  },
  
  update(){
    
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
      value: "Fatigue point reached! Remember to take a break...",
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
  
});