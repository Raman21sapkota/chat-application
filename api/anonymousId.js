const express = require("express");
const crypto = require('crypto');
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Max 10 requests per minute
    message: "Too many requests from this IP, please try again later."
});
const router = express.Router().use(limiter);

global.myGlobalVariable = 0


myGlobalVariable+=1;

router.get("/assign", (req, res, next)=>{
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
    });
    const anonymousid = crypto.createHash('md5').update(myGlobalVariable.toString()).digest('hex');
    myGlobalVariable += 1;
    res.status(200).json({anonymousId:anonymousid, publicKey:publicKey, privateKey:privateKey});
});

module.exports=router;
