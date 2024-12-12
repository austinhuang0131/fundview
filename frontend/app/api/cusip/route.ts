import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
    try {
        const cusips = await db.query('SELECT DISTINCT CUSIP FROM INFOTABLE');
        return NextResponse.json(cusips);
    } catch (error) {
        console.error('Error fetching CUSIPs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}