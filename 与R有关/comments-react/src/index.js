import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import CommentApp from './containers/CommentApp';
import commentsReducer from './reducers/comment';
import './index.css';

const store = createStore(commentsReducer);

render(
    <Provider store={store}>
        <CommentApp />
    </Provider>,
    window.root
);