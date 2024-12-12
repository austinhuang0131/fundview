import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

const fundHoldingsQuery = `
SELECT 
    it.NAMEOFISSUER AS name_of_issuer,
    it.TITLEOFCLASS AS title_of_class,
    it.CUSIP AS cusip,
    it.VALUE AS value,
    cp.REPORTCALENDARORQUARTER AS reporting_date,
    cp.FILINGMANAGER_NAME AS filing_manager_name,
    sub.CIK AS cik,
    sub.PERIODOFREPORT AS period_of_report
FROM ThirteenF.INFOTABLE AS it
INNER JOIN ThirteenF.COVERPAGE AS cp ON cp.ACCESSION_NUMBER = it.ACCESSION_NUMBER
INNER JOIN ThirteenF.SUBMISSION AS sub ON sub.ACCESSION_NUMBER = it.ACCESSION_NUMBER
WHERE it.CUSIP = ?;
`;

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ cusip: string }> }
) {
    try {
        const { cusip } = await context.params;

        const fundHoldings = await db.query(fundHoldingsQuery, [cusip]);
        console.log(`Funds fetched successfully for CUSIP: ${cusip}`);
        return NextResponse.json(fundHoldings);
    } catch (error) {
        console.error("Error fetching stock:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}