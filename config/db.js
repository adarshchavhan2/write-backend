const mongoose = require('mongoose');

exports.connectDb = async() => {
    try {
        await mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongoose connected..');
    } catch (error) {
        console.log(error);
    }
}