import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, users });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { email, password } = await req.json();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            role: 'admin' // Only creating regular admins via this UI usually
        });

        return NextResponse.json({ success: true, user: { email: user.email, role: user.role, _id: user._id } });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
