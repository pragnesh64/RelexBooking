import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

/**
 * Upload a file to S3
 */
export async function uploadFile(
  file: File,
  path: string,
  options?: {
    onProgress?: (progress: number) => void;
    metadata?: Record<string, string>;
  }
): Promise<{ key: string; url: string }> {
  try {
    const result = await uploadData({
      path,
      data: file,
      options: {
        contentType: file.type,
        metadata: options?.metadata,
        onProgress: (progress) => {
          if (progress.totalBytes) {
            const percentage = (progress.transferredBytes / progress.totalBytes) * 100;
            options?.onProgress?.(percentage);
          }
        },
      },
    }).result;

    // Get the public URL for the uploaded file
    const urlResult = await getUrl({ path: result.path });

    return {
      key: result.path,
      url: urlResult.url.toString(),
    };
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload event image
 */
export async function uploadEventImage(
  file: File,
  eventId: string,
  onProgress?: (progress: number) => void
): Promise<{ key: string; url: string }> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${eventId}-${timestamp}.${fileExtension}`;
  const path = `events/${fileName}`;

  return uploadFile(file, path, {
    onProgress,
    metadata: {
      eventId,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload KYC document
 */
export async function uploadKYCDocument(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ key: string; url: string }> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}-${timestamp}.${fileExtension}`;
  const path = `kyc/${fileName}`;

  return uploadFile(file, path, {
    onProgress,
    metadata: {
      userId,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Get public URL for a file
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const result = await getUrl({ path });
    return result.url.toString();
  } catch (error) {
    console.error('Failed to get file URL:', error);
    throw new Error('Failed to get file URL');
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    await remove({ path });
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * List files in a directory
 */
export async function listFiles(path: string): Promise<Array<{ key: string; size?: number; lastModified?: Date }>> {
  try {
    const result = await list({ path });
    return result.items.map((item) => ({
      key: item.path,
      size: item.size,
      lastModified: item.lastModified,
    }));
  } catch (error) {
    console.error('Failed to list files:', error);
    throw new Error('Failed to list files');
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB. Please upload a smaller image.',
    };
  }

  return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF, image, or Word document.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB. Please upload a smaller file.',
    };
  }

  return { valid: true };
}
