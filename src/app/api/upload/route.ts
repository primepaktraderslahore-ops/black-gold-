import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_');
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure directory exists (Node.js 10+, separate check/create might be needed if old node, but Next.js usually fine)
        // For brevity, assuming public folder exists. We might need to ensure 'uploads' exists.
        // Let's rely on manual creation or check.
        try {
            await writeFile(path.join(uploadDir, filename), buffer);
        } catch (error) {
            // Try creating dir if it fails (simple polyfill-ish)
            const fs = require('fs');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
                await writeFile(path.join(uploadDir, filename), buffer);
            } else {
                throw error;
            }
        }

        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
