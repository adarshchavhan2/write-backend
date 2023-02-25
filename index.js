const express = require('express');
const cors = require('cors');
const app = express();

app.get('/', (req, res)=>{
    res.send('hello boys');
});

app.listen(4000, ()=>{
    console.log('app is working');
});