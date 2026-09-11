//Goal 
// A. Get all active instruments
// B. Get one instrument

import Instrument from "./instrument.model.js";
import AppError from "../../utils/AppError.js";

export const getAllInstruments = async () => {
  const instruments = await Instrument.find({
    isActive: true,
  }).sort({
    symbol: 1,
  });

  return instruments;
};

export const getSingleInstrument = async (id) => {
  const instrument = await Instrument.findById(id);

  if (!instrument) {
    throw new AppError("Instrument not found", 404);
  }

  return instrument;
};