import {
  getTechnicalAnalysis as getTechnicalAnalysisService,
} from "./technicalAnalysis.service.js";

export const getTechnicalAnalysis = async (
  req,
  res,
  next
) => {
  try {
    const technicals =
      await getTechnicalAnalysisService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: technicals,
    });
  } catch (error) {
    next(error);
  }
};
