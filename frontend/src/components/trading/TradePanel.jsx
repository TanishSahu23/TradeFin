import { useState } from "react";

import { createOrder } from "../../api/order.api.js";
import { formatCurrency } from "../../utils/formatters.js";

const TradePanel = ({ instrument, onOrderSuccess }) => {
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentPrice = Number(instrument?.currentPrice || 0);

  const numericQuantity = Number(quantity || 0);

  const estimatedValue = currentPrice * numericQuantity;

  const handleQuantityChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const numericValue = Number(value);

    if (
      Number.isInteger(numericValue) &&
      numericValue >= 1
    ) {
      setQuantity(numericValue);
    }
  };

  const handleOrder = async () => {
    setError("");
    setSuccess("");

    if (!instrument?._id) {
      setError("Instrument information is missing.");
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (!Number.isInteger(Number(quantity))) {
      setError("Quantity must be a whole number.");
      return;
    }

    if (currentPrice <= 0) {
      setError("Current market price is not available.");
      return;
    }

    try {
      setLoading(true);

      const result = await createOrder({
        instrumentId: instrument._id,
        side,
        quantity: Number(quantity),
      });

      setSuccess(
        `${side} order executed successfully.`
      );

      setQuantity(1);

      if (onOrderSuccess) {
        onOrderSuccess(result);
      }
    } catch (error) {
      console.error("Order failed:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Order could not be executed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Paper Trading
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Place a simulated market order using your
          virtual portfolio.
        </p>
      </div>

      {/* Instrument */}
      <div className="mt-5 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Instrument
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {instrument?.symbol || "-"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              Market Price
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {formatCurrency(currentPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Buy / Sell */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Order Side
        </label>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setSide("BUY");
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${
              side === "BUY"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            BUY
          </button>

          <button
            type="button"
            onClick={() => {
              setSide("SELL");
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${
              side === "SELL"
                ? "bg-red-600 text-white"
                : "text-gray-600 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-5">
        <label
          htmlFor="order-quantity"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Quantity
        </label>

        <input
          id="order-quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={handleQuantityChange}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
        />
      </div>

      {/* Order Summary */}
      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Order Summary
        </h3>

        <div className="mt-3 flex justify-between">
          <span className="text-sm text-gray-500">
            Side
          </span>

          <span
            className={`font-semibold ${
              side === "BUY"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {side}
          </span>
        </div>

        <div className="mt-3 flex justify-between">
          <span className="text-sm text-gray-500">
            Market Price
          </span>

          <span className="font-medium text-gray-900">
            {formatCurrency(currentPrice)}
          </span>
        </div>

        <div className="mt-3 flex justify-between">
          <span className="text-sm text-gray-500">
            Quantity
          </span>

          <span className="font-medium text-gray-900">
            {quantity || 0}
          </span>
        </div>

        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-700">
            Estimated Value
          </span>

          <span className="font-semibold text-gray-900">
            {formatCurrency(estimatedValue)}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Place Order */}
      <button
        type="button"
        onClick={handleOrder}
        disabled={loading}
        className={`mt-5 w-full rounded-lg px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
          side === "BUY"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading
          ? "Processing..."
          : `${side === "BUY" ? "Buy" : "Sell"} ${
              instrument?.symbol || "Stock"
            }`}
      </button>

      {/* Disclaimer */}
      <p className="mt-3 text-center text-xs text-gray-400">
        Educational paper trading only. No real money
        or exchange order is involved.
      </p>
    </div>
  );
};

export default TradePanel;