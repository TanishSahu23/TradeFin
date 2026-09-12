import marketDataConfig
  from "./marketData.config.js";

import alphaVantageClient
  from "./providers/alphaVantage.client.js";

const getMarketDataClient = () => {
  switch (
    marketDataConfig.provider
  ) {
    case "alphavantage":
      return alphaVantageClient;

    case "none":
      throw new Error(
        "Market data provider is not configured"
      );

    default:
      throw new Error(
        `Unsupported market data provider: ${marketDataConfig.provider}`
      );
  }
};

export default getMarketDataClient;