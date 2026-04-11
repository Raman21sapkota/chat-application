const mysql = require("mysql")


const db = mysql.createConnection({
    host:"localhost",
    user:"patali",
    password:"password",
});

const databaseName = "SafeConnect";
function setupDatabase(){
try {
    // Create the SafeConnect database if it doesn't exist
    db.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);

    // Use the SafeConnect database
    db.query(`USE ${databaseName}`);

    // Create the notification table with a basic column definition
    db.query(`CREATE TABLE IF NOT EXISTS notification (
        targetAnonymousId TEXT,
        senderAnonymousId TEXT,
        username TEXT,
        publicKey TEXT
    )`);
    db.query(`CREATE TABLE IF NOT EXISTS message (
        targetAnonymousId TEXT,
        senderAnonymousId TEXT,
        message TEXT,
        timeStamp TEXT
    )`);
    db.query(`CREATE TABLE IF NOT EXISTS updateMessage (
        targetAnonymousId TEXT,
        senderAnonymousId TEXT,
        message TEXT,
        timeStamp TEXT
    )`);
    db.query(`CREATE TABLE IF NOT EXISTS deleteMessage (
        targetAnonymousId TEXT,
        senderAnonymousId TEXT,
        message TEXT,
        timeStamp TEXT
    )`);
    db.query(`CREATE TABLE IF NOT EXISTS friendRequestAccept (
        targetAnonymousId TEXT,
        senderAnonymousId TEXT,
        publicKey TEXT
    )`);

} catch (error) {
    // Handle any errors
    console.error("Error:", error);
}
}
async function friendRequest(anonymousId) {
    try {
        // Perform the database query
        const friendRequestList = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM notification WHERE targetAnonymousId = ?', [anonymousId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results); // Resolve with the query results
                }
            });
        });
        // Convert the query results to JSON format
        const friendRequestJson = JSON.stringify(friendRequestList);
        return friendRequestJson;
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

async function fetchMessage(anonymousId) {
    try {
        // Perform the database query
        const message = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM message WHERE targetAnonymousId = ?', [anonymousId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results); // Resolve with the query results
                }
            });
            // db.query('DELETE FROM message WHERE targetAnonymousId = ?;', [anonymousId]);
        });


        // Convert the query results to JSON format
        const messageJson = JSON.stringify(message);
        return messageJson;
        
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

async function updateMessage(anonymousId) {
    try {
        // Perform the database query
        const message = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM updateMessage WHERE targetAnonymousId = ?', [anonymousId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results); // Resolve with the query results
                }
            });
            // db.query('DELETE FROM updateMessage WHERE targetAnonymousId = ?;', [anonymousId]);
        });


        // Convert the query results to JSON format
        const messageJson = JSON.stringify(message);
        return messageJson;
        
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

async function deleteMessage(anonymousId) {
    try {
        // Perform the database query
        const message = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM deleteMessage WHERE targetAnonymousId = ?', [anonymousId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results); // Resolve with the query results
                }
            });
            // db.query('DELETE FROM deleteMessage WHERE targetAnonymousId = ?;', [anonymousId]);
        });
        // Convert the query results to JSON format
        const messageJson = JSON.stringify(message);
        return messageJson;
        
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

async function fetchFriendRequestAccept(anonymousId) {
    try {
        // Perform the database query
        const message = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM friendRequestAccept WHERE targetAnonymousId = ?', [anonymousId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results); // Resolve with the query results
                }
            });
            // db.query('DELETE FROM friendRequestAccept WHERE targetAnonymousId = ?;', [anonymousId]);
        });
        // Convert the query results to JSON format
        const messageJson = JSON.stringify(message);
        return messageJson; 
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

setupDatabase();

module.exports = {db, friendRequest, fetchMessage, fetchFriendRequestAccept, updateMessage, deleteMessage};
