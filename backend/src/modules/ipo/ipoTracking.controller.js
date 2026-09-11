import {
  trackIPO as trackIPOService,
  untrackIPO as untrackIPOService,
  getTrackedIPOs as getTrackedIPOsService,
} from "./ipoTracking.service.js";

export const trackIPO = async (req, res, next) => {
  try {
    const tracking = await trackIPOService(
      req.user.userId,
      req.params.id
    );

    res.status(201).json({
      success: true,
      message: "IPO added to watchlist",
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

export const untrackIPO = async (req, res, next) => {
  try {
    await untrackIPOService(
      req.user.userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "IPO removed from watchlist",
    });
  } catch (error) {
    next(error);
  }
};

export const getTrackedIPOs = async (req, res, next) => {
  try {
    const trackedIPOs = await getTrackedIPOsService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: trackedIPOs,
    });
  } catch (error) {
    next(error);
  }
};