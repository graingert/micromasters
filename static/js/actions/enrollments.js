// @flow
import type { Dispatch } from 'redux';
import { createAction } from 'redux-actions';

import type { Dispatcher } from '../flow/reduxTypes';
import type {
  ProgramEnrollment,
  ProgramEnrollments,
} from '../flow/enrollmentTypes';
import * as api from '../util/api';


export const REQUEST_GET_PROGRAM_ENROLLMENTS = 'REQUEST_GET_PROGRAM_ENROLLMENTS';
export const requestGetProgramEnrollments = createAction(REQUEST_GET_PROGRAM_ENROLLMENTS);

export const RECEIVE_GET_PROGRAM_ENROLLMENTS_SUCCESS = 'RECEIVE_GET_PROGRAM_ENROLLMENTS_SUCCESS';
export const receiveGetProgramEnrollmentsSuccess = createAction(RECEIVE_GET_PROGRAM_ENROLLMENTS_SUCCESS);

export const RECEIVE_GET_PROGRAM_ENROLLMENTS_FAILURE = 'RECEIVE_GET_PROGRAM_ENROLLMENTS_FAILURE';
export const receiveGetProgramEnrollmentsFailure = createAction(RECEIVE_GET_PROGRAM_ENROLLMENTS_FAILURE);

export function fetchProgramEnrollments(): Dispatcher<ProgramEnrollments> {
  return (dispatch: Dispatch) => {
    dispatch(requestGetProgramEnrollments());
    return api.getProgramEnrollments().
      then(enrollments => dispatch(receiveGetProgramEnrollmentsSuccess(enrollments))).
      catch(error => {
        dispatch(receiveGetProgramEnrollmentsFailure(error));
        // the exception is assumed handled and will not be propagated
      });
  };
}

export const REQUEST_ADD_PROGRAM_ENROLLMENT = 'REQUEST_ADD_PROGRAM_ENROLLMENT';
export const requestAddProgramEnrollment = createAction(REQUEST_ADD_PROGRAM_ENROLLMENT);

export const RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS = 'RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS';
export const receiveAddProgramEnrollmentSuccess = createAction(RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS);

export const RECEIVE_ADD_PROGRAM_ENROLLMENT_FAILURE = 'RECEIVE_ADD_PROGRAM_ENROLLMENT_FAILURE';
export const receiveAddProgramEnrollmentFailure = createAction(RECEIVE_ADD_PROGRAM_ENROLLMENT_FAILURE);

export const addProgramEnrollment = (programId: number): Dispatcher<ProgramEnrollment> => {
  return (dispatch: Dispatch) => {
    dispatch(requestAddProgramEnrollment(programId));
    return api.addProgramEnrollment(programId).
      then(enrollment => dispatch(receiveAddProgramEnrollmentSuccess(enrollment))).
      catch(error => {
        dispatch(receiveAddProgramEnrollmentFailure(error));
        // the exception is assumed handled and will not be propagated
      });
  };
};

export const CLEAR_ENROLLMENTS = 'CLEAR_ENROLLMENTS';
export const clearEnrollments = createAction(CLEAR_ENROLLMENTS);

export const SET_CURRENT_PROGRAM_ENROLLMENT = 'SET_CURRENT_PROGRAM_ENROLLMENT';
export const setCurrentProgramEnrollment = createAction(SET_CURRENT_PROGRAM_ENROLLMENT);
