import {
  getWatchlist as getWatchlistService,
  addToWatchlist as addToWatchlistService,
  removeFromWatchlist as removeFromWatchlistService,
} from "./watchlist.service.js";

export const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await getWatchlistService(req.user.userId);

    res.status(200).json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req, res, next) => {
  try {
    const { instrumentId } = req.body;

    const watchlist = await addToWatchlistService(
      req.user.userId,
      instrumentId
    );

    res.status(201).json({
      success: true,
      message: "Instrument added to watchlist",
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { instrumentId } = req.params;

    const watchlist = await removeFromWatchlistService(
      req.user.userId,
      instrumentId
    );

    res.status(200).json({
      success: true,
      message: "Instrument removed from watchlist",
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
};