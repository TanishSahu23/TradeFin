import { useEffect, useState } from "react";

import { getPortfolioSummary } from "../../api/portfolio.api.js";
import {
  formatCurrency,
  formatPercentage,
} from "../../utils/formatters.js";

const StatCard = ({
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPortfolioSummary =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getPortfolioSummary();

          setSummary(data);
        } catch (error) {
          setError(
            error.response?.data?.message ||
              "Unable to load portfolio summary."
          );
        } finally {
          setLoading(false);
        }
      };

    loadPortfolioSummary();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Loading portfolio data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-600">
          Your portfolio at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(
            summary.portfolioValue
          )}
          description="Cash + current holdings value"
        />

        <StatCard
          label="Invested Amount"
          value={formatCurrency(
            summary.investedAmount
          )}
          description="Current invested capital"
        />

        <StatCard
          label="Overall P&L"
          value={formatCurrency(
            summary.totalPnL
          )}
          description={`Realized: ${formatCurrency(
            summary.realizedPnL
          )}`}
        />

        <StatCard
          label="Cash Balance"
          value={formatCurrency(
            summary.cashBalance
          )}
          description={`${formatPercentage(
            summary.portfolioValue > 0
              ? (summary.cashBalance /
                  summary.portfolioValue) *
                  100
              : 0
          )} of portfolio`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Current Holdings Value
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(
              summary.currentValue
            )}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Unrealized P&L:{" "}
            {formatCurrency(
              summary.unrealizedPnL
            )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Realized P&L
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(
              summary.realizedPnL
            )}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Total P&L:{" "}
            {formatCurrency(
              summary.totalPnL
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;