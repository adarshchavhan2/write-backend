const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const { connectDb } = require('./config/db');
const { error } = require('./middlewares/error');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

dotenv.config();

connectDb();

const app = express();
const port = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true, origin: FRONTEND_URL, methods:['GET', 'POST', 'PUT', 'DELETE']
}));
    
app.get('/', (req,res)=>{
    res.send(frontend: FRONTEND_URL);
});
    
    // available routes
app.use('/api/v1', userRoutes);
app.use('/api/v1', postRoutes);

app.use(error)
app.listen(port);
