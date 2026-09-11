import PortfolioSnapshot from "../portfolio/portfolioSnapshot.model.js";
import Holding from "../holding/holding.model.js";

const TRADING_DAYS_PER_YEAR = 252;

const calculateDailyReturns = (snapshots) => {
  return snapshots
    .slice(1)
    .map((snapshot) => snapshot.dailyReturn)
    .filter((dailyReturn) =>
      Number.isFinite(dailyReturn)
    );
};

const calculateMean = (values) => {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
};

const calculateStandardDeviation = (
  values,
  mean
) => {
  if (values.length === 0) {
    return 0;
  }

  const squaredDifferences = values.map(
    (value) =>
      Math.pow(value - mean, 2)
  );

  const variance =
    squaredDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  return Math.sqrt(variance);
};

const calculateDownsideDeviation = (
  returns,
  targetReturn = 0
) => {
  const downsideReturns = returns.filter(
    (dailyReturn) =>
      dailyReturn < targetReturn
  );

  if (downsideReturns.length === 0) {
    return 0;
  }

  const squaredDownsideReturns =
    downsideReturns.map(
      (dailyReturn) =>
        Math.pow(
          dailyReturn - targetReturn,
          2
        )
    );

  const downsideVariance =
    squaredDownsideReturns.reduce(
      (sum, value) => sum + value,
      0
    ) / returns.length;

  return Math.sqrt(downsideVariance);
};

const calculateMaximumDrawdown = (
  snapshots
) => {
  if (snapshots.length === 0) {
    return 0;
  }

  /*
   * Build a flow-adjusted equity curve.
   *
   * We start with the first snapshot's portfolio
   * value and then compound using each day's
   * flow-adjusted return.
   *
   * This prevents deposits/withdrawals from
   * artificially creating portfolio peaks.
   */
  let adjustedPortfolioValue =
    snapshots[0].portfolioValue;

  let peakPortfolioValue =
    adjustedPortfolioValue;

  let maximumDrawdown = 0;

  for (let i = 1; i < snapshots.length; i++) {
    const dailyReturn =
      snapshots[i].dailyReturn;

    if (!Number.isFinite(dailyReturn)) {
      continue;
    }

    adjustedPortfolioValue =
      adjustedPortfolioValue *
      (1 + dailyReturn);

    if (
      adjustedPortfolioValue >
      peakPortfolioValue
    ) {
      peakPortfolioValue =
        adjustedPortfolioValue;
    }

    if (peakPortfolioValue <= 0) {
      continue;
    }

    const drawdown =
      (adjustedPortfolioValue -
        peakPortfolioValue) /
      peakPortfolioValue;

    if (drawdown < maximumDrawdown) {
      maximumDrawdown = drawdown;
    }
  }

  return maximumDrawdown;
};

export const getPerformanceAnalytics =
  async (userId) => {
    const snapshots =
      await PortfolioSnapshot.find({
        user: userId,
      }).sort({
        date: 1,
      });

    if (snapshots.length === 0) {
      return [];
    }

    let cumulativeReturn = 0;

    return snapshots.map(
      (snapshot, index) => {
        const dailyPnL =
          index > 0
            ? snapshot.dailyPnL
            : 0;

        const dailyReturn =
          index > 0
            ? snapshot.dailyReturn
            : 0;

        if (index > 0) {
          cumulativeReturn =
            (1 + cumulativeReturn) *
              (1 + dailyReturn) -
            1;
        }

        return {
          date: snapshot.date,
          portfolioValue:
            snapshot.portfolioValue,
          investedAmount:
            snapshot.investedAmount,
          totalPnL:
            snapshot.totalPnL,

          dailyPnL,

          externalCashFlow:
            snapshot.externalCashFlow || 0,

          dailyReturn:
            dailyReturn * 100,

          cumulativeReturn:
            cumulativeReturn * 100,
        };
      }
    );
  };

export const getRiskAnalytics =
  async (userId) => {
    const snapshots =
      await PortfolioSnapshot.find({
        user: userId,
      }).sort({
        date: 1,
      });

    if (snapshots.length < 2) {
      return {
        dataPoints: snapshots.length,
        averageDailyReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        maximumDrawdown: 0,
        bestDayReturn: 0,
        worstDayReturn: 0,
        message:
          "Not enough historical data for risk calculations",
      };
    }

    const dailyReturns =
      calculateDailyReturns(
        snapshots
      );

    if (dailyReturns.length === 0) {
      return {
        dataPoints: snapshots.length,
        averageDailyReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        maximumDrawdown: 0,
        bestDayReturn: 0,
        worstDayReturn: 0,
        message:
          "Not enough valid return data",
      };
    }

    const meanDailyReturn =
      calculateMean(dailyReturns);

    const dailyVolatility =
      calculateStandardDeviation(
        dailyReturns,
        meanDailyReturn
      );

    const annualizedReturn =
      meanDailyReturn *
      TRADING_DAYS_PER_YEAR;

    const annualizedVolatility =
      dailyVolatility *
      Math.sqrt(
        TRADING_DAYS_PER_YEAR
      );

    const sharpeRatio =
      dailyVolatility > 0
        ? (meanDailyReturn /
            dailyVolatility) *
          Math.sqrt(
            TRADING_DAYS_PER_YEAR
          )
        : 0;

    const downsideDeviation =
      calculateDownsideDeviation(
        dailyReturns
      );

    const sortinoRatio =
      downsideDeviation > 0
        ? (meanDailyReturn /
            downsideDeviation) *
          Math.sqrt(
            TRADING_DAYS_PER_YEAR
          )
        : 0;

    const maximumDrawdown =
      calculateMaximumDrawdown(
        snapshots
      );

    const bestDayReturn =
      Math.max(...dailyReturns);

    const worstDayReturn =
      Math.min(...dailyReturns);

    return {
      dataPoints: snapshots.length,

      averageDailyReturn:
        meanDailyReturn * 100,

      annualizedReturn:
        annualizedReturn * 100,

      volatility:
        annualizedVolatility * 100,

      sharpeRatio: Number(
        sharpeRatio.toFixed(4)
      ),

      sortinoRatio: Number(
        sortinoRatio.toFixed(4)
      ),

      maximumDrawdown:
        maximumDrawdown * 100,

      bestDayReturn:
        bestDayReturn * 100,

      worstDayReturn:
        worstDayReturn * 100,
    };
  };

export const getDiversificationAnalytics =
  async (userId) => {
    const holdings =
      await Holding.find({
        user: userId,
        quantity: { $gt: 0 },
      }).populate("instrument");

    if (holdings.length === 0) {
      return {
        portfolioValue: 0,
        holdings: [],
        hhi: 0,
        diversificationScore: 0,
        concentrationLevel: "NONE",
      };
    }

    const holdingData =
      holdings.map((holding) => {
        const currentValue =
          holding.quantity *
          holding.instrument.currentPrice;

        return {
          symbol:
            holding.instrument.symbol,
          name:
            holding.instrument.name,
          sector:
            holding.instrument.sector ||
            "Other",
          currentValue,
        };
      });

    const portfolioValue =
      holdingData.reduce(
        (total, holding) =>
          total + holding.currentValue,
        0
      );

    const holdingsWithAllocation =
      holdingData.map((holding) => {
        const allocationPercentage =
          portfolioValue > 0
            ? (holding.currentValue /
                portfolioValue) *
              100
            : 0;

        return {
          ...holding,
          allocationPercentage,
        };
      });

    const hhi =
      holdingsWithAllocation.reduce(
        (total, holding) =>
          total +
          Math.pow(
            holding.allocationPercentage /
              100,
            2
          ),
        0
      );

    let concentrationLevel = "LOW";

    if (hhi >= 0.25) {
      concentrationLevel = "HIGH";
    } else if (hhi >= 0.15) {
      concentrationLevel =
        "MODERATE";
    }

    const diversificationScore =
      Math.max(
        0,
        Math.min(
          100,
          (1 - hhi) * 100
        )
      );

    return {
      portfolioValue,
      holdings:
        holdingsWithAllocation,
      hhi: Number(
        hhi.toFixed(4)
      ),
      diversificationScore:
        Number(
          diversificationScore.toFixed(2)
        ),
      concentrationLevel,
    };
  };