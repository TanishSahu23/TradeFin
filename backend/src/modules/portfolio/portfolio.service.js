import CashLedger from "../ledger/cashLedger.model.js";
import Holding from "../holding/holding.model.js";
import PortfolioSnapshot from "./portfolioSnapshot.model.js";
import User from "../user/user.model.js";

export const getCashBalance = async (userId) => {
  const latestEntry = await CashLedger.findOne({
    user: userId,
  }).sort({
    createdAt: -1,
  });

  if (!latestEntry) {
    throw new Error("Cash account not initialized");
  }

  return latestEntry.balanceAfter;
};

export const getPortfolioSummary = async (userId) => {
  const cashBalance =
    await getCashBalance(userId);

  const holdings =
    await Holding.find({
      user: userId,
    }).populate("instrument");

  let investedAmount = 0;
  let currentValue = 0;
  let unrealizedPnL = 0;
  let realizedPnL = 0;

  for (const holding of holdings) {
    realizedPnL +=
      holding.realizedPnL || 0;

    if (holding.quantity <= 0) {
      continue;
    }

    const holdingCurrentValue =
      holding.quantity *
      holding.instrument.currentPrice;

    const holdingUnrealizedPnL =
      holdingCurrentValue -
      holding.investedAmount;

    investedAmount +=
      holding.investedAmount;

    currentValue +=
      holdingCurrentValue;

    unrealizedPnL +=
      holdingUnrealizedPnL;
  }

  const portfolioValue =
    cashBalance + currentValue;

  const totalPnL =
    unrealizedPnL + realizedPnL;

  return {
    cashBalance,
    investedAmount,
    currentValue,
    portfolioValue,
    unrealizedPnL,
    realizedPnL,
    totalPnL,
  };
};

export const getPortfolioAllocation = async (
  userId
) => {
  const cashBalance =
    await getCashBalance(userId);

  const holdings =
    await Holding.find({
      user: userId,
      quantity: { $gt: 0 },
    }).populate("instrument");

  const holdingData =
    holdings.map((holding) => {
      const currentValue =
        holding.quantity *
        holding.instrument.currentPrice;

      return {
        instrumentId:
          holding.instrument._id,

        symbol:
          holding.instrument.symbol,

        name:
          holding.instrument.name,

        sector:
          holding.instrument.sector,

        currentValue,
      };
    });

  const totalHoldingsValue =
    holdingData.reduce(
      (total, holding) =>
        total + holding.currentValue,
      0
    );

  const portfolioValue =
    cashBalance +
    totalHoldingsValue;

  const allocations =
    holdingData.map((holding) => ({
      instrumentId:
        holding.instrumentId,

      symbol:
        holding.symbol,

      name:
        holding.name,

      sector:
        holding.sector,

      currentValue:
        holding.currentValue,

      allocationPercentage:
        portfolioValue > 0
          ? (holding.currentValue /
              portfolioValue) *
            100
          : 0,
    }));

  return {
    portfolioValue,

    cashBalance,

    cashAllocationPercentage:
      portfolioValue > 0
        ? (cashBalance /
            portfolioValue) *
          100
        : 0,

    holdings: allocations,
  };
};

/**
 * Create or update today's portfolio snapshot.
 *
 * IMPORTANT:
 *
 * This function is intentionally reusable.
 *
 * It can be called by:
 *
 * 1. The daily cron job
 * 2. Immediately after BUY
 * 3. Immediately after SELL
 * 4. A manual snapshot endpoint
 *
 * This means Analytics does not have to wait
 * until 4:00 PM after a portfolio transaction.
 */
export const createPortfolioSnapshot =
  async (userId) => {
    const summary =
      await getPortfolioSummary(userId);

    /**
     * Normalize today's date to midnight.
     */
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    /**
     * Find the previous trading/day snapshot.
     *
     * We deliberately exclude today's snapshot.
     */
    const previousSnapshot =
      await PortfolioSnapshot.findOne({
        user: userId,

        date: {
          $lt: today,
        },
      }).sort({
        date: -1,
      });

    let externalCashFlow = 0;

    /**
     * External cash flows are deposits/
     * withdrawals represented by ADJUSTMENT.
     *
     * BUY and SELL are portfolio transactions,
     * not external cash flows.
     */
    if (previousSnapshot) {
      const ledgerEntries =
        await CashLedger.find({
          user: userId,

          type: {
            $in: [
              "INITIAL_CREDIT",
              "ADJUSTMENT",
            ],
          },

          createdAt: {
            $gt:
              previousSnapshot.createdAt,

            $lt: new Date(),
          },
        });

      externalCashFlow =
        ledgerEntries
          .filter(
            (entry) =>
              entry.type ===
              "ADJUSTMENT"
          )
          .reduce(
            (total, entry) =>
              total + entry.amount,
            0
          );
    }

    let dailyPnL = 0;
    let dailyReturn = 0;

    /**
     * Calculate today's performance
     * relative to the previous snapshot.
     */
    if (previousSnapshot) {
      const portfolioValueChange =
        summary.portfolioValue -
        previousSnapshot.portfolioValue;

      dailyPnL =
        portfolioValueChange -
        externalCashFlow;

      if (
        previousSnapshot.portfolioValue >
        0
      ) {
        dailyReturn =
          dailyPnL /
          previousSnapshot.portfolioValue;
      }
    }

    /**
     * Upsert today's snapshot.
     *
     * If today's snapshot already exists,
     * it is UPDATED immediately.
     *
     * If it doesn't exist,
     * it is CREATED.
     */
    const snapshot =
      await PortfolioSnapshot.findOneAndUpdate(
        {
          user: userId,

          date: today,
        },

        {
          user: userId,

          date: today,

          cashBalance:
            summary.cashBalance,

          investedAmount:
            summary.investedAmount,

          portfolioValue:
            summary.portfolioValue,

          totalPnL:
            summary.totalPnL,

          dailyPnL,

          externalCashFlow,

          dailyReturn,
        },

        {
          upsert: true,

          new: true,

          setDefaultsOnInsert:
            true,
        }
      );

    return snapshot;
  };

export const getPortfolioSnapshots =
  async (userId) => {
    return await PortfolioSnapshot.find({
      user: userId,
    }).sort({
      date: 1,
    });
  };

export const getSectorAllocation =
  async (userId) => {
    const cashBalance =
      await getCashBalance(userId);

    const holdings =
      await Holding.find({
        user: userId,
        quantity: { $gt: 0 },
      }).populate("instrument");

    const sectorMap = {};

    for (const holding of holdings) {
      const sector =
        holding.instrument.sector ||
        "Other";

      const currentValue =
        holding.quantity *
        holding.instrument.currentPrice;

      if (!sectorMap[sector]) {
        sectorMap[sector] = 0;
      }

      sectorMap[sector] +=
        currentValue;
    }

    const totalHoldingsValue =
      Object.values(
        sectorMap
      ).reduce(
        (total, value) =>
          total + value,
        0
      );

    const portfolioValue =
      cashBalance +
      totalHoldingsValue;

    const sectors =
      Object.entries(
        sectorMap
      )
        .map(
          ([
            sector,
            currentValue,
          ]) => ({
            sector,

            currentValue,

            allocationPercentage:
              portfolioValue > 0
                ? (currentValue /
                    portfolioValue) *
                  100
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.allocationPercentage -
            a.allocationPercentage
        );

    const largestSector =
      sectors[0] || null;

    return {
      portfolioValue,

      cashBalance,

      cashAllocationPercentage:
        portfolioValue > 0
          ? (cashBalance /
              portfolioValue) *
            100
          : 0,

      sectors,

      concentration:
        largestSector
          ? {
              largestSector:
                largestSector.sector,

              largestSectorPercentage:
                largestSector.allocationPercentage,
            }
          : null,
    };
  };

export const createSnapshotsForAllUsers =
  async () => {
    const users =
      await User.find({})
        .select("_id")
        .lean();

    let successful = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await createPortfolioSnapshot(
          user._id
        );

        successful += 1;
      } catch (error) {
        failed += 1;

        console.error(
          `Portfolio snapshot failed for user ${user._id}: ${error.message}`
        );
      }
    }

    return {
      totalUsers:
        users.length,

      successful,

      failed,
    };
  };