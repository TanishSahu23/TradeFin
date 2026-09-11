import getMarketDataClient from "./marketData.factory.js";
import {
  mapQuote,
  mapHistoricalPrice,
} from "./marketData.mapper.js";

export const getQuote = async (
  symbol,
  exchange
) => {
  const marketDataClient =
    getMarketDataClient();

  const providerData =
    await marketDataClient.getQuote(
      symbol,
      exchange
    );

  return mapQuote(providerData);
};

export const getHistoricalPrices = async (
  symbol,
  exchange,
  options = {}
) => {
  const marketDataClient =
    getMarketDataClient();

  const providerData =
    await marketDataClient.getHistoricalPrices(
      symbol,
      exchange,
      options
    );

  return providerData.map(
    mapHistoricalPrice
  );
};