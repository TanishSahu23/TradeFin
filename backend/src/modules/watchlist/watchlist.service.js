import Watchlist from "./watchlist.model.js";
import Instrument from "../instrument/instrument.model.js";
import AppError from "../../utils/AppError.js";

export const getWatchlist = async (userId) => {
  const watchlist = await Watchlist.findOne({
    user: userId,
  }).populate("instruments");

  if (!watchlist) {
    return {
      user: userId,
      instruments: [],
    };
  }

  return watchlist;
};

export const addToWatchlist = async (userId, instrumentId) => {
  const instrument = await Instrument.findById(instrumentId);

  if (!instrument) {
    throw new AppError("Instrument not found", 404);
  }

  let watchlist = await Watchlist.findOne({
    user: userId,
  });

  if (!watchlist) {
    watchlist = await Watchlist.create({
      user: userId,
      instruments: [instrumentId],
    });

    return await watchlist.populate("instruments");
  }

  const alreadyExists = watchlist.instruments.some(
    (id) => id.toString() === instrumentId
  );

  if (alreadyExists) {
    throw new AppError("Instrument already in watchlist", 409);
  }

  watchlist.instruments.push(instrumentId);

  await watchlist.save();

  return await watchlist.populate("instruments");
};

export const removeFromWatchlist = async (userId, instrumentId) => {
  const watchlist = await Watchlist.findOne({
    user: userId,
  });

  if (!watchlist) {
    throw new AppError("Watchlist not found", 404);
  }

  const instrumentExists = watchlist.instruments.some(
    (id) => id.toString() === instrumentId
  );

  if (!instrumentExists) {
    throw new AppError("Instrument not in watchlist", 404);
  }

  watchlist.instruments = watchlist.instruments.filter(
    (id) => id.toString() !== instrumentId
  );

  await watchlist.save();

  return await watchlist.populate("instruments");
};