import configureTestStore from 'redux-asserts';
import { assert } from 'chai';
import sinon from 'sinon';

import { signupDialog } from './signup_dialog';
import {
  setDialogVisibility,
  setProgram,

  SET_DIALOG_VISIBILITY,
  SET_PROGRAM
} from '../actions/signup_dialog';

describe('signup dialog reducer', () => {
  let sandbox, store, dispatchThen;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = configureTestStore(signupDialog);
    dispatchThen = store.createDispatchThen();
  });

  afterEach(() => {
    sandbox.restore();

    store = null;
    dispatchThen = null;
  });

  describe('dialog visibility', () => {
    [true, false].forEach(bool => {
      it(`should let you set dialog visibility to ${bool}`, () => {
        return dispatchThen(setDialogVisibility(bool), [
          SET_DIALOG_VISIBILITY
        ]).then(state => {
          assert.equal(state.dialogVisibility, bool);
        });
      });
    });
  });

  describe('Signup program selection', () => {
    it('should let you set a program id', () => {
      return dispatchThen(setProgram(2), [
        SET_PROGRAM
      ]).then(state => {
        assert.equal(state.program, 2);
      });
    });
  });
});

