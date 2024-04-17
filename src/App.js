import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

import './App.css';

function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
      if (!response.ok) {
        throw new Error('Network');
      }
      const jsonData = await response.json();

      setData(jsonData);

      const monthlyVariance = jsonData.monthlyVariance;
      const months = monthlyVariance.map(d => d.month);
      const years = monthlyVariance.map(d => d.year);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data && data.monthlyVariance) {
      const monthlyVariance = data.monthlyVariance;
      const baseTemperature = data.baseTemperature;

      //years
      const parseYear = d3.timeParse("%Y");
      const years = monthlyVariance.map(d => parseYear(d.year));
      const yearRange = 
        d3.range(
        d3.min(years)
        .getFullYear(), 
        d3.max(years)
        .getFullYear() + 1)
        .filter(year => year % 10 === 0);
      const tickValues = yearRange.map(year => new Date(year, 0, 1));

      //months
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      const months = monthlyVariance.map(d => monthNames[d.month - 1]);

      const fontSize = 16;
      const width = 5 * Math.ceil(monthlyVariance.length / 12);
      const height = 33 * 12;
      const padding = {
        left: 5 * fontSize,
        right: 9 * fontSize,
        top: 1 * fontSize,
        bottom: 8 * fontSize
      };

      const svg = d3.select("svg")
        .attr("width", width + padding.left + padding.right)
        .attr("height", height + padding.top + padding.bottom)
        .append("g")
        .attr("transform", `translate(${padding.left}, ${padding.top})`);

      const xScale = d3.scaleTime()
        .domain([d3.min(years), d3.max(years)])
        .range([0, width]);

      const yScale = d3.scaleBand()
        .domain(monthNames)
        .rangeRound([0, height])
        .padding(0.1);

      const g = svg.append("g")
        .attr("transform", "translate(" + 
        padding.left + "," + padding.top + ")");

      //x-axis
      g.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height - padding.top})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")).tickValues(tickValues))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("font-size", "10px");

      //y-axis
      svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("font-size", "12px");

      //color scale
      const colorRanges = [
        {color: '#313695', min: 2.8, max: 3.9},
        {color: '#4575b4', min: 3.9, max: 5.0},
        {color: '#74add1', min: 5.0, max: 6.1},
        {color: '#abd9e9', min: 6.1, max: 7.2},
        {color: '#e0f3f8', min: 7.2, max: 8.3},
        {color: '#fee090', min: 8.3, max: 9.5},
        {color: '#fdae61', min: 9.5, max: 10.6},
        {color: '#f46d43', min: 10.6, max: 11.7},
        {color: '#d73027', min: 11.7, max: 12.8},
        {color: '#a50026', min: 12.8, max: 14.0}
      ]
      const colors = [
        '#a50026','#d73027','#f46d43','#fdae61',
        '#fee090','#e0f3f8','#abd9e9','#74add1',
        '#4575b4','#313695'];

      const colorScale = d3.scaleLinear()
        .domain(colorRanges.map(range => range.min))
        .range(colorRanges.map(range => range.color));

      //legend
        const legendWidth = 300;
        const legendHeight = 20;
        const legendPadding = 10;
        const labelWidth = legendWidth / colorRanges.length;

        const legendSvg = d3.select(".App")
          .append("svg")
          .attr("class", "legend")
          .attr("id", "legend")
          .attr("width", legendWidth)
          .attr("height", legendHeight + legendPadding + 30)
          .style("margin-left", `${padding.left}px`);

        colorRanges.forEach((range, index) => {
          legendSvg.append("rect")
            .attr("x", index * labelWidth)
            .attr("y", legendPadding)
            .attr("width", labelWidth)
            .attr("height", legendHeight)
            .style("fill", range.color);

          legendSvg.append("text")
            .attr("x", index * labelWidth + labelWidth / 2)
            .attr("y", legendHeight + legendPadding + 20)
            .text(`${range.min.toFixed(1)}`)
            .attr("font-size", "10px")
            .attr("text-anchor", "middle");
        });

      //tooltip
      var Tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "bluegray")
        .style("padding", "5px");

      var mouseover = function(d) {
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "white")
        .style("opacity", 1);
      }

      var mousemove = function(event, d) {
        var Tooltip = d3.select("#tooltip");

        Tooltip
          .html(d.year + " - " + monthNames[d.month - 1] + 
          "<br>" + (baseTemperature + d.variance).toFixed(1) + "ºC" +
          "<br>" + d.variance.toFixed(1))
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .style("opacity", 0.9)
          .attr("data-year", d3.select(this).attr("data-year"));
      }

      var mouseleave = function(d) {
        Tooltip
        .style("opacity", 0)
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8);
      }

      // rectangles
      svg.append("g")
        .selectAll("rect")
        .data(monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(parseYear(d.year)) + padding.left)
        .attr("y", d => yScale(monthNames[d.month - 1]))
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => baseTemperature + d.variance)
        .attr("width", width / years.length * 12)
        .attr("height", height / 12 )
        .style("fill", d => colorScale(baseTemperature + d.variance))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


      

      

    }
  }, [data]);

  return (
    <div className="App">
      <div id="title">
        <strong>Monthly Global Land-Surface Temperature</strong>
        <p id="description">1753 - 2015: base temperature 8.66ºC</p>
      </div>
      <svg width="900" height="600"></svg>
    </div>
  );
}

export default App;
