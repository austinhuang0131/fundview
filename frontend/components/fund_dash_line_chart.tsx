//https://observablehq.com/d/6103dbf577b791c7

"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface DataPoint {
    x: string; // Represents time (e.g., "2023 Q1")
    stock: string; // Represents stock name (e.g., "Stock A")
    holdings: number; // Represents y-axis value
}

interface ScatterplotProps {
    data: DataPoint[]; // Dataset for the chart
    width: number; // Chart width
    height: number; // Chart height
}

function Scatterplot({ data, width, height }: ScatterplotProps) {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const margin = { top: 20, bottom: 40, left: 50, right: 20 };

        // Clear previous chart
        d3.select(ref.current).selectAll("*").remove();

        // Define the horizontal scale.
        const x = d3.scaleBand()
            .domain([...new Set(data.map((d) => d.x))])
            .range([margin.left, width - margin.right]);

        // Define the vertical scale.
        const y = d3.scaleLinear()
            .domain([
                d3.min(data, (d) => d.holdings)! - 5, // Extend below minimum
                d3.max(data, (d) => d.holdings)!,
            ])
            .range([height - margin.bottom, margin.top]);

        // Define the color scale.
        const color = d3.scaleOrdinal<string>()
            .domain([...new Set(data.map((d) => d.stock))])
            .range(d3.schemeCategory10);

        // Create the container SVG.
        const svg = d3.select(ref.current)
            .append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("style", "max-width: 100%; height: auto;");

        // Add the x-axis.
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        // Add the y-axis.
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add lines connecting points for each stock.
        const line = d3
            .line<DataPoint>()
            .x((d) => (x(d.x) || 0) + x.bandwidth() / 2)
            .y((d) => y(d.holdings));

        const groupedData = d3.group(data, (d) => d.stock);

        svg.append("g")
            .selectAll("path")
            .data(groupedData)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", ([stock]) => color(stock))
            .attr("stroke-width", 2)
            .attr("d", ([, values]) => line(values.sort((a, b) => a.x.localeCompare(b.x)))!);

        // Create a tooltip div (hidden by default).
        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("box-shadow", "0px 2px 4px rgba(0, 0, 0, 0.1)")
            .style("pointer-events", "none")
            .style("visibility", "hidden");

        // Add circles for data points with hover interaction.
        svg.append("g")
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d) => (x(d.x) || 0) + x.bandwidth() / 2)
            .attr("cy", (d) => y(d.holdings))
            .attr("r", 5)
            .attr("fill", (d) => color(d.stock))
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").text(`Holdings: ${d.holdings}`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        // Cleanup tooltip on unmount.
        return () => {
            tooltip.remove();
        };
    }, [data, width, height]);

    return <svg ref={ref} width={width} height={height} />;
}

export default Scatterplot;
