const express = require("express");
const rateLimit = require("express-rate-limit");


const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // Max 10 requests per minute
    message: "Too many requests from this IP, please try again later."
});
const router = express.Router().use(limiter);

// router.use(limiter);

router.post("/", express.json(), (req, res)=>{
    const message = req.body;
    res.status(200).json({message:`The message content is ${message.name}`});
});

module.exports = router;

