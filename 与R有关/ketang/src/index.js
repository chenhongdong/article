import React from 'react';
import { render } from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Home from './containers/Home';
import Mine from './containers/Mine';
import Profile from './containers/Profile';
import Layout from './containers/Layout';
import Detail from './containers/Detail';
import Login from './containers/Login';
import Reg from './containers/Reg';
import { ConnectedRouter } from 'react-router-redux';
import history from './history';

console.log(history);
render(<Provider store={store}>
    <ConnectedRouter history={history}>
        <Layout>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/mine" component={Mine} />
                <Route path="/profile" component={Profile} />
                <Route path="/detail/:id" component={Detail} />
                <Route path="/login" component={Login} />
                <Route path="/reg" component={Reg} />
            </Switch>
        </Layout>
    </ConnectedRouter>
</Provider>, window.root);