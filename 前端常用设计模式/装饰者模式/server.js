const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.all('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    next();
});

app.post('/login', (req, res) => {
    
    console.log(req.body);

    
    res.json({
        code: 0
    });
});

app.listen(7777);