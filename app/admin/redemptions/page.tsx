"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Database } from "../../api/types/database.types";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Redemption = Database["public"]["Tables"]["redemptions"]["Row"] & {
  rewards: {
    id: string;
    name: string;
    point_cost: number;
    image_url: string | null;
  } | null;
};

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const fetchRedemptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Include withdrawn redemptions for admin view
      const response = await fetch("/api/redemptions?include_withdrawn=true");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch redemptions");
      }

      setRedemptions(data.redemptions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch redemptions";
      setError(errorMessage);
      console.error("Error fetching redemptions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (redemptionId: string) => {
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (!redemption || redemption.status === 'withdrawn') return;

    const confirmMessage = `Are you sure you want to withdraw this redemption?\n\nReward: ${redemption.rewards?.name || 'Unknown'}\nPoints to refund: ${redemption.points_spent}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setWithdrawingId(redemptionId);

    try {
      const response = await fetch(`/api/redemptions/${redemptionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: 'withdraw' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to withdraw redemption");
      }

      showToast(`✅ ${data.message} - ${data.points_refunded} points refunded!`);
      await fetchRedemptions(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to withdraw redemption";
      showToast(errorMessage, "error");
      console.error("Error withdrawing redemption:", err);
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
      case 'withdrawn':
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  };

  const activeRedemptions = redemptions.filter(r => r.status === 'active');
  const withdrawnRedemptions = redemptions.filter(r => r.status === 'withdrawn');
  const totalPointsSpent = activeRedemptions.reduce((sum, r) => sum + r.points_spent, 0);
  const totalPointsRefunded = withdrawnRedemptions.reduce((sum, r) => sum + r.points_spent, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">
          Loading redemption history...
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
                Redemption History
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage all reward redemptions
              </p>
            </div>
            <button
              onClick={fetchRedemptions}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
              <button
                onClick={fetchRedemptions}
                className="ml-4 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400">Total Redemptions</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {redemptions.length}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-green-600 dark:text-green-400">Points Spent (Active)</div>
              <div className="text-xl font-semibold text-green-800 dark:text-green-200">
                {totalPointsSpent}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-red-600 dark:text-red-400">Points Refunded</div>
              <div className="text-xl font-semibold text-red-800 dark:text-red-200">
                {totalPointsRefunded}
              </div>
            </div>
          </div>
        </div>

        {/* Redemptions List */}
        {redemptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No Redemptions Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Redemptions will appear here once rewards start being redeemed.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                All Redemptions ({redemptions.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Redeemed At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {redemptions.map((redemption) => (
                    <tr key={redemption.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {redemption.rewards?.image_url ? (
                            <img
                              src={redemption.rewards.image_url}
                              alt={redemption.rewards.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-lg mr-3 flex items-center justify-center">
                              🎁
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {redemption.rewards?.name || 'Unknown Reward'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {redemption.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                          {redemption.points_spent} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          {format(new Date(redemption.redeemed_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(redemption.redeemed_at), "h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(redemption.status)}>
                          {redemption.status === 'active' ? 'Active' : 'Withdrawn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {redemption.status === 'active' ? (
                          <button
                            onClick={() => handleWithdraw(redemption.id)}
                            disabled={withdrawingId === redemption.id}
                            className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${
                              withdrawingId === redemption.id 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }`}
                          >
                            {withdrawingId === redemption.id ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                Withdrawing...
                              </div>
                            ) : (
                              'Withdraw'
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            Withdrawn
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 max-w-md ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
} 