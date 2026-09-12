import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getInstruments,
  getLatestPrice,
  searchInstruments,
} from "../../api/instrument.api.js";

import { formatCurrency } from "../../utils/formatters.js";

const Markets = () => {
  const [instruments, setInstruments] =
    useState([]);

  const [prices, setPrices] =
    useState({});

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [pricesLoading, setPricesLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [priceError, setPriceError] =
    useState("");

  /**
   * -----------------------------------------
   * Load all instruments.
   * -----------------------------------------
   */
  const fetchInstruments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getInstruments();

        setInstruments(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load instruments:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load instruments"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * -----------------------------------------
   * Search instruments.
   *
   * Backend decides:
   *
   * MongoDB first
   *       ↓
   * Alpha Vantage if missing
   *       ↓
   * Save to MongoDB
   *       ↓
   * Return instrument
   * -----------------------------------------
   */
  const handleSearch =
    useCallback(
      async (value) => {
        setSearch(value);

        const query =
          value.trim();

        if (!query) {
          fetchInstruments();
          return;
        }

        try {
          setSearchLoading(true);
          setError("");

          const data =
            await searchInstruments(
              query
            );

          setInstruments(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Instrument search failed:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              "Failed to search instruments"
          );

          setInstruments([]);
        } finally {
          setSearchLoading(false);
        }
      },
      [fetchInstruments]
    );

  /**
   * -----------------------------------------
   * Fetch latest prices.
   * -----------------------------------------
   */
  const fetchLatestPrices =
    useCallback(
      async (instrumentList) => {
        if (
          !instrumentList?.length
        ) {
          setPrices({});
          return;
        }

        try {
          setPricesLoading(true);
          setPriceError("");

          const results =
            await Promise.allSettled(
              instrumentList.map(
                async (
                  instrument
                ) => {
                  const price =
                    await getLatestPrice(
                      instrument._id
                    );

                  return {
                    instrumentId:
                      instrument._id,

                    price,
                  };
                }
              )
            );

          const nextPrices = {};

          let failedCount = 0;

          results.forEach(
            (result) => {
              if (
                result.status ===
                "fulfilled"
              ) {
                const {
                  instrumentId,
                  price,
                } = result.value;

                nextPrices[
                  instrumentId
                ] = price;
              } else {
                failedCount += 1;

                console.error(
                  "Failed to fetch latest price:",
                  result.reason
                );
              }
            }
          );

          setPrices(
            nextPrices
          );

          if (
            failedCount > 0
          ) {
            setPriceError(
              `${failedCount} instrument price${
                failedCount >
                1
                  ? "s"
                  : ""
              } could not be updated.`
            );
          }
        } finally {
          setPricesLoading(
            false
          );
        }
      },
      []
    );

  /**
   * -----------------------------------------
   * Initial load.
   * -----------------------------------------
   */
  useEffect(() => {
    fetchInstruments();
  }, [
    fetchInstruments,
  ]);

  /**
   * -----------------------------------------
   * Fetch prices whenever instruments change.
   * -----------------------------------------
   */
  useEffect(() => {
    if (
      instruments.length > 0
    ) {
      fetchLatestPrices(
        instruments
      );
    } else {
      setPrices({});
    }
  }, [
    instruments,
    fetchLatestPrices,
  ]);

  /**
   * -----------------------------------------
   * Get market data.
   * -----------------------------------------
   */
  const getMarketData = (
    instrument
  ) => {
    const latest =
      prices[
        instrument._id
      ];

    return {
      currentPrice:
        latest?.currentPrice ??
        instrument.currentPrice ??
        0,

      previousClose:
        latest?.previousClose ??
        instrument.previousClose ??
        0,

      change:
        latest?.change ??
        undefined,

      changePercent:
        latest?.changePercent ??
        undefined,

      latestTradingDay:
        latest?.timestamp ??
        undefined,
    };
  };

  /**
   * -----------------------------------------
   * Calculate price change.
   * -----------------------------------------
   */
  const getPriceChange = (
    instrument
  ) => {
    const marketData =
      getMarketData(
        instrument
      );

    const currentPrice =
      Number(
        marketData.currentPrice ||
          0
      );

    const previousClose =
      Number(
        marketData.previousClose ||
          0
      );

    let change =
      Number(
        marketData.change
      );

    let changePercent =
      Number(
        marketData.changePercent
      );

    if (
      !Number.isFinite(
        change
      )
    ) {
      change =
        currentPrice -
        previousClose;
    }

    if (
      !Number.isFinite(
        changePercent
      )
    ) {
      changePercent =
        previousClose > 0
          ? (change /
              previousClose) *
            100
          : 0;
    }

    return {
      currentPrice,
      previousClose,
      change,
      changePercent,
    };
  };

  /**
   * -----------------------------------------
   * Refresh prices.
   * -----------------------------------------
   */
  const handleRefreshPrices =
    async () => {
      await fetchLatestPrices(
        instruments
      );
    };

  /**
   * -----------------------------------------
   * Initial loading.
   * -----------------------------------------
   */
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="mb-2 text-2xl font-bold">
          Markets
        </h1>

        <p className="text-gray-500">
          Loading instruments...
        </p>
      </div>
    );
  }

  /**
   * -----------------------------------------
   * Error state.
   * -----------------------------------------
   */
  if (error) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Markets
        </h1>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold">
            Markets
          </h1>

          <p className="mt-1 text-gray-500">
            Explore available stocks
            and market instruments.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleRefreshPrices
          }
          disabled={
            pricesLoading
          }
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pricesLoading
            ? "Updating..."
            : "Refresh Prices"}
        </button>
      </div>

      {/* Price update error */}

      {priceError && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {priceError}
        </div>
      )}

      {/* Search */}

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by symbol or company name..."
          value={search}
          onChange={(event) =>
            handleSearch(
              event.target.value
            )
          }
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {searchLoading && (
          <p className="mt-2 text-sm text-gray-500">
            Searching market data...
          </p>
        )}
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Symbol
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Exchange
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Price
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Change
                </th>
              </tr>
            </thead>

            <tbody>
              {instruments.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {search
                      ? "No instruments found."
                      : "No instruments available."}
                  </td>
                </tr>
              ) : (
                instruments.map(
                  (
                    instrument
                  ) => {
                    const {
                      currentPrice,
                      change,
                      changePercent,
                    } =
                      getPriceChange(
                        instrument
                      );

                    const isPositive =
                      change >= 0;

                    const hasPrice =
                      Number.isFinite(
                        Number(
                          currentPrice
                        )
                      ) &&
                      Number(
                        currentPrice
                      ) > 0;

                    return (
                      <tr
                        key={
                          instrument._id
                        }
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/markets/${instrument._id}`}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {
                              instrument.symbol
                            }
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            to={`/markets/${instrument._id}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                          >
                            {
                              instrument.name
                            }
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          {
                            instrument.exchange
                          }
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          {
                            instrument.instrumentType
                          }
                        </td>

                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {hasPrice
                            ? formatCurrency(
                                currentPrice
                              )
                            : "—"}
                        </td>

                        <td
                          className={`px-6 py-4 text-right font-medium ${
                            isPositive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {hasPrice ? (
                            <>
                              {isPositive
                                ? "+"
                                : ""}
                              {formatCurrency(
                                change
                              )}{" "}
                              (
                              {isPositive
                                ? "+"
                                : ""}
                              {changePercent.toFixed(
                                2
                              )}
                              %)
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-4 text-sm text-gray-500">
        {searchLoading
          ? "Searching market data..."
          : pricesLoading
          ? "Updating market prices..."
          : search
          ? "Search results from TradeFin and Alpha Vantage."
          : Object.keys(
                prices
              ).length > 0
          ? "Prices updated from market data provider."
          : "Showing stored instrument prices."}
      </div>
    </div>
  );
};

export default Markets;