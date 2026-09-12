import apiClient from "./client.js";

/**
 * Get all instruments.
 */
export const getInstruments =
  async () => {
    const response =
      await apiClient.get(
        "/instruments"
      );

    return response.data.data;
  };

/**
 * Search instruments.
 */
export const searchInstruments =
  async (query) => {
    const response =
      await apiClient.get(
        "/instruments/search",
        {
          params: {
            q: query,
          },
        }
      );

    return response.data.data;
  };

/**
 * Get one instrument.
 */
export const getInstrument =
  async (instrumentId) => {
    const response =
      await apiClient.get(
        `/instruments/${instrumentId}`
      );

    return response.data.data;
  };

/**
 * Get historical prices.
 */
export const getHistoricalPrices =
  async (
    instrumentId,
    params = {}
  ) => {
    const response =
      await apiClient.get(
        `/market-prices/${instrumentId}/history`,
        {
          params,
        }
      );

    return response.data.data;
  };

/**
 * Get latest price.
 */
export const getLatestPrice =
  async (instrumentId) => {
    const response =
      await apiClient.get(
        `/market-prices/${instrumentId}/latest`
      );

    return response.data.data;
  };