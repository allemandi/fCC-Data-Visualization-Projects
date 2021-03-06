var width = 1000;
var height = 500;
var padding = 70;


//copy year, current format for d3 v6
var copyYearFormat = d3.timeFormat("%Y");
d3.select(".copyyear").text(copyYearFormat(new Date()));


const svg = d3.select(".svg-chart").append("svg").
attr("width", width).
attr("height", height);


var tooltip = d3.select(".svg-chart").append("div").
attr('class', 'tooltip').
attr("id", "tooltip").
style("visibility", "hidden");


var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var colorHex = ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'];


const datasrc =
'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

// v6 of d3, then() required
d3.json(datasrc).then(json => {
  var dataset = json;

  //monthly Variance dataset is arr
  var monVarSet = dataset.monthlyVariance;


  for (i = 0; i < monVarSet.length; i++)
  {
    monVarSet[i]['monthString'] = months[monVarSet[i]['month'] - 1];
  }

  //baseTemp should be 8.66
  var baseTemp = dataset.baseTemperature;
  //min temp is 1.6840000000000002
  var minTemp = d3.min(monVarSet, i => i['variance']) + baseTemp;

  //max temp is 13.888
  var maxTemp = d3.max(monVarSet, i => i['variance']) + baseTemp;

  //1753 is the min Year
  var xMin = d3.min(monVarSet, i => new Date(i['year']));

  //2015 is the max Year
  var xMax = d3.max(monVarSet, i => new Date(i['year']));



  var xScale = d3.
  scaleTime().
  domain([xMin, xMax]).
  range([padding, width - padding]);


  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

  var yRange = [];

  // .range([height - padding, padding]);
  for (var i = 0; i < 12; i++) {
    yRange.push(padding + i * (height - padding * 2) / 12);
  }

  var yScale = d3.
  scaleOrdinal().
  domain(months).
  range(yRange);

  var yAxis = d3.axisLeft().scale(yScale).ticks(12);

  svg.append('g').call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(0,' + (height - padding) + ')');

  svg.append('g').call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding + ', 0)');

  var colorScale = d3.scaleQuantize().domain([minTemp, maxTemp]).range(colorHex);

  svg.append('text').
  attr('transform', `translate(${width / 3.5},${height / padding + 30})`).
  attr('id', 'description').
  text('Jan 1951 - Dec 1980. Base Temperature: ' + baseTemp);




  //cells for heatmap
  svg.selectAll("cells").
  data(monVarSet).
  enter().
  append("rect").
  attr('data-month', i => i['month'] - 1).
  attr('data-year', i => i['year']).
  attr('data-temp', i => i['variance'] + baseTemp).
  attr("x", i => xScale(new Date(i['year']))).
  attr('y', i => yScale(i['monthString'])).
  attr("width", (width - padding) / (xMax - xMin)).
  attr("height", (height - padding) / months.length).
  attr('fill', i => colorScale(i['variance'] + baseTemp)).
  attr("class", "cell").
  on('mouseover', function (event, d) {
    d3.select(this);
    tooltip.attr("data-year", d['year']) // this element references year, as requested by specs
    .html(`${d['monthString']} ${d['year']}<br/>${Math.round((baseTemp + d['variance']) * 100) / 100} &#730;C<br/>Variance: ${d['variance']} &#730;C`) //tooltip flavor text
    //math.round *1000 / 1000 to 
    .style("visibility", "visible") //upon mouseover, visibility becomes visible
    .style("top", `${event.pageY - 20}px`) //mouse positioning relatively towards the middle
    .style("left", `${event.pageX + 20}px`); //mouse positioning right of tooltip
  }).
  on("mouseout", function (event, d) {
    tooltip.style("visibility", "hidden"); // upon mouseout, visibility becomes hidden
  });

  //array for legend
  var tempArr = [];
  for (let i = 0; i < colorHex.length; i++)
  {
    tempArr.push([minTemp + i * (maxTemp - minTemp) / (colorHex.length - 1), colorHex[i]]);
  }

  //legend scale, based on temp 
  var legendScale = d3.scaleLinear().domain([minTemp, maxTemp]).
  range([0, width / 2]);

  // actual color legend
  svg.append('g').attr('id', 'legend').selectAll("legend").
  data(tempArr).
  enter().
  append("rect").
  attr("x", i => legendScale(i[0] + 5.1)).
  attr('y', height - padding / 1.5).
  attr("width", width / 2 / colorHex.length).
  attr("height", 20).
  attr('fill', i => i[1]).
  attr("style", "outline: thin solid black;").
  attr('class', 'legend');


  //tick values for legend axis
  var legendTickValues = tempArr.map(i => i[0]);

  //legendAxis set values and tick formatting
  var legendAxis = d3.axisBottom(legendScale).
  ticks(colorHex.length).
  tickValues(legendTickValues).
  tickFormat(d3.format('.2f')).
  tickSize(12);

  //call legend axis, transform
  svg.append('g').
  call(legendAxis).
  attr('transform', `translate(${legendScale(tempArr[0][0] + 5)} , ${height - padding / 3})`);


});