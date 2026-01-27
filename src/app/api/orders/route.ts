import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const order = await Order.create(body);
        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
