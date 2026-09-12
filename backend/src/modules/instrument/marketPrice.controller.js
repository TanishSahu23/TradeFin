import {
  getHistoricalPrices as getHistoricalPricesService,
  getLatestPrice as getLatestPriceService,
  syncMarketDataForInstrument,
} from "./marketPrice.service.js";

/**
 * Get historical prices.
 */
export const getHistoricalPrices = async (
  req,
  res,
  next
) => {
  try {
    const prices =
      await getHistoricalPricesService(
        req.params.id,
        req.validatedQuery
      );

    res.status(200).json({
      success: true,
      data: prices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest price.
 *
 * This endpoint reads from MongoDB.
 *
 * It does NOT call Alpha Vantage.
 */
export const getLatestPrice = async (
  req,
  res,
  next
) => {
  try {
    const price =
      await getLatestPriceService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: price,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Synchronize market data.
 *
 * This endpoint explicitly tells the
 * backend to fetch data from Alpha Vantage
 * and store it in MongoDB.
 */
export const syncMarketData = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await syncMarketDataForInstrument(
        req.params.id
      );

    res.status(200).json({
      success: true,

      message:
        "Market data synchronized successfully",

      data: result,
    });
  } catch (error) {
    next(error);
  }
};