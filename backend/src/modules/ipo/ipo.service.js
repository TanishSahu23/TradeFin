import IPO from "./ipo.model.js";

import AppError from "../../utils/AppError.js";

export const getAllIPOs = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  return await IPO.find(query).sort({
    listingDate: 1,
    createdAt: -1,
  });
};

export const getIPOById = async (ipoId) => {
  const ipo = await IPO.findById(ipoId);

  if (!ipo) {
    throw new AppError("IPO not found", 404);
  }

  return ipo;
};

export const createIPO = async (ipoData) => {
  const ipo = await IPO.create(ipoData);

  return ipo;
};