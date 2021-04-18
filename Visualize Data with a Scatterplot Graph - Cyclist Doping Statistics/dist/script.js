var width = 800;
var height = 400;
var padding = 40;


//copy year, current format for d3 v6
var copyYearFormat = d3.timeFormat("%Y");
d3.select(".copyyear").text(copyYearFormat(new Date()));

//time format for minutes and seconds for xAxis
var timeFormat = d3.timeFormat('%M:%S');

//color is based on schemeTableau10 (color scheme) for d3's scaleOrdinal
//categorical coloring if dataset.Doping
var color = d3.scaleOrdinal(d3.schemeTableau10);



const svg = d3.select(".svg-chart").append("svg").
attr("width", width).
attr("height", height);


var tooltip = d3.select(".svg-chart").append("div").
attr('class', 'tooltip').
attr("id", "tooltip").
style("visibility", "hidden");

const datasrc = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// v6 of d3, then() required
d3.json(datasrc).then(json => {

  // handle the responseJSON inside the handler for then() due to asynch
  // dataset is already object
  var dataset = json;

  //project specs require minutes and seconds to be listed down in Date() format
  //therefore, returning Minutes as new object element
  dataset.forEach(i => {

    var splitTime = i.Time.split(':');
    //set Minutes element to a new Date string, all in a standard year of 1970 (per fCC example)
    //differentiate by time, [0] index as minutes, [1] index as seconds
    i['Minutes'] = new Date(Date.UTC(1970, 0, 1, 0, splitTime[0], splitTime[1]));
  });

  //minimum of year subtracted by 1 to scaling purposes, as seen in original example
  //var xMin in this example is 1993, but the actual min from the provided dataset is 1994
  var xMin = d3.min(dataset, i => i['Year'] - 1);
  //xMax is 2016 in this example, actual max of dataset is 2015
  var xMax = d3.max(dataset, i => i['Year'] + 1);

  //return minimum date value of Minutes, as this has already been parsed as new date format
  //for scaling purposes, seconds rounded down via floor
  var yMin = d3.min(dataset, i => d3.timeMinute.floor(i['Minutes']));

  // return max date value of minutes
  // ceiling applied to round up seconds to the next whole minute
  var yMax = d3.max(dataset, i => d3.timeMinute.ceil(i['Minutes']));

  var xScale = d3.
  scaleLinear().
  domain([xMin, xMax]).
  range([padding, width - padding]);

  var yScale = d3.
  scaleTime().
  domain([yMax, yMin]).
  range([height - padding, padding]);

  // tick format as d for [Number.toString] and ignore noninteger values
  // ref: https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/#d3_format
  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  var yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  svg.append('g').call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(0,' + (height - padding) + ')');

  svg.append('g').call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding + ', 0)');


  svg.selectAll('.dot').data(dataset).enter().append('circle').
  attr('class', 'dot').
  attr('r', 5) // dot radius is 5
  .attr('data-xvalue', i => i['Year']) //attri xvalue of dot by Year
  .attr('data-yvalue', i => i['Minutes']) //attri yvalue of dot by Minutes / Seconds
  .attr('cx', i => xScale(i['Year'])) //actual x positioning on graph is according to xScale applied to Year
  .attr('cy', i => yScale(i['Minutes'])).
  style('fill', i => color(i['Doping'] !== "")) // if Doping does not equal blank for data entry, then apply other color according to ordinal scale 
  .on('mouseover', function (event, d) {
    d3.select(this).attr("fill", "#009999");
    tooltip.attr("data-year", d['Year']) // this element references year, as requested by specs
    .html(`${d['Nationality']} ${d['Name']}<br/>Year: ${d['Year']}<br>Time: ${d['Time']} <br> ${d['Doping']}`) //tooltip flavor text
    .style("visibility", "visible") //upon mouseover, visbility becomes visible
    .style("top", `${event.pageY - 20}px`) //mouse positioning relatively towards the middle
    .style("left", `${event.pageX + 20}px`); //mouse positioning right of tooltip
  }).
  on("mouseout", function (event, d) {
    tooltip.style("visibility", "hidden"); // upon mouseout, visibility becomes hidden
  });

  // legend as var, with data according to domain of ordinal scale already applied (Doping and not doping)  
  var legend = svg.append('g').attr('id', 'legend').
  selectAll('#legend').
  data(color.domain()).
  enter().
  append('g')
  //for each iteration of the data colors (2 in this example)
  // translate each label to half the height, then adjust spacing according to iteration coun
  .attr('transform', (d, i) => 'translate(0,' + (height / 2 - i * 30) + ')');

  // append rectangles according to legend iteration label, and recolored according to iteration
  legend.
  append('rect').
  attr('x', width - 20).
  attr('width', 20).
  attr('height', 20).
  style('fill', color);

  //according to iteration, 
  legend.
  append('text').
  attr('x', width - 25).
  attr('y', 15).
  style('text-anchor', 'end').
  text(function (d) {
    if (d) {
      return "Doping";
    } else {
      return 'No Doping';
    }
  });

});