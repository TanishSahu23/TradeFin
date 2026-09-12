const marketDataConfig = {
  provider:
    process.env.MARKET_DATA_PROVIDER || "none",

  timeout:
    Number(process.env.MARKET_DATA_TIMEOUT) || 10000,

  alphaVantage: {
    apiKey:
      process.env.ALPHA_VANTAGE_API_KEY,

    baseUrl:
      process.env.ALPHA_VANTAGE_BASE_URL ||
      "https://www.alphavantage.co/query",
  },
};

export default marketDataConfig;