const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res, next) => {
    res.json('All good in here');
});

router.post('/send-feedback', async (req, res, next) => {
    try {
        const { from_name, message } = req.body;
        const data = {
            service_id: process.env.SERVICE_ID,
            template_id: process.env.TEMPLATE_ID,
            user_id: process.env.USER_ID,
            accessToken: process.env.accessToken,
            template_params: {
                from_name: from_name,
                message: message,
            },
        };
        await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
        res.send(201);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
