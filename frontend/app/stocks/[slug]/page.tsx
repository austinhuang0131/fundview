"use client";

import {use, useEffect, useState} from "react";
import LineChart, { DataPoint } from "@/components/line_chart_modular";
import { fetchStockData, StockDataPoint } from "@/lib/api";
import Select from "react-select";
import Slider from "@/components/Slider";
import { getQuarters } from "@/lib/getQuarters";

export default function StockDetail({params}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = use(params).slug;
    const [data, setData] = useState<DataPoint[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [quarters, setQuarters] = useState([] as string[]);
    // const quarterState = useState([0]);
    const quarterRangeState = useState([0, 0]);
    const funds = [...new Set(data.map((d) => d.FundName))].map(
        (c) => ({ value: c as string, label: c as string })
      );
    const [fundFilter, setFundFilter] = useState(
        funds.slice(0, 10).map((v) => v.value)
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the fetchStockData function from api.ts
                const { data: stockData, quarters: q } = await fetchStockData(slug);

                // Process data for the line chart
                const processedData = stockData.map((row: StockDataPoint) => ({
                    time: row.reporting_date,
                    holdings: row.value,
                    FundName: row.name_of_fund,
                }));
                setQuarters(q);
                setData(processedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        };

        if (slug) fetchData();
    }, [slug]);

    if (isLoading) return <p>Loading...</p>;
    if (!data.length) return <p>No data found for CUSIP {slug}</p>;

    return (
        <div>
            <h1>Details for CUSIP: {slug}</h1>
            {/* TODO: name */}
            <div className="w-full">
                {/* Company Filter */}
                <div className="w-full md:w-1/2 mx-auto mb-6">
                    <Select
                    isMulti
                    name="funds"
                    options={funds}
                    className="w-full"
                    styles={{
                        control: (base) => ({
                        ...base,
                        borderColor: "#4C1D95", // Tailwind's purple-900 color for select-primary
                        borderWidth: "2px",
                        boxShadow: "none",
                        "&:hover": {
                            borderColor: "#6B21A8", // Tailwind's purple-800 color for hover state
                        },
                        }),
                        multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#EDE9FE", // Tailwind's purple-100 color
                        color: "#4C1D95",
                        }),
                        multiValueLabel: (base) => ({
                        ...base,
                        color: "#4C1D95", // Tailwind's purple-900 color
                        }),
                        multiValueRemove: (base) => ({
                        ...base,
                        color: "#4C1D95",
                        "&:hover": {
                            backgroundColor: "#6B21A8", // Tailwind's purple-800 color for hover state
                            color: "white",
                        },
                        }),
                    }}
                    onChange={(v) => {
                        setFundFilter(v.map((c) => c.value));
                    }}
                    />
                </div>
            </div>
            <div className="justify-center">
          {/* Bar Chart Section */}
            <div className="w-full lg:w-1/2 px-4 mb-8">
                <div className="justify-center w-3/4 mx-auto ">
                <Slider
                    quarters={quarters}
                    state={quarterRangeState}
                    range={true}
                />
                </div>
                <h2 className="text-2xl text-center mt-4">
                Holdings during{" "}
                {getQuarters(quarters, quarterRangeState[0])
                .filter((_, i, a) => i === 0 || i === a.length - 1)
                .join(" and ")}
                </h2>
                <LineChart
                    data={data}
                    width={0.8}
                    height={400}
                    groupKey="FundName"
                    title={`Holdings Over Time for ${slug}`}
                    companies={fundFilter}
                    quarters={getQuarters(quarters, quarterRangeState[0])}
                />
            </div>
            </div>
        </div>
    );
}