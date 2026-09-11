import {
  getCashBalance as getCashBalanceService,
  getPortfolioSummary as getPortfolioSummaryService,
  getPortfolioAllocation as getPortfolioAllocationService,
  createPortfolioSnapshot as createPortfolioSnapshotService,
  getPortfolioSnapshots as getPortfolioSnapshotsService,
  getSectorAllocation as getSectorAllocationService,
} from "./portfolio.service.js";

export const getCashBalance = async (req, res, next) => {
  try {
    const cashBalance = await getCashBalanceService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: {
        cashBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioSummary = async (req, res, next) => {
  try {
    const summary = await getPortfolioSummaryService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioAllocation = async (req, res, next) => {
  try {
    const allocation = await getPortfolioAllocationService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
};

export const createPortfolioSnapshot = async (req, res, next) => {
  try {
    const snapshot = await createPortfolioSnapshotService(
      req.user.userId
    );

    res.status(201).json({
      success: true,
      message: "Portfolio snapshot created successfully",
      data: snapshot,
    });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioSnapshots = async (req, res, next) => {
  try {
    const snapshots = await getPortfolioSnapshotsService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    next(error);
  }
};

export const getSectorAllocation = async (req, res, next) => {
  try {
    const allocation = await getSectorAllocationService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
};