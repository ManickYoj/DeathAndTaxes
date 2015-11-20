$(run);

function run () {
  initializeView();
  getData(function(data){
    setupView();
    updateView(data)
  })
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

function setupView(){
  const svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  var sel = svg.selectAll("g")
    .data(GLOBAL.education)
    .enter()
    .append("g")

  sel.append("text")
  .attr("class","value")
  .attr("x",function(d,i) { return s.margin+(i*2)*barWidth+barWidth/2; })
  .attr("y",s.height-s.margin)
  .attr("dy","0.3em")
  .style("fill","#696969")
  .style("font-size", 12)
  .style("text-anchor","middle")
  .text(function(d) { return (d); });

}

function updateView(data){

  var svg = d3.select("#eduAgeViz");
  var height = svg.attr("height");
  var width = svg.attr("width");
  var legendMargin = 10
  var margin = 100;

  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  console.log(data);

  var sel = svg.selectAll("g")
    .data(data)
    .enter()
    .append("g")

  var y = d3.scale.linear()
      .domain ([0, 100])
      .range([s.margin, s.height - s.margin]);

  var x = d3.scale.linear()
      .domain ([0, 12])
      .range([s.margin+(0*2)*barWidth+barWidth/2, s.margin+(12*2)*barWidth+barWidth/2]);

  svg.selectAll("scatter-dots")
    .data(data)
    .enter().append("circle")
      .attr("cx", function (d) {return x(GLOBAL.education.indexOf(d["Education"])); } )
      .attr("cy", function (d) { return y(d["Age (Years)"]); } )
      .attr("r", function(d){ return d["Number in Group"]/500; })
      .style("opacity", 0.6);
}


var GLOBAL = {
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


function getData (f) {
  d3.json("/EducationAndAge", function(error,data) {
     if (error) {
         console.log(error);
     } else {
         d3.select("#loading").remove();
         GLOBAL.data = data;
         f(data);
     }
  });
}

function getDataRows (data, parameter, value) {
  return data.filter(function(row){
    return (row[parameter]===value)
  })
}