import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
    // Publicly accessible to fetch content
    try {
        const contents = await Content.find({});
        // Convert to clearer object { key: value_obj }
        const data: any = {};
        contents.forEach(c => {
            try {
                data[c.key] = JSON.parse(c.value);
            } catch (e) {
                data[c.key] = c.value;
            }
        });
        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { key, value } = await req.json();
        // Upsert
        await Content.findOneAndUpdate(
            { key },
            { value: JSON.stringify(value) },
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
