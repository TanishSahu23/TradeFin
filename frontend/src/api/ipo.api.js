import apiClient from "./client.js";

export const getIPOs = async (status) => {
  const response = await apiClient.get(
    "/ipos",
    {
      params: status ? { status } : {},
    }
  );

  return response.data.data;
};

export const getIPO = async (ipoId) => {
  const response = await apiClient.get(
    `/ipos/${ipoId}`
  );

  return response.data.data;
};

export const getTrackedIPOs = async () => {
  const response = await apiClient.get(
    "/ipos/tracked"
  );

  return response.data.data;
};

export const trackIPO = async (ipoId) => {
  const response = await apiClient.post(
    `/ipos/${ipoId}/track`
  );

  return response.data.data;
};

export const untrackIPO = async (ipoId) => {
  const response = await apiClient.delete(
    `/ipos/${ipoId}/track`
  );

  return response.data.data;
};