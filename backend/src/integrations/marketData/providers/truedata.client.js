import axios from "axios";

import marketDataConfig from "../marketData.config.js";

let accessToken = null;
let tokenExpiresAt = 0;

const authenticate = async () => {
  const {
    authUrl,
    username,
    password,
  } = marketDataConfig.truedata;

  if (!username || !password) {
    throw new Error(
      "TrueData credentials are not configured"
    );
  }

  const response = await axios.post(
    `${authUrl}/token`,
    new URLSearchParams({
      username,
      password,
      grant_type: "password",
    }),
    {
      timeout: marketDataConfig.timeout,
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    }
  );

  accessToken = response.data.access_token;

  const expiresIn =
    Number(response.data.expires_in) || 3600;

  tokenExpiresAt =
    Date.now() +
    Math.max(expiresIn - 60, 60) * 1000;

  return accessToken;
};

const getAccessToken = async () => {
  if (
    accessToken &&
    Date.now() < tokenExpiresAt
  ) {
    return accessToken;
  }

  return await authenticate();
};

const formatDate = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    throw new Error(
      `Invalid market-data date: ${date}`
    );
  }

  const year = String(
    value.getFullYear()
  ).slice(-2);

  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    value.getDate()
  ).padStart(2, "0");

  const hours = String(
    value.getHours()
  ).padStart(2, "0");

  const minutes = String(
    value.getMinutes()
  ).padStart(2, "0");

  const seconds = String(
    value.getSeconds()
  ).padStart(2, "0");

  return `${year}${month}${day}T${hours}:${minutes}:${seconds}`;
};

const normalizeSymbol = (
  symbol,
  exchange
) => {
  if (exchange === "NSE") {
    return symbol;
  }

  return symbol;
};

const requestHistory = async ({
  symbol,
  exchange,
  interval = "eod",
  from,
  to,
}) => {
  const token = await getAccessToken();

  const normalizedSymbol =
    normalizeSymbol(symbol, exchange);

  const response = await axios.get(
    `${marketDataConfig.truedata.historyUrl}/getbars`,
    {
      timeout: marketDataConfig.timeout,

      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },

      params: {
        symbol: normalizedSymbol,
        interval,
        from: formatDate(from),
        to: formatDate(to),
        response: "json",
      },
    }
  );

  return response.data;
};

const parseRecords = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.Records)) {
    return data.Records;
  }

  if (Array.isArray(data?.records)) {
    return data.records;
  }

  return [];
};

const mapHistoryRecord = (record) => {
  if (!Array.isArray(record)) {
    return {
      date: record.timestamp,
      open: record.open,
      high: record.high,
      low: record.low,
      close: record.close,
      volume: record.volume ?? record.v,
    };
  }

  return {
    date: record[0],
    open: record[2],
    high: record[3],
    low: record[4],
    close: record[5],
    volume: record[7] ?? record[6],
  };
};

const truedataClient = {
  async getQuote(symbol, exchange) {
    const now = new Date();
    const from = new Date(
      now.getTime() - 60 * 60 * 1000
    );

    const data = await requestHistory({
      symbol,
      exchange,
      interval: "1min",
      from,
      to: now,
    });

    const records = parseRecords(data);

    if (records.length === 0) {
      throw new Error(
        `No TrueData quote data found for ${exchange}:${symbol}`
      );
    }

    const latest =
      records[records.length - 1];

    return {
      symbol,
      exchange,
      ...mapHistoryRecord(latest),
      timestamp: new Date(
        mapHistoryRecord(latest).date
      ),
    };
  },

  async getHistoricalPrices(
    symbol,
    exchange,
    options = {}
  ) {
    const {
      from,
      to = new Date(),
      interval = "eod",
    } = options;

    if (!from) {
      throw new Error(
        "Historical market data requires a from date"
      );
    }

    const data = await requestHistory({
      symbol,
      exchange,
      interval,
      from,
      to,
    });

    return parseRecords(data).map(
      mapHistoryRecord
    );
  },
};

export default truedataClient;