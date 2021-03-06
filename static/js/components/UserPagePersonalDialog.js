// @flow
import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'react-mdl/lib/Button';

import { personalValidation } from '../util/validation';
import PersonalForm from './PersonalForm';
import ValidationAlert from './ValidationAlert';
import type { Profile, SaveProfileFunc } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

export default class UserPagePersonalDialog extends React.Component {
  props: {
    setUserPageDialogVisibility:  () => void,
    ui:                           UIState,
    profile:                      Profile,
    saveProfile:                  SaveProfileFunc,
    clearProfileEdit:             () => void,
  };

  closePersonalDialog: Function = (): void => {
    const {
      setUserPageDialogVisibility,
      clearProfileEdit,
      profile: { username }
    } = this.props;
    setUserPageDialogVisibility(false);
    clearProfileEdit(username);
  };

  savePersonalInfo: Function = (): void => {
    const { profile, ui, saveProfile } = this.props;
    saveProfile(personalValidation, profile, ui).then(() => {
      this.closePersonalDialog();
    });
  };

  render () {
    const { ui: { userPageDialogVisibility } } = this.props;
    const actions = <ValidationAlert {...this.props}>
      <Button
        type='button'
        className='cancel-button'
        onClick={this.closePersonalDialog}>
        Cancel
      </Button>
      <Button
        type='button'
        className='save-button'
        onClick={this.savePersonalInfo}>
        Save
      </Button>
    </ValidationAlert>;

    return (
      <Dialog
        className="personal-dialog"
        open={userPageDialogVisibility}
        onRequestClose={this.closePersonalDialog}
        actions={actions}
        autoScrollBodyContent={true}>
        <PersonalForm {...this.props} validator={personalValidation} />
      </Dialog>
    );
  }
}
