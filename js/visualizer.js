$(run);

function run () {
  button_2003.addEventListener("click",function() { updateViewFromButton(2003); });
  button_2008.addEventListener("click",function() { updateViewFromButton(2008); });
  button_2013.addEventListener("click",function() { updateViewFromButton(2013); });

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
  // TODO: show y axis
  const svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  // var y = d3.scale.linear()
  //       .domain([0, d3.max(GLOBAL.ageStamps, function(d) { return d; })])
  //       .range([ s.height, 0 ]);

  var sel = svg.selectAll("g")
    .data(GLOBAL.education)
    .enter()
    .append("g")

  sel.append("text")
  .attr("class","value")
  .attr("x",function(d,i) { return s.margin+(i*2)*barWidth+barWidth/2; })
  .attr("y",s.height-s.margin/2)
  .attr("dy","0.3em")
  .style("fill","#696969")
  .style("font-size", 12)
  .style("text-anchor","middle")
  .text(function(d) { return (d); });

}

function updateView(data){

  var svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  var sel = svg.selectAll("g")
    .data(data)
    .enter()
    .append("g")

  var y = d3.scale.linear()
      .domain ([0, 100])
      .range([s.height - s.margin, s.margin]);

  var x = d3.scale.linear()
      .domain ([0, 12])
      .range([s.margin+(0*2)*barWidth+barWidth/2, s.margin+(12*2)*barWidth+barWidth/2]);

  svg.selectAll("scatter-dots")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {return x(GLOBAL.education.indexOf(d["Education"])); } )
    .attr("cy", function (d) { return y(d["Age (Years)"]); } )
    .attr("r", function(d){ return d["Number in Group"]/500; })
    .style("opacity", 0.6)
    .style("cursor", "pointer")
    .on("mouseover",function(d) { 
      // TODO: hover-over effect bring circle "on-top"/"in-front" view
      var circSelect = d3.select(this);
      this.style.fill = "#696969"; 
      showToolTip(+circSelect.attr("cx")+circSelect.attr("r")/2,
      +circSelect.attr("cy")-TOOLTIP.height/2-5,d["Year"],d["Number in Group"], 
      d["Education"], d["Age (Years)"]);
    })
    .on("mouseout",function(d,i) {
      hideToolTip();
      this.style.fill = "black";  
    });
}

function updateViewFromButton(year){
  var filteredData = getDataRows(GLOBAL.data, "Year", year);  
  var svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  var sel = svg.selectAll("g")
    .data(filteredData)
    .enter()
    .append("g")

  svg.selectAll("circle").remove();
  svg.select("#selected").remove();

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
  .text(year + " data")

  var y = d3.scale.linear()
      .domain ([0, 100])
      .range([s.height - s.margin, s.margin]);

  var x = d3.scale.linear()
      .domain ([0, 12])
      .range([s.margin+(0*2)*barWidth+barWidth/2, s.margin+(12*2)*barWidth+barWidth/2]);

  svg.selectAll("scatter-dots")
    .data(filteredData)
    .enter().append("circle")
      .attr("cx", function (d) {return x(GLOBAL.education.indexOf(d["Education"])); } )
      .attr("cy", function (d) { return y(d["Age (Years)"]); } )
      .attr("r", function(d){ return d["Number in Group"]/500; })
      .style("opacity", 0.6)
      .style("cursor", "pointer")
      .on("mouseover",function(d) { 
        var circSelect = d3.select(this);
        this.style.fill = "#696969"; 
        showToolTip(+circSelect.attr("cx")+circSelect.attr("r")/2,
        +circSelect.attr("cy")-TOOLTIP.height/2-5,d["Year"],d["Number in Group"], 
        d["Education"], d["Age (Years)"])
        
        d3.selectAll(".tooltip")
          .attr("transform",
        d3.select(this.parentNode).attr("transform"));
      })
      .on("mouseout",function(d,i) {
        hideToolTip();
        this.style.fill = "black";  
      });
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
  ],
  ageStamps : [0,20,40,60,80,100,120,140]
};

var TOOLTIP = {width:250, height:70}

function showToolTip (cx,cy,year,numDead, education, age) {
  // TODO: tooltip not showing
  var svg = d3.select("#eduAgeViz");

  svg.append("rect")
    .attr("class","tooltip")
    .attr("x",cx-TOOLTIP.width/2)
    .attr("y",cy-TOOLTIP.height/2)
    .attr("width",TOOLTIP.width)
    .attr("height",TOOLTIP.height)
    .style("fill","#dd6112")
    .style("stroke","#772310")
    .style("stroke-width","3px")

    // year
  svg.append("text")
    .attr("class","tooltip")
    .attr("x",cx)
    .attr("y",cy-15)
    .attr("dy","0.3em")
    .style("text-anchor","middle")
    .text(year);

    // # dead
  svg.append("text")
    .attr("class","tooltip")
    .attr("x",cx)
    .attr("y",cy+15)
    .attr("dy","0.3em")
    .style("text-anchor","middle")
    .text(numDead);

    // Education
  svg.append("text")
    .attr("class","tooltip")
    .attr("x",cx)
    .attr("y",cy+15)
    .attr("dy","0.3em")
    .style("text-anchor","middle")
    .text(education);

    // Age
  svg.append("text")
    .attr("class","tooltip")
    .attr("x",cx)
    .attr("y",cy+15)
    .attr("dy","0.3em")
    .style("text-anchor","middle")
    .text(age);
}

function hideToolTip () {
    d3.selectAll(".tooltip").remove();
}

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