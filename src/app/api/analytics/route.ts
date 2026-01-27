import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { OrderStatus } from '@/models/Order';

export async function GET() {
    try {
        await dbConnect();

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Helper to sum delivered orders since a date
        const getSales = async (fromDate: Date) => {
            const result = await Order.aggregate([
                {
                    $match: {
                        status: OrderStatus.DELIVERED,
                        updatedAt: { $gte: fromDate }, // Use updatedAt because that's when it was marked delivered typically
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' },
                    },
                },
            ]);
            return result[0]?.total || 0;
        };

        const [daily, weekly, monthly] = await Promise.all([
            getSales(startOfDay),
            getSales(startOfWeek),
            getSales(startOfMonth),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                daily,
                weekly,
                monthly,
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
