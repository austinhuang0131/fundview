"use client"; 

import Slider from "@/components/Slider";
import LineChart, { DataPoint } from "@/components/line_chart_modular";
import { FundDataPoint, fetchTestData } from "@/lib/api";
import { use, useEffect, useState } from "react";

const processDataForScatterplot = (data: FundDataPoint[]) => {
  return data.map(d => ({
    time: d.reporting_date,
    holdings: d.value,
    stock: d.name_of_issuer
  })).sort((a, b) => a.time < b.time ? 1 : -1) as DataPoint[];
};

const getQuarters = (quarters: string[], indices: number[]) => {
  switch (indices.length) {
    case 0:
      return [];
    case 1:
      return [quarters[indices[0]]];
    default:
      return quarters.slice(indices[0], indices[1] + 1);
  }
};

export default function FundDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = use(params).slug;

  const [data, setData] = useState([] as FundDataPoint[]);
  const [isLoading, setLoading] = useState(true);

  const [quarters, setQuarters] = useState([] as string[]);
  const quarterState = useState([0]);
  const quarterRangeState = useState([0, 0]);

  useEffect(() => {
    fetchTestData()
      .then(({data, quarters: q}) => {
        setData(data);
        setLoading(false);
        setQuarters(q);
        quarterState[1]([q.length - 1]);
        quarterRangeState[1]([0, q.length - 1]);
        console.log(q);
      })
  }, []);
  
  if (isLoading) return (
    <p>Loading...</p>
  )
  if (!data) return (
    <p>No data!!!</p>
  )
  return (
    <div>
      <h1>Fund Details for {slug}</h1>
      <p>View detailed information about fund {slug}.</p>
      <div style={{ width: "100%" }}>
        <div style={{ width: "50%", display: "inline-block" }}>
          <div style={{ width: "70%", height: "100px", marginLeft: "auto", marginRight: "auto", marginTop: "50px" }}>
            <Slider quarters={quarters}
              state={quarterState} range={false} />
          </div>
        </div>
        <div style={{ width: "50%", display: "inline-block" }}>
          <div style={{ width: "70%", height: "100px", marginLeft: "auto", marginRight: "auto", marginTop: "50px" }}>
            <Slider quarters={quarters}
              state={quarterRangeState} range={true} />
          </div>
          <LineChart
            width={0.45} height={400} title="Sample text" groupKey="stock"
            data={processDataForScatterplot(data)} quarters={getQuarters(quarters, quarterRangeState[0])}
          />
        </div>
      </div>
    </div>
  );
}
