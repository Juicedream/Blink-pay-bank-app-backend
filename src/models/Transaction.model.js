const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    tran_type: {
      type: String,
      required: true,
      enum: ["credit", "debit"],
      trim: true,
      lower: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["NGN", "USD"],
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "reversed"],
      required: true,
    },
    narration: {
      type: String,
      required: true,
      maxLength: 100,
    },
    ref_id: {
      type: String,
    },
    balance_before: {
      type: Number,
      required: true,
    },
    balance_after: {
      type: Number,
      required: true,
    },
    channel: {
      type: String,
      enum: ["mobile", "web", "card", "wallet"],
      required: true,
    },
    meta_data: {
      recipient_bank: {
        type: String,
      },
      recipient_acc_num: {
        type: String,
      },
      deviceInfo:{
        userAgent:{
            type: String
        },
        platform: {
            type: String
        },
        language: {
            type: String
        },
        time: {
            type: String,
            default: Date.now()
        }
      }
    },

   
  },
  { timestamps: true }
);

const model = mongoose.model("transaction", schema);

exports.TransactionModel = model;
