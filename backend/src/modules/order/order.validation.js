import { z } from "zod";

export const createOrderSchema = z.object({
  instrumentId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid instrument ID"
    ),

  side: z.enum(["BUY", "SELL"], {
    errorMap: () => ({
      message: "Side must be BUY or SELL",
    }),
  }),

  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});