/* global document: false, window: false */
import '../global_init';

import ReactDOM from 'react-dom';
import { assert } from 'chai';
import _ from 'lodash';

import Navbar from '../components/Navbar';
import { CLEAR_DASHBOARD } from '../actions';
import {
  RECEIVE_DASHBOARD_SUCCESS,
} from '../actions';
import {
  RECEIVE_GET_USER_PROFILE_SUCCESS,
  CLEAR_PROFILE,
  START_PROFILE_EDIT,
  UPDATE_PROFILE_VALIDATION,
} from '../actions/profile';
import {
  CLEAR_ENROLLMENTS,
  RECEIVE_GET_PROGRAM_ENROLLMENTS_FAILURE,
  REQUEST_ADD_PROGRAM_ENROLLMENT,
  RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS,
  RECEIVE_ADD_PROGRAM_ENROLLMENT_FAILURE,
} from '../actions/enrollments';
import * as enrollmentActions from '../actions/enrollments';
import {
  CLEAR_UI,
  SET_PROFILE_STEP,
} from '../actions/ui';
import * as uiActions from '../actions/ui';
import {
  USER_PROFILE_RESPONSE,
  PERSONAL_STEP,
  EDUCATION_STEP,
  EMPLOYMENT_STEP,
  PRIVACY_STEP,
} from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';
import * as api from '../util/api';

describe('App', () => {
  let listenForActions, renderComponent, helper;
  let editProfileActions, addProgramEnrollmentStub;

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
    editProfileActions = [
      START_PROFILE_EDIT,
      UPDATE_PROFILE_VALIDATION,
      SET_PROFILE_STEP,
    ];
    addProgramEnrollmentStub = helper.sandbox.stub(api, 'addProgramEnrollment');
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('clears profile, ui, enrollments, and dashboard after unmounting', () => {
    return renderComponent("/dashboard").then(([, div]) => {
      return listenForActions([CLEAR_DASHBOARD, CLEAR_PROFILE, CLEAR_UI, CLEAR_ENROLLMENTS], () => {
        ReactDOM.unmountComponentAtNode(div);
      });
    });
  });

  describe('program enrollments', () => {
    let setLocalStorage = id => {
      window.localStorage.setItem("signupDialogRedux", JSON.stringify({program: id}));
    };

    describe('adding a new program enrollment', () => {
      let newEnrollment = [{id: 2, title: 'A new program'}];

      beforeEach(() => {
        addProgramEnrollmentStub.returns(Promise.resolve(newEnrollment));
        setLocalStorage(2);
      });

      it('should call the API if a program ID is present', () => {
        return renderComponent('/dashboard', [
          REQUEST_ADD_PROGRAM_ENROLLMENT,
          RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS
        ]).then(() => {
          assert(addProgramEnrollmentStub.calledWith(2), "API should be called");
        });
      });

      it('should retrieve the program id from localStorage', () => {
        return renderComponent('/dashboard', [
          REQUEST_ADD_PROGRAM_ENROLLMENT,
          RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS
        ]).then(() => {
          assert(
            window.localStorage.getItem.calledWith("signupDialogRedux"),
            "getItem should be called with 'programId'"
          );
        });
      });

      it('should delete the program id from localStorage if there is no API error', () => {
        return renderComponent('/dashboard', [
          REQUEST_ADD_PROGRAM_ENROLLMENT,
          RECEIVE_ADD_PROGRAM_ENROLLMENT_SUCCESS
        ]).then(() => {
          assert(
            window.localStorage.removeItem.calledWith("signupDialogRedux"),
            "removeItem should be called to remove 'programId'"
          );
        });
      });

      it('should delete the program id if the API returns a 404', () => {
        addProgramEnrollmentStub.returns(Promise.reject({errorStatusCode: 404}));

        return renderComponent('/dashboard', [
          REQUEST_ADD_PROGRAM_ENROLLMENT,
          RECEIVE_ADD_PROGRAM_ENROLLMENT_FAILURE,
        ]).then(() => {
          assert(
            window.localStorage.removeItem.calledWith("signupDialogRedux"),
            "removeItem should be called to remove 'programId'"
          );
        });
      });

      describe('error handling', () => {
        let cStub;
        beforeEach(() => {
          cStub = helper.sandbox.stub(console, 'error');
        });

        afterEach(() => {
          cStub.restore();
        });

        it.only('should raise an error if the API returns a different error', () => {
          addProgramEnrollmentStub.returns(Promise.reject({errorStatusCode: 500}));

          return renderComponent('/dashboard', [
            REQUEST_ADD_PROGRAM_ENROLLMENT,
            RECEIVE_ADD_PROGRAM_ENROLLMENT_FAILURE,
          ]).then(() => {
            assert(console.error.calledWith( // eslint-disable-line no-console
              "adding program enrollment failed for program: ", 2
            ), "should be called with correct argument");
          });
        });
      });
    });

    it('should not call the API if there is no program ID in localStorage', () => {
      return renderComponent('/dashboard').then(() => {
        assert(addProgramEnrollmentStub.notCalled, "API should not have been called");
      });
    });
  });

  describe('profile completeness', () => {
    let checkStep = () => helper.store.getState().ui.profileStep;

    it('redirects to /profile if profile is not complete', () => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        first_name: undefined
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile");
        assert.equal(checkStep(), PERSONAL_STEP);
      });
    });

    it('redirects to /profile if profile is not filled out', () => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        filled_out: false
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard").then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile");
        assert.equal(checkStep(), PERSONAL_STEP);
      });
    });

    it('redirects to /profile and goes to the employment step if a field is missing there', () => {
      let profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      profile.work_history[1].city = "";

      helper.profileGetStub.returns(Promise.resolve(profile));
      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile");
        assert.equal(checkStep(), EMPLOYMENT_STEP);
      });
    });

    it('redirects to /profile and goes to the privacy step if a field is missing there', () => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        account_privacy: ''
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile");
        assert.equal(checkStep(), PRIVACY_STEP);
      });
    });

    it('redirects to /profile and goes to the education step if a field is missing there', () => {
      let response = _.cloneDeep(USER_PROFILE_RESPONSE);
      response.education[0].school_name = '';
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile");
        assert.equal(checkStep(), EDUCATION_STEP);
      });
    });
  });

  describe('enrollments', () => {
    it('shows an error message if the enrollments GET fetch fails', () => {
      helper.enrollmentsGetStub.returns(Promise.reject());
      let types = [
        RECEIVE_DASHBOARD_SUCCESS,
        RECEIVE_GET_USER_PROFILE_SUCCESS,
        RECEIVE_GET_PROGRAM_ENROLLMENTS_FAILURE,
      ];
      return renderComponent("/dashboard", types, false).then(([wrapper]) => {
        let text = wrapper.find('.page-content').text();
        assert(text.includes("Sorry, we were unable to load the data"));
      });
    });

    it('setEnrollDialogVisibility dispatches the value to the action with the same name', () => {
      return renderComponent("/dashboard").then(([wrapper]) => {
        let props = wrapper.find(Navbar).props();
        let stub = helper.sandbox.stub(uiActions, 'setEnrollDialogVisibility');
        stub.returns({type: "fake"});
        props.setEnrollDialogVisibility("value");
        assert(stub.calledWith("value"));
      });
    });

    it('setEnrollSelectedProgram dispatches the value to the action with the same name', () => {
      return renderComponent("/dashboard").then(([wrapper]) => {
        let props = wrapper.find(Navbar).props();
        let stub = helper.sandbox.stub(uiActions, 'setEnrollSelectedProgram');
        stub.returns({type: "fake"});
        props.setEnrollSelectedProgram("value");
        assert(stub.calledWith("value"));
      });
    });

    it('setCurrentProgramEnrollment dispatches the value to the action with the same name', () => {
      return renderComponent("/dashboard").then(([wrapper]) => {
        let props = wrapper.find(Navbar).props();
        let stub = helper.sandbox.stub(enrollmentActions, 'setCurrentProgramEnrollment');
        stub.returns({type: "fake"});
        props.setCurrentProgramEnrollment("value");
        assert(stub.calledWith("value"));
      });
    });
  });
});
