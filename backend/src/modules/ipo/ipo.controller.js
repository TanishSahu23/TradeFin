import {
  getAllIPOs as getAllIPOsService,
  getIPOById as getIPOByIdService,
} from "./ipo.service.js";

export const getAllIPOs = async (req, res, next) => {
  try {
    const ipos = await getAllIPOsService(req.query);

    res.status(200).json({
      success: true,
      data: ipos,
    });
  } catch (error) {
    next(error);
  }
};

export const getIPOById = async (req, res, next) => {
  try {
    const ipo = await getIPOByIdService(req.params.id);

    res.status(200).json({
      success: true,
      data: ipo,
    });
  } catch (error) {
    next(error);
  }
};