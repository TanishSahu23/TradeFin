import {
  getCorrelationMatrix as getCorrelationMatrixService,
  getBeta as getBetaService,
} from "./quantitativeAnalysis.service.js";

export const getCorrelationMatrix = async (
  req,
  res,
  next
) => {
  try {
    const matrix =
      await getCorrelationMatrixService();

    res.status(200).json({
      success: true,
      data: matrix,
    });
  } catch (error) {
    next(error);
  }
};

export const getBeta = async (
  req,
  res,
  next
) => {
  try {
    const beta = await getBetaService(
      req.params.id,
      req.query.benchmarkId
    );

    res.status(200).json({
      success: true,
      data: beta,
    });
  } catch (error) {
    next(error);
  }
};