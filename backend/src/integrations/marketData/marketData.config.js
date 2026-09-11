const marketDataConfig = {
  provider:
    process.env.MARKET_DATA_PROVIDER || "none",

  timeout:
    Number(process.env.MARKET_DATA_TIMEOUT) || 10000,

  truedata: {
    authUrl:
      process.env.TRUEDATA_AUTH_URL ||
      "https://auth.truedata.in",

    historyUrl:
      process.env.TRUEDATA_HISTORY_URL ||
      "https://history.truedata.in",

    username:
      process.env.TRUEDATA_USERNAME,

    password:
      process.env.TRUEDATA_PASSWORD,
  },
};

export default marketDataConfig;