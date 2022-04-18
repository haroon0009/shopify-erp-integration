import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    meta_details: {
      type: mongoose.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const FulFillmentModal = mongoose.model('FulFillment', schema);
