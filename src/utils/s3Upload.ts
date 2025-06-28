/**
 * Client-side S3 upload utility
 * This utility handles file uploads to S3 from the frontend
 */

interface UploadResponse {
  url: string;
  key: string;
}

/**
 * Upload a file to S3 via the backend API
 * @param file - The file to upload
 * @param folder - Optional folder path in S3
 * @returns Promise with the uploaded file URL and key
 */
export const uploadFileToS3 = async (file: File, folder: string = 'documents'): Promise<UploadResponse> => {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Upload to our backend API which will handle S3 upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      key: result.key
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Upload multiple files to S3
 * @param files - Array of files to upload
 * @param folder - Optional folder path in S3
 * @returns Promise with array of uploaded file URLs and keys
 */
export const uploadMultipleFilesToS3 = async (
  files: File[], 
  folder: string = 'documents'
): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadFileToS3(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from S3 via the backend API
 * @param key - The S3 key of the file to delete
 * @returns Promise that resolves when file is deleted
 */
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}; 