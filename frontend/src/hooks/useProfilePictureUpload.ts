import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : "http://localhost:8000/api";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useProfilePictureUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadProfilePicture = async (
    userId: string,
    file: File
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);

    try {
      console.log('[Upload Hook] Starting upload...', { userId, fileName: file.name });

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('[Upload Hook] Invalid file type:', file.type);
        return { success: false, error: 'Please upload an image file' };
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('[Upload Hook] File too large:', file.size);
        return { success: false, error: 'Image size should be less than 5MB' };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      setProgress(50);

      const uploadUrl = `${API_BASE}/users/${userId}/profile-picture`;
      console.log('[Upload Hook] Uploading to:', uploadUrl);

      // Upload to backend
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('[Upload Hook] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[Upload Hook] Upload failed:', error);
        return { success: false, error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      console.log('[Upload Hook] Upload successful:', data);
      setProgress(100);

      // Save to localStorage
      localStorage.setItem('swavalambi_profile_picture', data.profile_picture_url);

      return { success: true, url: data.profile_picture_url };
    } catch (error) {
      console.error('[Upload Hook] Network error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadProfilePicture, isUploading, progress };
};
