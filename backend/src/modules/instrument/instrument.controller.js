import {
  getAllInstruments as getAllInstrumentsService,
  getSingleInstrument as getSingleInstrumentService,
  searchInstruments as searchInstrumentsService,
} from "./instrument.service.js";

/**
 * GET /instruments
 */
export const getAllInstruments = async (
  req,
  res,
  next
) => {
  try {
    const instruments =
      await getAllInstrumentsService();

    res.status(200).json({
      success: true,
      data: instruments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /instruments/:id
 */
export const getSingleInstrument = async (
  req,
  res,
  next
) => {
  try {
    const instrument =
      await getSingleInstrumentService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: instrument,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /instruments/search?q=ITC
 */
export const searchInstruments = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.query.q;

    const instruments =
      await searchInstrumentsService(
        query
      );

    res.status(200).json({
      success: true,
      data: instruments,
    });
  } catch (error) {
    next(error);
  }
};