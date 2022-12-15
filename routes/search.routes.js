const Doctor = require('../models/Doctor.model');
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

module.exports = router;
