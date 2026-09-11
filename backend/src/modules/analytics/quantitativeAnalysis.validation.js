import { z } from "zod";

export const betaQuerySchema = z.object({
  benchmarkId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid benchmark instrument ID"
    ),
});