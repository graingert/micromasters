import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {
  setSignupDialogVisibility,
  setSignupProgram,
} from './actions/ui';
import configureStore from './store/configureStore';
import SignupDialog from './containers/SignupDialog';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const store = configureStore();

const dialogDiv = document.querySelector('#signup-dialog');

const openDialog = () => store.dispatch(setSignupDialogVisibility(true));
window.openDialog = openDialog;

// find the DOM element and attach openDialog to onClick
const logoLink = document.querySelector('a.navbar-brand');

logoLink.onClick = openDialog;

if ( typeof SETTINGS.program === 'number' ) {
  store.dispatch(setSignupProgram(SETTINGS.program));
}

ReactDOM.render(
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <Provider store={store}>
      <SignupDialog />
    </Provider>
  </MuiThemeProvider>,
  dialogDiv
);
