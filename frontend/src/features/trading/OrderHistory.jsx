import { useEffect, useState } from "react";

import { getMyOrders } from "../../api/order.api.js";
import { formatCurrency } from "../../utils/formatters.js";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyOrders();

        console.log("Orders API response:", response);

        /*
         * Handle different possible backend response shapes:
         *
         * 1. [ ...orders ]
         * 2. { data: [ ...orders ] }
         * 3. { orders: [ ...orders ] }
         */
        let orderData = [];

        if (Array.isArray(response)) {
          orderData = response;
        } else if (Array.isArray(response?.data)) {
          orderData = response.data;
        } else if (Array.isArray(response?.orders)) {
          orderData = response.orders;
        }

        setOrders(orderData);
      } catch (error) {
        console.error(
          "Failed to load orders:",
          error
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load order history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
          Order History
        </h1>

        <p className="mt-2 text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Order History
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            Unable to load orders
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const buyOrders = orders.filter(
    (order) => order?.side === "BUY"
  );

  const sellOrders = orders.filter(
    (order) => order?.side === "SELL"
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Order History
        </h1>

        <p className="mt-1 text-gray-500">
          View your paper trading orders and
          executions.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Buy Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {buyOrders.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Sell Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {sellOrders.length}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactions
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">
              No orders yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Your BUY and SELL transactions will
              appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Instrument
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Side
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Execution Price
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Order Value
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const instrument =
                    order?.instrument;

                  const trade =
                    order?.trade;

                  const executionPrice = Number(
                    trade?.executionPrice ??
                      order?.executionPrice ??
                      0
                  );

                  const quantity = Number(
                    order?.quantity ?? 0
                  );

                  const orderValue =
                    executionPrice * quantity;

                  const isBuy =
                    order?.side === "BUY";

                  return (
                    <tr
                      key={order?._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      {/* Instrument */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {instrument?.symbol ||
                              "Unknown"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {instrument?.name ||
                              "Unknown instrument"}
                          </p>
                        </div>
                      </td>

                      {/* Side */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            isBuy
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order?.side || "-"}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-right text-gray-700">
                        {quantity}
                      </td>

                      {/* Execution Price */}
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {executionPrice > 0
                          ? formatCurrency(
                              executionPrice
                            )
                          : "-"}
                      </td>

                      {/* Order Value */}
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {executionPrice > 0
                          ? formatCurrency(
                              orderValue
                            )
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            order?.status ===
                            "EXECUTED"
                              ? "bg-green-100 text-green-700"
                              : order?.status ===
                                "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order?.status || "-"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(
                          order?.executedAt ||
                            order?.requestedAt
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        TradeFin uses simulated paper trading.
        These orders are not sent to a real stock
        exchange.
      </p>
    </div>
  );
};

export default OrderHistory;