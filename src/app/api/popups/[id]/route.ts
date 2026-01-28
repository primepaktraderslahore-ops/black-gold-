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

// Next.js 15: params is a Promise
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        await Popup.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const { isActive } = await req.json();
        await Popup.findByIdAndUpdate(id, { isActive });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
