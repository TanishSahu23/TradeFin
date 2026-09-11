import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type : mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        instrument: {
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: "Instrument",
        },
        side: { //Buy or sell
            type : String,
            required: true,
            enum: ["BUY","SELL"]
        },
        orderType: { // Market
            type: String,
            required: true,
            enum: ["MARKET"]
        },
        quantity: {
            type : Number,
            required:true,
            min: 1,
        },
        status: { //Pending/Executed/Cancelled/Rejected
            type : String,
            required: true,
            enum: ["PENDING", "EXECUTED", "CANCELLED", "REJECTED"]
        },
        rejectionReason: {
            type : String,
        },
        requestedAt: {
            type : Date,
            required:true
        },
        executedAt: {
            type : Date,
        }
    },
    { timestamps: true }
)

const Order = mongoose.model("Order", orderSchema)

export default Order