import {
  createOrder as createOrderService,
  getMyOrders as getMyOrdersService,
} from "./order.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const result = await createOrderService(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Order executed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await getMyOrdersService(req.user.userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};