import axios from "axios";

import marketDataConfig from "../marketData.config.js";

const {
  apiKey,
  baseUrl,
} = marketDataConfig.alphaVantage;

/**
 * Validate Alpha Vantage configuration.
 */
const validateConfig = () => {
  if (!apiKey) {
    throw new Error(
      "Alpha Vantage API key is not configured"
    );
  }

  if (!baseUrl) {
    throw new Error(
      "Alpha Vantage base URL is not configured"
    );
  }
};

/**
 * Convert TradeFin's instrument symbol into
 * the symbol expected by Alpha Vantage.
 *
 * IMPORTANT:
 *
 * Alpha Vantage uses provider-specific
 * exchange suffixes.
 *
 * For the Indian instrument currently
 * being used by TradeFin:
 *
 * HDFCBANK
 *     ↓
 * HDFCBANK.BSE
 *
 * We keep this mapping in one place so
 * the rest of the application doesn't
 * need to know Alpha Vantage's symbol format.
 */
const normalizeSymbol = (
  symbol,
  exchange
) => {
  if (!symbol) {
    throw new Error(
      "Stock symbol is required"
    );
  }

  const normalizedSymbol =
    symbol.trim().toUpperCase();

  /**
   * If the symbol already contains
   * a provider suffix, don't modify it.
   *
   * Example:
   *
   * HDFCBANK.BSE
   */
  if (normalizedSymbol.includes(".")) {
    return normalizedSymbol;
  }

  /**
   * Current TradeFin → Alpha Vantage
   * mapping.
   *
   * The Alpha Vantage result we already
   * verified successfully uses:
   *
   * HDFCBANK.BSE
   *
   * Therefore both NSE/BSE instruments
   * currently use the BSE provider symbol
   * when no explicit suffix exists.
   *
   * This can later be moved into the
   * Instrument model if you add many
   * instruments/providers.
   */
  if (
    exchange === "NSE" ||
    exchange === "BSE"
  ) {
    return `${normalizedSymbol}.BSE`;
  }

  return normalizedSymbol;
};

/**
 * Make an HTTP request to Alpha Vantage.
 */
const request = async (params) => {
  validateConfig();

  try {
    const response = await axios.get(
      baseUrl,
      {
        timeout:
          marketDataConfig.timeout,

        params: {
          ...params,
          apikey: apiKey,
        },
      }
    );

    const data = response.data;

    /**
     * Alpha Vantage invalid-symbol
     * or invalid-request response.
     */
    if (data?.["Error Message"]) {
      throw new Error(
        data["Error Message"]
      );
    }

    /**
     * Alpha Vantage rate-limit response.
     */
    if (data?.Note) {
      throw new Error(
        `Alpha Vantage API limit reached: ${data.Note}`
      );
    }

    /**
     * Alpha Vantage may return an
     * information message instead of
     * actual market data.
     */
    if (
      data?.Information &&
      !data?.["Time Series (Daily)"]
    ) {
      throw new Error(
        data.Information
      );
    }

    return data;
  } catch (error) {
    if (
      error.response?.data?.Note
    ) {
      throw new Error(
        `Alpha Vantage API limit reached: ${error.response.data.Note}`
      );
    }

    if (
      error.response?.data?.Information
    ) {
      throw new Error(
        error.response.data.Information
      );
    }

    if (
      error.response?.data?.[
        "Error Message"
      ]
    ) {
      throw new Error(
        error.response.data[
          "Error Message"
        ]
      );
    }

    throw error;
  }
};

/**
 * Get the latest available market quote.
 *
 * We use TIME_SERIES_DAILY instead of
 * GLOBAL_QUOTE so that the latest daily
 * OHLCV data can also be used.
 */
const getQuote = async (
  symbol,
  exchange
) => {
  const alphaVantageSymbol =
    normalizeSymbol(
      symbol,
      exchange
    );

  const data = await request({
    function:
      "TIME_SERIES_DAILY",

    symbol:
      alphaVantageSymbol,

    outputsize:
      "compact",
  });

  const timeSeries =
    data?.["Time Series (Daily)"];

  if (!timeSeries) {
    throw new Error(
      `No Alpha Vantage daily data found for ${alphaVantageSymbol}`
    );
  }

  const dates =
    Object.keys(timeSeries).sort(
      (a, b) =>
        new Date(b) -
        new Date(a)
    );

  if (dates.length === 0) {
    throw new Error(
      `No Alpha Vantage price data found for ${alphaVantageSymbol}`
    );
  }

  const latestDate =
    dates[0];

  const latest =
    timeSeries[latestDate];

  const previousDate =
    dates[1];

  const previous =
    previousDate
      ? timeSeries[previousDate]
      : null;

  const currentPrice =
    Number(
      latest["4. close"]
    );

  const previousClose =
    previous
      ? Number(
          previous["4. close"]
        )
      : undefined;

  let change;

  let changePercent;

  if (
    previousClose !== undefined &&
    Number.isFinite(
      previousClose
    )
  ) {
    change =
      currentPrice -
      previousClose;

    changePercent =
      previousClose !== 0
        ? (change /
            previousClose) *
          100
        : undefined;
  }

  return {
    symbol:
      symbol
        .trim()
        .toUpperCase(),

    exchange,

    providerSymbol:
      alphaVantageSymbol,

    open:
      latest["1. open"],

    high:
      latest["2. high"],

    low:
      latest["3. low"],

    close:
      latest["4. close"],

    volume:
      latest["5. volume"],

    previousClose,

    change,

    changePercent,

    latestTradingDay:
      latestDate,
  };
};

/**
 * Get historical daily prices.
 */
const getHistoricalPrices = async (
  symbol,
  exchange,
  options = {}
) => {
  const alphaVantageSymbol =
    normalizeSymbol(
      symbol,
      exchange
    );

  const data = await request({
    function:
      "TIME_SERIES_DAILY",

    symbol:
      alphaVantageSymbol,

    outputsize:
      options.outputsize ||
      "compact",
  });

  const timeSeries =
    data?.["Time Series (Daily)"];

  if (!timeSeries) {
    throw new Error(
      `No Alpha Vantage historical data found for ${alphaVantageSymbol}`
    );
  }

  return Object.entries(
    timeSeries
  )
    .map(
      ([date, values]) => ({
        date,

        open:
          values["1. open"],

        high:
          values["2. high"],

        low:
          values["3. low"],

        close:
          values["4. close"],

        volume:
          values["5. volume"],

        providerSymbol:
          alphaVantageSymbol,

        providerExchange:
          "India/Bombay",
      })
    )
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );
};

const alphaVantageClient = {
  getQuote,
  getHistoricalPrices,
};

export default alphaVantageClient;