import { useEffect, useMemo, useState } from "react";

import {
  getIPOs,
  getTrackedIPOs,
  trackIPO,
  untrackIPO,
} from "../../api/ipo.api.js";

import { formatCurrency } from "../../utils/formatters.js";

const IPOs = () => {
  const [ipos, setIPOs] = useState([]);
  const [trackedIPOs, setTrackedIPOs] =
    useState([]);

  const [status, setStatus] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [trackingId, setTrackingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadIPOs = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          ipoData,
          trackedData,
        ] = await Promise.all([
          getIPOs(status),
          getTrackedIPOs(),
        ]);

        setIPOs(
          Array.isArray(ipoData)
            ? ipoData
            : ipoData?.ipos || []
        );

        setTrackedIPOs(
          Array.isArray(trackedData)
            ? trackedData
            : trackedData?.ipos || []
        );
      } catch (error) {
        console.error(
          "Failed to load IPOs:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load IPO research."
        );
      } finally {
        setLoading(false);
      }
    };

    loadIPOs();
  }, [status]);

  const trackedIds = useMemo(() => {
    return new Set(
      trackedIPOs.map((item) => {
        if (item?.ipo?._id) {
          return item.ipo._id;
        }

        return item?._id;
      })
    );
  }, [trackedIPOs]);

  const filteredIPOs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return ipos;
    }

    return ipos.filter((ipo) => {
      return (
        ipo.companyName
          ?.toLowerCase()
          .includes(query) ||
        ipo.symbol
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [ipos, search]);

  const handleTracking = async (ipo) => {
    try {
      setTrackingId(ipo._id);
      setError("");
      setSuccess("");

      const isTracked = trackedIds.has(
        ipo._id
      );

      if (isTracked) {
        await untrackIPO(ipo._id);

        setTrackedIPOs((current) =>
          current.filter((item) => {
            const trackedIPOId =
              item?.ipo?._id ||
              item?._id;

            return (
              trackedIPOId !== ipo._id
            );
          })
        );

        setSuccess(
          `${ipo.companyName} removed from your IPO watchlist.`
        );
      } else {
        const tracked =
          await trackIPO(ipo._id);

        setTrackedIPOs((current) => [
          ...current,
          tracked,
        ]);

        setSuccess(
          `${ipo.companyName} added to your IPO watchlist.`
        );
      }
    } catch (error) {
      console.error(
        "Failed to update IPO tracking:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update IPO watchlist."
      );
    } finally {
      setTrackingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatNumber = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "-";
    }

    return Number(value).toLocaleString(
      "en-IN"
    );
  };

  const getPriceBand = (ipo) => {
    const min = Number(
      ipo.priceBandMin
    );

    const max = Number(
      ipo.priceBandMax
    );

    if (min > 0 && max > 0) {
      return `${formatCurrency(
        min
      )} - ${formatCurrency(max)}`;
    }

    if (max > 0) {
      return formatCurrency(max);
    }

    if (min > 0) {
      return formatCurrency(min);
    }

    return "-";
  };

  const getStatusClasses = (ipoStatus) => {
    switch (ipoStatus) {
      case "OPEN":
        return "bg-green-100 text-green-700";

      case "UPCOMING":
        return "bg-blue-100 text-blue-700";

      case "CLOSED":
        return "bg-gray-100 text-gray-700";

      case "LISTED":
        return "bg-purple-100 text-purple-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          IPO Research
        </h1>

        <p className="mt-2 text-gray-500">
          Loading IPO data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          IPO Research
        </h1>

        <p className="mt-1 text-gray-500">
          Research upcoming, open, closed, and
          listed IPOs.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus("")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                status === ""
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setStatus("UPCOMING")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                status === "UPCOMING"
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Upcoming
            </button>

            <button
              type="button"
              onClick={() =>
                setStatus("OPEN")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                status === "OPEN"
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Open
            </button>

            <button
              type="button"
              onClick={() =>
                setStatus("CLOSED")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                status === "CLOSED"
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Closed
            </button>

            <button
              type="button"
              onClick={() =>
                setStatus("LISTED")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                status === "LISTED"
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Listed
            </button>
          </div>

          <input
            type="text"
            placeholder="Search company or symbol..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:max-w-sm"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Available IPOs
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {filteredIPOs.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Open IPOs
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              ipos.filter(
                (ipo) =>
                  ipo.status === "OPEN"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Tracked
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {trackedIPOs.length}
          </p>
        </div>
      </div>

      {/* IPO Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            IPO Opportunities
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Compare key IPO information before
            researching further.
          </p>
        </div>

        {filteredIPOs.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-gray-500">
              No IPOs found.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Try changing the filter or search
              term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Company
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    IPO Dates
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    Price Band
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    Lot Size
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    Issue Size
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    Subscription
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    P/E
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    Current Price
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredIPOs.map((ipo) => {
                  const isTracked =
                    trackedIds.has(
                      ipo._id
                    );

                  return (
                    <tr
                      key={ipo._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      {/* Company */}
                      <td className="px-5 py-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {ipo.companyName}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {ipo.symbol || "-"}{" "}
                            {ipo.exchange
                              ? `• ${ipo.exchange}`
                              : ""}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-5">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            ipo.status
                          )}`}
                        >
                          {ipo.status}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-5 text-sm text-gray-600">
                        <p>
                          Open:{" "}
                          {formatDate(
                            ipo.openDate
                          )}
                        </p>

                        <p className="mt-1">
                          Close:{" "}
                          {formatDate(
                            ipo.closeDate
                          )}
                        </p>
                      </td>

                      {/* Price Band */}
                      <td className="px-5 py-5 text-right font-medium text-gray-900">
                        {getPriceBand(ipo)}
                      </td>

                      {/* Lot Size */}
                      <td className="px-5 py-5 text-right text-gray-700">
                        {formatNumber(
                          ipo.lotSize
                        )}
                      </td>

                      {/* Issue Size */}
                      <td className="px-5 py-5 text-right text-gray-700">
                        {ipo.issueSize
                          ? formatNumber(
                              ipo.issueSize
                            )
                          : "-"}
                      </td>

                      {/* Subscription */}
                      <td className="px-5 py-5 text-right text-gray-700">
                        {ipo.subscription !==
                          undefined &&
                        ipo.subscription !==
                          null
                          ? `${ipo.subscription}x`
                          : "-"}
                      </td>

                      {/* PE */}
                      <td className="px-5 py-5 text-right text-gray-700">
                        {ipo.peRatio !==
                          undefined &&
                        ipo.peRatio !== null
                          ? Number(
                              ipo.peRatio
                            ).toFixed(2)
                          : "-"}
                      </td>

                      {/* Current Price */}
                      <td className="px-5 py-5 text-right font-medium text-gray-900">
                        {ipo.currentPrice
                          ? formatCurrency(
                              ipo.currentPrice
                            )
                          : "-"}
                      </td>

                      {/* Tracking */}
                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleTracking(
                              ipo
                            )
                          }
                          disabled={
                            trackingId ===
                            ipo._id
                          }
                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            isTracked
                              ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {trackingId ===
                          ipo._id
                            ? "Updating..."
                            : isTracked
                            ? "Untrack"
                            : "Track"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Research Note */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="font-semibold text-blue-900">
          IPO Research Note
        </h2>

        <p className="mt-1 text-sm leading-6 text-blue-700">
          IPO data in TradeFin is intended for
          research and educational analysis. Always
          verify financial information and official
          offer documents before making investment
          decisions.
        </p>
      </div>
    </div>
  );
};

export default IPOs;