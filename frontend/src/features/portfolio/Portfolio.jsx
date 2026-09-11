import { useEffect, useState } from "react";

import { getMyHoldings } from "../../api/holding.api.js";

import {
  formatCurrency,
} from "../../utils/formatters.js";

const Portfolio = () => {
  const [holdings, setHoldings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadHoldings = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyHoldings();

        setHoldings(data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load holdings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();
  }, []);

  const totalInvested = holdings.reduce(
    (total, holding) =>
      total + holding.investedAmount,
    0
  );

  const totalCurrentValue =
    holdings.reduce(
      (total, holding) =>
        total + holding.currentValue,
      0
    );

  const totalUnrealizedPnL =
    holdings.reduce(
      (total, holding) =>
        total + holding.unrealizedPnL,
      0
    );

  const totalRealizedPnL =
    holdings.reduce(
      (total, holding) =>
        total + holding.realizedPnL,
      0
    );

  const getPnLClass = (value) => {
    if (value > 0) {
      return "text-green-600";
    }

    if (value < 0) {
      return "text-red-600";
    }

    return "text-gray-900";
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Portfolio
        </h1>

        <p className="mt-2 text-gray-600">
          Loading your holdings...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Portfolio
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
          Portfolio
        </h1>

        <p className="mt-1 text-gray-600">
          Track your current investments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Invested Amount
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(
              totalInvested
            )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Current Value
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(
              totalCurrentValue
            )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Unrealized P&L
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${getPnLClass(
              totalUnrealizedPnL
            )}`}
          >
            {formatCurrency(
              totalUnrealizedPnL
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Holdings
          </h2>
        </div>

        {holdings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              You don't have any holdings yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 font-medium text-gray-600">
                    Instrument
                  </th>

                  <th className="px-5 py-4 font-medium text-gray-600">
                    Qty
                  </th>

                  <th className="px-5 py-4 font-medium text-gray-600">
                    Avg. Buy Price
                  </th>

                  <th className="px-5 py-4 font-medium text-gray-600">
                    Current Price
                  </th>

                  <th className="px-5 py-4 font-medium text-gray-600">
                    Current Value
                  </th>

                  <th className="px-5 py-4 font-medium text-gray-600">
                    Unrealized P&L
                  </th>
                </tr>
              </thead>

              <tbody>
                {holdings.map(
                  (holding) => (
                    <tr
                      key={holding.id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {
                              holding
                                .instrument
                                .symbol
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              holding
                                .instrument
                                .name
                            }
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {holding.quantity}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {formatCurrency(
                          holding.averageBuyPrice
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {formatCurrency(
                          holding.currentPrice
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900">
                        {formatCurrency(
                          holding.currentValue
                        )}
                      </td>

                      <td
                        className={`px-5 py-4 font-medium ${getPnLClass(
                          holding.unrealizedPnL
                        )}`}
                      >
                        {formatCurrency(
                          holding.unrealizedPnL
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Realized P&L
        </p>

        <p
          className={`mt-2 text-xl font-bold ${getPnLClass(
            totalRealizedPnL
          )}`}
        >
          {formatCurrency(
            totalRealizedPnL
          )}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          P&L from completed sell transactions
        </p>
      </div>
    </div>
  );
};

export default Portfolio;