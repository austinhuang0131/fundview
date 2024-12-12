import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

const fundHoldingsQuery = 
`
SELECT 
    it.NAMEOFISSUER,
    it.TITLEOFCLASS,
    it.CUSIP,
    it.VALUE,
    cp.REPORTCALENDARORQUARTER,
    cp.FILINGMANAGER_NAME,
    sub.CIK,
    sub.PERIODOFREPORT,
    ind.SECTOR
FROM ThirteenF.INFOTABLE as it
INNER JOIN ThirteenF.COVERPAGE as cp on cp.ACCESSION_NUMBER = it.ACCESSION_NUMBER
INNER JOIN ThirteenF.SUBMISSION as sub on sub.ACCESSION_NUMBER = it.ACCESSION_NUMBER
INNER JOIN ThirteenF.INDUSTRY as ind on it.CUSIP = ind.CUSIP
WHERE sub.CIK = ? AND REPORTCALENDARORQUARTER < '2022-12-31'
; -- AND (TITLEOFCLASS LIKE '%stock%' OR TITLEOFCLASS LIKE '%equity%');
`;

export async function GET(
    request: NextRequest,
    context: { params: { cik: string } }
) {
    try {
        const { cik } = await context.params;

        const fundHoldings = await db.query(fundHoldingsQuery, [cik]);
        console.log(`Funds fetched successfully for CIK: ${cik}`);
        return NextResponse.json(fundHoldings);
    } catch (error) {
        console.error('Error fetching funds:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
