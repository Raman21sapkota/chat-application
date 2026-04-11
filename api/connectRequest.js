const express = require("express");
const db = require("../database")

const router = express.Router();

// var friendRequest;
// router.post("/", express.json(), async (req, res)=>{
    
//     connectRequestData={targetAnonymousId:req.body.targetAnonymousId, senderAnonymousId:req.body.senderAnonymousId, username:req.body.username, publicKey:req.body.publicKey}
//     const sql = "INSERT INTO notification (targetAnonymousId, senderAnonymousId, username, publicKey) VALUES (?, ?, ?, ?)";
//     const values = [req.body.targetAnonymousId, req.body.senderAnonymousId, req.body.username, req.body.publicKey];
//     await db.query(sql, values, (error, result) => {
//         if (error) {
//             console.error("Error inserting data:", error);
//             res.status(500).json({ message: "Error inserting data into notification table" });
//         } else {
//             console.log("Data inserted successfully");
//             res.status(200).json({ message: "Message sent successfully" });
//         }
//     });

// });




// router.get("/", (req, res) => {
//     console.log("Get request executed!");

//         res.status(200).json({
//         targetAnonymousId: targetAnonymousId,
//         senderAnonymousId: senderAnonymousId,
//         username: username,
//         publicKey: publicKey
//     });
// });


module.exports=router;