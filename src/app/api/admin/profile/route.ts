import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (e) {
        return null; // Invalid token
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const currentUser = await getUser();

    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email, password } = await req.json();

        // Find the user
        const user = await User.findById(currentUser.userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Update fields if provided
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        return NextResponse.json({ success: true, message: 'Profile updated' });

    } catch (err) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
