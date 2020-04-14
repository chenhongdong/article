import { combineReducers } from 'redux';
import home from './home';
import session from './session';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
    home,
    session,
    router: routerReducer
});