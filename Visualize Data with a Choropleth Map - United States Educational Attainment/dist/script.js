var width = 1000;
var height = 800;
var padding = 80;


//copy year, current format for d3 v6
var copyYearFormat = d3.timeFormat("%Y");
d3.select(".copyyear").text(copyYearFormat(new Date()));


const svg = d3.select(".svg-chart").append('svg').
attr("width", width).
attr("height", height);


var tooltip = d3.select(".svg-chart").append("div").
attr('class', 'tooltip').
attr("id", "tooltip").
style("visibility", "hidden");



const EDUCATION_SRC =
'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_SRC =
'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

var srcFiles = [EDUCATION_SRC, COUNTY_SRC];


// given a geometry or feature object, it generates the path data string suitable for the "d" attribute of an SVG path element. 
var path = d3.geoPath();

//by d3 v5,  queue was deprecated.
Promise.all(srcFiles.map(url => d3.json(url))).then(json => {
  var eduData = json[0];
  var usData = json[1];

  //create a fips dictionary paired with bachelors or higher  key value pairs
  fipsDict = {};
  // forEach to perform the provided function of setting dictionary pairs once for each array element.
  eduData.forEach(i => fipsDict[i['fips']] = i['bachelorsOrHigher']);

  // minimum Percentage of Bachelor's or higher in eduData set
  // 2.6 in this case
  var minPercent = d3.min(eduData, i => i.bachelorsOrHigher);

  // maximum Percentage of Bachelor's or higher in eduData set
  // 75.1 in this case
  var maxPercent = d3.max(eduData, i => i.bachelorsOrHigher);

  const COLOR_SCHEME = d3.schemeBrBG[9];

  var legendArr = [];

  for (let i = 0; i < COLOR_SCHEME.length; i++)
  {
    legendArr.push([minPercent + i * (maxPercent - minPercent) / (COLOR_SCHEME.length - 1), COLOR_SCHEME[i]]);
  }

  // colorScale, threshhold starting from 2.6  
  // d3.range(start, stop, [opt] step), starting from 2.6, up to 75.1 - 9.0625 = 66.0375, with each incremental step being split into 8 parts (9.0625)
  var colorScale = d3.
  scaleThreshold().
  domain(d3.range(minPercent, maxPercent, (maxPercent - minPercent) / d3.schemeBrBG[9].length)).
  range(d3.schemeBrBG[9]);

  // xScale
  var xScale = d3.scaleLinear().domain([minPercent, maxPercent]).rangeRound([padding, (width - padding) / 2]);

  // actual color legend
  svg.append('g').attr('id', 'legend').selectAll("legend").
  data(legendArr).
  enter().
  append("rect").
  attr("x", i => xScale(i[0] + padding * 1.135)).
  attr('y', height - padding / 1.5).
  attr("width", width / 2.3 / legendArr.length).
  attr("height", 20).
  attr('fill', i => i[1]).
  attr("style", "outline: thin solid black;").
  attr('class', 'legend');

  var legendTickValues = legendArr.map(i => i[0]);


  var legendAxis = d3.axisBottom(xScale).
  ticks(legendArr.length).
  tickFormat(x => `${x.toFixed(2)}%`).
  tickValues(legendTickValues).
  tickSize(12);

  //call legend axis, transform
  svg.append('g').
  call(legendAxis).
  attr('transform', `translate(${xScale(legendArr[0][0] + padding)} , ${height - padding / 3})`);




  svg.append('g').
  selectAll("path") // add "path" for all usData data points
  .data(topojson.feature(usData, usData.objects.counties).features).
  enter().
  append("path").
  attr('class', 'county').
  attr("d", path).
  attr('data-fips', i => i['id']).
  attr('data-education', i => fipsDict[i['id']]).
  attr('fill', i => colorScale(fipsDict[i['id']])).
  on('mouseover', function (event, d) {
    d3.select(this);
    tooltip.attr("data-education", fipsDict[d['id']]).
    html(`County: ${eduData.filter(item => item['fips'] == d['id'])[0]['area_name']}<br/>State: ${eduData.filter(item => item['fips'] == d['id'])[0]['state']}<br/>Percentage: ${fipsDict[d['id']]}%`) //tooltip flavor text
    //math.round *1000 / 1000 to 
    .style("visibility", "visible") //upon mouseover, visibility becomes visible
    .style("top", `${event.pageY - 20}px`) //mouse positioning relatively towards the middle
    .style("left", `${event.pageX + 20}px`); //mouse positioning right of tooltip
  }).
  on("mouseout", function (event, d) {
    tooltip.style("visibility", "hidden"); // upon mouseout, visibility becomes hidden
  });


  svg.append('text').
  attr('transform', `translate(${padding},${height - padding})`).
  attr('id', 'description').
  text(" Percentage of Ages 25 and above with Bachelor's Degrees or Higher (2010-2014)");


});