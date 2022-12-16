const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = model('Review', reviewSchema);
