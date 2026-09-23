import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const MAX_GLB_SIZE = 1024 * 1024 * 1024; // 1 GB
const ALLOWED_CONTENT_TYPES = ['model/gltf-binary', 'application/octet-stream'];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadPresignedBody;

    // Only a logged-in admin may ask the server to mint a presigned upload URL.
    // Upload-completed callbacks (if enabled by the SDK) come from Vercel Blob
    // and do not carry the user's Supabase session cookie.
    if (body.type === 'blob.generate-presigned-url') {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
      }
    }

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!pathname.toLowerCase().endsWith('.glb')) {
          throw new Error('Sono ammessi solo file .GLB');
        }

        const validUntil = Date.now() + 15 * 60 * 1000;
        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_GLB_SIZE,
          validUntil,
        });

        return {
          token,
          urlOptions: {
            validUntil,
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_GLB_SIZE,
            addRandomSuffix: true,
          },
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob presigned upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore upload Blob' },
      { status: 400 },
    );
  }
}
