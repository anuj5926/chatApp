const mongoose = require('mongoose');

async function DbConnect(url) {
    try {
        await mongoose.connect(url);
        console.log("MongoDb connected");
    } catch (err) {
        console.log("Error:", err);
    }
}

module.exports = {
    DbConnect
};
