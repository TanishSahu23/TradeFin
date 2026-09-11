import { z } from "zod";

export const createJournalSchema = z
  .object({
    instrumentId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid instrument ID"
      ),

    tradeId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid trade ID"
      )
      .optional(),

    action: z.enum([
      "BUY",
      "SELL",
      "HOLD",
    ]),

    price: z
      .number({
        required_error:
          "Price is required",
        invalid_type_error:
          "Price must be a number",
      })
      .finite()
      .min(
        0.01,
        "Price must be greater than 0"
      ),

    quantity: z
      .number({
        invalid_type_error:
          "Quantity must be a number",
      })
      .int(
        "Quantity must be an integer"
      )
      .min(
        1,
        "Quantity must be at least 1"
      )
      .optional(),

    reason: z
      .string()
      .trim()
      .min(
        5,
        "Reason must be at least 5 characters"
      ),

    confidence: z
      .number({
        required_error:
          "Confidence is required",
        invalid_type_error:
          "Confidence must be a number",
      })
      .int(
        "Confidence must be an integer"
      )
      .min(
        1,
        "Confidence must be between 1 and 5"
      )
      .max(
        5,
        "Confidence must be between 1 and 5"
      ),

    exitPrice: z
      .number({
        invalid_type_error:
          "Exit price must be a number",
      })
      .finite()
      .min(
        0.01,
        "Exit price must be greater than 0"
      )
      .optional(),

    outcomePnL: z
      .number({
        invalid_type_error:
          "Outcome P&L must be a number",
      })
      .finite()
      .optional(),
  })
  .refine(
    (data) =>
      data.action === "HOLD" ||
      data.quantity !== undefined,
    {
      message:
        "Quantity is required for BUY or SELL journal entries",
      path: ["quantity"],
    }
  );

export const updateJournalSchema =
  z.object({
    exitPrice: z
      .number({
        required_error:
          "Exit price is required",
        invalid_type_error:
          "Exit price must be a number",
      })
      .finite()
      .min(
        0.01,
        "Exit price must be greater than 0"
      ),

    outcomePnL: z
      .number({
        required_error:
          "Outcome P&L is required",
        invalid_type_error:
          "Outcome P&L must be a number",
      })
      .finite(),
  });