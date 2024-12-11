import { randomNormal } from "d3"; // for sample data

export type FundDataPoint = {
  reporting_date: string, // for now, could be a date project
  value: number,
  name_of_issuer: string
}

const dateToQuarter = (date: string) => {
  const matches = date.match(/^(3\d-\w{3})-(\d{4})$/)!;
  switch (matches[1]) {
    case "31-DEC":
      return `${matches[2]} Q4`;
    case "30-SEP":
      return `${matches[2]} Q3`;
    case "30-JUN":
      return `${matches[2]} Q2`;
    default:
      return `${matches[2]} Q1`;
  }
};

export async function fetchHelloData() {
  const response = await fetch("http://localhost:8000/hello");
  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }
  return response.json();
}

export async function fetchTestData() {
  const r = randomNormal(100, 10);
  const dates = ["2021", "2022", "2023"]
    .map(y => [`31-DEC-${y}`, `30-SEP-${y}`, `30-JUN-${y}`, `31-MAR-${y}`])
    .reduce((a, b) => [...a, ...b]);
  const data: FundDataPoint[] =
    ["Pear Computers", "Dino Oil", "Money Bank"].map(name_of_issuer => dates.map(d => {
      return {
        reporting_date: dateToQuarter(d),
        value: r(),
        name_of_issuer
      } as FundDataPoint;
    }))
    .reduce((a, b) => [...a, ...b])
    .sort((a, b) => a.reporting_date > b.reporting_date ? 1 : -1);
  const quarters = [...new Set(data.map(d => d.reporting_date))];
  return {data, quarters};
}