// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    
    // Get filename from the query parameter or generate one
    const { searchParams } = new URL(request.url);
    const providedFilename = searchParams.get('filename');
    
    // Generate a safe unique filename if none provided
    const filename = providedFilename || 
      `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    return NextResponse.json({
      url: blob.url,
      success: true
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      success: false 
    }, { status: 500 });
  }
}