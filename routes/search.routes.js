const Doctor = require('../models/Doctor.model');
const Review = require('../models/Review.model');
const Patient = require('../models/Patient.model');

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require('../middleware/jwt.middleware.js');

const router = require('express').Router();

router.get('/doctors', async (req, res, next) => {
    const params = req.query;
    try {
        const result = await Doctor.find(params).populate('specialty');
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.get(
    '/doctors/:id/review/:idReview/delete',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { id, idReview } = req.params;
            const foundReview = await Review.findById(idReview);
            await Patient.findByIdAndUpdate(foundReview.author, {
                $pull: { reviews: idReview },
            });

            await Doctor.findByIdAndUpdate(id, {
                $pull: { reviews: idReview },
            });

            res.send(200);
        } catch (err) {
            next(err);
        }
    }
);

router.post('/doctors/:id/review', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { author } = req.body;
        const newReview = await Review.create({ ...req.body });
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            id,
            {
                $push: { reviews: newReview._id },
            },
            { new: true }
        );

        await Patient.findByIdAndUpdate(author, {
            $push: { reviews: newReview._id },
        });

        res.json(updatedDoctor);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
