"use client";

import { useState, useRef, useCallback } from "react";
import { PhotoIcon, XMarkIcon, LinkIcon } from "@heroicons/react/24/outline";

interface ProfileImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string | null;
  disabled?: boolean;
  className?: string;
}

export default function ProfileImageUpload({
  onImageUpload,
  currentImageUrl,
  disabled = false,
  className = "",
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): string | null => {
    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      return "Image size must be less than 1MB";
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Image must be JPEG, PNG, or WebP format";
    }

    return null;
  };

  const handleImageSelect = useCallback((file: File) => {
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onImageUpload(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    setUrlInput("");
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !showUrlInput) {
      fileInputRef.current?.click();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      onImageUpload(urlInput.trim());
      setShowUrlInput(false);
      setError(null);
    }
  };

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${showUrlInput ? '' : 'cursor-pointer'}
          ${isDragOver
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
          }
          ${disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            : showUrlInput ? "" : "hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Profile preview"
              className="w-32 h-32 object-cover rounded-full mx-auto shadow-md"
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : showUrlInput ? (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={toggleUrlInput}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add URL
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PNG, JPG, WebP up to 1MB
              </p>
            </div>
          </div>
        )}
      </div>

      {!preview && !showUrlInput && (
        <div className="text-center">
          <button
            type="button"
            onClick={toggleUrlInput}
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <LinkIcon className="h-4 w-4 mr-1" />
            Or use image URL
          </button>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 For best results, use square images (e.g., 200x200px)
      </p>
    </div>
  );
} 