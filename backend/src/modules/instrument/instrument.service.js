import Instrument from "./instrument.model.js";

import AppError from "../../utils/AppError.js";

import alphaVantageClient from "../../integrations/marketData/providers/alphaVantage.client.js";

/**
 * Get all active instruments.
 */
export const getAllInstruments = async () => {
  const instruments =
    await Instrument.find({
      isActive: true,
    }).sort({
      symbol: 1,
    });

  return instruments;
};

/**
 * Get one instrument.
 */
export const getSingleInstrument = async (
  id
) => {
  const instrument =
    await Instrument.findById(id);

  if (!instrument) {
    throw new AppError(
      "Instrument not found",
      404
    );
  }

  return instrument;
};

/**
 * Search instruments.
 *
 * Flow:
 *
 * 1. Search MongoDB.
 * 2. If found, return MongoDB results.
 * 3. If not found, search Alpha Vantage.
 * 4. Find an Indian equity.
 * 5. Get its latest market price.
 * 6. Save it to MongoDB.
 * 7. Return the saved instrument.
 */
export const searchInstruments = async (
  query
) => {
  const search =
    query?.trim().toUpperCase();

  if (!search) {
    return [];
  }

  /**
   * -----------------------------------------
   * STEP 1
   * Search our own database first.
   * -----------------------------------------
   */
  const existing =
    await Instrument.find({
      isActive: true,

      $or: [
        {
          symbol: {
            $regex: search,
            $options: "i",
          },
        },

        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }).sort({
      symbol: 1,
    });

  if (existing.length > 0) {
    return existing;
  }

  /**
   * -----------------------------------------
   * STEP 2
   * Search Alpha Vantage.
   * -----------------------------------------
   */
  const matches =
    await alphaVantageClient.searchSymbols(
      search
    );

  if (
    !Array.isArray(matches) ||
    matches.length === 0
  ) {
    return [];
  }

  /**
   * -----------------------------------------
   * STEP 3
   * Find an Indian equity.
   *
   * We currently use BSE because the
   * Alpha Vantage integration in this
   * project maps Indian symbols to BSE.
   * -----------------------------------------
   */
  const indianMatches =
    matches.filter(
      (match) =>
        match.region === "India" &&
        String(
          match.type || ""
        ).toLowerCase() ===
          "equity"
    );

  if (indianMatches.length === 0) {
    return [];
  }

  /**
   * Best Alpha Vantage match.
   */
  const match =
    indianMatches.sort(
      (a, b) =>
        b.matchScore -
        a.matchScore
    )[0];

  if (!match?.symbol) {
    return [];
  }

  /**
   * Alpha Vantage may return:
   *
   * ITC.BSE
   *
   * We remove the provider suffix
   * before storing our own symbol.
   */
  const providerSymbol =
    match.symbol
      .trim()
      .toUpperCase();

  const localSymbol =
    providerSymbol.endsWith(".BSE")
      ? providerSymbol.replace(
          /\.BSE$/,
          ""
        )
      : providerSymbol;

  /**
   * -----------------------------------------
   * STEP 4
   * Check MongoDB again.
   *
   * This protects against creating
   * duplicates.
   * -----------------------------------------
   */
  const existingAfterSearch =
    await Instrument.findOne({
      symbol: localSymbol,
      exchange: "BSE",
    });

  if (existingAfterSearch) {
    return [existingAfterSearch];
  }

  /**
   * -----------------------------------------
   * STEP 5
   * Get actual price from Alpha Vantage.
   * -----------------------------------------
   */
  const quote =
    await alphaVantageClient.getQuote(
      providerSymbol,
      "BSE"
    );

  const currentPrice =
    Number(quote.currentPrice);

  const previousClose =
    Number(quote.previousClose);

  if (
    !Number.isFinite(
      currentPrice
    ) ||
    currentPrice <= 0
  ) {
    throw new AppError(
      `Unable to retrieve market price for ${providerSymbol}`,
      400
    );
  }

  /**
   * -----------------------------------------
   * STEP 6
   * Save new instrument.
   * -----------------------------------------
   */
  const instrument =
    await Instrument.create({
      symbol: localSymbol,

      name:
        match.name ||
        localSymbol,

      exchange: "BSE",

      instrumentType: "EQUITY",

      isin:
        `AV-BSE-${localSymbol}`,

      sector: "Other",

      currentPrice,

      previousClose:
        Number.isFinite(
          previousClose
        )
          ? previousClose
          : currentPrice,

      isActive: true,
    });

  /**
   * -----------------------------------------
   * STEP 7
   * Return newly imported instrument.
   * -----------------------------------------
   */
  return [instrument];
};

/**
 * Import an instrument manually.
 */
export const importInstrument = async (
  instrumentData
) => {
  const {
    symbol,
    name,
    exchange,
  } = instrumentData;

  if (
    !symbol ||
    !name ||
    !exchange
  ) {
    throw new AppError(
      "Symbol, name and exchange are required",
      400
    );
  }

  const normalizedSymbol =
    symbol.trim().toUpperCase();

  const existingInstrument =
    await Instrument.findOne({
      symbol: normalizedSymbol,
      exchange,
    });

  if (existingInstrument) {
    return existingInstrument;
  }

  const quote =
    await alphaVantageClient.getQuote(
      normalizedSymbol,
      exchange
    );

  const currentPrice =
    Number(quote.currentPrice);

  const previousClose =
    Number(quote.previousClose);

  if (
    !Number.isFinite(
      currentPrice
    ) ||
    currentPrice <= 0
  ) {
    throw new AppError(
      "Unable to retrieve instrument price",
      400
    );
  }

  const instrument =
    await Instrument.create({
      symbol:
        normalizedSymbol,

      name,

      exchange,

      instrumentType:
        "EQUITY",

      isin:
        `AV-${exchange}-${normalizedSymbol}`,

      sector:
        "Other",

      currentPrice,

      previousClose:
        Number.isFinite(
          previousClose
        )
          ? previousClose
          : currentPrice,

      isActive: true,
    });

  return instrument;
};