import apiClient from "./client.js";

export const createOrder = async ({
  instrumentId,
  side,
  quantity,
}) => {
  const response = await apiClient.post(
    "/orders",
    {
      instrumentId,
      side,
      quantity,
    }
  );

  return response.data.data;
};

export const getMyOrders = async () => {
  const response = await apiClient.get(
    "/orders"
  );

  return response.data.data;
};