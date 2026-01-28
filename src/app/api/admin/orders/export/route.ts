import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { OrderStatus } from '@/models/Order';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

async function getRole() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded.role;
    } catch (e) {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    const role = await getRole();
    if (!role) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Only Delivered orders? User said "delivered orders table can be downloaded".
        const orders = await Order.find({ status: OrderStatus.DELIVERED }).sort({ updatedAt: -1 });

        const csvHeader = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Address', 'Items', 'Total Amount', 'Status'].join(',');
        const csvRows = orders.map((order: any) => {
            const itemsStr = order.items.map((i: any) => `${i.quantity}x ${i.variant}`).join('; ');
            return [
                order._id,
                new Date(order.updatedAt).toISOString(),
                `"${order.customer.name}"`,
                order.customer.phone,
                order.customer.email,
                `"${order.customer.address}, ${order.customer.city}"`,
                `"${itemsStr}"`,
                order.totalAmount,
                order.status
            ].join(',');
        });

        const csvContent = [csvHeader, ...csvRows].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="delivered_orders_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (err) {
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
