import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

import ReferralCode from '@/models/ReferralCode';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();

        let discount = 0;
        let finalTotal = body.totalAmount;

        if (body.referralCode) {
            const code = await ReferralCode.findOne({ code: body.referralCode, isActive: true });
            if (code) {
                // Check max uses if applicable
                if (code.maxUses && code.usedCount >= code.maxUses) {
                    // Code expired logic, but maybe just ignore it or return error?
                    // For better UX, assume frontend checks validation, backend enforces.
                    // If invalid, we proceed without discount or error. Let's error for stricter control.
                    return NextResponse.json({ success: false, error: 'Referral code limit reached' }, { status: 400 });
                }

                discount = (finalTotal * code.discountPercentage) / 100;
                finalTotal = finalTotal - discount;

                // Increment usage
                code.usedCount += 1;
                await code.save();
            } else {
                return NextResponse.json({ success: false, error: 'Invalid referral code' }, { status: 400 });
            }
        }

        const newOrder = await Order.create({ ...body, totalAmount: finalTotal });

        return NextResponse.json({ success: true, data: newOrder });
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
