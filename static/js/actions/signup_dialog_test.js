// @flow
import {
  setDialogVisibility,
  setProgram,

  SET_DIALOG_VISIBILITY,
  SET_PROGRAM
} from './signup_dialog';
import { assertCreatedActionHelper } from './util';

describe('generated signup dialog action helpers', () => {
  it('should create all action creators', () => {
    [
      [setDialogVisibility, SET_DIALOG_VISIBILITY],
      [setProgram, SET_PROGRAM],
    ].forEach(assertCreatedActionHelper);
  });
});
