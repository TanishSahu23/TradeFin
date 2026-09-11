const marketDataClient = {
  async getQuote(symbol, exchange) {
    throw new Error(
      `Market data provider does not implement getQuote for ${exchange}:${symbol}`
    );
  },

  async getHistoricalPrices(
    symbol,
    exchange,
    options = {}
  ) {
    throw new Error(
      `Market data provider does not implement getHistoricalPrices for ${exchange}:${symbol}`
    );
  },
};

export default marketDataClient;