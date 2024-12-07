//https://observablehq.com/d/6103dbf577b791c7

"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface DataPoint {
    time: string; // Time period (e.g., "2023 Q1")
    holdings: number; // Holdings value
    [key: string]: string | number; // Flexible keys for groupings
}

interface ScatterplotProps {
    data: DataPoint[]; // Dataset for the chart
    width: number; // Chart width
    height: number; // Chart height
    groupKey: string; // Key to group lines (e.g., "stock", "fund", "industry")
    title?: string; // Optional chart title
}

function Scatterplot({ data, width, height, groupKey, title }: ScatterplotProps) {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const margin = { top: 50, bottom: 40, left: 50, right: 20 };

        // Clear previous chart
        d3.select(ref.current).selectAll("*").remove();

        // Calculate y-axis dynamic minimum value (10% lower than the range)
        const yMin = d3.min(data, (d) => d.holdings)!;
        const yMax = d3.max(data, (d) => d.holdings)!;
        const yRange = yMax - yMin;

        // Define scales
        const x = d3.scaleBand()
            .domain([...new Set(data.map((d) => d.time))])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([yMin - 0.1 * yRange, yMax]) // Scale 10% below min
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal<string>()
            .domain([...new Set(data.map((d) => d[groupKey] as string))])
            .range(d3.schemeCategory10);

        // Create the SVG container
        const svg = d3.select(ref.current)
            .append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("style", "max-width: 100%; height: auto;");

        // Add a title
        if (title) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(title);
        }

        // Add the axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add lines for grouped data
        const line = d3.line<DataPoint>()
            .x((d) => (x(d.time) || 0) + x.bandwidth() / 2)
            .y((d) => y(d.holdings));

        const groupedData = d3.group(data, (d) => d[groupKey] as string);

        svg.append("g")
            .selectAll("path")
            .data(groupedData)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", ([key]) => color(key))
            .attr("stroke-width", 2)
            .attr("d", ([, values]) => line(values.sort((a, b) => a.time.localeCompare(b.time)))!);

        // Add points with tooltips
        svg.append("g")
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d) => (x(d.time) || 0) + x.bandwidth() / 2)
            .attr("cy", (d) => y(d.holdings))
            .attr("r", 5)
            .attr("fill", (d) => color(d[groupKey] as string))
            .on("mouseover", (event, d) => {
                d3.select(event.target).attr("stroke", "black").attr("stroke-width", 2);
            })
            .on("mouseout", (event) => {
                d3.select(event.target).attr("stroke", "none");
            });
    }, [data, width, height, groupKey, title]);

    return <svg ref={ref} width={width} height={height} />;
}

export default Scatterplot;
