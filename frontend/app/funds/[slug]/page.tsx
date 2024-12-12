"use client";

import Barchart from "@/components/Barchart";
import Slider from "@/components/Slider";
import LineChart, { DataPoint } from "@/components/line_chart_modular";
import { FundDataPoint, fetchData } from "@/lib/api";
import { db } from "@/lib/database";
import { use, useEffect, useState } from "react";
import Select from "react-select";

const processDataForLineChart = (data: FundDataPoint[]) => {
  return data
    .map((d) => ({
      time: d.reporting_date,
      holdings: d.value,
      stock: d.name_of_issuer,
    }))
    .sort((a, b) => (a.time < b.time ? 1 : -1)) as DataPoint[];
};

const processDataForBarChart = (data: FundDataPoint[]) => {
  return data.map((d) => ({
    holdingAmount: d.value,
    stock: d.name_of_issuer,
    time: d.reporting_date,
  }));
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
  const [filingManager, setFilingManager] = useState("");
  const [quarters, setQuarters] = useState([] as string[]);
  const quarterState = useState([0]);
  const quarterRangeState = useState([0, 0]);
  const companies = [...new Set(data.map((d) => d.name_of_issuer))].map(
    (c: string) => ({ value: c, label: c })
  );
  const [companyFilter, setCompanyFilter] = useState(
    companies.slice(0, 10).map((v) => v.value)
  );

  useEffect(() => {
    fetchData(slug).then(({ data, quarters: q , filingManager}) => {
      setData(data);
      setLoading(false);
      setQuarters(q);
      setFilingManager(filingManager);
      quarterState[1]([q.length - 1]);
      quarterRangeState[1]([0, q.length - 1]);
    });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No data!!!</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-4">
        Fund Details for {filingManager}
      </h1>
      <p className="text-lg text-center mb-6">
        View detailed information about fund {filingManager}.
      </p>

      <div className="w-full">
        {/* Company Filter */}
          <div className="w-full md:w-1/2 mx-auto mb-6">
            <Select
              isMulti
              name="stocks"
              options={companies}
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
                setCompanyFilter(v.map((c) => c.value));
              }}
            />
        </div>

        <div className="justify-center">
          {/* Bar Chart Section */}
          <div className="w-full lg:w-1/2 px-4 mb-8">
            <div className="w-3/4 mx-auto">
              <Slider quarters={quarters} state={quarterState} range={false} />
            </div>
            <h2 className="text-2xl text-center mt-4">
              Holdings during {getQuarters(quarters, quarterState[0])[0]}
            </h2>
            <Barchart
              width={0.75}
              height={400}
              companies={companyFilter}
              data={processDataForBarChart(data)}
              quarter={getQuarters(quarters, quarterState[0])[0]}
            />
          </div>

          {/* Line Chart Section */}
          <div className="w-full lg:w-1/2 px-4 mb-8">
            <div className="w-3/4 mx-auto">
              <Slider
                quarters={quarters}
                state={quarterRangeState}
                range={true}
              />
            </div>
            <h2 className="text-2xl text-center mt-4">
              Trend of holding between{" "}
              {getQuarters(quarters, quarterRangeState[0])
                .filter((_, i, a) => i === 0 || i === a.length - 1)
                .join(" and ")}
            </h2>
            <LineChart
              width={0.75}
              height={400}
              groupKey="stock"
              companies={companyFilter}
              data={processDataForLineChart(data)}
              quarters={getQuarters(quarters, quarterRangeState[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
