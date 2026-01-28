import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password, secretKey } = await req.json();

        // Simple protection for initial setup
        if (secretKey !== process.env.ADMIN_SECRET_KEY && !process.env.ADMIN_SECRET_KEY) {
            // If no secret key env is set, maybe allow it? or strictly block. 
            // For security, let's assume we need a secret key to create the FIRST super admin or use a seed script.
            // However, to make it easy for the user:
            const userCount = await User.countDocuments();
            if (userCount > 0 && secretKey !== process.env.ADMIN_SECRET_KEY) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // First user is always Super Admin, others default to Admin unless specific logic added
        const isFirstUser = (await User.countDocuments()) === 0;
        const role = isFirstUser ? UserRole.SUPER_ADMIN : UserRole.ADMIN;

        const user = await User.create({
            email,
            password: hashedPassword,
            role,
        });

        return NextResponse.json({ success: true, user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
