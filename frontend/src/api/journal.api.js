import apiClient from "./client.js";

export const getJournalEntries = async () => {
  const response = await apiClient.get(
    "/journal"
  );

  return response.data.data;
};

export const createJournalEntry = async (
  journalData
) => {
  const response = await apiClient.post(
    "/journal",
    journalData
  );

  return response.data.data;
};

export const updateJournalEntry = async (
  journalId,
  journalData
) => {
  const response = await apiClient.put(
    `/journal/${journalId}`,
    journalData
  );

  return response.data.data;
};