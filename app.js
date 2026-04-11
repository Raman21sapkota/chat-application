const express = require('express');
const anonymousId = require("./api/anonymousId");
const message = require("./api/message");
const router = require("./api/connectRequest");
const connectRequest = router;
const app = express();

//anonymousid handler
app.get("/",(req, res, next)=>{
    res.status(200).json({message:"It works! ",name:"asdfasd"});
}); 

app.use("/anonymousid", anonymousId);


// app.use("/trustcontact", connectRequest);

//message handle
app.use("/message", message);
// app.use("/uni", (req, res, next)=>{
//     res.status(200).json({message:"It works! ",name:"asdfasd"});
// });

module.exports = app;   