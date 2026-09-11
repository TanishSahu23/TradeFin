import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Instrument from "../modules/instrument/instrument.model.js";

const instruments = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    isin: "INE002A01018",
    sector: "Oil, Gas & Petrochemicals",
    currentPrice: 1400,
    previousClose: 1385,
    isActive: true,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    isin: "INE467B01029",
    sector: "Information Technology",
    currentPrice: 3000,
    previousClose: 2975,
    isActive: true,
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    isin: "INE009A01021",
    sector: "Information Technology",
    currentPrice: 1500,
    previousClose: 1488,
    isActive: true,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    isin: "INE040A01034",
    sector: "Banking",
    currentPrice: 1750,
    previousClose: 1735,
    isActive: true,
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    isin: "INE090A01021",
    sector: "Banking",
    currentPrice: 1250,
    previousClose: 1238,
    isActive: true,
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    exchange: "NSE",
    instrumentType: "EQUITY",
    isin: "INE062A01020",
    sector: "Banking",
    currentPrice: 850,
    previousClose: 842,
    isActive: true,
  },
  {
    symbol: "NIFTY50",
    name: "NIFTY 50",
    exchange: "NSE",
    instrumentType: "INDEX",
    isin: "NIFTY50INDEX",
    sector: "INDEX",
    currentPrice: 25000,
    previousClose: 24900,
    isActive: true,
  },
];

const seedInstruments = async () => {
  try {
    await connectDB();

    for (const instrument of instruments) {
      await Instrument.findOneAndUpdate(
        {
          symbol: instrument.symbol,
          exchange: instrument.exchange,
        },
        instrument,
        {
            upsert: true,
            returnDocument: "after",
        }
      );
    }

    console.log("Instruments seeded successfully");
  } catch (error) {
    console.error(`Instrument seeding failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
  }
};

seedInstruments();