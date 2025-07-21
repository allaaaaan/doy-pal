"use client";

import { useState, useEffect } from "react";
import { Database } from "../../api/types/database.types";
import RewardCard from "../../../components/RewardCard";
import RewardForm from "../../../components/RewardForm";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchRewards();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/rewards");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rewards");
      }

      setRewards(data.rewards || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch rewards";
      setError(errorMessage);
      console.error("Error fetching rewards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReward = () => {
    setEditingReward(null);
    setIsModalOpen(true);
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
    setIsSubmitting(false);
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      const url = editingReward 
        ? `/api/rewards/${editingReward.id}`
        : "/api/rewards";
      
      const method = editingReward ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save reward");
      }

      showToast(
        editingReward 
          ? "Reward updated successfully!" 
          : "Reward created successfully!"
      );

      handleCloseModal();
      await fetchRewards();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save reward";
      showToast(errorMessage, "error");
      console.error("Error saving reward:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReward = async (rewardId: string) => {
    try {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return;

      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !reward.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update reward");
      }

      showToast(
        reward.is_active 
          ? "Reward deactivated successfully" 
          : "Reward activated successfully"
      );

      await fetchRewards();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update reward";
      showToast(errorMessage, "error");
      console.error("Error updating reward:", err);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const action = reward.is_active ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this reward?`)) {
      return;
    }

    await handleToggleReward(rewardId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">
          Loading rewards...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Rewards Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage rewards that can be redeemed with points
              </p>
            </div>
            <button
              onClick={handleCreateReward}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Reward
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
              <button
                onClick={fetchRewards}
                className="ml-4 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Total rewards: {rewards.length} | Active: {rewards.filter(r => r.is_active).length}
          </div>
        </div>

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No Rewards Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first reward to get started with the redemption system.
            </p>
            <button
              onClick={handleCreateReward}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Reward
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                mode="admin"
                onEdit={handleEditReward}
                onDelete={handleDeleteReward}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingReward ? "Edit Reward" : "Create New Reward"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <RewardForm
                reward={editingReward}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
} 