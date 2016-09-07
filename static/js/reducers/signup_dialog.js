import {
  SET_DIALOG_VISIBILITY,
  SET_PROGRAM
} from '../actions/signup_dialog';

export type SignupState = {
  dialogVisibility: boolean,
  program: ?number,
};

export const INITIAL_SIGNUP_STATE = {
  dialogVisibility: false,
  program: null,
};

export const signupDialog = (state: SignupState = INITIAL_SIGNUP_STATE, action) => {
  switch (action.type) {
  case SET_DIALOG_VISIBILITY:
    return { ...state, dialogVisibility: action.payload };
  case SET_PROGRAM:
    return { ...state, program: action.payload };
  default:
    return state;
  }
};
