//date time, current format for d3 v6
var dateFormat = d3.timeFormat("%Y");
d3.select(".copyyear").text(dateFormat(new Date()));

datasrc = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";


// Using v6 of d3, then() is required for promise, current fcc example shows deprecated method for v4
d3.json(datasrc).then(json => {
  // handle the responseJSON inside the handler for then() due to asynch
  var dataset = json.data;

  const setNum = dataset.length;
  const width = 1000;
  const height = 500;
  const padding = 70;

  const barWidth = (width - padding) / setNum;

  // opacity 0 allows for completely invisible tooltip div as default
  var tooltip = d3.select(".svg-chart").append("div").
  attr('class', 'tooltip').
  attr("id", "tooltip").
  style("visibility", "hidden"); //by default, the tooltip is hidden



  const svg = d3.select(".svg-chart").append("svg").
  attr("width", width).
  attr("height", height);


  const datadates = dataset.map(x => new Date(x[0]));
  const dataGDP = dataset.map(x => x[1]);


  var xMax = new Date(d3.max(datadates));

  var xScale = d3.scaleTime().domain([d3.min(datadates), xMax]).range([padding, width - 1]); // -1 for exact lineup of x values

  var xAxis = d3.axisBottom().scale(xScale);

  //height 10 to see text value
  var yScale = d3.scaleLinear().domain([0, d3.max(dataGDP)]).range([height - padding, 10]); // 10 for y axis labeling space (no cutoff)
  var yAxis = d3.axisLeft(yScale);

  // x axis label
  svg.
  append('text').
  attr('x', width / 2).
  attr('y', height - 15).
  text('Years').
  attr('class', 'label');


  // y axis label 
  svg.
  append('text').
  attr('transform', 'rotate(-90)').
  attr('x', -height / 2) //because rotated, x is vertical
  .attr('y', barWidth + 15).
  text('USD (Billions)').
  attr('class', 'label');


  svg.append('g').call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(0,' + (height - padding) + ')');


  svg.append('g').call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding + ', 0)');


  svg.selectAll('rect').data(dataset).enter().append('rect').
  attr('class', 'bar') // bar graph
  .style('fill', '#663366') // fill color, #663366 for visiblity
  .attr('x', (d, i) => padding + i * barWidth) //x values with padding applied
  .attr('y', (d, i) => yScale(d[1])) //apply scale to y values
  .attr('width', barWidth) //width is length of bar
  .attr('height', (d, i) => height - padding - yScale(d[1])) //height takes into account padding as well as the y scale
  .attr('data-date', (d, i) => dataset[i][0]) // data category for x axis value
  .attr('data-gdp', (d, i) => dataset[i][1]) // data category for y axis value
  .on('mouseover', function (event, d) {// credits to pmillspaugh on fcc forum for d3 v6 arg changes compared to v5
    //forum.freecodecamp.org/t/214064
    d3.select(this).attr("fill", "#009999");
    tooltip.attr("data-date", d[0]) // this element references d[0] index for date value
    .html(`${d[0]} <br/> $${parseInt(d[1], 10)} Billion`) //tooltip flavor text
    .style("visibility", "visible") //upon mouseover, visbility becomes visible
    .style("top", `${event.pageY - 20}px`) //mouse positioning relatively towards the middle
    .style("left", `${event.pageX + 20}px`); //mouse positioning right of tooltip
  }).
  on("mouseout", function (event, d) {
    tooltip.style("visibility", "hidden"); // upon mouseout, visibility becomes hidden
  });

});