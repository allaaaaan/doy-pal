"use client";

import { Database } from "../app/api/types/database.types";
import { StarIcon, GiftIcon } from "@heroicons/react/24/outline";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];

interface RewardCardProps {
  reward: Reward;
  currentPoints?: number;
  onRedeem?: (rewardId: string) => void;
  onEdit?: (reward: Reward) => void;
  onDelete?: (rewardId: string) => void;
  mode?: "redeem" | "admin";
  isRedeeming?: boolean;
}

export default function RewardCard({
  reward,
  currentPoints = 0,
  onRedeem,
  onEdit,
  onDelete,
  mode = "redeem",
  isRedeeming = false,
}: RewardCardProps) {
  const canAfford = currentPoints >= reward.point_cost;
  const pointsNeeded = reward.point_cost - currentPoints;

  const handleRedeem = () => {
    if (canAfford && onRedeem && !isRedeeming) {
      onRedeem(reward.id);
    }
  };

  const getButtonText = () => {
    if (isRedeeming) return "Redeeming...";
    if (canAfford) return `Redeem for ${reward.point_cost} points`;
    return `Need ${pointsNeeded} more points`;
  };

  const getButtonStyles = () => {
    if (isRedeeming) {
      return "bg-gray-400 cursor-not-allowed";
    }
    if (canAfford) {
      return "bg-green-500 hover:bg-green-600 active:bg-green-700";
    }
    return "bg-gray-300 dark:bg-gray-600 cursor-not-allowed";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
        {reward.image_url ? (
          <img
            src={reward.image_url}
            alt={reward.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        
        {/* Fallback icon when no image or image fails */}
        <div className={`${reward.image_url ? "hidden" : ""} absolute inset-0 flex items-center justify-center`}>
          <GiftIcon className="h-16 w-16 text-gray-400" />
        </div>

        {/* Point cost badge */}
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
          <div className="flex items-center space-x-1">
            <StarIcon className="h-3 w-3" />
            <span>{reward.point_cost}</span>
          </div>
        </div>

        {/* Admin mode - status indicator */}
        {mode === "admin" && (
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                reward.is_active
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
              }`}
            >
              {reward.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
          {reward.name}
        </h3>
        
        {reward.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {reward.description}
          </p>
        )}

        {/* Actions */}
        {mode === "redeem" ? (
          <button
            onClick={handleRedeem}
            disabled={!canAfford || isRedeeming}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${getButtonStyles()}`}
          >
            {isRedeeming && (
              <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {getButtonText()}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(reward)}
              className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(reward.id)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                reward.is_active
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {reward.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        )}
      </div>

      {/* Points needed indicator for redeem mode */}
      {mode === "redeem" && !canAfford && (
        <div className="px-4 pb-3">
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-center">
            💡 You need {pointsNeeded} more points
          </div>
        </div>
      )}
    </div>
  );
} 