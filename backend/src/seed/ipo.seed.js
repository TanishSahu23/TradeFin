import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import IPO from "../modules/ipo/ipo.model.js";

const ipos = [
  {
    companyName: "Nova Technologies Limited",
    symbol: "NOVATECH",
    exchange: "NSE",
    status: "UPCOMING",

    openDate: new Date("2026-09-15"),
    closeDate: new Date("2026-09-18"),
    listingDate: new Date("2026-09-23"),

    priceBandMin: 850,
    priceBandMax: 900,

    lotSize: 16,
    issueSize: 1800,

    subscription: 0,

    listingPrice: null,
    currentPrice: null,

    revenue: 5200,
    profit: 620,

    peRatio: 28.5,
    revenueGrowth: 18.2,
    profitGrowth: 24.6,
  },

  {
    companyName: "FinServe Technologies Limited",
    symbol: "FINSERVE",
    exchange: "NSE",
    status: "OPEN",

    openDate: new Date("2026-09-08"),
    closeDate: new Date("2026-09-11"),
    listingDate: new Date("2026-09-16"),

    priceBandMin: 620,
    priceBandMax: 650,

    lotSize: 20,
    issueSize: 1200,

    subscription: 4.75,

    listingPrice: null,
    currentPrice: null,

    revenue: 3400,
    profit: 410,

    peRatio: 31.2,
    revenueGrowth: 21.4,
    profitGrowth: 27.8,
  },

  {
    companyName: "GreenGrid Energy Limited",
    symbol: "GREENGRID",
    exchange: "BSE",
    status: "LISTED",

    openDate: new Date("2026-08-10"),
    closeDate: new Date("2026-08-13"),
    listingDate: new Date("2026-08-20"),

    priceBandMin: 420,
    priceBandMax: 450,

    lotSize: 30,
    issueSize: 950,

    subscription: 12.4,

    listingPrice: 510,
    currentPrice: 575,

    revenue: 2800,
    profit: 295,

    peRatio: 36.7,
    revenueGrowth: 31.5,
    profitGrowth: 38.2,
  },

  {
    companyName: "RetailHub India Limited",
    symbol: "RETAILHUB",
    exchange: "NSE",
    status: "CLOSED",

    openDate: new Date("2026-09-01"),
    closeDate: new Date("2026-09-04"),
    listingDate: new Date("2026-09-10"),

    priceBandMin: 720,
    priceBandMax: 760,

    lotSize: 19,
    issueSize: 1500,

    subscription: 8.6,

    listingPrice: null,
    currentPrice: null,

    revenue: 6100,
    profit: 505,

    peRatio: 42.1,
    revenueGrowth: 15.8,
    profitGrowth: 19.4,
  },
];

const seedIPOs = async () => {
  try {
    await connectDB();

    for (const ipo of ipos) {
      await IPO.findOneAndUpdate(
        {
          symbol: ipo.symbol,
          exchange: ipo.exchange,
        },
        ipo,
        {
          upsert: true,
          returnDocument: "after",
        }
      );
    }

    console.log("IPOs seeded successfully");
  } catch (error) {
    console.error(`IPO seeding failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
  }
};

seedIPOs();