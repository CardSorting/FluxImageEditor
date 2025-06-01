export interface ImageEditRequest {
  imageUrl: string;
  prompt: string;
  chatId: number;
}

export interface ImageEditResponse {
  editedImageUrl: string;
  originalImageUrl: string;
  prompt: string;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.imageUrl;
}
