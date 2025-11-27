import { supabaseAdmin } from '@/lib/supabase';

/**
 * Deletes files from Supabase storage based on their URLs
 * @param urls Array of file URLs to delete
 * @returns Promise<void>
 */
export async function deleteFilesFromStorage(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0 || !supabaseAdmin) return;

  for (const url of urls) {
    try {
      // Extract the path from the URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlParts = url.split('/storage/v1/object/public/');
      if (urlParts.length !== 2) continue;

      const pathWithBucket = urlParts[1];
      const pathParts = pathWithBucket.split('/');
      if (pathParts.length < 2) continue;

      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      // Delete the file from storage
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error(`Failed to delete file ${filePath} from bucket ${bucket}:`, error);
      }
    } catch (error) {
      console.error(`Error processing URL ${url}:`, error);
    }
  }
}