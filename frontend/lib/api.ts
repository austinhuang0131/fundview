import { randomNormal } from "d3"; // for sample data

export type FundDataPoint = {
  reporting_date: string, // for now, could be a date project
  value: number,
  name_of_issuer: string
}

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
    ["Pear Computers", "Dino Oil", "Money Bank"].map(name_of_issuer => dates.map(reporting_date => {
      return {
        reporting_date,
        value: r(),
        name_of_issuer
      } as FundDataPoint;
    }))
    .reduce((a, b) => [...a, ...b]);
  return data;
}