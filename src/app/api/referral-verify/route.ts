import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ReferralCode from '@/models/ReferralCode';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { code } = await req.json();
        if (!code) {
            return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
        }

        const referral = await ReferralCode.findOne({ code: code.toUpperCase(), isActive: true });

        if (!referral) {
            return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 404 });
        }

        if (referral.maxUses && referral.usedCount >= referral.maxUses) {
            return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 });
        }

        return NextResponse.json({ success: true, discountPercentage: referral.discountPercentage });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
    }
}
