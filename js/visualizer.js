$(run);

function run () {
  button_2003.addEventListener("click",function() { updateViewFromButton(2003); });
  button_2008.addEventListener("click",function() { updateViewFromButton(2008); });
  button_2013.addEventListener("click",function() { updateViewFromButton(2013); });

  initializeView();
  getData("/EducationAndAge", (data) => {
    GLOBAL.data = data;
    setupView();
    updateView(data)
  });

  getData("/EducationAndCause39", (d) => {
    const eduCauseData = new Data(d);

    // Group specific cause of death into categories
    // EG. All malignant neoplasm deaths -> Cancer
    eduCauseData.addPipe((rawData) => {
      return relabelData(rawData, "Cause of Death", GROUPINGS["Cause of Death"]);
    });

    // Group educational attainments
    eduCauseData.addPipe((rawData) => {
      return relabelData(rawData, "Education", GROUPINGS["Education"]);
    });

    // Filter out all Not Specified values (for any key)
    eduCauseData.addPipe((rawData) => {
      return _.reject(rawData, datum => _.contains(datum, "Not Specified"));
    });

    // Construct a matrix from the data
    const eduCauseMatrix = new Matrix(
      eduCauseData.runPipeline(),
      "Education",
      "Cause of Death"
    );

    // Normalize matrix by educational attainment
    eduCauseMatrix.normalizeByRow();

    // Construct a view for the matrix
    eduCauseMatrix.bubbleView("#eduCauseViz");
  });
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
  .text("Data from Years 2003, 2008, 2013")

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


  // var yearsScale = d3.scale.ordinal()
  //     .domain(GLOBAL.ageStamps)
  //     .rangeBands([s.height - s.margin, s.margin]);

  // var yearsAxis =d3.svg.axis()
  //   .orient('left')
  //   .tickSize(1) // Distances the year label from state labels
  //   .scale(yearsScale)

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

  // Group elementary school to free up space in viz
  data = relabelData(data, "Education", GROUPINGS["Primary Education"]);

  var svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  var sel = svg.data(data)
    .enter()
    .append("g")

  var y = d3.scale.linear()
      .domain ([0, 100])
      .range([s.height - s.margin, s.margin]);

  var x = d3.scale.linear()
      .domain ([0, 12])
      .range([s.margin+(0*2)*barWidth+barWidth/2, s.margin+(12*2)*barWidth+barWidth/2]);

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  svg.selectAll("scatter-dots")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {return x(GLOBAL.education.indexOf(d["Education"])); } )
    .attr("cy", function (d) { return y(d["Age (Years)"]); } )
    .attr("r", function(d){ return d["Number in Group"]/500; })
    .style("opacity", 0.2)
    .style("cursor", "pointer")
    .on("mouseover",function(d) { 
      this.style.fill = "#696969"; 

      tooltip.transition()
         .duration(200)
         .style("opacity", .9)
         .style("background-color","#EEE")
         .style("fill", "none")
         .style("stroke", "#fff")
         .style("stroke-width", 6)
         .style("border-radius", "10")
         .style("padding", "10");

      // content
      tooltip.html( "<center>" + "Year: "+d["Year"] + "<br/>" + "Number of deaths: "+ d["Number in Group"] 
      + "<br/>" + "Education: "+ d["Education"] + "<br/>" + "Years Old: "+d["Age (Years)"] + "</center>")
           .style("left", (d3.event.pageX + 5) + "px")
           .style("top", (d3.event.pageY - 28) + "px");

    })
    .on("mouseout",function(d,i) {
      this.style.fill = "black"; 
      tooltip.transition()
        .duration(500)
        .style("opacity", 0); 
    });
}

function updateViewFromButton(year){
  var filteredData = getDataRows(GLOBAL.data, "Year", year);
  filteredData = relabelData(filteredData, "Education", GROUPINGS["Primary Education"]);

  var svg = d3.select("#eduAgeViz");
  const s = computeSizes(svg);
  var barWidth = s.chartWidth/(2*GLOBAL.education.length-1);

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

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
      .attr("cx", (d) => x(GLOBAL.education.indexOf(d["Education"])))
      .attr("cy", (d) => y(d["Age (Years)"]))
      .attr("r", (d) => d["Number in Group"]/500)
      .style("opacity", 0.2)
      .style("cursor", "pointer")
      .on("mouseover",function(d) { 
        this.style.fill = "#696969"; 

        tooltip.transition()
           .duration(200)
           .style("opacity", .9)
           .style("background-color","#696969")
           .style("fill", "none")
           .style("stroke", "#fff")
           .style("stroke-width", 6)
           .style("border-radius", "10")
           .style("padding", "10");

        // content
        tooltip.html( "<center>" + "Year: "+d["Year"] + "<br/>" + "Number of deaths: "+ d["Number in Group"] 
        + "<br/>" + "Education: "+ d["Education"] + "<br/>" + "Years Old: "+d["Age (Years)"] + "</center>")
             .style("left", (d3.event.pageX + 5) + "px")
             .style("top", (d3.event.pageY - 28) + "px");

      })
      .on("mouseout",function(d,i) {
        this.style.fill = "black"; 
        tooltip.transition()
          .duration(500)
          .style("opacity", 0); 
      });
}


var GLOBAL = {
  data : [],
  years : ["2003","2008", "2013"],
  education : [
    "Not Specified", 
    "No Formal Education", 
    "Some Elementary School",
    "1 Year of High School",
    "2 Years of High School",
    "3 Years of High School",
    "4 Years of High School",
    "1 Year of College",
    "2 Years of College",
    "3 Years of College",
    "4 Years of College",
    "5+ Years of College",
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

    // dead
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

function getData (endpoint, f) {
  d3.json(endpoint, function(error,data) {
     if (error) {
         console.log(error);
     } else {
         d3.select("#loading").remove();
         f(data);
     }
  });
}

function getDataRows (data, parameter, value) {
  return data.filter(function(row){
    return (row[parameter]===value)
  })
}

function Data(rawData) {
  this.rawData = rawData;
  this.pipeline = [];
}

Data.prototype.addPipe = function(pipe) {
  this.pipeline.push(pipe);
}

Data.prototype.runPipeline = function () {
  // Deep copy the rawData
  let transformedData = JSON.parse(JSON.stringify(this.rawData));

  this.pipeline.forEach((pipe) => {
    transformedData = pipe(transformedData);
  });

  return transformedData;
}

const GROUPINGS = {
  "Cause of Death": {
    "Cancer": [
      "Malignant Neoplasm Unspecified",
      "Malignant Neoplasm of Stomach",
      "Malignant Neoplasm of Colon or Rectum or Anus",
      "Malignant Neoplasm of Pancreas",
      "Malignant Neoplasm of Trachea or Bronchus or Lung",
      "Malignant Neoplasm of Breast",
      "Malignant Neoplasm of Cervix or Uteri or Corpus Uteri or Ovary",
      "Malignant Neoplasm of Prostate",
      "Malignant Neoplasm of Urinary Tract",
      "Non Hodgkins Lymphoma",
      "Leukemia",
      "Other Malignant Neoplasms",
    ],

    "Cardiovascular Disease": [
      "Diseases of Heart",
      "Hypertensive Heart Disease with or without Renal Disease",
      "Ischemic Heart Diseases",
      "Other Diseases of Heart",
      "Essential Primary Hypertension or Hypertensive Renal Disease",
      "Cerebrovascular Diseases",
      "Atherosclerosis",
      "Other Diseases of Circulatory System",
    ],
  },

  "Primary Education": {
    "Some Elementary School" : [
      "1 Years of Elementary School",
      "2 Years of Elementary School",
      "3 Years of Elementary School",
      "4 Years of Elementary School",
      "5 Years of Elementary School",
      "6 Years of Elementary School",
      "7 Years of Elementary School",
      "8 Years of Elementary School",
    ],
  },

  "Education": {
    "Elementary and Middle School" : [
      "1 Years of Elementary School",
      "2 Years of Elementary School",
      "3 Years of Elementary School",
      "4 Years of Elementary School",
      "5 Years of Elementary School",
      "6 Years of Elementary School",
      "7 Years of Elementary School",
      "8 Years of Elementary School",
    ],

    "High School": [
      "1 Year of High School",
      "2 Years of High School",
      "3 Years of High School",
      "4 Years of High School",
    ],

    "College": [
      "1 Year of College",
      "2 Years of College",
      "3 Years of College",
      "4 Years of College",
    ],
  }
}

function relabelData(data, key, grouping={}) {
  return data.map((datum) => {
    _.each(grouping, (membersOfGroup, groupName) => {
      if (membersOfGroup.indexOf(datum[key]) != -1) datum[key] = groupName;
    })

    return datum;
  });
}



/**
 * Matrix
 * ------
 *
 * A 'class' for organizing data into a 2D format for visualization.
 *
 * The Matrix format takes an array of SQL row-like data and condenses
 * it based on two properties - one for rows and one for columns.
 */


/**
 * Condense all of the data by two properties, the rowAxisKey
 * and colAxisKey. Construct a matrix out of the results
 * 
 * @param  {Array} data The SQL-row-style data
 * @param  {String} rowAxisKey The key by which to group data by row
 * @param  {String} colAxisKey The key by which to group data by column
 */
function Matrix (data, rowAxisKey, colAxisKey) {
  this.rowLabels = _.uniq(_.pluck(data, rowAxisKey));
  this.colLabels = _.uniq(_.pluck(data, colAxisKey));

  // Create a 2D Matrix with the axes specified. At each
  // index, store an object with all of the data that match
  // those two axis and the sum of the number of people that
  // match that axis
  this.matrix = new Array(this.rowLabels.length);
  for (let row = 0; row < this.rowLabels.length; row++) {
    this.matrix[row] = new Array(this.rowLabels.length);
    this.colLabels.forEach((label, col) => {
      this.matrix[row][col] = {
        row,
        col,
        rowLabel: this.rowLabels[row],
        colLabel: this.colLabels[col],
        size: 0,
        data: [],
      }
    })
  }

  // Assign all of the data to the points at which
  // they belong
  let row, col;
  data.forEach((datum) => {
    row = this.rowLabels.indexOf(datum[rowAxisKey]);
    col = this.colLabels.indexOf(datum[colAxisKey]);

    this.matrix[row][col].data.push(datum);
    this.matrix[row][col].size += datum["Number in Group"];
  });
}

/**
 * Normalize the 'size' attribute of each element in the matrix
 * so that it represents a ratio of the total data in its column.
 */
Matrix.prototype.normalizeByColumn = function () {
  for (let col = 0; col < this.colLabels.length; col++ ) {
    let colTotal = 0;

    // Total column
    for (let row = 0; row < this.rowLabels.length; row++ ) {
      this.matrix[row][col].size = this.totalData(row, col);
      colTotal += this.matrix[row][col].size;
    }

    // Normalize each 'size' value in column by total
    for (let row = 0; row < this.rowLabels.length; row++) {
      this.matrix[row][col].size /= colTotal;
    }
  }
}

/**
 * Normalize the 'size' attribute of each element in the matrix
 * so that it represents a ratio of the total data in its row.
 */
Matrix.prototype.normalizeByRow = function () {
  for (let row = 0; row < this.rowLabels.length; row++ ) {
    let rowTotal = 0;

    // Total column
    for (let col = 0; col < this.colLabels.length; col++ ) {
      this.matrix[row][col].size = this.totalData(row, col);
      rowTotal += this.matrix[row][col].size;
    }

    // Normalize each 'size' value in column by total
    for (let col = 0; col < this.colLabels.length; col++) {
      this.matrix[row][col].size /= rowTotal;
    }
  }
}

/**
 * Total all of the data elements at a certain point in the matrix.
 * 
 * @param  {Number} row The row index of the point to total
 * @param  {Number} col The column index of the point to total
 * @return {Number}     The number of people represented by that matrix point
 */
Matrix.prototype.totalData = function (row, col) {
  let total = 0;

  this.matrix[row][col].data.forEach((datum) => {
    total += datum["Number in Group"];
  })

  return total;
}

/**
 * Project a view of the matrix into an SVG.
 * 
 * @param  {String} selector A d3 selector referring to an svg
 */
Matrix.prototype.bubbleView = function (selector) {
  // Define View Variables
  const root = d3.select(selector);
  const width = parseInt(root.style("width"));
  const height = parseInt(root.style("height"));

  const MARGIN_INDICIES = 3;
  const elemWidth = width / (this.colLabels.length + MARGIN_INDICIES);
  const elemHeight = height / (this.rowLabels.length + MARGIN_INDICIES);
  const maxRadius = Math.min(elemWidth, elemHeight);

  // Position and Create Row Labels
  const rowLabels = root.append("g");
  this.rowLabels.forEach((label, index) => {
    let x = 10;
    let y = elemHeight * (index) + maxRadius;

    rowLabels.append("text")
      .text(label)
      .attr({
        x,
        y: y - 5,
      })
      .style({
        "fill": "rgb(105, 105, 105)",
        "font-size": "12px",
        "text-transform": "capitalize",
      });

    rowLabels.append("line")
      .attr({
        x1: 10,
        x2: width - 10,
        y1: y,
        y2: y,
      })
      .style({
        "stroke-width": "1px",
        "stroke-opacity": "0.1",
        "stroke": "black",
      });
  });

  // Position and Create Column Labels
  const colLabels = root.append("g");
  this.colLabels.forEach((label, index) => {
    let x = elemWidth * (MARGIN_INDICIES + index);
    let y = elemHeight * (this.rowLabels.length) + maxRadius;

    colLabels.append("text")
      .text(label)
      .attr({
        x: x + 5,
        y,
        "transform": `rotate(30 ${x} ${y})`,
      })
      .style({
        "fill": "rgb(105, 105, 105)",
        "font-size": "12px",
        "text-transform": "capitalize",
      });

    colLabels.append("line")
      .attr({
        x1: x,
        x2: x,
        y1: 10,
        y2: y,
      })
      .style({
        "stroke-width": "1px",
        "stroke-opacity": "0.1",
        "stroke": "black",
      })
  });

  // Render Data as Circles
  const circles = root.append("g");
  this.rowLabels.forEach((r, rowIndex) => {
    this.colLabels.forEach((c, colIndex) => {
      circles.append("circle")
        .attr({
          cx: elemWidth * (colIndex + MARGIN_INDICIES),
          cy: elemHeight * (rowIndex) + maxRadius,
          r: Math.sqrt(this.matrix[rowIndex][colIndex].size / Math.PI) * maxRadius,
          "fill": "rgb(85, 85, 85)",
        })
        .on("mouseover", (e) => {
          const tooltip = d3.select(".tooltip")
          tooltip.transition()
           .duration(200)
           .style("opacity", .9)
           .style("background-color","#EEE")
           .style("fill", "none")
           .style("stroke", "#fff")
           .style("stroke-width", 6)
           .style("border-radius", "10")
           .style("padding", "10");
           const d = this.matrix[rowIndex][colIndex];
            // content
            tooltip.html(
              `<center> ${d.colLabel} <br/>
               ${(d.size * 100).toFixed(1)}% of Deaths of Persons <br/>
               with Highest Educational Status </br>
               ${d.rowLabel} </center>`)
             .style("left", (d3.event.pageX + 5) + "px")
             .style("top", (d3.event.pageY - 28) + "px");

        }).on("mouseout", () => {
          d3.select(".tooltip")
            .transition()
            .duration(500)
            .style("opacity", 0);
        });
    });
  });
}