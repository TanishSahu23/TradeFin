import mongoose from "mongoose";

const ipoTrackingSchema = new mongoose.Schema({

    user: {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    ipo: {
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "IPO",
    },
    status: {
        type: String,
        required:true,
        enum: ["WATCHING",],
    },
},{ timestamps:true} 
)

ipoTrackingSchema.index(
  { user: 1, ipo: 1 },
  { unique: true }
)

const IPOTracking = mongoose.model("IPOTracking", ipoTrackingSchema)

export default IPOTracking