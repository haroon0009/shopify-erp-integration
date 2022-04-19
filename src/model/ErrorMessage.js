import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    type: {
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

export const ErrorMessage = mongoose.model('ErrorMessage', schema);
