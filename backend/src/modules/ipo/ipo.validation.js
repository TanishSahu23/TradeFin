import { z } from "zod";

export const ipoIdSchema = z.object({
  id: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid IPO ID"
    ),
});

export const createIpoSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(
        2,
        "Company name must be at least 2 characters"
      ),

    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .toUpperCase(),

    exchange: z.enum(["NSE", "BSE"]),

    status: z.enum([
      "UPCOMING",
      "OPEN",
      "CLOSED",
      "LISTED",
      "CANCELLED",
    ]),

    openDate: z.coerce
      .date()
      .optional(),

    closeDate: z.coerce
      .date()
      .optional(),

    listingDate: z.coerce
      .date()
      .optional(),

    priceBandMin: z
      .number()
      .finite()
      .min(
        0.01,
        "Price band minimum must be greater than 0"
      )
      .optional(),

    priceBandMax: z
      .number()
      .finite()
      .min(
        0.01,
        "Price band maximum must be greater than 0"
      )
      .optional(),

    lotSize: z
      .number()
      .int(
        "Lot size must be an integer"
      )
      .min(
        1,
        "Lot size must be at least 1"
      )
      .optional(),

    issueSize: z
      .number()
      .finite()
      .min(
        0,
        "Issue size cannot be negative"
      )
      .optional(),

    subscription: z
      .number()
      .finite()
      .min(
        0,
        "Subscription cannot be negative"
      )
      .optional(),

    listingPrice: z
      .number()
      .finite()
      .min(
        0.01,
        "Listing price must be greater than 0"
      )
      .optional(),

    currentPrice: z
      .number()
      .finite()
      .min(
        0.01,
        "Current price must be greater than 0"
      )
      .optional(),

    revenue: z
      .number()
      .finite()
      .min(
        0,
        "Revenue cannot be negative"
      )
      .optional(),

    profit: z
      .number()
      .finite()
      .optional(),

    peRatio: z
      .number()
      .finite()
      .positive(
        "P/E ratio must be greater than 0"
      )
      .optional(),

    revenueGrowth: z
      .number()
      .finite()
      .optional(),

    profitGrowth: z
      .number()
      .finite()
      .optional(),
  })
  .refine(
    (data) =>
      data.priceBandMin === undefined ||
      data.priceBandMax === undefined ||
      data.priceBandMin <=
        data.priceBandMax,
    {
      message:
        "Price band minimum cannot exceed maximum",
      path: ["priceBandMax"],
    }
  )
  .refine(
    (data) =>
      !data.openDate ||
      !data.closeDate ||
      data.openDate <= data.closeDate,
    {
      message:
        "Open date cannot be after close date",
      path: ["closeDate"],
    }
  )
  .refine(
    (data) =>
      !data.closeDate ||
      !data.listingDate ||
      data.closeDate <=
        data.listingDate,
    {
      message:
        "Listing date cannot be before close date",
      path: ["listingDate"],
    }
  );