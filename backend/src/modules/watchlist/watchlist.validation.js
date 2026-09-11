import { z } from "zod";

export const addToWatchlistSchema = z.object({
  instrumentId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid instrument ID"
  ),
});

export const removeFromWatchlistSchema = z.object({
  instrumentId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid instrument ID"
  ),
});