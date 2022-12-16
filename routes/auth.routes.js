const express = require('express');
const router = express.Router();

// require file uploader
const fileUploader = require('../config/cloudinary.config');

// ℹ️ Handles password encryption
const bcrypt = require('bcrypt');

// ℹ️ Handles password encryption
const jwt = require('jsonwebtoken');

// Require the User model in order to interact with the database
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require('../middleware/jwt.middleware.js');

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post('/signup', (req, res, next) => {
    const { email, password, firstName, lastName, specialty } = req.body;

    // Check if email or password or name are provided as empty strings
    if (
        email === '' ||
        password === '' ||
        firstName === '' ||
        lastName === ''
    ) {
        res.status(400).json({
            message: 'Provide email, password and full name',
        });
        return;
    }

    // This regular expression check that the email is of a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Provide a valid email address.' });
        return;
    }

    // This regular expression checks password for special characters and minimum length
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({
            message:
                'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.',
        });
        return;
    }

    if (specialty) {
        // Check the users collection if a user with the same email already exists
        Doctor.findOne({ email })
            .then((foundUser) => {
                // If the user with the same email already exists, send an error response
                if (foundUser) {
                    res.status(400).json({ message: 'Doctor already exists.' });
                    return;
                }

                // If email is unique, proceed to hash the password
                const salt = bcrypt.genSaltSync(saltRounds);
                const hashedPassword = bcrypt.hashSync(password, salt);

                // Create the new user in the database
                // We return a pending promise, which allows us to chain another `then`
                return Doctor.create({
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    specialty,
                });
            })
            .then((createdUser) => {
                // Deconstruct the newly created user object to omit the password
                // We should never expose passwords publicly
                const { email, firstName, _id } = createdUser;

                // Create a new object that doesn't expose the password
                const user = { email, firstName, _id };

                // Send a json response containing the user object
                res.status(201).json({ user: user });
            })
            .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    } else {
        // Check the users collection if a user with the same email already exists
        Patient.findOne({ email })
            .then((foundUser) => {
                // If the user with the same email already exists, send an error response
                if (foundUser) {
                    res.status(400).json({
                        message: 'Patient already exists.',
                    });
                    return;
                }

                // If email is unique, proceed to hash the password
                const salt = bcrypt.genSaltSync(saltRounds);
                const hashedPassword = bcrypt.hashSync(password, salt);

                // Create the new user in the database
                // We return a pending promise, which allows us to chain another `then`
                return Patient.create({
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                });
            })
            .then((createdUser) => {
                // Deconstruct the newly created user object to omit the password
                // We should never expose passwords publicly
                const { email, firstName, _id } = createdUser;

                // Create a new object that doesn't expose the password
                const user = { email, firstName, _id };

                // Send a json response containing the user object
                res.status(201).json({ user: user });
            })
            .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    }
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
    const { email, password, type } = req.body;

    // Check if email or password are provided as empty string
    if (email === '' || password === '') {
        res.status(400).json({ message: 'Provide email and password.' });
        return;
    }

    if (type === 'patient') {
        // Check the users collection if a user with the same email exists
        Patient.findOne({ email })
            .then((foundUser) => {
                if (!foundUser) {
                    // If the user is not found, send an error response
                    res.status(401).json({ message: 'User not found.' });
                    return;
                }

                // Compare the provided password with the one saved in the database
                const passwordCorrect = bcrypt.compareSync(
                    password,
                    foundUser.password
                );

                if (passwordCorrect) {
                    // Deconstruct the user object to omit the password
                    const { _id, email, firstName, lastName, profilePicture } =
                        foundUser;

                    // Create an object that will be set as the token payload
                    const payload = {
                        _id,
                        email,
                        firstName,
                        type,
                        lastName,
                        profilePicture,
                    };

                    // Create a JSON Web Token and sign it
                    const authToken = jwt.sign(
                        payload,
                        process.env.TOKEN_SECRET,
                        {
                            algorithm: 'HS256',
                            expiresIn: '6h',
                        }
                    );

                    // Send the token as the response
                    res.status(200).json({ authToken: authToken });
                } else {
                    res.status(401).json({
                        message: 'Unable to authenticate the user',
                    });
                }
            })
            .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    } else {
        Doctor.findOne({ email })
            .populate('specialty')
            .then((foundUser) => {
                if (!foundUser) {
                    // If the user is not found, send an error response
                    res.status(401).json({ message: 'User not found.' });
                    return;
                }

                // Compare the provided password with the one saved in the database
                const passwordCorrect = bcrypt.compareSync(
                    password,
                    foundUser.password
                );

                if (passwordCorrect) {
                    // Deconstruct the user object to omit the password
                    const {
                        _id,
                        email,
                        firstName,
                        lastName,
                        profilePicture,
                        specialty,
                        description,
                    } = foundUser;

                    // Create an object that will be set as the token payload
                    const payload = {
                        _id,
                        email,
                        firstName,
                        lastName,
                        type,
                        profilePicture,
                        specialty: specialty.name,
                        description,
                    };

                    // Create a JSON Web Token and sign it
                    const authToken = jwt.sign(
                        payload,
                        process.env.TOKEN_SECRET,
                        {
                            algorithm: 'HS256',
                            expiresIn: '6h',
                        }
                    );

                    // Send the token as the response
                    res.status(200).json({ authToken: authToken });
                } else {
                    res.status(401).json({
                        message: 'Unable to authenticate the user',
                    });
                }
            })
            .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    }
});

router.post(
    '/upload/:id',
    fileUploader.single('profilePicture'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!req.file) {
                throw new Error('No file uploaded!');
            }
            res.json({ fileUrl: req.file.path });
        } catch (err) {
            next(err);
        }
    }
);

router.put('/users/:id/edit', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, firstName, lastName, email, profilePicture } = req.body;
        if (type === 'doctor') {
            const { description } = req.body;
            const updatedDoctor = await Doctor.findByIdAndUpdate(
                id,
                { firstName, lastName, email, profilePicture, description },
                { new: true }
            ).populate('specialty');
            // Deconstruct the user object to omit the password
            const { _id, specialty } = updatedDoctor;

            // Create an object that will be set as the token payload
            const payload = {
                _id,
                email,
                firstName,
                lastName,
                type,
                profilePicture,
                specialty: specialty.name,
                description,
            };
            const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
                algorithm: 'HS256',
                expiresIn: '6h',
            });
            res.status(201).json({ ...updatedDoctor, authToken });
        } else {
            const updatedPatient = await Patient.findByIdAndUpdate(
                id,
                { firstName, lastName, email, profilePicture },
                { new: true }
            );
            // Deconstruct the user object to omit the password
            const { _id } = updatedPatient;

            // Create an object that will be set as the token payload
            const payload = {
                _id,
                email,
                firstName,
                lastName,
                type,
                profilePicture,
            };
            const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
                algorithm: 'HS256',
                expiresIn: '6h',
            });
            res.status(201).json({ ...updatedPatient, authToken });
        }
    } catch (err) {
        next(err);
    }
});

router.get('/doctors/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            _id,
            appointments,
            email,
            firstName,
            lastName,
            profilePicture,
            specialty,
            description,
            reviews,
        } = await Doctor.findById(id)
            .populate('specialty reviews appointments')
            .populate({
                path: 'appointments',
                populate: {
                    path: 'patient',
                    model: 'Patient',
                },
            })
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author',
                    model: 'Patient',
                },
            });
        res.json({
            _id,
            appointments,
            email,
            firstName,
            lastName,
            profilePicture,
            specialty,
            description,
            reviews,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/patients/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            _id,
            appointments,
            email,
            firstName,
            lastName,
            profilePicture,
        } = await Patient.findById(id)
            .populate('appointments')
            .populate({
                path: 'appointments',
                populate: {
                    path: 'doctor',
                    model: 'Doctor',
                },
            });
        res.json({
            _id,
            appointments,
            email,
            firstName,
            lastName,
            profilePicture,
        });
    } catch (err) {
        next(err);
    }
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {
    // If JWT token is valid the payload gets decoded by the
    // isAuthenticated middleware and is made available on `req.payload`
    // console.log(`req.payload`, req.payload);

    // Send back the token payload object containing the user data
    res.status(200).json(req.payload);
});

module.exports = router;
