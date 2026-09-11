import { z } from "zod";

export const instrumentIdSchema = z.object({
  id: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid instrument ID"
  ),
});