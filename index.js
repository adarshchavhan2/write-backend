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
const frontendUrl = process.env.FRONTEND_URL;

app.get('/', (req, res)=> {
    res.send(`<h1>Site is wroking. click to visit frontend.</h1>`);
})

app.use(express.json({
    limit: '50MB'
}));
app.use(
    express.urlencoded({
        extended: true
    })
    );
    app.use(cookieParser());
    app.use(cors({
        origin: frontendUrl,
        credentials: true,
        methods: ["GET","POST","PUT", "DELETE"]
    }));
    
    
    // available routes
app.use('/api/v1', userRoutes);
app.use('/api/v1', postRoutes);

app.use(error)
app.listen(port);
