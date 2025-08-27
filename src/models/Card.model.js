const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    card_name: {
      type: String,
      required: true,
      trim: true,
    },

    acc_type: {
      type: String,
      enum: ["savings", "current"],
      required: true,
    },

    card_type: {
      type: String,
      enum: ["platinum", "women", "regular", "vintage"],
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    card_pan: {
      type: String,
      required: true,
      unique: true,
    },

    card_cvv: {
      type: String,
      required: true,
      unique: true,
    },

    pin:{
        type: String,
        required: true,
    },

    card_expiry: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const model = mongoose.model("card", schema);

exports.CardModel = model;
