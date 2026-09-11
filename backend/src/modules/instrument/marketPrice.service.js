import MarketPrice from "./marketPrice.model.js";

import AppError from "../../utils/AppError.js";

export const getHistoricalPrices = async (
  instrumentId,
  filters = {}
) => {
  const query = {
    instrument: instrumentId,
  };

  if (filters.from || filters.to) {
    query.date = {};

    if (filters.from) {
      query.date.$gte = filters.from;
    }

    if (filters.to) {
      query.date.$lte = filters.to;
    }
  }

  const prices = await MarketPrice.find(query).sort({
    date: 1,
  });

  return prices;
};

export const getLatestPrice = async (instrumentId) => {
  const price = await MarketPrice.findOne({
    instrument: instrumentId,
  }).sort({
    date: -1,
  });

  if (!price) {
    throw new AppError(
      "Historical price data not found",
      404
    );
  }

  return price;
};