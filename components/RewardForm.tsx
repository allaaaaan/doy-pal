"use client";

import { useState, useEffect } from "react";
import { Database } from "../app/api/types/database.types";
import ImageUpload from "./ImageUpload";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];

interface RewardFormProps {
  reward?: Reward | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface RewardFormData {
  name: string;
  description: string;
  point_cost: number;
  image: File | null;
}

export default function RewardForm({
  reward,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RewardFormProps) {
  const [formData, setFormData] = useState<RewardFormData>({
    name: "",
    description: "",
    point_cost: 1,
    image: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description || "",
        point_cost: reward.point_cost,
        image: null, // Don't pre-populate image file
      });
    }
  }, [reward]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Reward name is required";
    }

    if (formData.point_cost <= 0) {
      newErrors.point_cost = "Point cost must be greater than 0";
    }

    if (formData.point_cost > 1000) {
      newErrors.point_cost = "Point cost cannot exceed 1000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    // Create FormData for multipart submission
    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("description", formData.description.trim());
    submitData.append("point_cost", formData.point_cost.toString());
    
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (field: keyof Omit<RewardFormData, "image">, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageSelect = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Reward Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Reward Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.name
              ? "border-red-300 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="e.g., Teddy Bear, Extra Screen Time"
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          placeholder="Optional description of the reward..."
          disabled={isSubmitting}
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Point Cost */}
      <div>
        <label
          htmlFor="point_cost"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Point Cost *
        </label>
        <input
          type="number"
          id="point_cost"
          value={formData.point_cost}
          onChange={(e) => handleInputChange("point_cost", parseInt(e.target.value) || 0)}
          min="1"
          max="1000"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.point_cost
              ? "border-red-300 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
          disabled={isSubmitting}
        />
        {errors.point_cost && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.point_cost}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          How many points this reward costs to redeem
        </p>
      </div>

      {/* Image Upload */}
      <ImageUpload
        onImageSelect={handleImageSelect}
        currentImageUrl={reward?.image_url}
        disabled={isSubmitting}
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{reward ? "Updating..." : "Creating..."}</span>
            </div>
          ) : (
            <span>{reward ? "Update Reward" : "Create Reward"}</span>
          )}
        </button>
      </div>
    </form>
  );
} 