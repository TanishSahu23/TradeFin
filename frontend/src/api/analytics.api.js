import apiClient from "./client.js";

export const getPerformanceAnalytics = async () => {
  const response = await apiClient.get(
    "/analytics/performance"
  );

  return response.data.data;
};

export const getRiskAnalytics = async () => {
  const response = await apiClient.get(
    "/analytics/risk"
  );

  return response.data.data;
};

export const getDiversificationAnalytics =
  async () => {
    const response = await apiClient.get(
      "/analytics/diversification"
    );

    return response.data.data;
  };

export const getCorrelationMatrix =
  async () => {
    const response = await apiClient.get(
      "/analytics/correlation"
    );

    return response.data.data;
  };

export const getBeta = async (
  instrumentId,
  benchmarkId
) => {
  const response = await apiClient.get(
    `/analytics/beta/${instrumentId}`,
    {
      params: {
        benchmarkId,
      },
    }
  );

  return response.data.data;
};

export const getTechnicalAnalysis =
  async (instrumentId) => {
    const response = await apiClient.get(
      `/analytics/instruments/${instrumentId}/technicals`
    );

    return response.data.data;
  };