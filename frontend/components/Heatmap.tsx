// https://observablehq.com/d/d25f80a4399ac86d

"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { Legend } from "../lib/d3-color-legend";

function Heatmap(props: { data: {x: string, y: string, v: number}[], width: number, height: number, legend_title: string}) {
    const ref = useRef(null);

    const getTextColor = (c: string) => {
        const color = d3.color(c)?.rgb();
        if (!color) return "white";
        // Compute the "relative luminance".
        const luminance = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
        // Use dark text on light backgrounds and vice versa.
        return luminance > 0.5 ? 'black' : 'white';
    }

    useEffect(() => {
        const margin = {top: 40, bottom: 20, left: 40, right: 0};
        const legend_margin = {top: 0, right: 20, width: 100};
        const x_scale_half = 5;

        d3.select(ref.current)
            .selectAll("*")
            .remove();
    
        // Define the horizontal scale.
        const x = d3.scaleBand()
            .domain([...new Set(props.data.map(d => d.x))])
            .range([margin.left, props.width - margin.right])
            .padding(0.1);
    
        // Define the vertical scale.
        const y = d3.scaleBand()
            .domain([...new Set(props.data.map(d => d.y))])
            .range([props.height - margin.bottom, margin.top])
            .padding(0.1);
    
        // Define the color scale.
        const color = d3.scaleDiverging([-x_scale_half, 0, x_scale_half], ["red", "white", "green"]);
    
        // Create the container SVG.
        const svg = d3.select(ref.current)
            .append("svg")
            .attr("width", props.width)
            .attr("height", props.height)
            .attr("viewBox", [0, 0, props.width, props.height])
            .attr("style", "max-width: 100%; height: auto;");
    
        // Add the axes.
        svg.append("g")
            .attr("transform", `translate(0,${props.height - margin.bottom})`)
            .call(d3.axisBottom(x));
    
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    
        // draw the rectangles
        svg.append("g")
            .selectAll("rect")
            .data(props.data)
            .join("rect")
            .attr("x", d => x(d.x)!)
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.y)!)
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d.v))
    
        // add the labels
        svg.append("g")
            .selectAll("text")
            .data(props.data)
            .join("text")
            .attr("x", d => x(d.x)! + x.bandwidth() / 2)
            .attr("y", d => y(d.y)! + y.bandwidth() / 2 + 5)
            .attr("fill", d => getTextColor(color(d.v)))
            .style("text-anchor", "middle")
            .text(d => `${d3.format('+.2f')(d.v)}%`);

        // legend
        svg.append("g")
            .attr("transform",
                `translate(${props.width - legend_margin.right - legend_margin.width},${legend_margin.top})`
            )
            .append(() => Legend(color, {
                title: props.legend_title,
                width: legend_margin.width,
                tickFormat: (d: number) => `${d3.format('+.2f')(d)}%`}))
            .attr("id", "legend");
    }, [props.data, props.height, props.width, props.legend_title]);

    return <svg width={props.width} height={props.height} id="heatmap" ref={ref} />;
};

export default Heatmap;