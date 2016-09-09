/* global SETTINGS: false */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { assert } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TestUtils from 'react-addons-test-utils';

import { PROGRAM_ENROLLMENTS } from '../constants';
import { signupDialogStore } from '../store/configureStore';
import { localStorageMock, findReact } from '../util/test_utils';
import SignupDialog from './SignupDialog';
import {
  setDialogVisibility,
  setProgram,
} from '../actions/signup_dialog';

let store, listenForActions, dispatchThen, dialog;

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

const getLocalStorage = () => JSON.parse(window.localStorage.getItem("signupDialogRedux"));

const openDialog = () => store.dispatch(setDialogVisibility(true));

const programSelect = () => document.querySelector('.signup-dialog-select');

describe('SignupDialog', () => {
  beforeEach(() => {
    if ( window.localStorage === undefined ) {
      window.localStorage = localStorageMock();
    }
    SETTINGS.programs = PROGRAM_ENROLLMENTS;
    store = signupDialogStore(true);
    listenForActions = store.createListenForActions();
    dispatchThen = store.createDispatchThen();
    dialog = mountDialog();
  });

  afterEach(() => {
    window.localStorage.reset();
    delete(SETTINGS.programs);
  });

  it('should pull programs from SETTINGS.programs', () => {
    openDialog();

    let renderedSelectOptions = findReact(programSelect()).props.children.map(child => {
      let { value, primaryText } = child.props;
      return { id: value, title: primaryText };
    });

    assert.deepEqual(renderedSelectOptions, SETTINGS.programs);
  });

  it('should update localStorage when selecting a program', () => {
    assert.isNull(getLocalStorage());
    store.dispatch(setProgram(2));
    assert.deepEqual(getLocalStorage(), { program: 2 });
  });

  it('should not update localStorage when opening the dialog', () => {
    assert.isNull(getLocalStorage());
    openDialog();
    assert.deepEqual(getLocalStorage(), {});
  });
});
