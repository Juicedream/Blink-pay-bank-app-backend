const mongoose = require("mongoose");
// const bcryptjs = require("bcryptjs");
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lower: true,
    },
    acc_type: {
      type: String,
      required: true,
      enum: ["savings", "current", "virtual"],
      defualt: "savings",
    },
    is_onboarded: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      maxLength: 50,
    },
    age: {
      type: Number,
      min: 18,
      max: 85,
    },
    birth_date: {
      type: String,
      minLength: 10,
      maxLength: 10
      
    },
    bvn: {
        type: String,
        minLength: 11,
        maxLength: 11
    },
    docs_upload: [
      {
        fileType: {
          type: String,
          enum: ["Driver's License", "NIN", "Utility Bill"], // restrict to allowed types
          required: true,
        },
        fileName: {
          type: String, // store the uploaded file's name
          required: true,
        },
        filePath: {
          type: String, // optional: if you’re storing the file path or URL
        },
        docType: {
            type: String,
            enum: ["pdf", "image"]
        }
      },
    ],

    pin: {
        type: String,
        unique: true,
        minLength: 4,
        maxLength: 4,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tier: {
        type: String,
        enum: ["Tier 1", "Tier 2", "Tier 3"],
        defaut: "Tier 1"
    },
    acc_balance: {
        type: Number,
        default: 0.00
    },
    transfer_limit:{
        type: Number,
        default: 100000
    }, 
    acc_number: {
        type: Number,
        required: true,
        unique: true
    },
    created_by:{
        type: String,
        required: true
    },
    bank_name: {
        type: String,
        default: "Blinkpay Bank"
    },
    tran_history:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        }
    ]
    
    
  },
  { timestamps: true }
);


const model = mongoose.model("account", schema);

exports.AccountModel = model