import marketDataConfig from "./marketData.config.js";
import truedataClient from "./providers/truedata.client.js";

const getMarketDataClient = () => {
  switch (marketDataConfig.provider) {
    case "truedata":
      return truedataClient;

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