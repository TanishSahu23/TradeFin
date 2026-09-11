import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getInstruments } from "../../api/instrument.api.js";
import { formatCurrency } from "../../utils/formatters.js";

const Markets = () => {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getInstruments();
        setInstruments(data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load instruments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInstruments();
  }, []);

  const filteredInstruments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return instruments;
    }

    return instruments.filter((instrument) => {
      return (
        instrument.symbol.toLowerCase().includes(query) ||
        instrument.name.toLowerCase().includes(query)
      );
    });
  }, [instruments, search]);

  const getPriceChange = (instrument) => {
    const currentPrice = Number(
      instrument.currentPrice || 0
    );

    const previousClose = Number(
      instrument.previousClose || 0
    );

    const change = currentPrice - previousClose;

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
        <h1 className="mb-2 text-2xl font-bold">
          Markets
        </h1>

        <p className="text-gray-500">
          Loading instruments...
        </p>
      </div>
    );
  }

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
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Markets
        </h1>

        <p className="mt-1 text-gray-500">
          Explore available stocks and market instruments.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by symbol or company name..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Instruments Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No instruments found.
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((instrument) => {
                  const {
                    change,
                    changePercent,
                  } = getPriceChange(instrument);

                  const isPositive = change >= 0;

                  return (
                    <tr
                      key={instrument._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      {/* Symbol */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/markets/${instrument._id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {instrument.symbol}
                        </Link>
                      </td>

                      {/* Company Name */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/markets/${instrument._id}`}
                          className="text-gray-700 hover:text-blue-600 hover:underline"
                        >
                          {instrument.name}
                        </Link>
                      </td>

                      {/* Exchange */}
                      <td className="px-6 py-4 text-gray-700">
                        {instrument.exchange}
                      </td>

                      {/* Instrument Type */}
                      <td className="px-6 py-4 text-gray-700">
                        {instrument.instrumentType}
                      </td>

                      {/* Current Price */}
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(
                          instrument.currentPrice
                        )}
                      </td>

                      {/* Price Change */}
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          isPositive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatCurrency(change)} (
                        {isPositive ? "+" : ""}
                        {changePercent.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Markets;