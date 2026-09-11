import apiClient from "./client.js";

export const getInstruments = async () => {
  const response = await apiClient.get(
    "/instruments"
  );

  return response.data.data;
};

export const getInstrument = async (
  instrumentId
) => {
  const response = await apiClient.get(
    `/instruments/${instrumentId}`
  );

  return response.data.data;
};

export const getHistoricalPrices = async (
  instrumentId,
  params = {}
) => {
  const response = await apiClient.get(
    `/market-prices/${instrumentId}/history`,
    {
      params,
    }
  );

  return response.data.data;
};

export const getLatestPrice = async (
  instrumentId
) => {
  const response = await apiClient.get(
    `/market-prices/${instrumentId}/latest`
  );

  return response.data.data;
};