import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({

    user: {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    order: {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Order"
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
    quantity: {
        type : Number,
        required:true,
        min: 1,
    },  
    executionPrice: {
        type : Number,
        required:true,
        min: 0.01
    },
    executedAt: {
        type: Date,
        required:true
    },
}, {timestamps:true}
)

const Trade = mongoose.model("Trade", tradeSchema)

export default Trade