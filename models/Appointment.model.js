const { Schema, model } = require('mongoose');

const appointmentSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        appointment: {
            type: Date,
            required: true,
        },
        doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
    },
    { timestamps: true }
);

module.exports = model('Appointment', appointmentSchema);
