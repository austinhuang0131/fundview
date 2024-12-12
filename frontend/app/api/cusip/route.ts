import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
    try {
        const data = await db.query(
            'SELECT DISTINCT id.CUSIP, id.Symbol AS ticker ' +
            'FROM INFOTABLE it INNER JOIN INDUSTRY id ON it.CUSIP = id.CUSIP'
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}