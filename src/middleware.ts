import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// Simple JWT decoding for middleware (Edge runtime)
// Since installing 'jose' might be extra, we can purely check for existence and rely on API to verify signature for data access.
// OR better: use a simple verified check if possible.
// For now, let's basic check existence and redirect. Secure content is protected by API checks.

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isAdminPath = path.startsWith('/admin');
    const token = request.cookies.get('admin_token')?.value;

    if (isAdminPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (path === '/login' && token) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Role protection (e.g., /admin/users is Super Admin only)
    // Decoding JWT in middleware without 'jose' library is tricky if edge.
    // We will enforce strict Role checks in the PAGE layout or API calls.
    // For visual protection, we can decode base64.

    if (path.startsWith('/admin') && token) {
        try {
            const [, payload] = token.split('.');
            const decoded = JSON.parse(atob(payload));
            const role = decoded.role;

            const isSuperAdminRoute = path.startsWith('/admin/users') ||
                path.startsWith('/admin/settings') ||
                path.startsWith('/admin/products'); // If specific product management page

            // Adjust based on exact route structure. 
            // Super Admin only features:
            if (path.includes('/admin/users') && role !== 'super_admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
        } catch (e) {
            // Invalid token structure
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
