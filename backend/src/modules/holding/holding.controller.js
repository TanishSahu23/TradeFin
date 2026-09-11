import {
  getMyHoldings as getMyHoldingsService,
} from "./holding.service.js";

export const getMyHoldings = async (req, res, next) => {
  try {
    const holdings = await getMyHoldingsService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    next(error);
  }
};