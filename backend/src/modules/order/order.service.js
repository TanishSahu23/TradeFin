import mongoose from "mongoose";

import Order from "./order.model.js";
import Instrument from "../instrument/instrument.model.js";
import Trade from "../trade/trade.model.js";
import Holding from "../holding/holding.model.js";
import CashLedger from "../ledger/cashLedger.model.js";

import {
  createPortfolioSnapshot,
} from "../portfolio/portfolio.service.js";

import AppError from "../../utils/AppError.js";

const getCurrentCashBalance = async (
  userId,
  session
) => {
  const latestEntry =
    await CashLedger.findOne({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .session(session);

  if (!latestEntry) {
    throw new AppError(
      "Cash account not initialized",
      500
    );
  }

  return latestEntry.balanceAfter;
};

export const createOrder = async (
  userId,
  orderData
) => {
  const {
    instrumentId,
    side,
    quantity,
  } = orderData;

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const instrument =
      await Instrument.findOne({
        _id: instrumentId,
        isActive: true,
      }).session(session);

    if (!instrument) {
      throw new AppError(
        "Instrument not found or inactive",
        404
      );
    }

    const executionPrice =
      instrument.currentPrice;

    if (
      !executionPrice ||
      executionPrice <= 0
    ) {
      throw new AppError(
        "Instrument price is unavailable",
        400
      );
    }

    if (
      !quantity ||
      quantity <= 0
    ) {
      throw new AppError(
        "Quantity must be greater than zero",
        400
      );
    }

    const totalAmount =
      executionPrice * quantity;

    const currentCash =
      await getCurrentCashBalance(
        userId,
        session
      );

    if (
      side === "BUY" &&
      currentCash < totalAmount
    ) {
      throw new AppError(
        "Insufficient funds",
        400
      );
    }

    let holding =
      await Holding.findOne({
        user: userId,
        instrument: instrumentId,
      }).session(session);

    if (side === "SELL") {
      if (
        !holding ||
        holding.quantity < quantity
      ) {
        throw new AppError(
          "Insufficient holdings",
          400
        );
      }
    }

    const order =
      await Order.create(
        [
          {
            user: userId,
            instrument: instrumentId,
            side,
            orderType: "MARKET",
            quantity,
            status: "PENDING",
            requestedAt: new Date(),
          },
        ],
        {
          session,
        }
      );

    const createdOrder =
      order[0];

    const trade =
      await Trade.create(
        [
          {
            user: userId,
            order:
              createdOrder._id,
            instrument:
              instrumentId,
            side,
            quantity,
            executionPrice,
            executedAt:
              new Date(),
          },
        ],
        {
          session,
        }
      );

    const createdTrade =
      trade[0];

    createdOrder.status =
      "EXECUTED";

    createdOrder.executedAt =
      createdTrade.executedAt;

    await createdOrder.save({
      session,
    });

    /*
     * BUY
     *
     * Increase holding quantity,
     * recalculate average price,
     * reduce cash balance.
     */
    if (side === "BUY") {
      if (!holding) {
        holding =
          new Holding({
            user: userId,
            instrument:
              instrumentId,
            quantity: 0,
            averageBuyPrice:
              executionPrice,
            investedAmount: 0,
            realizedPnL: 0,
          });
      }

      const oldQuantity =
        holding.quantity;

      const oldAveragePrice =
        holding.averageBuyPrice;

      const newQuantity =
        oldQuantity +
        quantity;

      const newAveragePrice =
        oldQuantity === 0
          ? executionPrice
          : (
              oldQuantity *
                oldAveragePrice +
              quantity *
                executionPrice
            ) /
            newQuantity;

      holding.quantity =
        newQuantity;

      holding.averageBuyPrice =
        newAveragePrice;

      holding.investedAmount =
        newQuantity *
        newAveragePrice;

      await holding.save({
        session,
      });

      const newCashBalance =
        currentCash -
        totalAmount;

      await CashLedger.create(
        [
          {
            user: userId,
            type: "BUY",
            amount:
              -totalAmount,
            balanceAfter:
              newCashBalance,
            reference:
              createdTrade._id,
            description: `BUY ${quantity} ${instrument.symbol}`,
          },
        ],
        {
          session,
        }
      );
    }

    /*
     * SELL
     *
     * Decrease holding quantity,
     * calculate realized P&L,
     * increase cash balance.
     */
    if (side === "SELL") {
      const realizedPnL =
        (
          executionPrice -
          holding.averageBuyPrice
        ) * quantity;

      holding.quantity -=
        quantity;

      holding.investedAmount =
        holding.quantity *
        holding.averageBuyPrice;

      holding.realizedPnL +=
        realizedPnL;

      if (
        holding.quantity === 0
      ) {
        holding.averageBuyPrice =
          0;

        holding.investedAmount =
          0;
      }

      await holding.save({
        session,
      });

      const newCashBalance =
        currentCash +
        totalAmount;

      await CashLedger.create(
        [
          {
            user: userId,
            type: "SELL",
            amount:
              totalAmount,
            balanceAfter:
              newCashBalance,
            reference:
              createdTrade._id,
            description: `SELL ${quantity} ${instrument.symbol}`,
          },
        ],
        {
          session,
        }
      );
    }

    /*
     * Commit the actual trade first.
     *
     * The order, trade, holding and
     * cash ledger are now permanently
     * saved.
     */
    await session.commitTransaction();

    /*
     * IMPORTANT:
     *
     * Update today's portfolio snapshot
     * immediately after the trade.
     *
     * Previously this was only happening
     * from the scheduled node-cron job.
     *
     * We intentionally do this AFTER the
     * transaction has committed.
     *
     * If snapshot creation fails, the
     * completed trade must NOT be rolled
     * back.
     */
    try {
      await createPortfolioSnapshot(
        userId
      );

      console.log(
        `Portfolio snapshot updated immediately after ${side} order for user ${userId}`
      );
    } catch (snapshotError) {
      console.error(
        `Portfolio snapshot update failed after ${side} order: ${snapshotError.message}`
      );
    }

    return {
      order:
        createdOrder,

      trade:
        createdTrade,
    };
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (
  userId
) => {
  const orders =
    await Order.find({
      user: userId,
    })
      .populate("instrument")
      .sort({
        requestedAt: -1,
      });

  const ordersWithTrades =
    await Promise.all(
      orders.map(
        async (order) => {
          const trade =
            await Trade.findOne({
              order:
                order._id,
            });

          return {
            ...order.toObject(),

            trade,
          };
        }
      )
    );

  return ordersWithTrades;
};