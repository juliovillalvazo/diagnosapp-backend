const Appointment = require('../models/Appointment.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const router = require('express').Router();
const axios = require('axios');

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require('../middleware/jwt.middleware.js');

router.get('/appointments/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        res.json(appointment);
    } catch (err) {
        next(err);
    }
});

router.get('/appointments/:id/delete', async (req, res, next) => {
    try {
        const { id } = req.params;
        await Appointment.findByIdAndRemove(id);

        res.status(200);
    } catch (err) {
        next(err);
    }
});

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

            const updatedDoctor = await Doctor.findByIdAndUpdate(id, {
                $push: { appointments: newConsultation._id },
            });

            const updatedPatient = await Patient.findByIdAndUpdate(
                req.body.patient,
                {
                    $push: { appointments: newConsultation._id },
                }
            );

            const data = {
                service_id: process.env.SERVICE_ID,
                template_id: process.env.TEMPLATE_ID_APPOINTMENT,
                user_id: process.env.USER_ID,
                accessToken: process.env.accessToken,
                template_params: {
                    from_name: updatedPatient.firstName,
                    message: newConsultation.summary,
                    to_name: updatedDoctor.firstName,
                    to_email: updatedDoctor.email,
                },
            };
            await axios.post(
                'https://api.emailjs.com/api/v1.0/email/send',
                data
            );

            res.json(newConsultation);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
