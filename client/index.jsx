import React from 'react';
import ReactDOM from 'react-dom';
import {Router} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from 'routes';

import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import * as reducers from 'reducers';
import promiseMiddleware from '../shared/lib/promiseMiddleware';
import immutifyState from 'lib/immutifyState';
import {fromJS} from 'immutable';


const initialState = immutifyState(window.__INITIAL_STATE__);

const history = createBrowserHistory();

const reducer = combineReducers(reducers);
const store = applyMiddleware(promiseMiddleware)(createStore)(reducer, initialState);


ReactDOM.render (
    <Provider store={store}>
        <Router children={routes} history={history} />
    </Provider>,
    document.getElementById('react-view')
);
