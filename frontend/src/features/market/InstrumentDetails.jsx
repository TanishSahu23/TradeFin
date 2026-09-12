import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getHistoricalPrices,
  getInstrument,
  getLatestPrice,
} from "../../api/instrument.api.js";

import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../../api/watchlist.api.js";

import PriceChart from "../../components/charts/PriceChart.jsx";
import TradePanel from "../../components/trading/TradePanel.jsx";

import { formatCurrency } from "../../utils/formatters.js";

const InstrumentDetails = () => {
  const { id } = useParams();

  const [instrument, setInstrument] = useState(null);

  const [historicalPrices, setHistoricalPrices] =
    useState([]);

  const [isInWatchlist, setIsInWatchlist] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [watchlistLoading, setWatchlistLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstrumentData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          instrumentData,
          historicalData,
          latestPriceData,
        ] = await Promise.all([
          getInstrument(id),

          getHistoricalPrices(id, {
            limit: 120,
          }),

          getLatestPrice(id),
        ]); 

        setInstrument({
          ...instrumentData,

          currentPrice:
            latestPriceData.currentPrice,

          previousClose:
            latestPriceData.previousClose,

          open:
            latestPriceData.open,

          high:
            latestPriceData.high,

          low:
            latestPriceData.low,

          volume:
            latestPriceData.volume,

          change:
            latestPriceData.change,

          changePercent:
            latestPriceData.changePercent,

          timestamp:
          latestPriceData.timestamp,
        });

        setHistoricalPrices(
          Array.isArray(historicalData)
            ? historicalData
            : historicalData?.prices || []
        );
      } catch (error) {
        console.error(
          "Failed to load instrument:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load instrument details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInstrumentData();
    }
  }, [id]);

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const data = await getWatchlist();

        const instruments = Array.isArray(data)
          ? data
          : data?.instruments || [];

        const exists = instruments.some(
          (item) => item?._id === id
        );

        setIsInWatchlist(exists);
      } catch (error) {
        console.error(
          "Failed to check watchlist:",
          error
        );
      }
    };

    if (id) {
      checkWatchlist();
    }
  }, [id]);

  const handleWatchlistToggle = async () => {
    try {
      setWatchlistLoading(true);
      setError("");

      if (isInWatchlist) {
        await removeFromWatchlist(id);

        setIsInWatchlist(false);
      } else {
        await addToWatchlist(id);

        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error(
        "Watchlist update failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update watchlist."
      );
    } finally {
      setWatchlistLoading(false);
    }
  };

  const getPriceChange = () => ({
    change: Number(instrument?.change || 0),
    changePercent: Number(
      instrument?.changePercent || 0
    ),
  });

  /*
   * -----------------------------------------
   * LOADING STATE
   * -----------------------------------------
   */

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link
            to="/markets"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to Markets
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Loading instrument...
        </h1>

        <p className="mt-2 text-gray-500">
          Loading stock information and price
          history.
        </p>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * ERROR STATE
   * -----------------------------------------
   */

  if (error && !instrument) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link
            to="/markets"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to Markets
          </Link>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Instrument Details
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!instrument) {
    return null;
  }

  const {
    change,
    changePercent,
  } = getPriceChange();

  const isPositive = change >= 0;

  /*
   * -----------------------------------------
   * ORDER SUCCESS
   * -----------------------------------------
   *
   * TradePanel handles the actual order.
   *
   * We keep this callback available so that
   * later we can refresh holdings, portfolio,
   * balance, etc. after an order.
   */

  const handleOrderSuccess = () => {
    console.log(
      "Order executed successfully"
    );
  };

  return (
    <div className="p-6">
      {/* ------------------------------------- */}
      {/* BACK TO MARKETS */}
      {/* ------------------------------------- */}

      <div className="mb-6">
        <Link
          to="/markets"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Back to Markets
        </Link>
      </div>

      {/* ------------------------------------- */}
      {/* ERROR MESSAGE */}
      {/* ------------------------------------- */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ------------------------------------- */}
      {/* INSTRUMENT HEADER */}
      {/* ------------------------------------- */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          {/* Instrument information */}

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {instrument.name}
              </h1>

              <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {instrument.symbol}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <p>
                Exchange:{" "}
                <span className="font-medium text-gray-900">
                  {instrument.exchange}
                </span>
              </p>

              <p>
                Type:{" "}
                <span className="font-medium text-gray-900">
                  {instrument.instrumentType}
                </span>
              </p>

              {instrument.sector && (
                <p>
                  Sector:{" "}
                  <span className="font-medium text-gray-900">
                    {instrument.sector}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Watchlist button */}

          <button
            type="button"
            onClick={handleWatchlistToggle}
            disabled={watchlistLoading}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              isInWatchlist
                ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-900 text-white hover:bg-gray-800"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {watchlistLoading
              ? "Updating..."
              : isInWatchlist
              ? "Remove from Watchlist"
              : "Add to Watchlist"}
          </button>
        </div>

        {/* Current price */}

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Current Price
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(
                instrument.currentPrice
              )}
            </p>
          </div>

          <div
            className={`pb-1 text-lg font-semibold ${
              isPositive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(change)}{" "}
            ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* ------------------------------------- */}
      {/* PRICE SUMMARY */}
      {/* ------------------------------------- */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Current price */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Current Price
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(
              instrument.currentPrice
            )}
          </p>
        </div>

        {/* Previous close */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Previous Close
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(
              instrument.previousClose
            )}
          </p>
        </div>

        {/* Day change */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Day Change
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              isPositive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* ------------------------------------- */}
      {/* MAIN CONTENT */}
      {/* ------------------------------------- */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ----------------------------------- */}
        {/* PRICE CHART */}
        {/* ----------------------------------- */}

        <div className="xl:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Price History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historical candlestick price data.
              </p>
            </div>

            {historicalPrices.length === 0 ? (
              <div className="flex h-[450px] items-center justify-center rounded-lg bg-gray-50">
                <p className="text-gray-500">
                  No historical price data
                  available.
                </p>
              </div>
            ) : (
              <PriceChart
                data={historicalPrices}
              />
            )}
          </div>
        </div>

        {/* ----------------------------------- */}
        {/* TRADE PANEL */}
        {/* ----------------------------------- */}

        <div>
          <TradePanel
            instrument={instrument}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>
      </div>

      {/* ------------------------------------- */}
      {/* PAPER TRADING INFORMATION */}
      {/* ------------------------------------- */}

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="font-semibold text-blue-900">
          Paper Trading
        </h2>

        <p className="mt-1 text-sm text-blue-700">
          TradeFin uses simulated market orders
          for educational purposes. Orders are
          not sent to a real stock exchange.
        </p>
      </div>
    </div>
  );
};

export default InstrumentDetails;