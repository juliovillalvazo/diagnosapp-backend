const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const doctorSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required.'],
        },
        firstName: {
            type: String,
            lowercase: true,
            required: [true, 'first name is required.'],
        },
        lastName: {
            type: String,
            lowercase: true,
            required: [true, 'last name is required.'],
        },
        specialty: {
            type: Schema.Types.ObjectId,
            ref: 'Specialty',
            required: [true, 'specialty is required'],
        },
        profilePicture: {
            type: String,
            default:
                'https://directory.wkhs.com/sites/default/files/hg-features/hg-providers/default-neutral.jpg',
        },
        appointments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Appointment',
            },
        ],
        description: { type: String, default: 'this is my public profile' },
        reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

const Doctor = model('Doctor', doctorSchema);

module.exports = Doctor;
