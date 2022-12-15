const Appointment = require('../models/Appointment.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const router = require('express').Router();

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require('../middleware/jwt.middleware.js');

router.post(
    '/schedule/doctors/:id',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { id } = req.params;

            const newConsultation = await Appointment.create({
                ...req.body,
                doctor: id,
            });

            await Doctor.findByIdAndUpdate(id, {
                $push: { appointments: newConsultation._id },
            });
            await Patient.findByIdAndUpdate(req.body.patient, {
                $push: { appointments: newConsultation._id },
            });

            res.json(newConsultation);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
