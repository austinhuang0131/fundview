import { randomNormal } from "d3"; // for sample data

export type FundDataPoint = {
  reporting_date: string, // for now, could be a date project
  value: number,
  name_of_issuer: string
}

const dateToQuarter = (date: string) => {
  const matches = date.match(/^(\d{4})-(\d{2})-(\d{2})/)!;
  switch (matches[2]) {
    case "12":
      return `${matches[1]} Q4`;
    case "09":
      return `${matches[1]} Q3`;
    case "06":
      return `${matches[1]} Q2`;
    default:
      return `${matches[1]} Q1`;
  }
};

export async function fetchHelloData() {
  const response = await fetch("http://localhost:8000/hello");
  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }
  return response.json();
}

// export async function fetchTestData() {
//   const r = randomNormal(100, 10);
//   const dates = ["2021", "2022", "2023"]
//     .map(y => [`31-DEC-${y}`, `30-SEP-${y}`, `30-JUN-${y}`, `31-MAR-${y}`])
//     .reduce((a, b) => [...a, ...b]);
//   const data: FundDataPoint[] =
//     ["Pear Computers", "Dino Oil", "Money Bank"].map(name_of_issuer => dates.map(d => {
//       return {
//         reporting_date: dateToQuarter(d),
//         value: r(),
//         name_of_issuer
//       } as FundDataPoint;
//     }))
//     .reduce((a, b) => [...a, ...b])
//     .sort((a, b) => a.reporting_date > b.reporting_date ? 1 : -1);
//   const quarters = [...new Set(data.map(d => d.reporting_date))];
//   return {data, quarters};
// }

export async function fetchData(slug: string) {
  return processFundHoldings(await fetchFundHoldings(slug));
}

export async function fetchFundHoldings(cik: string) {
  const response = await fetch(`/api/fundholdings/${cik}`);
  if (!response.ok) {
    throw new Error("Failed to fetch fund holdings data");
  }
  return response.json();
}

function processFundHoldings(apiData: any[]): { data: FundDataPoint[], quarters: string[] } {
  console.log(apiData[0].REPORTCALENDARORQUARTER);
  const processedData: FundDataPoint[] = apiData.map(item => ({
    reporting_date: dateToQuarter(item.REPORTCALENDARORQUARTER),
    value: item.VALUE,
    name_of_issuer: item.NAMEOFISSUER
  }));

  // Sort the data by reporting date
  processedData.sort((a, b) => a.reporting_date.localeCompare(b.reporting_date));

  // Get unique quarters
  const quarters = [...new Set(processedData.map(d => d.reporting_date))];
  console.log(quarters);

  return { data: processedData, quarters };
}
