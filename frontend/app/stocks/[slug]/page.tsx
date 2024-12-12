"use client";

import {use, useEffect, useState} from "react";
import LineChart, { DataPoint } from "@/components/line_chart_modular";
import { fetchStockData, StockDataPoint } from "@/lib/api";

export default function StockDetail({params}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = use(params).slug;
    const [data, setData] = useState<DataPoint[]>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the fetchStockData function from api.ts
                const { data: stockData } = await fetchStockData(slug);

                // Process data for the line chart
                const processedData = stockData.map((row: StockDataPoint) => ({
                    time: row.reporting_date,
                    holdings: row.value,
                    FundName: row.name_of_fund,
                }));
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
            <div style={{ width: "100%", height: "500px" }}>
                <LineChart
                    data={data}
                    width={0.8}
                    height={400}
                    groupKey="FundName"
                    title={`Holdings Over Time for ${slug}`}
                    companies={[...new Set(data.map((d) => String(d.FundName)))]}
                />
            </div>
        </div>
    );
}