d3.csv("Iris.csv")
        .row(function(d) {return  {Id: Number(d.Id), SepalLengthCm: Number(d.SepalLengthCm), SepalWidthCm: Number(d.SepalWidthCm), PetalLengthCm: Number(d.PetalLengthCm), PetalWidthCm: Number(d.PetalWidthCm), Species: d.Species }; })
        .get(function(error, data){
//console.log(data)

//the order:
//1. declare height and width
//2. work out the extremes
//3. declare the scales
//4. define axis generators


//1. declare height and width
var height = 300;
var width = 500;

//2. determining the max scales for x and y axis
var maxY = d3.max(data, function (d) { return d.PetalWidthCm; });
var maxX = d3.max(data, function(d) { return d.PetalLengthCm; });

//3. declare the scales (y is inverted)
var y = d3.scaleLinear()
            .domain([0, maxY])
            .range([height, 0]);

var x = d3.scaleLinear()
            .domain([0, maxX])
            .range([0, width]);

//define our axis generators

var yAxis = d3.axisLeft(y);
var xAxis = d3.axisBottom(x);

//Add elements to the page:

//add margins (which is an object{}, left, right, top, bottom)
var margin = {left:70, right:50, top:70, bottom:0};

var svg = d3.select("body")
            .append("svg")
                .attr("height", "100%")
                .attr("width", "100%")
            .append("g")
                .attr("transform", "translate("+margin.left+", "+margin.top+")")






//add all the elements into a group
//we transfrom the group- by shifting (using translate) margin.left for x and margin.top for y shift
// var chartGroup = svg.append("g")
//                         .attr("transform", "translate("+margin.left+", "+margin.top+")");

svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
                        .attr("r", 3.5)
                        .style("fill", function(d) {
                        if (d.Species=="Iris-setosa") {return "red"}
                        else if (d.Species=="Iris-versicolor") {return "blue"}
                        else {return "green"}

                    ;})

                    .attr("cx", function (d) { return x(d.PetalLengthCm); })
                    .attr("cy", function (d) { return y(d.PetalWidthCm); });

//Add axis:
//shift x axis down
svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, "+height+")")
        .call(xAxis);
svg.append("g").attr("class", "y axis").call(yAxis);

svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("x", -(height/2))
        .attr("y", -margin.right)
        .style("font-family", "Arial")
        .text("petal width (cm)")
        .style("font-size", "15px");

svg.append("text")
        .attr("transform", "translate(" +(width/2) +" ," +
                                        (height + margin.top-30) + ")")
        .style("text-anchor", "middle")
        .style("font-family", "Arial")
        .style("font-size", "15px")
        .text("petal length (cm)");

svg.append("text")
        .attr("x", (width/2))
        .attr("y", 0-(margin.top/2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-family", "Arial")
        .style("text-decoration", "inherit")
        .text("petal width vs. petal length vs. species");


//Add legend
var species = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"];

var legend = svg.selectAll('g.legend')
                .data(species)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i ) { return "translate (40, "+ (i*20 )+")"; });

legend.append("circle")
                .attr("class", String)
                .attr("r", 3.5)
                .style("fill", function(d) { if (d=="Iris-setosa") { return "red"; }
                                            else if (d=="Iris-versicolor") {return "blue"; }
                                            else {return "green"; }} );


legend.append("text")
    .attr("x", 12)
    .style("font-family", "Arial")
    .style("font-size", "10px")
    .text(function(d) { return d; });


//BOX PLOT
var data_1 = [];
var setosa_sepal_len = [];
var versicolor_sepal_len = [];
var virginica_sepal_len = [];

for (i=0; i<150; i++){
            if (data[i]["Species"] == "Iris-setosa"){
                    data_1.push ({ "Iris-setosa": data[i]["SepalLengthCm"]})
                    setosa_sepal_len.push (data[i]["SepalLengthCm"]) }
            else if (data[i]["Species"] == "Iris-versicolor"){
                    data_1.push ({"Iris-versicolor": data[i]["SepalLengthCm"]})
                    versicolor_sepal_len.push (data[i]["SepalLengthCm"]) }
            else if (data[i]["Species"] == "Iris-virginica"){
                    data_1.push ({"Iris-versicolor": data[i]["SepalLengthCm"]})
                    virginica_sepal_len.push (data[i]["SepalLengthCm"]) }
            }

//sort counts
setosa_sepal_len = setosa_sepal_len.sort();
versicolor_sepal_len = versicolor_sepal_len.sort();
virginica_sepal_len = virginica_sepal_len.sort();

//get into a dictionary

groupedData_dict = {"setosa": setosa_sepal_len, "versicolor": versicolor_sepal_len, "virginica": virginica_sepal_len};


//x scale
var colorScale = d3.scaleOrdinal(['red', 'blue', 'green'])
  .domain(Object.keys(groupedData_dict));

function boxQuartiles(d) {
   return [
     d3.quantile(d, .25),
     d3.quantile(d, .5),
     d3.quantile(d, .75)
   ]
}

// box plot data
var boxPlotData =[];

//loop through the dictionary, and create a list of dictionaries
for (var [species, data_] of Object.entries(groupedData_dict)) {

  var record = {};
  var localMin = d3.min(data_);
  var localMax = d3.max(data_);

  record["key"] = species;
  record["counts"] = data_;
  record["quartile"] = boxQuartiles(data_);
  record["whiskers"] = [localMin, localMax];
  record["color"] = colorScale(species);

  boxPlotData.push(record);
}

//Compute an ordinal xscale for the keys

var xScale = d3.scalePoint()
            .domain(Object.keys(groupedData_dict))
            .rangeRound([0, width])
            .padding([0.5]);

// Compute a global y scale. We need to do it for the petal lenth variable from the original data
var min = d3.min(data, function (d) { return d.SepalLengthCm; });
var max = d3.max(data, function (d) { return d.SepalLengthCm; });
var yScale = d3.scaleLinear()
            .domain([0, max])
            .range([height,0]);


var axisG = svg.append("g").attr("transform", "translate (600,0)");
var axisTopG = svg.append("g").attr("transform", "translate (615, 300)");


// Setup the group the box plot elements will render in
var g = svg.append("g")
  .attr("transform", "translate(600,0)");

var barWidth = 30;

// Draw the box plot vertical lines
var verticalLines = g.selectAll(".verticalLines")
  .data(boxPlotData)
  .enter()
  .append("line")
  .attr("x1", function(d) {
      return xScale(d.key) + barWidth/2;
    }
  )
  .attr("y1", function(d) {
      var whisker = d.whiskers[0];
      return yScale(whisker);
    }
  )
  .attr("x2", function(d) {
      return xScale(d.key) + barWidth/2;
    }
  )
  .attr("y2", function(d) {
      var whisker = d.whiskers[1];
      return yScale(whisker);
    }
  )
  .attr("stroke", "#000")
  .attr("stroke-width", 1)
  .attr("fill", "none");


  // Draw the boxes of the box plot, filled in white and on top of vertical lines
  var rects = g.selectAll("rect")
    .data(boxPlotData)
    .enter()
    .append("rect")
    .attr("width", barWidth)
    .attr("height", function(d) {
        var quartiles = d.quartile;
        var height = yScale(quartiles[0]) - yScale(quartiles[2]);
        return height;
      }
    )
    .attr("x", function(d) {
        return xScale(d.key);
      }
    )
    .attr("y", function(d) {
        return yScale(d.quartile[2]);
      }
    )
    .attr("fill", function(d) {
      return d.color;
      }
    )
    .attr("stroke", "#000")
    .attr("stroke-width", 1);


//console.log(yScale(4.8))

    // Now render all the horizontal lines at once - the whiskers and the median
    var horizontalLineConfigs = [
      // Top whisker
      {
        x1: function(d) { return xScale(d.key) },
        y1: function(d) { return yScale(d.whiskers[0]) },
        x2: function(d) { return xScale(d.key) + barWidth },
        y2: function(d) { return yScale(d.whiskers[0]) }
      },
      // Median line
      {
        x1: function(d) { return xScale(d.key) },
        y1: function(d) { return yScale(d.quartile[1]) },
        x2: function(d) { return xScale(d.key) + barWidth },
        y2: function(d) { return yScale(d.quartile[1]) }
      },
      // Bottom whisker
      {
        x1: function(d) { return xScale(d.key) },
        y1: function(d) { return yScale(d.whiskers[1]) },
        x2: function(d) { return xScale(d.key) + barWidth },
        y2: function(d) { return yScale(d.whiskers[1]) }
      }
    ];

    for(var i=0; i < horizontalLineConfigs.length; i++) {
      var lineConfig = horizontalLineConfigs[i];

      // Draw the whiskers at the min for this series
      var horizontalLine = g.selectAll(".whiskers")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("x1", lineConfig.x1)
        .attr("y1", lineConfig.y1)
        .attr("x2", lineConfig.x2)
        .attr("y2", lineConfig.y2)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", "none");
    }

    // Setup a scale on the left
var axisLeft = d3.axisLeft(yScale);
axisG.append("g")
  .call(axisLeft);

// Setup a series axis on the top. I shifted it down later
var axisTop = d3.axisTop(xScale);
axisTopG.append("g")
  .call(axisTop);


//Add the title
svg.append("text")
            .attr("x", (600+width/2))
            .attr("y", 0-(margin.top/2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-family", "Arial")
            .style("text-decoration", "inherit")
            .text("side-by-side boxplots");


//Add the labels
svg.append("text")
        .attr("transform", "translate(" +(600+ width/2) +" ," +
                                        (height + margin.top-40) + ")")
        .style("font-family", "Arial")
        .style("font-size", "15px")
        .text("species");

svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2) - 50)
        .attr("y", 600-margin.right +20)
        .style("font-family", "Arial")
        .style("font-size", "15px")
        .text("sepal length (cm)");

    });






//})
