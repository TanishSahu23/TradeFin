import IPO from "./ipo.model.js";
import IPOTracking from "./ipoTracking.model.js";

import AppError from "../../utils/AppError.js";

export const trackIPO = async (userId, ipoId) => {
  const ipo = await IPO.findById(ipoId);

  if (!ipo) {
    throw new AppError("IPO not found", 404);
  }

  const existingTracking = await IPOTracking.findOne({
    user: userId,
    ipo: ipoId,
  });

  if (existingTracking) {
    throw new AppError("IPO is already being tracked", 409);
  }

  const tracking = await IPOTracking.create({
    user: userId,
    ipo: ipoId,
    status: "WATCHING",
  });

  return await tracking.populate("ipo");
};

export const untrackIPO = async (userId, ipoId) => {
  const tracking = await IPOTracking.findOneAndDelete({
    user: userId,
    ipo: ipoId,
  });

  if (!tracking) {
    throw new AppError("IPO is not being tracked", 404);
  }

  return tracking;
};

export const getTrackedIPOs = async (userId) => {
  return await IPOTracking.find({
    user: userId,
  })
    .populate("ipo")
    .sort({
      createdAt: -1,
    });
};