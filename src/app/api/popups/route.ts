import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Popup from '@/models/Popup';
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

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const all = searchParams.get('all'); // Admin requests all

    try {
        let query: any = { isActive: true };
        if (location) query.location = location;

        if (all === 'true') {
            // Admin sees everything
            query = {};
        }

        const popups = await Popup.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: popups });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const popup = await Popup.create(body);
        return NextResponse.json({ success: true, data: popup });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
