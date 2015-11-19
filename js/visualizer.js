$(run);

const GLOBAL = {
  data : []
};

function run () {
  initializeView("#viz1");

  (function() {
  var apiCall = "/EducationAndCause39";
  $.get(apiCall)
    .done(function(data) {
      GLOBAL.data = data;
    });
  })();
  setupOverview();
}

function computeSizes (svg) {
    const height = svg.attr("height");
    const width = svg.attr("width");
    const margin = 100;
    return {
      height,
      width,
      margin,
      chartHeight: height-2*margin,
      chartWidth: width-2*margin
    }
}

function initializeView (selector) { 
  const svg = d3.select(selector);
  const s = computeSizes(svg);

  svg.append("text")
  .attr({
    id: "title",
    x: s.width/2,
    y: s.margin/3,
    dy: "0.3em",
  })
  .style({
    "text-anchor": "middle",
  })

  svg.append("text")
  .attr({
    id: "info",
    x: s.width/2,
    y: s.margin/1.5,
    dy: "0.3em",
  })
  .style({
    "text-anchor": "middle",
  })

  svg.append("text")
  .attr({
    id: "selected",
    x: s.width/2,
    y: s.margin,
    dy: "0.3em",
  })
  .style({
    "text-anchor": "middle"
  })

  svg.append("text")
  .attr({
    id: "loading",
    x: s.width/2,
    y: s.height/2,
    dy: "0.3em",
  })
  .style({
    fill: "#696969",
    "text-anchor": "middle",
  })
  .text("LOADING...");
}

function setupOverview(){
  const svg = d3.select("#viz1");
  const s = computeSizes(svg);

  svg.select("#loading")
  .text(null)
}