import express from "express";
import cors from "cors";

import errorHandler from "./middleware/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import instrumentRoutes from "./modules/instrument/instrument.routes.js";
import watchlistRoutes from "./modules/watchlist/watchlist.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import holdingRoutes from "./modules/holding/holding.routes.js";
import portfolioRoutes from "./modules/portfolio/portfolio.routes.js";
import journalRoutes from "./modules/journal/journal.routes.js";
import ipoRoutes from "./modules/ipo/ipo.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import marketPriceRoutes from "./modules/instrument/marketPrice.routes.js";
import technicalAnalysisRoutes from "./modules/analytics/technicalAnalysis.routes.js";
import quantitativeAnalysisRoutes from "./modules/analytics/quantitativeAnalysis.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "TradeFin API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/instruments", instrumentRoutes);

app.use("/api/v1/watchlist",watchlistRoutes )

app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/holdings", holdingRoutes);

app.use("/api/v1/portfolio", portfolioRoutes);

app.use("/api/v1/journal", journalRoutes);

app.use("/api/v1/ipos", ipoRoutes);

app.use("/api/v1/analytics", analyticsRoutes);

app.use("/api/v1/market-prices", marketPriceRoutes);

app.use("/api/v1/analytics", technicalAnalysisRoutes);

app.use("/api/v1/analytics", quantitativeAnalysisRoutes);

app.use(errorHandler);

export default app;