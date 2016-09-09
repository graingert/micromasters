// @flow
// actions for the signup dialog on the home and program pages
import { createAction } from 'redux-actions';

export const SET_DIALOG_VISIBILITY = 'SET_DIALOG_VISIBILITY';
export const setDialogVisibility = createAction(SET_DIALOG_VISIBILITY);

export const SET_PROGRAM = 'SET_PROGRAM';
export const setProgram = createAction(SET_PROGRAM);
