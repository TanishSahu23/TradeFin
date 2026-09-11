import {
  getPerformanceAnalytics as getPerformanceAnalyticsService,
  getRiskAnalytics as getRiskAnalyticsService,
  getDiversificationAnalytics as getDiversificationAnalyticsService,
} from "./analytics.service.js";

export const getPerformanceAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const performance =
      await getPerformanceAnalyticsService(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

export const getRiskAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const risk =
      await getRiskAnalyticsService(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: risk,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiversificationAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const diversification =
      await getDiversificationAnalyticsService(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: diversification,
    });
  } catch (error) {
    next(error);
  }
};