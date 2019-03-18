// Code goes here

var margin = {top: 50, right: 10, bottom: 10, left: 10},
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

/* Construct a new band scale (which is like an ordinal scale except the output
is continuous and numeric)
*/

var x = d3.scaleBand().rangeRound([0, width]).padding(1),
//initiating y and dragging variable which are object
    y = {},
    dragging = {};

 //var axis = d3.svg.axis().orient("left");

var line = d3.line(),
    //axis = d3.axisLeft(x),
    background,
    foreground,
    extents;

var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" +170+ "," + margin.top + ")");

d3.csv("Iris.csv", function(error, data) {

    // d3.keys(data[0]) - returns an array of the name of the variables -strings-in the dataset
//selecting the variables and storing in dimensions (we want only 4 variables)
//They will become the domain for our x axis.

dimensions = d3.keys(data[0]).filter(function(d) {
    if(d == "Id" || d == "Species") {
        return false; }
    else {
        return true; }
});

//specifying the domain for x
x.domain(dimensions);

//specifying the domain and range for y

/* d3.extent() - returns the maximum and minimum value of an array
p selects the first item in the array (i.e. first row) which is a dictionary, we access the variable we want
using p["SepalWidthCm"]; it loops like this over all the items in the array.

Overall stuff inside d3.extent() returns an array of 150 values and is supplied to itself. The method then finds
the max and min, which is passed to the domain.*/
// dimensions.forEach(function (d) {
//             y[d] = d3.scaleLinear()
//                         .domain(d3.extent(data, function(p) {
//                             return +p[d]; }))
//                         .range([height, 0]); }); #Here the y axis doesnt start at 0; not using!

dimensions.forEach(function (d) {
            y[d] = d3.scaleLinear()
                        .domain([0, (d3.max(data, function(p) {
                            return +p[d];}))])
                        .range([height, 0]); });

extents = dimensions.map(function(p) { return [0,0]; });

console.log(extents)


  // Add grey background lines for context.
background = svg.append("g")
      .attr("class", "background")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
foreground = svg.append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d) {return d.Species});

  // Add a group element for each dimension.
  //For each element in dimensions (that is our 4 vars or axis ) the drag method is implemented
  //allowing for movement of the axis
  var g = svg.selectAll(".dimension")
      .data(dimensions)
      .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })
      .call(d3.drag()
        .subject(function(d) { return {x: x(d)}; })
        .on("start", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
              .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));
  // Add an axis and title.
//1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff

g.append("g")
      .attr("class", "axis")
      .each(function(d) {  d3.select(this).call(d3.axisLeft(y[d]));})
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("font-size", "15px")
      .style("font-family", "Arial")
      .attr("y", -9)
      .text(function(d) { return d; });

var species = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"];
var legend = svg.selectAll('g.legend')
                .data(species)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i ) { return "translate (170, "+ (i*20 +370)+")"; });

svg.append("text")
.style("text-anchor", "middle")
.attr("x", -(height/2-650))
.attr("y", -35)
.style("font-family", "Arial")
.text("parallel coordinates")
.style("font-size", "20px");

legend.append("line")
    .attr("class", String)
    .attr("x1", 1)
    .attr("x2", 10)
    //.attr("stroke", "steelblue");

legend.append("text")
    .attr("x", 12)
    .style("font-family", "Arial")
    //.attr("dy", "31.em")
    .text(function(d) { return d; })
    .style("font-size", "10px");

  // Add and store a brush for each axis.
g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d]
            .brush = d3.brushY()
            .extent([[-8, 0], [8,height]])
            .on("brush start", brushstart)
            .on("brush", brush_parallel_chart));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush_parallel_chart() {
    for(var i=0;i<dimensions.length;++i){
        if(d3.event.target==y[dimensions[i]].brush) {
            extents[i]=d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);

        }
    }

      foreground.style("display", function(d) {
        return dimensions.every(function(p, i) {
            if(extents[i][0]==0 && extents[i][0]==0) {
                return true;
            }
          return extents[i][1] <= d[p] && d[p] <= extents[i][0];
        }) ? null : "none";
      });
}
