import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../modules/user/user.model.js";
import CashLedger from "../modules/ledger/cashLedger.model.js";

const INITIAL_CASH = 1000000;

const initializeCashAccounts = async () => {
  try {
    await connectDB();

    const users = await User.find({})
      .select("_id")
      .lean();

    let initialized = 0;
    let skipped = 0;

    for (const user of users) {
      const existingCashEntry = await CashLedger.findOne({
        user: user._id,
      });

      if (existingCashEntry) {
        skipped += 1;
        continue;
      }

      await CashLedger.create({
        user: user._id,
        type: "INITIAL_CREDIT",
        amount: INITIAL_CASH,
        balanceAfter: INITIAL_CASH,
        description: "Initial paper trading balance",
      });

      initialized += 1;

      console.log(
        `Cash account initialized for user ${user._id}`
      );
    }

    console.log(
      `Cash account migration completed: ${initialized} initialized, ${skipped} skipped`
    );
  } catch (error) {
    console.error(
      `Cash account migration failed: ${error.message}`
    );
  } finally {
    await mongoose.connection.close();
  }
};

initializeCashAccounts();