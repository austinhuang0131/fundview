// https://observablehq.com/d/d25f80a4399ac86d

"use client";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

type BarChartDataPoint = {stock: string, holdingAmount: number, time: string};

function Barchart(props: {
    data: BarChartDataPoint[],
    width: number, height: number, quarter: string, companies: string[]
}) {
    const ref = useRef(null);
    const { width: windowWidth } = useWindowDimensions();
    const canvasWidth = props.width * windowWidth;

    useEffect(() => {
        // Sort by holdingAmount in descending order and take selected companies
        let top5Data = props.data
            .filter(d => d.time == props.quarter &&
                (props.companies.length == 0 || props.companies.indexOf(d.stock) > -1)
            )
            .sort((a, b) => b.holdingAmount - a.holdingAmount);
        if (props.companies.length == 0)
            top5Data = top5Data.slice(0, 5);

        // Set up dimensions and margins
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = canvasWidth - margin.left - margin.right;
        const height = props.height - margin.top - margin.bottom;

        // Create scales
        const x = d3.scaleBand()
            .domain(top5Data.map(d => d.stock))
            .range([margin.left, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(top5Data, (d) => d.holdingAmount) || 0])
            .nice()
            .range([height, 0]);

        // Create SVG container
        if (d3.select(ref.current).select("#barchart_g").empty()) {
            d3.select(ref.current)
                .append("g")
                .attr("id", "barchart_g")
                .attr("transform", `translate(${margin.left},${margin.top})`)
                .append("g")
                .attr("id", "barchart_axes");
        }

        const svg = d3.select(ref.current).select("#barchart_g");
        const axesContainer = svg.select("#barchart_axes");

        axesContainer.selectAll("g").remove();

        // Add axes
        axesContainer.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        axesContainer.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - height / 2)
            .attr("y", margin.left - 103)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Holdings ($)");

        // Define a color scale
        // const color = d3.scaleOrdinal<string>()
        //     .domain(props.data.map(d => d.stock))
        //     .range(d3.schemeCategory10);

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
        
        // Draw bars with different colors
        const dataRects = svg
            .selectAll("rect")
            .data(top5Data);
        dataRects
            .join(
                enter => {
                    console.log(enter);
                    return enter.append("rect");
                },
                update => {
                    console.log(update);
                    return update;
                },
                exit => exit.remove()
            )
            .transition()
            .attr("x", d => x(d.stock)!)
            .attr("y", d => y(d.holdingAmount))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.holdingAmount))
            .attr("fill", "steelblue"); 
        
        dataRects
            .on("mouseover", (event: MouseEvent, d: BarChartDataPoint) => {
                d3.select(event.target as SVGElement)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
                tooltip.style("visibility", "visible").text(`Holdings: ${d.holdingAmount}`);
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

    }, [props.data, props.height, props.width, windowWidth]);

    return <svg width={canvasWidth} height={props.height} id="barchart" ref={ref} />;
};

export default Barchart;