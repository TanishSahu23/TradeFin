import MarketPrice from "../instrument/marketPrice.model.js";

import AppError from "../../utils/AppError.js";

const calculateSMA = (prices, period) => {
  if (prices.length < period) {
    return null;
  }

  const recentPrices = prices.slice(-period);

  const sum = recentPrices.reduce(
    (total, price) => total + price.close,
    0
  );

  return sum / period;
};

const calculateRSI = (prices, period = 14) => {
  if (prices.length <= period) {
    return null;
  }

  const changes = [];

  for (let i = 1; i < prices.length; i++) {
    changes.push(
      prices[i].close - prices[i - 1].close
    );
  }

  const recentChanges = changes.slice(-period);

  let gains = 0;
  let losses = 0;

  for (const change of recentChanges) {
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const averageGain = gains / period;
  const averageLoss = losses / period;

  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength =
    averageGain / averageLoss;

  return (
    100 -
    100 / (1 + relativeStrength)
  );
};

const calculateSupportResistance = (prices) => {
  const recentPrices = prices.slice(-20);

  if (recentPrices.length === 0) {
    return {
      support: null,
      resistance: null,
    };
  }

  const lows = recentPrices.map(
    (price) => price.low
  );

  const highs = recentPrices.map(
    (price) => price.high
  );

  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
};

const calculateVolumeAnalysis = (prices, period = 20) => {
  if (prices.length === 0) {
    return {
      latestVolume: 0,
      averageVolume: 0,
      volumeRatio: 0,
    };
  }

  const recentPrices = prices.slice(-period);

  const totalVolume = recentPrices.reduce(
    (total, price) => total + price.volume,
    0
  );

  const averageVolume =
    totalVolume / recentPrices.length;

  const latestVolume =
    prices[prices.length - 1].volume;

  const volumeRatio =
    averageVolume > 0
      ? latestVolume / averageVolume
      : 0;

  return {
    latestVolume,
    averageVolume,
    volumeRatio,
  };
};

export const getTechnicalAnalysis = async (
  instrumentId
) => {
  const prices = await MarketPrice.find({
    instrument: instrumentId,
  }).sort({
    date: 1,
  });

  if (prices.length === 0) {
    throw new AppError(
      "Historical price data not found",
      404
    );
  }

  const latestPrice =
    prices[prices.length - 1];

  const supportResistance =
    calculateSupportResistance(prices);

  const volumeAnalysis =
    calculateVolumeAnalysis(prices);

  return {
    latestPrice: latestPrice.close,

    sma20: calculateSMA(prices, 20),

    sma50: calculateSMA(prices, 50),

    rsi14: calculateRSI(prices, 14),

    support: supportResistance.support,

    resistance: supportResistance.resistance,

    latestVolume: volumeAnalysis.latestVolume,

    averageVolume: volumeAnalysis.averageVolume,

    volumeRatio: volumeAnalysis.volumeRatio,

    dataPoints: prices.length,
  };
};