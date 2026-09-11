import apiClient from "./client.js";

export const registerUser = async ({
  fullName,
  email,
  password,
}) => {
  const response = await apiClient.post(
    "/auth/register",
    {
      fullName,
      email,
      password,
    }
  );

  return response.data.data;
};

export const loginUser = async ({
  email,
  password,
}) => {
  const response = await apiClient.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data.data;
};

export const getCurrentUser = async () => {
  const response =
    await apiClient.get("/auth/me");

  return response.data.data;
};

export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // Even if backend logout fails,
    // we still clear the local session.
  }
};