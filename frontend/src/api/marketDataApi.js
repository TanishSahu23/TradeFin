const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

/**
 * Generic API request helper
 */
const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      "Invalid response received from server"
    );
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ||
        "Something went wrong with the API request"
    );
  }

  return data;
};

/**
 * Get all active instruments
 *
 * GET /api/v1/instruments
 */
export const getInstruments = async () => {
  const response =
    await apiRequest("/instruments");

  return response.data;
};

/**
 * Get a single instrument
 *
 * GET /api/v1/instruments/:id
 */
export const getInstrument = async (
  instrumentId
) => {
  if (!instrumentId) {
    throw new Error(
      "Instrument ID is required"
    );
  }

  const response =
    await apiRequest(
      `/instruments/${instrumentId}`
    );

  return response.data;
};

/**
 * Get latest market price
 *
 * GET /api/v1/market-prices/:instrumentId/latest
 */
export const getLatestPrice = async (
  instrumentId
) => {
  if (!instrumentId) {
    throw new Error(
      "Instrument ID is required"
    );
  }

  const response =
    await apiRequest(
      `/market-prices/${instrumentId}/latest`
    );

  return response.data;
};

/**
 * Get historical market prices
 *
 * GET /api/v1/market-prices/:instrumentId/history
 *
 * Optional:
 *   from = YYYY-MM-DD
 *   to   = YYYY-MM-DD
 */
export const getHistoricalPrices = async (
  instrumentId,
  filters = {}
) => {
  if (!instrumentId) {
    throw new Error(
      "Instrument ID is required"
    );
  }

  const params =
    new URLSearchParams();

  if (filters.from) {
    params.set(
      "from",
      filters.from
    );
  }

  if (filters.to) {
    params.set(
      "to",
      filters.to
    );
  }

  const queryString =
    params.toString();

  const endpoint =
    `/market-prices/${instrumentId}/history` +
    (queryString
      ? `?${queryString}`
      : "");

  const response =
    await apiRequest(endpoint);

  return response.data;
};

/**
 * Sync market data from provider
 *
 * POST /api/v1/market-prices/:instrumentId/sync
 */
export const syncMarketData = async (
  instrumentId
) => {
  if (!instrumentId) {
    throw new Error(
      "Instrument ID is required"
    );
  }

  const response =
    await apiRequest(
      `/market-prices/${instrumentId}/sync`,
      {
        method: "POST",
      }
    );

  return response.data;
};