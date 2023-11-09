const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'purchase'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', 
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
     unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [transactionSchema], 
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;