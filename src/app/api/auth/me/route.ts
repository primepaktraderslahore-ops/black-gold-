import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

export async function GET() {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return NextResponse.json({
            user: {
                email: decoded.email,
                role: decoded.role,
                userId: decoded.userId
            }
        });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}
