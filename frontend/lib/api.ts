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

export type CIKNAME = {
  CIK: string,
  NAME: string
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

export async function fetchCikAndNames() {
    const response = await fetch(`/api/cik`);
    if (!response.ok) {
      throw new Error("Failed to fetch fund holdings data");
    }
    return response.json();
  }

export async function fetchHelloData() {
  const response = await fetch("http://localhost:8000/hello");
  if (!response.ok) {
    throw new Error("Failed to fetch data from the backend");
  }
  return response.json();
}

export async function fetchFundData(slug: string) {
  return processFundHoldings(await fetchFundHoldings(slug));
}

export async function fetchFundHoldings(cik: string) {
  const response = await fetch(`/api/fundholdings/${cik}`);
  if (!response.ok) {
    throw new Error("Failed to fetch fund holdings data");
  }
  return response.json();
}

function processFundHoldings(apiData: any[]): { data: FundDataPoint[], quarters: string[] , filingManager: string} {
  const filingManager = apiData[0].FILINGMANAGER_NAME;
  console.log(apiData[0].REPORTCALENDARORQUARTER);
  const processedData: FundDataPoint[] = apiData
  .filter(item => new Date(item.REPORTCALENDARORQUARTER).getFullYear() > 2017)
  .map(item => ({
    reporting_date: dateToQuarter(item.REPORTCALENDARORQUARTER),
    value: item.VALUE,
    name_of_issuer: item.NAMEOFISSUER
  }));

  // Sort the data by reporting date
  processedData.sort((a, b) => a.reporting_date.localeCompare(b.reporting_date));

  // Get unique quarters
  const quarters = [...new Set(processedData.map(d => d.reporting_date))];
  console.log(quarters);

  return { data: processedData, quarters, filingManager};
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
  const processedData: StockDataPoint[] = apiData
  .filter(item => new Date(item.reporting_date).getFullYear() > 2017)
  .map((item) => ({
    reporting_date: dateToQuarter(item.reporting_date),
    value: item.value,
    name_of_fund: item.filing_manager_name,
  }));

  // Sort the data by reporting date
  processedData.sort((a, b) => a.reporting_date.localeCompare(b.reporting_date));

  // Get unique quarters
  const quarters = [...new Set(processedData.map(d => d.reporting_date))];

  return { data: processedData, quarters };
}