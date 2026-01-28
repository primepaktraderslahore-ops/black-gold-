import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

import Setting from '@/models/Setting';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Ensure status updates are allowed
        const order = await Order.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Trigger Webhook if status changed to DELIVERED
        if (body.status === 'Delivered') {
            const setting = await Setting.findOne({ key: 'google_sheet_url' });
            if (setting && setting.value) {
                // Async fire and forget or await? Await to log error but don't fail request
                try {
                    const payload = {
                        orderId: (order as any)._id,
                        date: new Date().toISOString(),
                        customerName: (order as any).customer.name,
                        phone: (order as any).customer.phone,
                        total: (order as any).totalAmount,
                        items: (order as any).items.map((i: any) => `${i.quantity}x ${i.variant}`).join(', ')
                    };

                    // Google Apps Script usually expects POST
                    await fetch(setting.value, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (webhookErr) {
                    console.error('Webhook failed:', webhookErr);
                }
            }
        }

        return NextResponse.json({ success: true, data: order }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
