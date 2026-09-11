// Working
// The controller is the HTTP layer.
// It receives the Express request and decides what HTTP response to send.

import {
  getAllInstruments as getAllInstrumentsService,
  getSingleInstrument as getSingleInstrumentService,
} from "./instrument.service.js";

export const getAllInstruments = async (req, res, next) => {
  try {
    const instruments = await getAllInstrumentsService();

    res.status(200).json({
      success: true,
      data: instruments,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleInstrument = async (req, res, next) => {
  try {
    const instrument = await getSingleInstrumentService(req.params.id);

    res.status(200).json({
      success: true,
      data: instrument,
    });
  } catch (error) {
    next(error);
  }
};