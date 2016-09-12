/* global SETTINGS: false */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { assert } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import { PROGRAM_ENROLLMENTS } from '../constants';
import { signupDialogStore } from '../store/configureStore';
import { localStorageMock, findReact } from '../util/test_utils';
import SignupDialog from './SignupDialog';
import {
  setDialogVisibility,
  setProgram,
} from '../actions/signup_dialog';

let store;

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

const getLocalStorage = () => JSON.parse(window.localStorage.getItem("redux"));

const openDialog = () => store.dispatch(setDialogVisibility(true));

const programSelect = () => document.querySelector('.signup-dialog-select');

describe('SignupDialog', () => {
  beforeEach(() => {
    if ( window.localStorage === undefined ) {
      window.localStorage = localStorageMock();
    }
    SETTINGS.programs = PROGRAM_ENROLLMENTS;
    store = signupDialogStore(true);
    mountDialog();
  });

  afterEach(() => {
    window.localStorage.reset();
    delete(SETTINGS.programs);
  });

  const signupDialog = {
    dialogVisibility: false,
    program: null,
  };

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
    let expectation = { signupDialog: { ...signupDialog, program: 2 }};
    assert.deepEqual(getLocalStorage(), expectation);
  });

  it('should update localStorage when opening the dialog', () => {
    assert.isNull(getLocalStorage());
    openDialog();
    let expectation = { signupDialog: { ...signupDialog, dialogVisibility: true } };
    assert.deepEqual(getLocalStorage(), expectation);
  });
});
