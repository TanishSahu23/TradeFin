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

  if (normalizedSymbol.includes(".")) {
    return normalizedSymbol;
  }

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

    if (data?.["Error Message"]) {
      throw new Error(
        data["Error Message"]
      );
    }

    if (data?.Note) {
      throw new Error(
        `Alpha Vantage API limit reached: ${data.Note}`
      );
    }

    if (
      data?.Information &&
      !data?.["Time Series (Daily)"] &&
      !data?.["bestMatches"]
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
 * Search global symbols using Alpha Vantage.
 *
 * Alpha Vantage SYMBOL_SEARCH returns
 * matching symbols and company names.
 */
const searchSymbols = async (
  keywords
) => {
  if (!keywords?.trim()) {
    return [];
  }

  const data = await request({
    function: "SYMBOL_SEARCH",
    keywords:
      keywords.trim(),
  });

  const matches =
    data?.bestMatches;

  if (!Array.isArray(matches)) {
    return [];
  }

  return matches.map(
    (match) => ({
      symbol:
        match["1. symbol"],

      name:
        match["2. name"],

      type:
        match["3. type"],

      region:
        match["4. region"],

      marketOpen:
        match["5. marketOpen"],

      marketClose:
        match["6. marketClose"],

      timezone:
        match["7. timezone"],

      currency:
        match["8. currency"],

      matchScore:
        Number(
          match["9. matchScore"] || 0
        ),
    })
  );
};

/**
 * Get the latest available market quote.
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

    currentPrice,

    open:
      Number(
        latest["1. open"]
      ),

    high:
      Number(
        latest["2. high"]
      ),

    low:
      Number(
        latest["3. low"]
      ),

    close:
      currentPrice,

    volume:
      Number(
        latest["5. volume"]
      ),

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
  searchSymbols,
  getQuote,
  getHistoricalPrices,
};

export default alphaVantageClient;