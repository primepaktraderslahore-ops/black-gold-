import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        // Simple successful login response
        // In a real app, set a cookie here or return a JWT
        const response = NextResponse.json({ success: true });

        // Set a simple cookie for demonstration (insecure but works for this scope)
        response.cookies.set('admin_auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
