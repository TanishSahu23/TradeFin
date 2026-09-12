import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

import {
  runPortfolioSnapshotJob,
  startPortfolioSnapshotJob,
} from "./jobs/portfolioSnapshot.job.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", async () => {
      console.log(`TradeFin server running on port ${PORT}`);

      await runPortfolioSnapshotJob();

      startPortfolioSnapshotJob();
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};


// require("dotenv").config();


startServer();