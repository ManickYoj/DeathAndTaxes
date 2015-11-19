$(run);

const GLOBAL = {
  data : [],
  years : ["2003","2008", "2013"],
  education : [
    "Not Specified", 
    "No formal education", 
    "Years of elementary school", 
    "1 Year of high school",
    "2 Years of high school",
    "3 Years of high school",
    "4 Years of high school",
    "1 Year of college",
    "2 Years of college",
    "3 Years of college",
    "4 Years of college",
    "5 or more years of college",
    "Not Started"
  ]
};

function run () {

  initializeView();
  (function() {
  var apiCall = "/EducationAndAge";
  $.get(apiCall)
    .done(function(data) {
      GLOBAL.data = JSON.parse(data);
    });
  })();
  setupData();
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

function initializeView () { 
  const svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);

  // title of graph
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
  .text("Education Level vs. Age of Death");

  // what year
  svg.append("text")
  .attr({
    id: "selected",
    x: s.width/2, 
    y: s.margin/2.1,
    dy: "0.3em",
  })
  .style({
    "text-anchor": "middle"
  })
  .text("2003 Data");

  // loading placeholder
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

function setupData(){
  getDataRows(2013);
}

// function setupOverview(){
//   const svg = d3.select("#eduAgeViz");
//   const s = computeSizes(svg);

//   svg.select("#loading")
//   .text(null)
// }

function getDataRows (year) {
  return GLOBAL.data.filter(function(row){
    return (row["Year"]===year)
  })
}