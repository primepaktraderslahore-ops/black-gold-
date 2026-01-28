import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';


// Helper to get role (since we don't have a shared library yet, let's duplicate logic or create lib/auth.ts)
// For now, let's extract from header or cookie manually if needed, but since this is API, 
// middleware might not pass user info directly unless we modify headers. 
// We will read the cookie again here for security or rely on frontend to pass header.
// SAFEST: Read cookie here.
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
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: products });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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
        // Schema now uses title, variants, banner. Ensure body matches using ...body is fine.
        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product });
    } catch (err: any) {
        console.error('Create Product Error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();
    const role = await getRole();
    if (role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    try {
        await Product.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
