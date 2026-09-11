import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getWatchlist,
  removeFromWatchlist,
} from "../../api/watchlist.api.js";

import { formatCurrency } from "../../utils/formatters.js";

const Watchlist = () => {
  const [watchlist, setWatchlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getWatchlist();

        setWatchlist(
          Array.isArray(data)
            ? data
            : data?.instruments || []
        );
      } catch (error) {
        console.error(
          "Failed to load watchlist:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load watchlist."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  const handleRemove = async (instrumentId) => {
    try {
      setRemovingId(instrumentId);
      setError("");

      await removeFromWatchlist(
        instrumentId
      );

      setWatchlist((current) =>
        current.filter(
          (instrument) =>
            instrument._id !== instrumentId
        )
      );
    } catch (error) {
      console.error(
        "Failed to remove from watchlist:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to remove instrument."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const getPriceChange = (instrument) => {
    const currentPrice = Number(
      instrument?.currentPrice || 0
    );

    const previousClose = Number(
      instrument?.previousClose || 0
    );

    const change =
      currentPrice - previousClose;

    const changePercent =
      previousClose > 0
        ? (change / previousClose) * 100
        : 0;

    return {
      change,
      changePercent,
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Watchlist
        </h1>

        <p className="mt-2 text-gray-500">
          Loading your watchlist...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Watchlist
        </h1>

        <p className="mt-1 text-gray-500">
          Track stocks you're interested in.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Your watchlist is empty
          </h2>

          <p className="mt-2 text-gray-500">
            Add stocks from the Markets page to
            start tracking them.
          </p>

          <Link
            to="/markets"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Explore Markets
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tracked Instruments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {watchlist.length}{" "}
              {watchlist.length === 1
                ? "instrument"
                : "instruments"}{" "}
              in your watchlist
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Instrument
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Exchange
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Price
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Change
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {watchlist.map((instrument) => {
                  const {
                    change,
                    changePercent,
                  } = getPriceChange(
                    instrument
                  );

                  const isPositive =
                    change >= 0;

                  return (
                    <tr
                      key={instrument._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      {/* Instrument */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/markets/${instrument._id}`}
                          className="group"
                        >
                          <p className="font-semibold text-blue-600 group-hover:text-blue-800 group-hover:underline">
                            {instrument.symbol}
                          </p>

                          <p className="text-sm text-gray-500">
                            {instrument.name}
                          </p>
                        </Link>
                      </td>

                      {/* Exchange */}
                      <td className="px-6 py-4 text-gray-700">
                        {instrument.exchange ||
                          "-"}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(
                          instrument.currentPrice
                        )}
                      </td>

                      {/* Change */}
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          isPositive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatCurrency(change)}{" "}
                        (
                        {isPositive ? "+" : ""}
                        {changePercent.toFixed(2)}
                        %)
                      </td>

                      {/* Remove */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              instrument._id
                            )
                          }
                          disabled={
                            removingId ===
                            instrument._id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {removingId ===
                          instrument._id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        Watchlist prices are based on the current
        market data available to TradeFin.
      </p>
    </div>
  );
};

export default Watchlist;