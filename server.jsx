import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import {RoutingContext, match} from 'react-router';
import createLocation from 'history/lib/createLocation';

import routes from 'routes';

import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import * as reducers from 'reducers';
import promiseMiddleware from './shared/lib/promiseMiddleware';
import fetchComponentData from './shared/lib/fetchComponentData';

const app = express();


import fs from 'fs';
app.use('/bundle.js', function (req, res) {
    return fs.createReadStream('./dist/bundle.js').pipe(res);
});


app.use((req, res) => {
    const location = createLocation(req.url);
    const reducer = combineReducers(reducers);
    const store = applyMiddleware(promiseMiddleware)(createStore)(reducer);

    match({routes, location}, (err, redirectLocation, renderProps) => {
        if(err) {
            console.error(err);
            return res.status(500).end('Internal server error');
        }
        if(!renderProps) {
            return res.status(404).end('Not found.');
        }

        function renderView() {
            const InitialComponent = (
                <Provider store={store}>
                    <RoutingContext {...renderProps} />
                </Provider>
            );

            const initialState = store.getState();

            const componentHTML = ReactDOM.renderToString(InitialComponent);

            const HTML = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Loki</title>
                        <script type="application/javascript">
                            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
                        </script>
                    </head>
                    <body>
                        <div id="react-view">${componentHTML}</div>
                        <script type="application/javascript" src="/bundle.js"></script>
                    </body>
                </html>
                `;
            return HTML;
        }

        fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
            .then(renderView)
            .then(html => res.end(html))
            .catch(err => res.end(err.message));
    });
});

export default app;
