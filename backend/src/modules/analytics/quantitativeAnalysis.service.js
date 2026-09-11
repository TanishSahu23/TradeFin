import MarketPrice from "../instrument/marketPrice.model.js";
import Instrument from "../instrument/instrument.model.js";

import AppError from "../../utils/AppError.js";

const calculateReturns = (prices) => {
  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    const previousClose = prices[i - 1].close;
    const currentClose = prices[i].close;

    if (previousClose > 0) {
      returns.push({
        date: prices[i].date,
        value:
          (currentClose - previousClose) /
          previousClose,
      });
    }
  }

  return returns;
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

const calculateCorrelation = (
  firstReturns,
  secondReturns
) => {
  if (
    firstReturns.length === 0 ||
    secondReturns.length === 0
  ) {
    return 0;
  }

  const firstValues = firstReturns.map(
    (item) => item.value
  );

  const secondValues = secondReturns.map(
    (item) => item.value
  );

  const firstMean = calculateMean(firstValues);
  const secondMean = calculateMean(secondValues);

  let numerator = 0;
  let firstVariance = 0;
  let secondVariance = 0;

  for (let i = 0; i < firstValues.length; i++) {
    const firstDifference =
      firstValues[i] - firstMean;

    const secondDifference =
      secondValues[i] - secondMean;

    numerator +=
      firstDifference * secondDifference;

    firstVariance +=
      Math.pow(firstDifference, 2);

    secondVariance +=
      Math.pow(secondDifference, 2);
  }

  const denominator =
    Math.sqrt(firstVariance) *
    Math.sqrt(secondVariance);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
};

const calculateBeta = (
  stockReturns,
  benchmarkReturns
) => {
  if (
    stockReturns.length === 0 ||
    benchmarkReturns.length === 0
  ) {
    return 0;
  }

  const stockValues = stockReturns.map(
    (item) => item.value
  );

  const benchmarkValues =
    benchmarkReturns.map(
      (item) => item.value
    );

  const stockMean =
    calculateMean(stockValues);

  const benchmarkMean =
    calculateMean(benchmarkValues);

  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < stockValues.length; i++) {
    const stockDifference =
      stockValues[i] - stockMean;

    const benchmarkDifference =
      benchmarkValues[i] - benchmarkMean;

    covariance +=
      stockDifference *
      benchmarkDifference;

    benchmarkVariance +=
      Math.pow(benchmarkDifference, 2);
  }

  if (benchmarkVariance === 0) {
    return 0;
  }

  return covariance / benchmarkVariance;
};

const getInstrumentReturns = async (
  instrumentId
) => {
  const prices = await MarketPrice.find({
    instrument: instrumentId,
  }).sort({
    date: 1,
  });

  return calculateReturns(prices);
};

const alignReturnsByDate = (
  firstReturns,
  secondReturns
) => {
  const secondReturnMap = new Map();

  for (const item of secondReturns) {
    const dateKey = new Date(item.date)
      .toISOString()
      .split("T")[0];

    secondReturnMap.set(
      dateKey,
      item.value
    );
  }

  const aligned = [];

  for (const item of firstReturns) {
    const dateKey = new Date(item.date)
      .toISOString()
      .split("T")[0];

    if (secondReturnMap.has(dateKey)) {
      aligned.push({
        first: item.value,
        second:
          secondReturnMap.get(dateKey),
      });
    }
  }

  return aligned;
};

export const getCorrelationMatrix = async () => {
  const instruments = await Instrument.find({
    isActive: true,
  }).sort({
    symbol: 1,
  });

  const returnData = {};

  for (const instrument of instruments) {
    returnData[instrument._id.toString()] =
      await getInstrumentReturns(
        instrument._id
      );
  }

  const matrix = [];

  for (const firstInstrument of instruments) {
    const row = {
      symbol: firstInstrument.symbol,
      values: {},
    };

    for (const secondInstrument of instruments) {
      const firstReturns =
        returnData[
          firstInstrument._id.toString()
        ];

      const secondReturns =
        returnData[
          secondInstrument._id.toString()
        ];

      const alignedReturns =
        alignReturnsByDate(
          firstReturns,
          secondReturns
        );

      const correlation =
        calculateCorrelation(
          alignedReturns.map((item) => ({
            value: item.first,
          })),
          alignedReturns.map((item) => ({
            value: item.second,
          }))
        );

      row.values[secondInstrument.symbol] =
        Number(correlation.toFixed(4));
    }

    matrix.push(row);
  }

  return matrix;
};

export const getBeta = async (
  instrumentId,
  benchmarkInstrumentId
) => {
  if (instrumentId === benchmarkInstrumentId) {
    return {
      beta: 1,
    };
  }

  const instrument = await Instrument.findById(
    instrumentId
  );

  const benchmark = await Instrument.findById(
    benchmarkInstrumentId
  );

  if (!instrument) {
    throw new AppError(
      "Instrument not found",
      404
    );
  }

  if (!benchmark) {
    throw new AppError(
      "Benchmark instrument not found",
      404
    );
  }

  const instrumentReturns =
    await getInstrumentReturns(
      instrumentId
    );

  const benchmarkReturns =
    await getInstrumentReturns(
      benchmarkInstrumentId
    );

  const alignedReturns =
    alignReturnsByDate(
      instrumentReturns,
      benchmarkReturns
    );

  const beta = calculateBeta(
    alignedReturns.map((item) => ({
      value: item.first,
    })),
    alignedReturns.map((item) => ({
      value: item.second,
    }))
  );

  return {
    instrument: {
      id: instrument._id,
      symbol: instrument.symbol,
    },
    benchmark: {
      id: benchmark._id,
      symbol: benchmark.symbol,
    },
    beta: Number(beta.toFixed(4)),
    dataPoints: alignedReturns.length,
  };
};