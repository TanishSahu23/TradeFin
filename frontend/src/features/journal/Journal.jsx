import { useEffect, useMemo, useState } from "react";

import {
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from "../../api/journal.api.js";

import { getInstruments } from "../../api/instrument.api.js";

import { formatCurrency } from "../../utils/formatters.js";

const initialForm = {
  instrumentId: "",
  action: "BUY",
  price: "",
  quantity: "",
  reason: "",
  confidence: 3,
};

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [instruments, setInstruments] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingEntry, setEditingEntry] = useState(null);
  const [exitPrice, setExitPrice] = useState("");
  const [updatingOutcome, setUpdatingOutcome] = useState(false);

  useEffect(() => {
    const loadJournal = async () => {
      try {
        setLoading(true);
        setError("");

        const [journalData, instrumentData] =
          await Promise.all([
            getJournalEntries(),
            getInstruments(),
          ]);

        setEntries(
          Array.isArray(journalData)
            ? journalData
            : journalData?.entries || []
        );

        setInstruments(
          Array.isArray(instrumentData)
            ? instrumentData
            : instrumentData?.instruments || []
        );
      } catch (error) {
        console.error(
          "Failed to load journal:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load investment journal."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJournal();
  }, []);

  const getErrorMessage = (error) => {
    const responseData = error.response?.data;

    if (
      responseData?.errors &&
      Array.isArray(responseData.errors)
    ) {
      return responseData.errors
        .map((item) => {
          const field =
            item.path?.length > 0
              ? `${item.path.join(".")}: `
              : "";

          return `${field}${item.message}`;
        })
        .join(" | ");
    }

    return (
      responseData?.message ||
      error.message ||
      "Something went wrong."
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        instrumentId: form.instrumentId,
        action: form.action,
        price: Number(form.price),
        reason: form.reason,
        confidence: Number(form.confidence),
      };

      if (form.quantity !== "") {
        payload.quantity = Number(form.quantity);
      }

      const newEntry =
        await createJournalEntry(payload);

      setEntries((current) => [
        newEntry,
        ...current,
      ]);

      setForm(initialForm);

      setSuccess(
        "Journal entry created successfully."
      );
    } catch (error) {
      console.error(
        "Failed to create journal entry:",
        error
      );

      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOutcomeUpdate = async (entry) => {
    const numericExitPrice = Number(exitPrice);

    if (
      !numericExitPrice ||
      numericExitPrice <= 0
    ) {
      setError("Enter a valid exit price.");
      return;
    }

    try {
      setUpdatingOutcome(true);
      setError("");
      setSuccess("");

      const quantity = Number(
        entry.quantity || 0
      );

      let outcomePnL = 0;

      if (quantity > 0) {
        if (entry.action === "BUY") {
          outcomePnL =
            (numericExitPrice -
              Number(entry.price)) *
            quantity;
        } else if (entry.action === "SELL") {
          outcomePnL =
            (Number(entry.price) -
              numericExitPrice) *
            quantity;
        }
      }

      const updatedEntry =
        await updateJournalEntry(
          entry._id,
          {
            exitPrice: numericExitPrice,
            outcomePnL,
          }
        );

      setEntries((current) =>
        current.map((item) =>
          item._id === entry._id
            ? updatedEntry
            : item
        )
      );

      setEditingEntry(null);
      setExitPrice("");

      setSuccess(
        "Journal outcome updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update journal outcome:",
        error
      );

      setError(getErrorMessage(error));
    } finally {
      setUpdatingOutcome(false);
    }
  };

  const statistics = useMemo(() => {
    const completedEntries = entries.filter(
      (entry) =>
        entry.exitPrice !== undefined &&
        entry.exitPrice !== null
    );

    const winners = completedEntries.filter(
      (entry) =>
        Number(entry.outcomePnL || 0) > 0
    );

    const losers = completedEntries.filter(
      (entry) =>
        Number(entry.outcomePnL || 0) < 0
    );

    const totalPnL =
      completedEntries.reduce(
        (sum, entry) =>
          sum +
          Number(entry.outcomePnL || 0),
        0
      );

    const averageWinner =
      winners.length > 0
        ? winners.reduce(
            (sum, entry) =>
              sum +
              Number(entry.outcomePnL || 0),
            0
          ) / winners.length
        : 0;

    const averageLoser =
      losers.length > 0
        ? losers.reduce(
            (sum, entry) =>
              sum +
              Number(entry.outcomePnL || 0),
            0
          ) / losers.length
        : 0;

    const winRate =
      completedEntries.length > 0
        ? (winners.length /
            completedEntries.length) *
          100
        : 0;

    return {
      total: entries.length,
      completed: completedEntries.length,
      winners: winners.length,
      losers: losers.length,
      totalPnL,
      averageWinner,
      averageLoser,
      winRate,
    };
  }, [entries]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Investment Journal
        </h1>

        <p className="mt-2 text-gray-500">
          Loading your journal...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Investment Journal
        </h1>

        <p className="mt-1 text-gray-500">
          Record your investment decisions,
          reasoning, confidence, and outcomes.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">
            Unable to complete request
          </p>

          <p className="mt-1">
            {error}
          </p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Entries
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.completed}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Win Rate
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {statistics.winRate.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Journal P&L
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              statistics.totalPnL >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {statistics.totalPnL >= 0 ? "+" : ""}
            {formatCurrency(
              statistics.totalPnL
            )}
          </p>
        </div>
      </div>

      {/* New Entry */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            New Journal Entry
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Capture the reasoning behind an
            investment decision.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* Instrument */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Instrument
            </label>

            <select
              name="instrumentId"
              value={form.instrumentId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select instrument
              </option>

              {instruments.map((instrument) => (
                <option
                  key={instrument._id}
                  value={instrument._id}
                >
                  {instrument.symbol} -{" "}
                  {instrument.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Action
            </label>

            <select
              name="action"
              value={form.action}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="BUY">
                BUY
              </option>

              <option value="SELL">
                SELL
              </option>

              <option value="HOLD">
                HOLD
              </option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              placeholder="Enter price"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Confidence */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confidence:{" "}
              <span className="font-bold text-gray-900">
                {form.confidence}/5
              </span>
            </label>

            <input
              type="range"
              name="confidence"
              min="1"
              max="5"
              value={form.confidence}
              onChange={handleChange}
              className="w-full"
            />

            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason / Investment Thesis
            </label>

            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              required
              minLength={5}
              rows="4"
              placeholder="Why are you considering this investment?"
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Minimum 5 characters.
            </p>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : "Add Journal Entry"}
            </button>
          </div>
        </form>
      </div>

      {/* Entries */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Journal Entries
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-gray-500">
              No journal entries yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Create your first investment thesis
              above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => {
              const pnl = Number(
                entry.outcomePnL || 0
              );

              const hasOutcome =
                entry.exitPrice !== undefined &&
                entry.exitPrice !== null;

              return (
                <div
                  key={entry._id}
                  className="p-6"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    {/* Entry Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {entry.instrument
                            ?.symbol ||
                            "Unknown"}
                        </h3>

                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            entry.action ===
                            "BUY"
                              ? "bg-green-100 text-green-700"
                              : entry.action ===
                                "SELL"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {entry.action}
                        </span>

                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Confidence{" "}
                          {entry.confidence}/5
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {entry.instrument
                          ?.name ||
                          "Unknown instrument"}
                      </p>

                      <p className="mt-4 text-sm leading-6 text-gray-700">
                        {entry.reason}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <p>
                          <span className="text-gray-500">
                            Entry:
                          </span>{" "}
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              entry.price
                            )}
                          </span>
                        </p>

                        {entry.quantity && (
                          <p>
                            <span className="text-gray-500">
                              Quantity:
                            </span>{" "}
                            <span className="font-semibold text-gray-900">
                              {entry.quantity}
                            </span>
                          </p>
                        )}

                        <p className="text-gray-500">
                          {formatDate(
                            entry.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Outcome */}
                    <div className="w-full lg:w-72">
                      {hasOutcome ? (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm text-gray-500">
                            Exit Price
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {formatCurrency(
                              entry.exitPrice
                            )}
                          </p>

                          <p className="mt-3 text-sm text-gray-500">
                            Outcome P&L
                          </p>

                          <p
                            className={`mt-1 text-xl font-bold ${
                              pnl >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {pnl >= 0
                              ? "+"
                              : ""}
                            {formatCurrency(
                              pnl
                            )}
                          </p>
                        </div>
                      ) : editingEntry ===
                        entry._id ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <p className="mb-2 text-sm font-medium text-gray-700">
                            Exit Price
                          </p>

                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={exitPrice}
                            onChange={(event) =>
                              setExitPrice(
                                event.target
                                  .value
                              )
                            }
                            placeholder="Enter exit price"
                            className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleOutcomeUpdate(
                                  entry
                                )
                              }
                              disabled={
                                updatingOutcome
                              }
                              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                              {updatingOutcome
                                ? "Saving..."
                                : "Save Outcome"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingEntry(
                                  null
                                );
                                setExitPrice("");
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(
                              entry._id
                            );
                            setExitPrice("");
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Add Exit / Outcome
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      {entries.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Winners
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {statistics.winners}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Avg. winner:{" "}
              {formatCurrency(
                statistics.averageWinner
              )}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Losers
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {statistics.losers}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Avg. loser:{" "}
              {formatCurrency(
                statistics.averageLoser
              )}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Completed Entries
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {statistics.completed}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Entries with recorded outcomes
            </p>
          </div>
        </div>
      )}

      <p className="mt-5 text-center text-xs text-gray-400">
        The Investment Journal is for educational
        tracking and analysis. It does not constitute
        investment advice.
      </p>
    </div>
  );
};

export default Journal;