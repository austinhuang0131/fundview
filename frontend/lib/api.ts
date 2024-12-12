import { randomNormal } from "d3"; // for sample data

export type FundDataPoint = {
  reporting_date: string, // for now, could be a date project
  value: number,
  name_of_issuer: string
}

export type StockDataPoint = {
  reporting_date: string, // for now, could be a date project
  value: number,
  name_of_fund: string
}

const dateToQuarter = (date: string) => {
  const matches = date.match(/^(\d{4})-(\d{2})-(\d{2})/)!;
  switch (matches[1]) {
    case "12":
      return `${matches[2]} Q4`;
    case "09":
      return `${matches[2]} Q3`;
    case "06":
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

export async function fetchFundData(slug: string) {
  return processFundHoldings(await fetchFundHoldings(slug));
}

export async function fetchFundHoldings(cik: string) {
  const response = await fetch(`/api/cusip/${cik}`);
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

  return { data: processedData, quarters };
}

// Fetch stock data by slug and process it
export async function fetchStockData(slug: string) {
  return processStockHoldings(await fetchStockHoldings(slug));
}

// Fetch raw stock holdings data by CUSIP
export async function fetchStockHoldings(cusip: string) {
  const response = await fetch(`/api/cusip/${cusip}`);
  if (!response.ok) {
    throw new Error("Failed to fetch stock holdings data");
  }
  return response.json();
}

// Process stock holdings data into a usable format
function processStockHoldings(apiData: any[]): { data: StockDataPoint[]; quarters: string[] } {
  const processedData: StockDataPoint[] = apiData.map((item) => ({
    reporting_date: dateToQuarter(item.REPORTCALENDARORQUARTER),
    value: item.VALUE,
    name_of_fund: item.FILINGMANAGER_NAME,
  }));

  // Sort the data by reporting date
  processedData.sort((a, b) => a.reporting_date.localeCompare(b.reporting_date));

  // Get unique quarters
  const quarters = [...new Set(processedData.map(d => d.reporting_date))];

  return { data: processedData, quarters };
}