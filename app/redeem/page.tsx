"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database } from "../api/types/database.types";
import RewardCard from "../../components/RewardCard";
import { ArrowLeftIcon, StarIcon } from "@heroicons/react/24/outline";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];
type PointSummary = Database["public"]["Views"]["point_summaries"]["Row"];

export default function RedeemPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointSummary, setPointSummary] = useState<PointSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch rewards and points in parallel
      const [rewardsResponse, pointsResponse] = await Promise.all([
        fetch("/api/rewards"),
        fetch("/api/points")
      ]);

      if (!rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        throw new Error(rewardsData.error || "Failed to fetch rewards");
      }

      if (!pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        throw new Error(pointsData.error || "Failed to fetch points");
      }

      const [rewardsData, pointsData] = await Promise.all([
        rewardsResponse.json(),
        pointsResponse.json()
      ]);

      setRewards(rewardsData.rewards || []);
      setPointSummary(pointsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (redeemingRewardId) return; // Prevent double redemption
    
    setRedeemingRewardId(rewardId);

    try {
      const response = await fetch("/api/redemptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reward_id: rewardId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error === "Insufficient points") {
          showToast(`You need ${data.needed} more points for this reward!`, "error");
        } else {
          throw new Error(data.error || "Failed to redeem reward");
        }
        return;
      }

      // Success! Show message and redirect
      showToast(`🎉 ${data.message}`, "success");
      
      // Refresh all data to show updated status
      await loadData();

      // Redirect to home after a brief delay
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to redeem reward";
      showToast(errorMessage, "error");
      console.error("Error redeeming reward:", err);
    } finally {
      setRedeemingRewardId(null);
    }
  };

  const currentPoints = pointSummary?.total_points || 0;
  const availableRewards = rewards.filter(reward => !(reward as any).is_redeemed);
  const redeemedRewards = rewards.filter(reward => (reward as any).is_redeemed);
  const affordableRewards = availableRewards.filter(reward => currentPoints >= reward.point_cost);
  const unaffordableRewards = availableRewards.filter(reward => currentPoints < reward.point_cost);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Redeem Rewards
              </h1>
              <div className="w-16"></div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadData}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mobile-content">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Redeem Rewards
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 mobile-safe-bottom space-y-6">
        {/* Points Balance */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Your Points</h2>
              <p className="text-green-100 text-sm">Available to spend</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold flex items-center">
                <StarIcon className="h-8 w-8 mr-2" />
                {currentPoints}
              </div>
              <div className="text-green-100 text-sm">
                {availableRewards.length} rewards available
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        {rewards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No Rewards Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Ask your parents to add some rewards you can earn!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Affordable Rewards */}
            {affordableRewards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🎁 You Can Get These! ({affordableRewards.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {affordableRewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      currentPoints={currentPoints}
                      onRedeem={handleRedeem}
                      mode="redeem"
                      isRedeeming={redeemingRewardId === reward.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unaffordable Rewards */}
            {unaffordableRewards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  💪 Keep Earning for These! ({unaffordableRewards.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {unaffordableRewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      currentPoints={currentPoints}
                      mode="redeem"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Redeemed Rewards */}
            {redeemedRewards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🎉 Already Redeemed! ({redeemedRewards.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {redeemedRewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward as any}
                      currentPoints={currentPoints}
                      mode="redeem"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Motivation Message */}
        {rewards.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {currentPoints === 0 
                ? "🌟 Start doing good things to earn your first points!"
                : affordableRewards.length === 0 && availableRewards.length > 0
                ? "🚀 Keep earning points to unlock these awesome rewards!"
                : affordableRewards.length > 0
                ? "🎉 Great job! You've earned some amazing rewards!"
                : redeemedRewards.length > 0 && availableRewards.length === 0
                ? "🏆 Wow! You've redeemed all available rewards!"
                : "🌟 Keep earning points for future rewards!"
              }
            </p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-4 left-4 right-4 mx-auto max-w-sm p-4 rounded-lg shadow-lg text-white text-center z-50 ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
} 