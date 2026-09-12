/**
 * Safely convert a value to Number.
 */
const toNumber = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : undefined;
};

/**
 * Map provider quote data into
 * TradeFin's common quote format.
 */
export const mapQuote = (
  providerData
) => ({
  symbol:
    providerData.symbol,

  exchange:
    providerData.exchange,

  currentPrice:
    toNumber(
      providerData.close
    ),

  previousClose:
    toNumber(
      providerData.previousClose
    ),

  open:
    toNumber(
      providerData.open
    ),

  high:
    toNumber(
      providerData.high
    ),

  low:
    toNumber(
      providerData.low
    ),

  volume:
    toNumber(
      providerData.volume
    ),

  change:
    toNumber(
      providerData.change
    ),

  changePercent:
    toNumber(
      providerData.changePercent
    ),

  timestamp:
    providerData.latestTradingDay,

  /**
   * Provider information is useful
   * for debugging and transparency.
   */
  providerSymbol:
    providerData.providerSymbol,

  providerExchange:
    providerData.providerExchange,
});

/**
 * Map provider historical price
 * into TradeFin's common format.
 */
export const mapHistoricalPrice = (
  providerData
) => ({
  date:
    new Date(
      providerData.date
    ),

  open:
    toNumber(
      providerData.open
    ),

  high:
    toNumber(
      providerData.high
    ),

  low:
    toNumber(
      providerData.low
    ),

  close:
    toNumber(
      providerData.close
    ),

  volume:
    toNumber(
      providerData.volume
    ) ?? 0,

  /**
   * Provider information is not
   * required by the MarketPrice model,
   * but keeping it available makes
   * debugging easier.
   */
  providerSymbol:
    providerData.providerSymbol,

  providerExchange:
    providerData.providerExchange,
});