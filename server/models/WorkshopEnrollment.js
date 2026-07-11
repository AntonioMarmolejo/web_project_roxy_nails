import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema({
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
    title:    { type: String, required: true },   // snapshot
    date:     { type: Date, required: true },     // snapshot
    price:    { type: Number, required: true },   // snapshot
    client: {
        name:  { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cod', 'stripe'], default: 'cod' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('WorkshopEnrollment', enrollmentSchema)
