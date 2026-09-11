import apiClient from "./client.js";

export const getMyHoldings = async () => {
  const response = await apiClient.get(
    "/holdings"
  );

  return response.data.data;
};