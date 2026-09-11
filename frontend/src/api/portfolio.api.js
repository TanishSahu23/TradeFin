import apiClient from "./client.js";

export const getPortfolioSummary = async () => {
  const response = await apiClient.get(
    "/portfolio/summary"
  );

  return response.data.data;
};