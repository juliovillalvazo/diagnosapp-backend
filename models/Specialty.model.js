const { Schema, model } = require('mongoose');

const specialtySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
});

module.exports = model('Specialty', specialtySchema);
