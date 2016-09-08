// @flow
/* global require:false, module:false */
import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import persistState from 'redux-localstorage';
import filter from 'redux-localstorage-filter';
import adapter from 'redux-localstorage/lib/adapters/localStorage';

import rootReducer from '../reducers';
import {
  signupDialog,
  INITIAL_SIGNUP_STATE
} from '../reducers/signup_dialog';

const notProd = () => process.env.NODE_ENV !== "production";

const middleware = () =>  {
  let ware = [ thunkMiddleware ];
  if ( notProd() ) {
    ware.push(createLogger());
  }
  return applyMiddleware(...ware);
};

const devTools = () => (
  notProd() && window.devToolsExtension ? window.devToolsExtension() : f => f
);

const createPersistantStore = persistance => compose(
  persistance,
  middleware(),
  devTools()
)(createStore);

const createNormalStore = compose(
  middleware(),
  devTools()
)(createStore);

const createPersistantTestStore = persistance => compose(
  persistance,
)(createStore);

export default function configureStore(initialState: ?Object) {
  const store = createNormalStore(rootReducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');

      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

export const signupDialogStore = (test: boolean = false) => {
  const storage = compose(
    filter(['program']),
  )(adapter(window.localStorage));

  const persistance = persistState(
    storage, 'signupDialogRedux'
  );

  if ( test ) {
    return createPersistantTestStore(persistance)(
      signupDialog, INITIAL_SIGNUP_STATE
    );
  } else {
    return createPersistantStore(persistance)(
      signupDialog, INITIAL_SIGNUP_STATE
    );
  }
};
