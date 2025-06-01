import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/fal-client";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onClose: () => void;
}

export function ImageUpload({ onImageUploaded, onClose }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadImage(file);
      onImageUploaded(imageUrl);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-600 transition-colors cursor-pointer relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </Button>
      
      <div {...getRootProps()} className={`${isDragActive ? 'border-green-600 bg-green-50' : ''}`}>
        <input {...getInputProps()} />
        <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {isUploading ? (
          <p className="text-gray-600">Uploading image...</p>
        ) : isDragActive ? (
          <p className="text-green-600">Drop the image here...</p>
        ) : (
          <>
            <p className="text-gray-600">Drag & drop an image here, or click to browse</p>
            <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG up to 10MB</p>
          </>
        )}
      </div>
      
      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}
    </div>
  );
}
