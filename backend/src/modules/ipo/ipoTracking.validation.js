import { z } from "zod";

export const ipoTrackingIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid IPO ID"),
});