import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        instruments: {
            type: [mongoose.Schema.Types.ObjectId],
            required:true,
            ref: "Instrument",
        },
}, {timestamps: true}
)

const Watchlist = mongoose.model("Watchlist", watchlistSchema)

export default Watchlist;