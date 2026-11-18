import { supabase } from '@/lib/supabase';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${sizeMB}MB) exceeds the maximum allowed size of 5MB.`
    );
  }
}

function getFileExtension(file: File): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return mimeToExt[file.type] ?? 'jpg';
}

/**
 * Upload an item photo to the 'item-photos' bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadItemPhoto(file: File, itemId: string): Promise<string> {
  validateFile(file);

  const ext = getFileExtension(file);
  const timestamp = Date.now();
  const path = `${itemId}/${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('item-photos')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload item photo: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from('item-photos').getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Upload claim evidence to the 'claim-evidence' bucket (private).
 * Returns a signed URL for access.
 */
export async function uploadClaimEvidence(file: File, claimId: string): Promise<string> {
  validateFile(file);

  const ext = getFileExtension(file);
  const timestamp = Date.now();
  const path = `${claimId}/${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('claim-evidence')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload claim evidence: ${uploadError.message}`);
  }

  // Return the path; signed URLs will be generated on-demand
  // Store the path in the database; use getSignedUrl() when displaying
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('claim-evidence')
    .createSignedUrl(path, 60 * 60); // 1 hour expiry

  if (signedUrlError) {
    throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
  }

  return signedUrlData.signedUrl;
}

/**
 * Get a public URL for a file in a public bucket.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed URL for a file in a private bucket.
 * @param expiresIn - Expiry time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from a storage bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
