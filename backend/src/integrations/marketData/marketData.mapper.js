export const mapQuote = (providerData) => ({
  symbol: providerData.symbol,
  exchange: providerData.exchange,
  currentPrice: Number(providerData.close),
  previousClose:
    providerData.previousClose !== undefined
      ? Number(providerData.previousClose)
      : undefined,
  timestamp: providerData.timestamp,
});

export const mapHistoricalPrice = (
  providerData
) => ({
  date: new Date(providerData.date),
  open: Number(providerData.open),
  high: Number(providerData.high),
  low: Number(providerData.low),
  close: Number(providerData.close),
  volume: Number(providerData.volume || 0),
});