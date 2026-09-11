import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

import {
  startPortfolioSnapshotJob,
} from "./jobs/portfolioSnapshot.job.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `TradeFin server running on port ${PORT}`
      );

      startPortfolioSnapshotJob();
    });
  } catch (error) {
    console.error(
      `Server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();