// @flow
/* global SETTINGS: false */
import React from 'react';
import Dialog from 'material-ui/Dialog';
import { connect } from 'react-redux';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import R from 'ramda';

import {
  setSignupDialogVisibility,
  setSignupProgram,
} from '../actions/ui';

type signupProps = {
  open:                 boolean,
  program:              number,
  setDialogVisibility:  (b: boolean) => void,
  setSignupProgram:     (n: number) => void,
};

const dialogStyle = {
  maxWidth: '500px',
};

const menuItems = R.map(program => (
  <MenuItem value={program.id} key={program.id} primaryText={program.title} />
));


const selectProgram = (setSignupProgram, program) => (
  <SelectField
    style={{width: "95%"}}
    hintText="Select"
    onChange={setSignupProgram}
    value={program}
  >
    { menuItems(SETTINGS.programs) }
  </SelectField>
);

const SignupDialog = ({
  open,
  program,
  setDialogVisibility,
  setSignupProgram
}: signupProps) => {
  return <Dialog
    open={open}
    className="signup-dialog-wrapper"
    onRequestClose={() => setDialogVisibility(false)}
    contentStyle={dialogStyle}
    autoScrollBodyContent={true}
  >
    <div className="signup-dialog">
      <div className="logos">
        <img src="/static/images/edx_logo.png" />
        <img src="/static/images/mit_logo_grey_red.png" />
      </div>
      <span>
        The MIT MicroMasters program is powered by edX.
        To sign up for a MIT MicroMasters program you need an edX account.
      </span>
      <div className="program-select">
        Which MicroMasters program are you signing up for?
        { selectProgram(setSignupProgram, program) }
      </div>
      <a className="mm-button signup" href="/login/edxorg">
        Continue with edX
      </a>
      <div className="terms-of-service-text">
        By clicking "Continue with edX" I certify that I agree with
        <a href="/terms_of_service" target="_blank">
          {" MIT MicroMasters Terms of Service. "}
        </a>
        Read our
        <a
          href="http://web.mit.edu/referencepubs/nondiscrimination/index.html" 
          target="_blank"
        >
          { " Nondiscrimination Policy." }
        </a>
      </div>
    </div>
  </Dialog>;
};

const mapStateToProps = state => ({
  open: state.ui.signupDialogVisibility,
  program: state.ui.signupProgram,
});

const setSignupProgramLS = id => window.localStorage.setItem("programId", id);

const mapDispatchToProps = dispatch => {
  const setSignupProgramHelper = (e,k,v) => {
    setSignupProgramLS(v);
    dispatch(setSignupProgram(v));
  };

  return {
    setDialogVisibility: visible => dispatch(setSignupDialogVisibility(visible)),
    setSignupProgram: setSignupProgramHelper,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignupDialog);
