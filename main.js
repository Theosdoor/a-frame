document.addEventListener("DOMContentLoaded", () => {
  // Add the line-graph component to the entity
  const lineGraph = document.getElementById("lineGraph");

  // load json data from json file
  fetch("https://raw.githubusercontent.com/Theosdoor/a-frame/main/ldr.json")
    .then((response) => response.json())
    .then((data) => {
      lineGraph.setAttribute("line-graph", "dataPoints", JSON.stringify(data));
    })
    .catch((error) => console.error("Error loading JSON:", error));
});
