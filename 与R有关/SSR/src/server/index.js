import React, { Component } from 'react';
import Home from '../containers/Home';
import { renderToString } from 'react-dom/server';

const express = require('express');
const app = express();

app.get('/', function (req, res) {
    let html = renderToString(<Home />);
    console.log(html);

    res.send(`
        <html>
            <head>
                <title>React SSR</title>
            </head>
            <body>
                <div id="root">${html}</div>
            </body>
        </html>
    `)
});

app.listen(4000);