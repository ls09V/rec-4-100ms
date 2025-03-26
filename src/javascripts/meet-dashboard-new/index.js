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


$(document).ready(() => { 
  const codee='ecs-zhxk-sjx';
  ReactDOM.createRoot(document.getElementById('videoPart')).render(
    <React.StrictMode>
      <HMSPrebuilt roomCode={codee} options= {options}/>
    </React.StrictMode>,
  );
})