/* eslint-disable max-len */
/* eslint-disable no-inner-declarations */
/* eslint-disable linebreak-style */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-use-before-define */

import 'bootstrap';
import $ from 'jquery';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom/client';
// eslint-disable-next-line no-unused-vars
import { HMSPrebuilt } from '@100mslive/roomkit-react';

function attachClickHandler() {
  // Remove header and toolbar
  $('[data-testid="header"], [data-testid="footer"], [data-testid="raiseHand_icon_onTile"], [data-testid="participant_audio_mute_icon"], [data-testid="control_bar"]').css('display', 'none');

  // Hide chat, participant list, settings, and other panels
  $('[data-testid="chat"], [data-testid="participants_list"], [data-testid="settings"]').css('display', 'none');

  // Hide extra overlays
  $('[data-testid="preview_screen"], [data-testid="leave_modal"], [data-testid="end_stream_modal"]').css('display', 'none');

  // Hide draggable elements
  $('.hms-ui-c-cRMLUG.hms-ui-c-cRMLUG-ikXnX.GI-css, .hms-ui-c-PJLV.hms-ui-c-PJLV-ikDFfxH-css').css('display', 'none');

  // $('[data-testid="header"], [data-testid="footer"],[data-testid="raiseHand_icon_onTile"],[data-testid="participant_audio_mute_icon"], [data-testid="control_bar"]').remove();

  // // Remove chat, participant list, settings, and other panels
  // $('[data-testid="chat"], [data-testid="participants_list"], [data-testid="settings"]').remove();

  // // Remove extra overlays
  // $('[data-testid="preview_screen"], [data-testid="leave_modal"], [data-testid="end_stream_modal"]').remove();

  // $('.hms-ui-c-PJLV.hms-ui-c-PJLV-ifMLkGL-css.react-draggable', '.hms-ui-c-PJLV.hms-ui-c-PJLV-ikDFfxH-css').remove();

  // Keep only participant tiles and screenshare
  $('[data-testid="participant_tile"], [data-testid="screenshare_tile"]').show();

  $('#name').val('Custom Beam');
  $('.hms-ui-c-jxehuX.hms-ui-c-jxehuX-gbvAgY-variant-primary').trigger('click');
  // $('.hms-ui-c-dhzjXW[data-aria-hidden="true"]').hide();
  $('.hms-ui-c-jxehuX').click();
}

// Initial call to attach the click handler
attachClickHandler();
// Observe changes to the DOM
const observer = new MutationObserver(attachClickHandler);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
$(document).ready(() => {
  const codee = 'gyf-aupc-hjj';
  const options = {
    userName: 'Custom_Beam',
    userId: '1234',
  };
  ReactDOM.createRoot(document.getElementById('videoPart')).render(
    <React.StrictMode>
      <HMSPrebuilt roomCode={codee} options= {options}/>
    </React.StrictMode>,
  );
});
