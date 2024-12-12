//https://observablehq.com/d/6103dbf577b791c7

"use client";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

export interface DataPoint {
    time: string; // Time period (e.g., "2023 Q1")
    holdings: number; // Holdings value
    [key: string]: string | number; // Flexible keys for groupings
}

interface LineChartProps {
    data: DataPoint[]; // Dataset for the chart
    width: number; // Chart width, as a multiplier of window
    height: number; // Chart height, absolute value
    groupKey: string; // Key to group lines (e.g., "stock", "fund", "industry")
    title?: string; // Optional chart title
    quarters: string[]; // filter by quarters
    companies: string[];
}

function LineChart({ data, width, height, groupKey, title, quarters, companies }: LineChartProps) {
    const ref = useRef<SVGSVGElement>(null);
    const { width: windowWidth } = useWindowDimensions();
    width = width * windowWidth;

    useEffect(() => {
        const margin = { top: 20, right: 30, bottom: 40, left: 100 };

        // Clear previous chart
        d3.select(ref.current).selectAll("*").remove();

        // Calculate y-axis dynamic minimum value (10% lower than the range)
        const yMin = d3.min(data, (d: DataPoint) => d.holdings) ?? 0;
        const yMax = d3.max(data, (d: DataPoint) => d.holdings) ?? 0;
        const yRange = yMax - yMin;

        // Define scales
        const legendPadding = 200
        const x = d3.scaleBand()
            .domain(quarters ?? [...new Set(data.map((d) => d.time))])
            .range([margin.left, width - margin.right - legendPadding]);

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
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45),translate(-25, -5)");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - height / 2)
            .attr("y", margin.left - 80)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Holdings ($)");

        // Add lines for grouped data
        const line = d3.line<DataPoint>()
            .x((d: DataPoint) => (x(d.time) || 0) + x.bandwidth() / 2)
            .y((d: DataPoint) => y(d.holdings));

        if (quarters.length > 0)
            data = data.filter(d => quarters.indexOf(d.time) > -1);
        if (companies.length == 0)
            companies = [...new Set(
                data
                    .filter(d => d.time == quarters[quarters.length - 1])
                    .sort((a, b) => b.holdings - a.holdings).map(d => d[groupKey] as string)
            )].slice(0, 10);
        data = data.filter(d => companies.indexOf(d[groupKey] as string) > -1);

        const groupedData = Array.from(
            d3.group(data, (d: DataPoint) => d[groupKey] as string)
        );

        svg.append("g")
            .selectAll("path")
            .data(groupedData)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", ([key]: [string, DataPoint[]]) => color(key))
            .attr("stroke-width", 2)
            .attr(
                "d",
                ([, values]: [string, DataPoint[]]) =>
                    line(values.sort((a, b) => a.time.localeCompare(b.time)))!
            );

        // Add points with tooltips
        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("visibility", "hidden");

        svg.append("g")
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d: DataPoint) => (x(d.time) || 0) + x.bandwidth() / 2)
            .attr("cy", (d: DataPoint) => y(d.holdings))
            .attr("r", 5)
            .attr("fill", (d: DataPoint) => color(d[groupKey] as string))
            .on("mouseover", (event: MouseEvent, d: DataPoint) => {
                d3.select(event.target as SVGElement)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
                tooltip.style("visibility", "visible").text(`Holdings: ${d.holdings}`);
            })
            .on("mousemove", (event: MouseEvent) => {
                tooltip
                    .style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", (event: MouseEvent) => {
                d3.select(event.target as SVGElement).attr("stroke", "none");
                tooltip.style("visibility", "hidden");
            });

        // Add Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - legendPadding + 20}, ${margin.top})`);

        const keys = [...new Set(data.map((d) => d[groupKey] as string))];

        keys.forEach((key, i) => {
            const legendGroup = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendGroup.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", color(key));

            legendGroup.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .text(key)
                .style("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });

        return () => {
            tooltip.remove(); // Clean up tooltip on unmount
        };
    }, [data, width, height, groupKey, title]);

    return <svg ref={ref} width={width} height={height} />;
}

export default LineChart;