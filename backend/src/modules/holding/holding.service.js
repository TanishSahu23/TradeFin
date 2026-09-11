import Holding from "./holding.model.js";

export const getMyHoldings = async (userId) => {
  const holdings = await Holding.find({
    user: userId,
    quantity: { $gt: 0 },
  }).populate("instrument");

  return holdings.map((holding) => {
    const currentPrice = holding.instrument.currentPrice;

    const currentValue =
      holding.quantity * currentPrice;

    const unrealizedPnL =
      currentValue - holding.investedAmount;

    return {
      id: holding._id,
      instrument: holding.instrument,
      quantity: holding.quantity,
      averageBuyPrice: holding.averageBuyPrice,
      investedAmount: holding.investedAmount,
      currentPrice,
      currentValue,
      unrealizedPnL,
      realizedPnL: holding.realizedPnL,
    };
  });
};