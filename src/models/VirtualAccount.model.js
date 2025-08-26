const mongoose = require("mongoose");
const { generatePin, generateVirtualAccountNumber } = require("../utils/function");
// const bcryptjs = require("bcryptjs");
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    acc_type: {
      type: String,
      defualt: "virtual",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tier: {
      type: String,
      enum: ["Tier 1", "Tier 2", "Tier 3"],
      defaut: "Tier 3",
    },

    amount: {
        type: Number,
        required: true
    },
 
    acc_number: {
      type: Number,
      required: true,
      default: generateVirtualAccountNumber()
    },
  
    bank_name: {
      type: String,
      default: "Blinkpay Bank",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);


const model = mongoose.model("virtual_accounts", schema);

exports.VirtualAccountModel = model