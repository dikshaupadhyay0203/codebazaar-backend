const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
    {
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        paymentId: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        purchaseDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

purchaseSchema.index({ buyerId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
