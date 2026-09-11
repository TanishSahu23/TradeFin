import apiClient from "./client.js";

export const getWatchlist = async () => {
  const response = await apiClient.get(
    "/watchlist"
  );

  return response.data.data;
};

export const addToWatchlist = async (
  instrumentId
) => {
  const response = await apiClient.post(
    "/watchlist",
    {
      instrumentId,
    }
  );

  return response.data.data;
};

export const removeFromWatchlist = async (
  instrumentId
) => {
  const response = await apiClient.delete(
    `/watchlist/${instrumentId}`
  );

  return response.data.data;
};