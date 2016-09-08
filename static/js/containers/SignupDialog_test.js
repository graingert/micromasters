/* global SETTINGS: false */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { assert } from 'chai';
import sinon from 'sinon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import R from 'ramda';
import TestUtils from 'react-addons-test-utils';
import configureTestStore from 'redux-asserts';
import { PROGRAM_ENROLLMENTS } from '../constants';
import MenuItem from 'material-ui/MenuItem';

import { signupDialogStore } from '../store/configureStore';
import { localStorageMock } from '../util/test_utils';
import SignupDialog from './SignupDialog';
import {
  setDialogVisibility,
  setProgram,
} from '../actions/signup_dialog';

let store, listenForActions, dispatchThen, dialog, localStorage;

// mount the component with the test store
const mountDialog = () => (
  mount (
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Provider store={store}>
        <SignupDialog />
      </Provider>
    </MuiThemeProvider>
  )
);

const openDialog = () => store.dispatch(setDialogVisibility(true));

describe('SignupDialog', () => {
  beforeEach(() => {
    if ( window.localStorage === undefined ) {
      window.localStorage = localStorageMock();
    }
    SETTINGS.programs = PROGRAM_ENROLLMENTS;
    store = configureTestStore(signupDialogStore.bind(this, true));
    listenForActions = store.createListenForActions();
    dispatchThen = store.createDispatchThen();
    dialog = mountDialog();
  });

  afterEach(() => {
    window.localStorage.reset();
    delete(SETTINGS.programs);
  });

  it.only('should pull programs from SETTINGS.programs', () => {
    openDialog();
    // console.log(dialog.parents());
    console.log(dialog.parent().find(MenuItem));
    console.log("FOOBAR");
  });

//   it('should update localStorage when ', () => {
//   });

//   it('should pull programs from SETTINGS.programs', () => {
//   });

//   it('should pull programs from SETTINGS.programs', () => {
//   });
});
