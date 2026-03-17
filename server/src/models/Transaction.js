import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true, index: true },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    notes: { type: String, default: '' },
    date: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
