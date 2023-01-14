import React from "react";
import { render } from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import Table from './pages/Table'

render(
    <div className="container">
        <div className="row">
            <div className="col-md-12">
                <BrowserRouter>
                    <ul className="nav nav-tabs">
                        <li><Link to="/table">Table</Link></li>
                        <li><Link to="/drag">Drag</Link></li>
                        <li><Link to="/animation">Animation</Link></li>
                    </ul>
                    <Route path="/table" component={Table} />
                </BrowserRouter>
            </div>
        </div>
    </div>
    , document.querySelector('#root')
)