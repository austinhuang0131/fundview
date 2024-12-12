import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// SQL query to fetch CIK and FILINGMANAGER_NAME
const sqlQuery = `
WITH RankedSubmissions AS (
    SELECT
        SUBMISSION.CIK,
        COVERPAGE.FILINGMANAGER_NAME AS NAME,
        ROW_NUMBER() OVER (PARTITION BY SUBMISSION.CIK ORDER BY COVERPAGE.FILINGMANAGER_NAME) AS rn
    FROM
        SUBMISSION
    INNER JOIN
        COVERPAGE ON COVERPAGE.ACCESSION_NUMBER = SUBMISSION.ACCESSION_NUMBER
)
SELECT
    CIK,
    NAME
FROM
    RankedSubmissions
WHERE
    rn = 1;
`;

export async function GET() {
  try {
    const ciks = await db.query(sqlQuery); 
    return NextResponse.json(ciks);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
