import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ReferralCode from '@/models/ReferralCode';
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
    if (role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const codes = await ReferralCode.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, codes });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const code = await ReferralCode.create(body);
        return NextResponse.json({ success: true, code });
    } catch (err) {
        // Check for duplicate key error
        if ((err as any).code === 11000) {
            return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create code' }, { status: 500 });
    }
}
