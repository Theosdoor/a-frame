AFRAME.registerComponent("line-graph", {
  schema: {
    dataPoints: { type: "string", default: "[]" },
    width: { type: "number", default: 2 },
    height: { type: "number", default: 1 },
    color: { type: "color", default: "#FFFFFF" },
    xrange: { type: "number", default: 300 },
    startFrom: { type: "number", default: 1 },
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
    this.graphInitialized = false;
    this.xTicks = false;
  },

  update() {
    this.data.parsedData = JSON.parse(this.data.dataPoints);

    // Set up the graph
    this.currentT = this.data.startFrom;
    this.visibleData = [];
    this.bounds = {
      minX: Math.max(this.currentT - this.data.xrange, 0),
      maxX: this.currentT,
      minY: 780,
      maxY: 940, // fixed y bounds
    };

    // Find the starting index in the parsed data
    this.currentDataIndex = this.data.parsedData.findIndex(
      (point) => point.T >= this.currentT
    );
    if (this.currentDataIndex === -1) {
      console.error("Start point is beyond available data");
      return;
    }

    // Plot points from (currentT - xrange) to currentT
    let startIndex = this.currentDataIndex;
    while (
      startIndex > 0 &&
      this.data.parsedData[startIndex - 1].T >= this.currentT - this.data.xrange
    ) {
      startIndex--;
    }

    for (let i = startIndex; i <= this.currentDataIndex; i++) {
      this.addDataPoint(this.data.parsedData[i]);
    }

    this.draw();
    this.startAnimation();
  },

  addDataPoint(point) {
  this.visibleData.push(point);
  this.updateBoundsWithPoint(point);
},

updateBoundsWithPoint(point) {
  for (let i = 0; i < 5; i++) {
    const ldrValue = point[`LDR ${i}`];
    if (ldrValue < this.bounds.minY) this.bounds.minY = ldrValue;
    if (ldrValue > this.bounds.maxY) this.bounds.maxY = ldrValue;
  }
  if (point.T > this.bounds.maxX) this.bounds.maxX = point.T;
  this.bounds.minX = Math.max(this.currentT - this.data.xrange, 0);
},

updateBounds() {
  const newMinX = Math.max(this.bounds.maxX - this.data.xrange, 0);
  while (this.visibleData.length > 0 && this.visibleData[0].T < newMinX) {
    this.visibleData.shift();
  }
  this.bounds.minX = newMinX;
},
  
startAnimation() {
  clearInterval(this.intervalId);
  this.intervalId = setInterval(() => {
    this.currentT += 1; // move time forward by 1 second
    if (this.currentDataIndex < this.data.parsedData.length) {
      this.addNewDataPoint();
      this.updateBounds();
      this.draw();

      // Check if currentT is 480 and notification hasn't been shown
      if (this.currentT === 480 && !this.notificationShown) {
        this.showNotification();
      }
    } else {
      clearInterval(this.intervalId);
    }
  }, 1000); // update every second
},


//   startAnimation() {
//     cancelAnimationFrame(this.animationFrameId);
//     this.lastUpdateTime = performance.now();
//     this.animate();
//   },
  
//   animate() {
//     const currentTime = performance.now();
//     const deltaTime = currentTime - this.lastUpdateTime;
    
//     if (deltaTime >= 1000) { // Update every second
//       this.currentT += 1; // increment time by 1 (move x axis along by this increment each iteration)
//       if (this.currentDataIndex < this.data.parsedData.length) {
//         this.addNewDataPoint();
//         this.updateBounds();
//         this.draw();

//         // show fatigue notification at 8 minutes
//         if (this.currentT === 480 && !this.notificationShown) {
//           this.showNotification();
//         }
//       }
//       this.lastUpdateTime = currentTime;
//     }
    
//     this.animationFrameId = requestAnimationFrame(() => this.animate());
//   },

  addNewDataPoint() {
    var newPoint = this.data.parsedData[this.currentDataIndex];
    // if new point's time value larger than currentT, plot previous point again
    if (newPoint.T > this.currentT) {
      newPoint = {
        ...this.data.parsedData[this.currentDataIndex - 1],
        T: this.currentT,
      };
    } else {
      // otherwise plot new point
      this.currentDataIndex++;
    }
    this.addDataPoint(newPoint);
  },

  updateBounds() {
    while (
      this.visibleData.length > 0 &&
      this.visibleData[0].T < this.bounds.minX
    ) {
      this.visibleData.shift();
    }
    this.bounds.minX = Math.max(this.bounds.maxX - this.data.xrange, 0);
  },

  draw() {
    if (!this.graphInitialized) {
      this.el.innerHTML = ""; // Clear previous graph only on first draw
      this.setTitle();
      this.setXLabel();
      this.drawLegend();
      this.setYTickLabels(); // fixed
      this.graphInitialized = true;
    }

    // clear previous traces (shouldnt remove axes too! TODO fix this)
    this.el.querySelectorAll("a-entity[line]").forEach((line) => line.remove());
  
    // update each call
    this.drawTraces();
    this.setXTickLabels(); // dynamically update
    this.drawAxes(); // TODO should be called only once, but axes removed when traces are removed!
  },
  
  setXTickLabels() {
    if (!this.xTicks) { // if no xticks exist yet, creat max and min labels
      // create max x label if not already created
      this.maxXLabel = document.createElement("a-text");
      this.maxXLabel.setAttribute("scale", { x: 0.2, y: 0.2, z: 0.2 });
      this.maxXLabel.setAttribute("color", this.data.color);
      this.el.appendChild(this.maxXLabel);

      // create min x label
      this.minXLabel = document.createElement("a-text");
      this.minXLabel.setAttribute("scale", { x: 0.2, y: 0.2, z: 0.2 });
      this.minXLabel.setAttribute("color", this.data.color);
      this.el.appendChild(this.minXLabel);

      this.xTicks = true;
    }
    this.maxXLabel.setAttribute("value", `${this.bounds.maxX.toFixed(0)}`);
    this.maxXLabel.setAttribute("position", {
      x: this.data.width,
      y: -0.05,
      z: 0,
    });

    this.minXLabel.setAttribute("value", `${this.bounds.minX.toFixed(0)}`);
    this.minXLabel.setAttribute("position", { x: 0, y: -0.05, z: 0 });
  },

  drawAxes() {
    ["x", "y"].forEach((axis) => {
      const entity = document.createElement("a-entity");
      entity.setAttribute("line", {
        start: { x: 0, y: 0, z: 0 },
        end: {
          x: axis === "x" ? this.data.width : 0,
          y: axis === "y" ? this.data.height : 0,
          z: 0,
        },
        color: this.data.color,
      });
      this.el.appendChild(entity);
    });
  },

  setTitle() {
    const title = document.createElement("a-text");
    title.setAttribute("value", "LDR Intensity");
    title.setAttribute("position", {
      x: this.data.width / 2,
      y: this.data.height + 0.05,
      z: 0,
    });
    title.setAttribute("scale", { x: 0.15, y: 0.15, z: 0.15 });
    title.setAttribute("color", this.data.color);
    title.setAttribute("align", "center");
    this.el.appendChild(title);
  },

  drawTraces() {
    for (let ldr = 0; ldr < 5; ldr++) {
      for (let i = 0; i < this.visibleData.length - 1; i++) {
        const line = document.createElement("a-entity");
        line.setAttribute("line", {
          start: this.getScaledPoint(this.visibleData[i], ldr),
          end: this.getScaledPoint(this.visibleData[i + 1], ldr),
          color: this.trace_colours[ldr],
        });
        this.el.appendChild(line);
      }
    }
  },

  getScaledPoint(point, ldr) {
    const xRange = this.bounds.maxX - this.bounds.minX;
    const yRange = this.bounds.maxY - this.bounds.minY;
    return {
      x: ((point.T - this.bounds.minX) / xRange) * this.data.width,
      y: ((point[`LDR ${ldr}`] - this.bounds.minY) / yRange) * this.data.height,
      z: 0,
    };
  },

  setYTickLabels() {
    // add max and min tick labels
    this.addTickLabel(`${this.bounds.minY.toFixed(0)}`, { x: -0.1, y: 0, z: 0 });
    this.addTickLabel(`${this.bounds.maxY.toFixed(0)}`, {
      x: -0.1,
      y: this.data.height,
      z: 0,
    });

    // add 3 intermediate tick labels to y-axis
    for (let i = 1; i <= 3; i++) {
      const y =
        this.bounds.minY + (i / 4) * (this.bounds.maxY - this.bounds.minY);
      this.addTickLabel(`${y.toFixed(0)}`, {
        x: -0.1,
        y: (i / 4) * this.data.height,
        z: 0,
      });
    }
  },

  addTickLabel(text, position) {
    const label = document.createElement("a-text");
    label.setAttribute("value", text);
    label.setAttribute("position", position);
    label.setAttribute("scale", { x: 0.2, y: 0.2, z: 0.2 });
    label.setAttribute("color", this.data.color);
    this.el.appendChild(label);
  },

  setXLabel() {
    const label = document.createElement("a-text");
    label.setAttribute("value", "Time / s");
    label.setAttribute("position", { x: this.data.width / 2, y: -0.1, z: 0 });
    label.setAttribute("scale", { x: 0.15, y: 0.15, z: 0.15 });
    label.setAttribute("color", this.data.color);
    label.setAttribute("align", "center");
    this.el.appendChild(label);
  },

  drawLegend() {
    const legendWidth = 0.2;
    const legendHeight = this.data.height;
    const startX = this.data.width + 0.05;
    const startY = 0;

    // Background for legend
    const background = document.createElement("a-plane");
    background.setAttribute("width", legendWidth);
    background.setAttribute("height", legendHeight);
    background.setAttribute("color", "#ababab");
    background.setAttribute("opacity", "0.5");
    background.setAttribute(
      "position",
      `${startX + legendWidth / 2} ${startY + legendHeight / 2} 0`
    );
    this.el.appendChild(background);

    // Legend items
    for (let i = 0; i < 5; i++) {
      const itemY = startY + legendHeight - (i + 1) * 0.07;

      // Color box
      const colorBox = document.createElement("a-plane");
      colorBox.setAttribute("width", "0.02");
      colorBox.setAttribute("height", "0.02");
      colorBox.setAttribute("color", this.trace_colours[i]);
      colorBox.setAttribute("position", `${startX + 0.03} ${itemY} 0.01`);
      this.el.appendChild(colorBox);

      // Tag
      const tag = document.createElement("a-text");
      tag.setAttribute("value", `LDR ${i}`);
      tag.setAttribute("position", `${startX + 0.07} ${itemY} 0.01`);
      tag.setAttribute("scale", { x: 0.08, y: 0.08, z: 0.08 });
      tag.setAttribute("color", this.data.color);
      tag.setAttribute("anchor", "left");
      this.el.appendChild(tag);
    }
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
