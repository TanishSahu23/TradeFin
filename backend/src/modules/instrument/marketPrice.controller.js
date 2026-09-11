import {
  getHistoricalPrices as getHistoricalPricesService,
  getLatestPrice as getLatestPriceService,
} from "./marketPrice.service.js";

export const getHistoricalPrices = async (req, res, next) => {
  try {
    const prices = await getHistoricalPricesService(
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

export const getLatestPrice = async (req, res, next) => {
  try {
    const price = await getLatestPriceService(req.params.id);

    res.status(200).json({
      success: true,
      data: price,
    });
  } catch (error) {
    next(error);
  }
};