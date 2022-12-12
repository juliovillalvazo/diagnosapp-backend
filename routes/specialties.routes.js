const Specialty = require('../models/Specialty.model');
const router = require('express').Router();

// read all specialties
router.get('/specialties', async (req, res) => {
    try {
        const allSpecialties = await Specialty.find({});
        res.json(allSpecialties);
    } catch (err) {
        console.log(err);
    }
});

// create new specialty
router.post('/specialties', async (req, res) => {
    try {
        const { name } = req.body;
        const newSpecialty = await Specialty.create({ name });
        res.send(newSpecialty);
    } catch (err) {
        console.log(err);
    }
});

// delete specialty
router.get('/specialties/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Specialty.findByIdAndRemove(id);
        res.status(201);
    } catch (err) {
        console.log(err);
    }
});

// update specialty
router.post('/specialties/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedSpecialty = await Specialty.findByIdAndUpdate(id, name, {
            new: true,
        });
        res.json(updatedSpecialty);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
