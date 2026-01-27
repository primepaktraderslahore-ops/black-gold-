import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isAdminPath = path.startsWith('/admin');
    const authCookie = request.cookies.get('admin_auth');

    if (isAdminPath && !authCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (path === '/login' && authCookie) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
