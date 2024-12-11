// https://observablehq.com/d/d25f80a4399ac86d

"use client";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

function Barchart(props: {
    data: {stock: string, holdingAmount: number, time: string}[],
    width: number, height: number, quarter: string
}) {
    const ref = useRef(null);
    const { width: windowWidth } = useWindowDimensions();
    const canvasWidth = props.width * windowWidth;

    useEffect(() => {
        // Sort by holdingAmount in descending order and take the top 5
        const top5Data = props.data
            .filter(d => d.time == props.quarter)
            .sort((a, b) => b.holdingAmount - a.holdingAmount)
            .slice(0, 5);

        // Set up dimensions and margins
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = canvasWidth - margin.left - margin.right;
        const height = props.height - margin.top - margin.bottom;

        // Create scales
        const x = d3.scaleBand()
            .domain(top5Data.map(d => d.stock))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(props.data, d => d.holdingAmount)!])
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
            .call(d3.axisLeft(y));

        // Define a color scale
        const color = d3.scaleOrdinal<string>()
            .domain(props.data.map(d => d.stock))
            .range(d3.schemeCategory10);
        
        // Draw bars with different colors
        svg
            .selectAll("rect")
            .data(top5Data)
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
            .attr("fill", (d) => color(d.stock)); // Assign color based on stock name

    }, [props.data, props.height, props.width, windowWidth]);

    return <svg width={canvasWidth} height={props.height} id="barchart" ref={ref} />;
};

export default Barchart;