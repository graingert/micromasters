import assert from 'assert';
import _ from 'lodash';

import {
  personalValidation,
  educationValidation,
  employmentValidation,
  privacyValidation,
  validateProfile,
  validateProfileComplete,
  validateDay,
  validateMonth,
  validateYear,
} from './validation';
import {
  USER_PROFILE_RESPONSE,
  HIGH_SCHOOL,
} from '../constants';

describe('Profile validation functions', () => {
  describe('Personal validation', () => {
    it('should return an empty object when all fields are present', () => {
      assert.deepEqual({}, personalValidation(USER_PROFILE_RESPONSE));
    });

    it('should return an appropriate error if a field is missing', () => {
      let clone = Object.assign({}, USER_PROFILE_RESPONSE);
      clone.first_name = '';
      assert.deepEqual({first_name: "Given name is required"}, personalValidation(clone));
    });
  });

  describe('Education validation', () => {
    it('should return an empty object when all fields are present', () => {
      assert.deepEqual({}, educationValidation(USER_PROFILE_RESPONSE));
    });

    it('should return an appropriate error if a field is missing', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.education[0].school_name = '';
      let expectation = {education: [{school_name: 'School name is required'}]};
      assert.deepEqual(expectation, educationValidation(clone));
    });

    it('should return an empty object if no education present', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.education = undefined;
      assert.deepEqual({}, educationValidation(clone));
    });

    it('should not validate field_of_study for high school students', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.education[0].degree_name = HIGH_SCHOOL;
      clone.education[0].field_of_study = "";
      assert.deepEqual({}, educationValidation(clone));
    });

    it('should show all fields which are required', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.education[0].school_name = '';
      clone.education[0].school_city = '';
      assert.deepEqual({
        education: [{
          school_name: 'School name is required',
          school_city: 'City is required'
        }]
      }, educationValidation(clone));
    });
  });

  describe('Employment validation', () => {
    it('should return an empty object when all fields are present', () => {
      assert.deepEqual({}, employmentValidation(USER_PROFILE_RESPONSE));
    });

    it('should return an appropriate error if a field is missing', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.work_history[0].company_name = '';
      let expectation = {work_history: [{company_name: 'Company Name is required'}]};
      assert.deepEqual(expectation, employmentValidation(clone));
    });

    it('should return an empty object if no employment present', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.work_history = undefined;
      assert.deepEqual({}, employmentValidation(clone));
    });

    it('should show all fields which are required', () => {
      let clone = _.cloneDeep(USER_PROFILE_RESPONSE);
      clone.work_history[0].company_name = '';
      clone.work_history[0].city = '';
      assert.deepEqual({
        work_history: [{
          city: 'City is required',
          company_name: 'Company Name is required'
        }]
      }, employmentValidation(clone));
    });
  });

  describe('Privacy validation', () => {
    it('should return an empty object when all fields are present', () => {
      assert.deepEqual({}, privacyValidation(USER_PROFILE_RESPONSE));
    });

    it('should return an appropriate error if a field is missing', () => {
      let clone = Object.assign({}, USER_PROFILE_RESPONSE, {account_privacy: ''});
      let expectation = {account_privacy: 'Privacy level is required'};
      assert.deepEqual(expectation, privacyValidation(clone));
    });
  });

  describe("validateProfile", () => {
    let requiredFields = [
      ['first_name'],
      ['last_name'],
      ['preferred_name'],
      ['gender'],
      ['preferred_language'],
      ['city'],
      ['country'],
      ['birth_city'],
      ['birth_country'],
      ['date_of_birth'],
    ];

    let messages = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'preferred_name': 'Preferred Name',
      'gender': 'Gender',
      'preferred_language': 'Preferred language',
      'city': 'City',
      'country': 'Country',
      'birth_city': 'Birth City',
      'birth_country': 'Birth Country',
      'date_of_birth': 'Birth Date',
    };

    it('validates the test profile successfully', () => {
      let errors = validateProfile(USER_PROFILE_RESPONSE);
      assert.deepEqual(errors, {});
    });

    it('validates required fields', () => {
      let profile = {};
      for (let key of requiredFields) {
        profile[key[0]] = '';
      }

      let errors = validateProfile(profile, requiredFields, messages);
      for (let key of requiredFields) {
        let error = errors[key];
        assert.ok(error.indexOf("is required") !== -1);
      }
    });

    it('validates nested fields', () => {
      let profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      _.set(profile, ['work_history', 0, 'city'], '');
      let errors = validateProfile(profile);
      assert.deepEqual({work_history: [ { city: "City is required" } ] }, errors);
    });

    it('correctly validates fields with 0', () => {
      let profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      profile.first_name = 0;
      let errors = validateProfile(profile);
      assert.deepEqual({}, errors);
    });
  });

  describe('validateProfileComplete', () => {
    let profile;
    beforeEach(() => {
      profile = {};
    });

    it('should return fields for an empty profile', () => {
      let errors = Object.assign({}, ...Object.entries({
        'first_name': "Given name",
        'last_name': "Family name",
        'preferred_name': "Preferred name",
        'gender': "Gender",
        'preferred_language': "Preferred language",
        'city': "City",
        'state_or_territory': 'State or Territory',
        'country': "Country",
        'birth_city': 'City',
        'birth_state_or_territory': 'State or Territory',
        'birth_country': "Country",
        'date_of_birth': "Date of birth"
      }).map(([k,v]) => ({[k]: `${v} is required`})));
      const expectation = [false, "/profile/personal", errors];
      assert.deepEqual(validateProfileComplete(profile), expectation);
    });

    it('should return appropriate fields when a field is missing', () => {
      profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      profile['account_privacy'] = '';
      let expectation = [false, "/profile/privacy", {
        account_privacy: 'Privacy level is required'
      }];
      assert.deepEqual(validateProfileComplete(profile), expectation);
    });

    it('should return true when all fields are filled in', () => {
      assert.deepEqual(validateProfileComplete(USER_PROFILE_RESPONSE), [true, null, null]);
    });

    it('should return fields for dialog when a nested field is missing', () => {
      profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      _.set(profile, ['work_history', 0, 'country'], '');
      let expectation = [false, "/profile/professional", {
        work_history: [{country: "Country is required"}]
      }];
      assert.deepEqual(validateProfileComplete(profile), expectation);
    });
  });

  describe('validateMonth', () => {
    it('handles months starting with 0 without treating as octal', () => {
      assert.equal(9, validateMonth("09"));
    });
    it('converts strings to numbers', () => {
      assert.equal(3, validateMonth("3"));
    });
    it('returns undefined for invalid months', () => {
      assert.equal(undefined, validateMonth("-3"));
      assert.equal(undefined, validateMonth("0"));
      assert.equal(1, validateMonth("1"));
      assert.equal(12, validateMonth("12"));
      assert.equal(undefined, validateMonth("13"));
    });
    it('returns undefined if the text is not an integer number', () => {
      assert.equal(undefined, validateMonth(""));
      assert.equal(undefined, validateMonth("two"));
      assert.equal(undefined, validateMonth(null));
      assert.equal(undefined, validateMonth({}));
      assert.equal(undefined, validateMonth(undefined));
      assert.equal(undefined, validateMonth("2e0"));
      assert.equal(undefined, validateMonth("3-4"));
      assert.equal(undefined, validateMonth("3.4"));
    });
  });

  describe('validateYear', () => {
    it('handles years starting with 0 without treating as octal', () => {
      assert.equal(999, validateYear("0999"));
    });
    it('converts strings to numbers', () => {
      assert.equal(3, validateYear("3"));
    });
    it('returns undefined for invalid years', () => {
      assert.equal(undefined, validateYear("-3"));
      assert.equal(undefined, validateYear("0"));
      assert.equal(1, validateYear("1"));
      assert.equal(9999, validateYear("9999"));
      assert.equal(undefined, validateYear("10000"));
    });
    it('returns undefined if the text is not an integer number', () => {
      assert.equal(undefined, validateYear(""));
      assert.equal(undefined, validateYear("two"));
      assert.equal(undefined, validateYear(null));
      assert.equal(undefined, validateYear({}));
      assert.equal(undefined, validateYear(undefined));
      assert.equal(undefined, validateYear("2e0"));
      assert.equal(undefined, validateYear("3-4"));
      assert.equal(undefined, validateYear("3.4"));
    });
  });

  describe('validateDate', () => {
    it('handles dates starting with 0 without treating as octal', () => {
      assert.equal(1, validateDay("01"));
    });
    it('converts strings to numbers', () => {
      assert.equal(3, validateDay("3"));
    });
    it('returns undefined for invalid dates', () => {
      assert.equal(undefined, validateDay("-3"));
      assert.equal(undefined, validateDay("0"));
      assert.equal(1, validateDay("1"));
      assert.equal(31, validateDay("31"));
      assert.equal(undefined, validateDay("32"));
    });
    it('returns undefined if the text is not an integer number', () => {
      assert.equal(undefined, validateDay(""));
      assert.equal(undefined, validateDay("two"));
      assert.equal(undefined, validateDay(null));
      assert.equal(undefined, validateDay({}));
      assert.equal(undefined, validateDay(undefined));
      assert.equal(undefined, validateDay("2e0"));
      assert.equal(undefined, validateDay("3-4"));
      assert.equal(undefined, validateDay("3.4"));
    });
  });
});