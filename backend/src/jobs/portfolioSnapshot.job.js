import cron from "node-cron";

import {
  createSnapshotsForAllUsers,
} from "../modules/portfolio/portfolio.service.js";

export const runPortfolioSnapshotJob = async () => {
  try {
    console.log(
      "Starting portfolio snapshot job..."
    );

    const result =
      await createSnapshotsForAllUsers();

    console.log(
      `Portfolio snapshot job completed: ${result.successful}/${result.totalUsers} users processed`
    );

    if (result.failed > 0) {
      console.warn(
        `${result.failed} portfolio snapshots failed`
      );
    }
  } catch (error) {
    console.error(
      `Portfolio snapshot job failed: ${error.message}`
    );
  }
};

export const runPortfolioSnapshotJobNow = async () => {
  await runPortfolioSnapshotJob();
};

export const startPortfolioSnapshotJob = () => {
  cron.schedule(
    "0 16 * * 1-5",
    async () => {
      await runPortfolioSnapshotJob();
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "Portfolio snapshot job scheduled for 4:00 PM IST on weekdays"
  );
};