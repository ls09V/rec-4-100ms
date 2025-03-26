/* eslint-disable max-len */
/* eslint-disable no-inner-declarations */
/* eslint-disable linebreak-style */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-use-before-define */

import 'bootstrap';
import $ from 'jquery';
import '../../stylesheets/common/importers/_bootstrap.scss';
import '../../stylesheets/common/importers/_plyr.scss';
import '../../stylesheets/common/importers/_fontawesome.scss';
import 'jbox/dist/jBox.all.css';
import 'lazysizes';
import Quill from 'quill';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import io from 'socket.io-client';
import { DateTime } from 'luxon';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom/client';
// eslint-disable-next-line no-unused-vars
import { HMSPrebuilt } from '@100mslive/roomkit-react';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import openInImage from '../../images/recordings/openInImage.png';

import {
  getQueryStringVal, getSession, checkSession, customPost, setSession,
} from '../common/steroid';

const sentSound = new Audio('build/audios/send.mp3');
const receivedSound = new Audio('build/audios/receive.mp3');
let sTime;
let eTime;
let endTime;
let startTime;
let renderErrorFlag = false;
let ajaxFailuremodal = false;
let sessionInvalidModal = false;
let meetingType = '';
let adminOrHost = false;
let timez = '';
const { API_PATH } = process.env;

const { SOCKET_URL } = process.env;
// localStorage.setItem('isMeetExtendModalShown', false);
const socket = io(`${SOCKET_URL}/chat`, {
  query: {
    token: localStorage.getItem('userId'),
    class_id: getQueryStringVal('session'),
    role: localStorage.getItem('role'),
    email: localStorage.getItem('email'),
    isAdmin: localStorage.getItem('admin'),
  },
});

setSession('class_id', getQueryStringVal('session'));

let srcVal = '';
let width = '95';
if (localStorage.getItem('product') === 'hackerkid') {
  const titleElement = document.querySelector('title');
  titleElement.innerText = 'HackerKID | WebinarClass';
  const faviconElement = document.querySelector('link[rel="icon"]');
  faviconElement.href = 'build/images/favicons/hackerkid-favicon.ico';
  $('#logout').text('Go to my Dashboard');
  $('.nav').addClass('hackerkid');
  srcVal = 'build/images/common/HackerKID.png';
  $('.head-guvi-logo').css('padding', '14px');
  width = '156';
  checkSession('hackerkid');
} else {
  checkSession('guvi');
}
function showToast(message, background) {
  const toast = $('<div>')
    .addClass('toast slide-in-from-left text-center') // Add slide-in class
    .css({
      background,
      color: 'white',
    })
    .attr('role', 'alert')
    .attr('aria-live', 'assertive')
    .attr('aria-atomic', 'true')
    .html(`<div class="toast-body"><span><i class="fas fa-exclamation-circle mr-1"></i></span>${message}</div>`);

  $('#toast-container').append(toast);
  toast.fadeIn();

  setTimeout(() => {
    toast.fadeOut(() => {
      toast.remove();
    });
  }, 2000);
}
function renderAjaxFailureModalContent(title, message, isRedirect = false, redirectUrl = '') {
  $('#exampleModalLabel').text(title);
  $('.modal-body p').text(message);

  if (isRedirect) {
    $('#modal-action-btn').text('Okay');
    $('.modal-body p').addClass('sessionInvalidText');
    $('#modal-action-btn').off('click').on('click', () => {
      window.location.href = redirectUrl;
    });
    $('.reloadBtn').off('click').on('click', () => {
      window.location.href = redirectUrl;
    });
  } else {
    $('.modal-body p').removeClass('sessionInvalidText');
    $('#modal-action-btn').text('Reload');
    $('#modal-action-btn').off('click').on('click', () => {
      window.location.reload();
    });
  }

  $('#ajaxFailureModal').modal({
    backdrop: 'static',
    keyboard: false,
  });
}
function claculateVideoSize(selector) {
  const videoWidth = $('.video-box-parent').width();
  const videoHeight = videoWidth * 0.7;
  $(selector).css({
    width: videoWidth,
    height: videoHeight,
  });
}

let typingTimer;
let classNotes;
// Wait for the CKEditor instance to be ready
ClassicEditor
  .create(document.querySelector('#editor2'))
  .then((editor) => {
    classNotes = editor;
    $('.ck-content').on('mouseenter', () => {
    // Set up an event listener for content changes in the CKEditor instance
      classNotes.model.document.on('change:data', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          const contents = classNotes.getData();
          const session = getQueryStringVal('session');
          if (contents.trim() !== '' && session) {
            $('.saveNotesDiv').css('visibility', 'visible');
            customPost({ session, notes: contents.trim() }, 'getNotes').then(() => {
            // Code to execute after the content change is detected and processed
              $('.saveNotesDiv').css('visibility', 'hidden');
            }).catch(() => {
              $('.saveNotesDiv').css('visibility', 'hidden');
              if (!ajaxFailuremodal) {
                showToast('Something went wrong, unable to get/save notes, try again later', '#e05656');
              }
            });
          }
        }, 1000);
      });
    });
  })
  .catch((error) => {
    console.error(error);
  });
// const quill1 = new Quill('#editor2', {
//   theme: 'snow',
// });
// let typingTimer;

// $('#editor2').on('mouseenter', () => {
//   quill1.on('text-change', () => {
//     clearTimeout(typingTimer);
//     typingTimer = setTimeout(() => {
//       const contents = quill1.root.innerHTML;
//       const session = getQueryStringVal('session');
//       if (contents.trim() !== '' && session) {
//         $('#loader-notes').removeClass('d-none');
//         customPost({ session, notes: contents.trim() }, 'getNotes').then(() => {
//         // Code to execute after the content change is detected and processed
//           $('#loader-notes').addClass('d-none');
//         });
//       }
//     }, 1000);
//   });
// });

function disableCameraAndMicrophone() {
  // Request media access
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      // Get all tracks (both video and audio) and stop them
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      // eslint-disable-next-line no-param-reassign
      stream = null;
    })
    .catch((err) => {
      console.error('Error accessing camera/microphone: ', err);
    });
}

function toggleTheme() {
  if (localStorage.getItem('hmsTheme') === 'dark-theme') {
    $('#darkMode').addClass('d-none');
    $('#lightMode').removeClass('d-none');
    $('.head-guvi-logo img').attr('src', 'build/images/common/guvilogodark.svg');
    $('#logo-admin-sidebar').attr('src', 'build/images/common/guvilogodark.svg');
  } else {
    $('#darkMode').removeClass('d-none');
    $('#lightMode').addClass('d-none');
    $('.head-guvi-logo img').attr('src', 'build/images/common/guvinewlogo.svg');
    $('#logo-admin-sidebar').attr('src', 'build/images/common/guvinewlogo.svg');
  }
}

function renderVideo() {
  customPost({ session: `${getQueryStringVal('session')}` }, 'getMeetDetails').then((response) => {
    if (!response.access && response.message === 'No access') {
      renderAjaxFailureModalContent(
        'No access',
        'You do not have access to this class. Please contact the adminstrator/mentor for further details.',
        true,
        'https://classify.zenclass.in/',
      );
      sessionInvalidModal = true;
      return;
    }
    if (!response.access && response.status === '401 unauthorized') {
      renderAjaxFailureModalContent(
        'Session Invalid',
        'Your session has expired, log in and try again.',
        true,
        'https://classify.zenclass.in/',
      );
      sessionInvalidModal = true;
      return;
    }
    // // window.location.href = './classes';

    ajaxFailuremodal = false;
    localStorage.setItem('chatUsername', response.name);

    socket.emit('dropDown', {
      email: localStorage.getItem('email'),
      chatUsername: localStorage.getItem('chatUsername') === '' ? localStorage.getItem('userName') : localStorage.getItem('chatUsername'),
      userType: response.userType,
    });
    // startTime = response.data.start_time;
    // endTime = response.data.end_time;
    // sTime = response.data.start_time;
    // eTime = response.data.end_time;
    timez = 'Asia/Kolkata';
    startTime = convertToTimeZoneUnixTime(response.data.start_time, timez);
    endTime = convertToTimeZoneUnixTime(response.data.end_time, timez);
    sTime = convertToTimeZoneUnixTime(response.data.start_time, timez);
    eTime = convertToTimeZoneUnixTime(response.data.end_time, timez);
    meetingType = response.data.meetingType;
    adminOrHost = response.data.hosts.some((host) => host.email === localStorage.getItem('email')) || response.userType === 'admin';
    // const session = getQueryStringVal('session');
    let currentTime = getCurrentTimeInTimezone('Asia/Kolkata');
    const curreTime = getCurrentTimeInTimezone('Asia/Kolkata');
    if (curreTime < startTime) {
      $('#spinner-container').addClass('d-none');
      $('#videoPart').addClass('d-none');
      $('.chat-card').addClass('d-none');
      const date = DateTime.fromSeconds(response.data.start_time).setZone('Asia/Kolkata');
      const time = date.toFormat('h:mm a');
      $('#alertTitle').text('You are early to the meet!!');
      $('#alertBody').text(`The meet will begin at ${time}... Plese make sure to enter at that time`);
      $('#switchAlertModal').modal({
        backdrop: 'static',
      });
      // $('#page').addClass('d-none');

      $('.close').click(() => {
        const prod = localStorage.getItem('product');
        if (prod === 'guvi') {
          window.location.href = '/classes';
        } else if (prod === 'hackerkid') {
          window.location.href = '/classes';
        }
      });
      $('#meet-okay_btn').click(() => {
        const prod = localStorage.getItem('product');
        if (prod === 'guvi') {
          window.location.href = '/classes';
        } else if (prod === 'hackerkid') {
          window.location.href = '/classes';
        }
      });
      return;
    }
    $('#navigateBtn').removeClass('d-none');
    // eslint-disable-next-line max-len
    if (response.data.studentCode || response.data.hostCode || response.data.studentRoleInMeetCode) {
      const emailToCheck = localStorage.getItem('email');
      const foundItem = response.data.batch_data.find((item) => item.email === emailToCheck);

      $('#videoPart').removeClass('col-md-5');
      $('#chatPart').removeClass('col-md-7');
      $('#videoPart').addClass('col-md-8');
      $('#chatPart').addClass('col-md-4');
      $('#spinner-container').addClass('d-none');
      if (currentTime >= startTime && currentTime <= endTime) {
        $('#chat-nav').addClass('nav-live');
        async function renderComponent() {
          try {
            const options = {
              userName: localStorage.getItem('chatUsername'),
              userId: response.attendance_hash,
            };
            if (response.userType === 'student' || (response.userType === 'admin' && typeof foundItem !== 'undefined')) {
              if (response.data.studentRoleInMeetCode && response.data.studentCode === response.data.studentRoleInMeetCode) {
                ReactDOM.createRoot(document.getElementById('videoPart')).render(
                  <React.StrictMode>
                    <HMSPrebuilt roomCode={response.data.studentCode} options= {options}/>
                  </React.StrictMode>,
                );
              } else if (response.data.studentRoleInMeetCode) {
                ReactDOM.createRoot(document.getElementById('videoPart')).render(
                  <React.StrictMode>
                    <HMSPrebuilt roomCode={response.data.studentRoleInMeetCode} options= {options}/>
                  </React.StrictMode>,
                );
              }
            } else if ((response.userType === 'admin' && typeof foundItem === 'undefined') || response.userType === 'host') {
              ReactDOM.createRoot(document.getElementById('videoPart')).render(
                <React.StrictMode>
                  <HMSPrebuilt roomCode={response.data.hostCode} options= {options}/>
                </React.StrictMode>,
              );
            }
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            const checkForInactiveRoom = async () => {
              // Wait for 1 second (or adjust the duration as needed)
              await delay(1000);

              const inactiveRoomElement = document.querySelector('.hms-ui-c-iwOMvD');
              console.log(inactiveRoomElement);
              if (inactiveRoomElement && inactiveRoomElement.textContent.includes('Psst! This room is currently inactive.')) {
                renderAjaxFailureModalContent(
                  'Something went wrong',
                  'Something is temporarily wrong. Please make sure you are connected to the internet and then reload your browser',
                );
                $('#ajaxFailureModal').modal('show');
                $('#spinner-container').addClass('d-none');
                renderErrorFlag = true;
                $('#page').addClass('d-none');
              }
            };
            await checkForInactiveRoom();

            if (response.data.recording_autoStart === 'false') {
              const reqData = {
                session: getQueryStringVal('session'),
                product: localStorage.getItem('product'),
                authtoken: localStorage.getItem('authToken'),
              };

              customPost(reqData, 'start-hms-recording')
                .then((data) => {
                  if (!data.access) {
                    if (response.userType === 'host' || response.userType === 'admin') {
                      showToast('Unable to automatically start recording, please try manually', '#e05656');
                    }
                  }
                })
                .catch((err) => {
                  console.log('err', err);
                  if (response.userType === 'host' || response.userType === 'admin') {
                    showToast('Unable to automatically start recording, please try manually', '#e05656');
                  }
                });
            }
          } catch (error) {
            console.log('Error rendering the component:', error);
          }
        }
        (async function main() {
          await renderComponent();
          if (localStorage.getItem('hmsTheme') === 'dark-theme') {
            setTheme('dark-theme');
          } else {
            setTheme('light-theme');
          }
          toggleTheme();
          if (response.data.enable_chat === 'off') {
            // $('.livechat').addClass('d-none');
            // $('.endedchat').removeClass('d-none');
            // $('.endedchat').addClass('chat-off');
            $('.chatAvailable').addClass('d-none');
            $('.chatUnavailable').removeClass('d-none');
          }
          if (!renderErrorFlag) {
            $('#page').removeClass('d-none');
            $('#chatPart').removeClass('d-none');
            $('.video-box').removeClass('d-none');
          } else {
            $('.row').addClass('d-none');
          }
        }());
        setTimeout(() => {
          // Define the elements to be added once
          const labelDiv = `
              <div class="labelDiv">
                <div class="labelTitle" title="${response.data.label}">${response.data.label}</div>
                <div class="lableRightDiv">
                <div class="themeToggleDiv">
                  <i id="lightMode" class="bi bi-brightness-alt-high" title="Switch to Light mode"></i>
                  <i id="darkMode" class="bi bi-moon" title="Switch to Dark Mode"></i>
                </div>
                <div class="copyLinkDiv" title="Copy meet link"><i class="bi bi-share"></i> Share</div>
                </div>
              </div>
              `;

          // Append the label div once
          $('#videoPart').append(labelDiv);
          toggleTheme();
        }, 1000);
      }

      // if and check for also ended live or not when the live button is triggered
      // if (currentTime >= startTime && currentTime <= endTime) {
      //   customPost({
      //     session, timestamp: currentTime, reqfor: 'storing', type: 'meet',
      //   }, 'attendance').then((resp) => {
      //     if (!resp.access) {
      //       // window.location.href = './';
      //     }
      //     if (resp.message === 'Already ended' && resp.endTime > 0) {
      //       endTime = resp.endTime;
      //       disableCameraAndMicrophone();
      //     }
      //   }).catch((err) => {
      //     console.log('err in ajax call request', err);
      //   });
      // }
      // dont execute the setinterval if class ends while entering the page
      if (currentTime >= startTime && currentTime <= endTime) {
        let intervalTime = 6000;
        const checkEndtime = () => {
          currentTime = getCurrentTimeInTimezone('Asia/Kolkata');
          if (currentTime >= startTime && currentTime <= endTime && intervalTime === 6000) {
            // customPost({
            //   session, timestamp: Math.floor(currentTime.toSeconds()), reqfor: 'storing', type: 'meet',
            // }, 'attendance').then((resp) => {
            //   if (!resp.access) {
            //     window.location.href = './';
            //   }
            //   if (resp.message === 'Already ended' && resp.endTime > 0) {
            //     endTime = resp.endTime;
            //     disableCameraAndMicrophone();
            //   }
            // }).catch((err) => {
            //   console.log('err in ajax call request', err);
            // });
          }

          const remainingTime = endTime - currentTime;
          if (remainingTime < 60) {
            intervalTime = 1000;
          }

          if (currentTime > startTime && currentTime > endTime) {
            $('#page').removeClass('d-none');
            $('#chatPart').removeClass('d-none');
            $('.video-box').removeClass('d-none');
            $('#videoPart').removeClass('col-md-8');
            $('#chatPart').removeClass('col-md-4');
            $('#videoPart').addClass('col-md-4');
            $('#chatPart').addClass('col-md-8');
            $('.nav-arrow').addClass('nav-arrow-meet-ended');
            $('.record').removeClass('d-none');
            $('.nav .nav-link').addClass('nav-link-not-live');
            $('#chat-nav').removeClass('nav-live');
            $('#meetExtendModal').modal('hide');
            let meetLabel = `"${response.data.label}"`;
            if (response.data.label === '') {
              meetLabel = 'Live session';
            }
            $('.labelTitle').addClass('d-none');
            $('#videoPart').empty().html(`
            <div id="if-ended" class="d-none">
            <div class='copyLinkDiv' title='Copy meet link'><i class="bi bi-share"></i> Share</div>
            <div class="endedText">
            <p>${meetLabel} has <span>Ended.</span></p>
            </div>
            </div>
          `);
            $('#if-ended').removeClass('d-none');
            // $('.livechat').addClass('d-none');
            // $('.endedchat').removeClass('d-none');
            $('.labelDiv').addClass('d-none');
            // $('#meetExtendModal').remove();
            // localStorage.setItem('isMeetExtendModalShown', 'false');
            const obj = {
              classID: localStorage.getItem('class_id'),
              email: localStorage.getItem('email'),
              role: localStorage.getItem('role'),
            };
            if (response.data.enable_chat === 'on') {
              if (socket.connected) {
                $('#chatloadAlert').removeClass('show').addClass('d-none');
                socket.emit('getcontents', obj);
              } else {
                $('#chatloadAlert').removeClass('d-none').addClass('show');
              }
            }
          }
        };

        setInterval(() => {
          checkEndtime();
        }, intervalTime);
      }
      // Listen for endTime updates
      // attendance
      $(document).ready(() => {
        if (currentTime > startTime && currentTime > endTime) {
          $('#page').removeClass('d-none');
          $('#chatPart').removeClass('d-none');
          $('.video-box').removeClass('d-none');
          $('#videoPart').removeClass('col-md-8');
          $('#chatPart').removeClass('col-md-4');
          $('#videoPart').addClass('col-md-4');
          $('#chatPart').addClass('col-md-8');
          $('.prebuilt-container').addClass('d-none');
          $('#if-ended').removeClass('d-none');
          // $('.livechat').addClass('d-none');
          $('.endedchat').removeClass('d-none');
          $('.nav .nav-link').addClass('nav-link-not-live');
          $('.nav-arrow').addClass('nav-arrow-meet-ended');
          $('.record').removeClass('d-none');
          $('#meetExtendModal').modal('hide');
          $('#chat-nav').removeClass('nav-live');
          $('.labelDiv').addClass('d-none');
          let meetLabel = `"${response.data.label}"`;
          if (response.data.label === '') {
            meetLabel = 'Live session';
          }
          $('#videoPart .endedText').html(`
            <div class='copyLinkDiv' title='Copy meet link'><i class="bi bi-share"></i> Share</div>
            <div class="endedText">
            <p>${meetLabel} has <span>Ended.</span></p>
            </div>
            </div>
            `);
          // localStorage.setItem('isMeetExtendModalShown', 'false');

          const obj = {
            classID: localStorage.getItem('class_id'),
            email: localStorage.getItem('email'),
            role: localStorage.getItem('role'),
          };
          if (response.data.enable_chat === 'on') {
            if (socket.connected) {
              $('#chatloadAlert').removeClass('show').addClass('d-none');
              socket.emit('getcontents', obj);
            } else {
              $('#chatloadAlert').removeClass('d-none').addClass('show');
            }
          }
        }
      });
    } else {
      // window.location.href = '/classes';
    }

    function calculateTimeDifference(atime) {
      const currTime = getCurrentTimeInTimezone('Asia/Kolkata');
      const timeDiff = atime - currTime;
      const fiveMinutes = 5 * 60;

      if (timeDiff <= fiveMinutes && timeDiff > 0) {
        showMeetExtendModal(atime);
      }
    }

    function showMeetExtendModal(atime) {
      const emailToCheck = localStorage.getItem('email');
      const foundItem = response.data.batch_data.find((item) => item.email === emailToCheck);
      if (!foundItem && (getSession('role') === 'ment' || getSession('admin') === 'true')) {
        const date = new Date(atime * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const time = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
        $('#meetExtendModal #alertTitle').text(`Alert!!! Meet will be ending at ${time}`);
        $('#meetExtendModal #alertBody').text(`The Meet is scheduled to end at ${time}`);
        $('#meetExtendModal').modal({
          backdrop: 'static',
        });

        $('#notifyOkBtn').click(() => {
          $('#meetExtendModal').modal('hide');
        });
      }
    }

    const totalClassTime = endTime - startTime;
    const fiveMinutes = 5 * 60;

    if (totalClassTime > fiveMinutes) {
      const endTimeNew = endTime - fiveMinutes;
      const delay = (endTimeNew * 1000) - new Date().getTime();
      if (delay < 0) {
        calculateTimeDifference(endTime);
      }
      if (delay > 0) {
        setTimeout(() => {
          calculateTimeDifference(endTime);
        }, delay);
      }
    }

    if (response.details) {
      classNotes.setData(response.details.notes);
    }

    const recordingsTab = document.getElementById('Recordings');
    if (response.data.recordings.length === 0) {
      const noRecording = document.createElement('div');
      noRecording.classList.add('no-recordings');
      noRecording.innerHTML = `
      <span>No recordings are currently available for this class. Try and check again after some time.</span>
      `;
      recordingsTab.append(noRecording);
      return;
    }
    const recordingsParentContainer = `
    <div id="recorings-top-container" class="recordings-top-container">
    `;
    recordingsTab.innerHTML = recordingsParentContainer;
    if (response.data.recordings.length > 0) {
      const shareButton = `
        <div class="container">
          <div class="d-flex align-items-center bg-white rounded shadow-sm p-2 copy-link-container">
            <i class="fas fa-link me-2 copy-icon"></i>
            <input type="text" class="form-control border-0 bg-transparent text-muted flex-grow-1 copy-link"title="https://classify.zenclass.in/meet-video?session=${response.details.classid}&index=0" value="https://classify.zenclass.in/meet-video?session=${response.details.classid}&index=0" readonly>
            <button class="btn colorBtn btn-sm ms-2" id="copy-btn-rec">Copy</button>
          </div>
        </div>
      `;

      const recordingsContainer = `
        <div class="recordings-container">
        </div>
      `;
      const recordingsTopContainer = document.getElementById('recorings-top-container');

      recordingsTopContainer.innerHTML = shareButton + recordingsContainer;
    }
    const recordingsContainer = document.querySelector('.recordings-container');
    response.data.recordings.forEach((recording, index) => {
      // to add back navigation
      const mTab = getQueryStringVal('mTab');
      const cTab = getQueryStringVal('cTab');
      const preTab = getQueryStringVal('pre');
      const startTimeNavigation = getQueryStringVal('start_time');
      const endTimeNavigation = getQueryStringVal('end_time');
      let urlVideo = `meet-video?session=${response.details.classid}&index=${index}`;

      if (mTab && cTab && preTab && mTab !== '' && cTab !== '' && preTab !== '') {
        urlVideo = `meet-video?session=${response.details.classid}&index=${index}&mTab=${mTab}&cTab=${cTab}&pre=${preTab}&start_time=${startTimeNavigation}&end_time=${endTimeNavigation}`;
      }
      const recordingDiv = document.createElement('div');
      recordingDiv.classList.add('recording-div');
      recordingDiv.innerHTML = `
      <i class="bi bi-file-earmark-play-fill custom-icon"></i>
      <span class="recording-text">${response.data.label}(${index + 1}).mp4</span>
       <a href=${urlVideo} target="_blank">
      </a>
      <div>
      <i class="bi bi-box-arrow-up-right open-icon"></i>
      </div>
    `;
      const icon = recordingDiv.querySelector('.open-icon');
      icon.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(urlVideo, '_blank');
      });
      const fileIcon = recordingDiv.querySelector('.custom-icon');
      fileIcon.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(urlVideo, '_blank');
      });
      const text = recordingDiv.querySelector('.recording-text');
      text.addEventListener('click', (event) => {
        event.preventDefault();
        const url = url;
        window.open(urlVideo, '_blank');
      });
      recordingsContainer.append(recordingDiv);
    });

    if (response.data === 'Invalid Auth Token') {
      // window.location.href = './';
    }
  }).catch((err) => {
    ajaxFailuremodal = true;
    $('#ajaxFailureModal').modal({
      backdrop: 'static',
      keyboard: false,
    });
    renderAjaxFailureModalContent('Something went wrong', 'Something is temporarily wrong. Please make sure you are connected to the internet and then reload your browser');
    $('#ajaxFailureModal').modal('show');
    $('#spinner-container').addClass('d-none');
    console.log('error in ajax request', err);
  });
  const session = getQueryStringVal('session');
  const quill = new Quill('#editor', {
    theme: 'snow',
    readOnly: true,
    modules: {
      toolbar: false,
    },
  });
  customPost({ session }, 'getMeetConfig').then((response) => {
    if (!response.access) {
      // window.location.href = './classes';
    }
    if (response.classlist[0].studentNotes) {
      // add the notes to the editor
      // quill.insertText(0, response.classlist[0].studentNotes);
      quill.clipboard.dangerouslyPasteHTML(response.classlist[0].studentNotes);
    } else {
      quill.insertText(0, 'No Notes added to this class');
    }
  }).catch(() => {
    if (!ajaxFailuremodal && !sessionInvalidModal) {
      quill.insertText(0, 'No Notes added to this class');
      showToast('Something went wrong, unable to load meet notes', '#e05656');
    }
  });
  const mail = getSession('email');
  const isAdmin = localStorage.getItem('admin');
  customPost({ session, mail, isAdmin }, 'getChatMeet').then((response) => {
    const emailToCheck = localStorage.getItem('email');
    let foundItem;
    if (response.options.length > 0) {
      foundItem = response.options.find((item) => item.email === emailToCheck);
    }
    if (response.user === 'student' || foundItem) {
      localStorage.setItem('role', 'stud');
      let options = '<option value="All hosts">All Hosts</option>';
      $('#select-recepient').append(options);
      response.options.forEach((opt) => {
        options = `<option value=${opt.email}>${opt.name}</option>`;
        $('#select-recepient').append(options);
      });
    } else if ((response.user === 'admin' && typeof foundItem === 'undefined') || response.user === 'host') {
      $('#end-meet').removeClass('d-none');
      let options = '<option value="Everyone" title="Everyone">Everyone</option>';
      $('#select-recepient').append(options);
      localStorage.setItem('role', 'ment');
      if (response.options.length > 0) {
        response.options.forEach((opt) => {
          options = `<option value="${opt.email}" title="${opt.email}">${opt.name}</option>`;
          $('#select-recepient').append(options);
        });
      }
    }
  }).catch(() => {
    if (!ajaxFailuremodal && !sessionInvalidModal) {
      showToast('Unable to load chat, try again later', '#e05656');
    }
  }).catch(() => {
    if (!ajaxFailuremodal && !sessionInvalidModal) {
      showToast('Unable to load chat, try again later', '#e05656');
    }
  });
}

function formatCodeSnippets(str) {
  const regex = /```([\w-]+)?\n([\s\S]+?)\n```/gm;
  const formattedStr = str.replace(regex, '<pre class="line-numbers"><code data-prismjs-copy="Copy" class="language-$1">$2</code></pre>');
  return formattedStr;
}

function renderChatBox(chatData) {
  // delete the existing chat box
  // const chatDiv = document.querySelector('.chat-div');
  $('.chat-div').empty();
  if (chatData && chatData.length > 0) {
    chatData.forEach((chat, index) => {
      const gmtTimeString = chat.time;
      let localTime = '';
      const currentTime = getCurrentTimeInTimezone('Asia/Kolkata');

      if (gmtTimeString !== '') {
        // Parse the time from chat (Assuming it's in 12-hour format)
        const gmtTimeParts = gmtTimeString.match(/(\d+):(\d+)(\w+)/);
        const gmtHours = parseInt(gmtTimeParts[1], 10);
        const gmtMinutes = parseInt(gmtTimeParts[2], 10);
        const ampm = gmtTimeParts[3].toLowerCase();
        const gmtTime = new Date();
        gmtTime.setUTCHours(ampm === 'am' ? gmtHours : gmtHours + 12);
        gmtTime.setUTCMinutes(gmtMinutes);
        localTime = gmtTime.toLocaleTimeString('en-US').replace(/:\d+ /, ' ');
      }
      if (chat.sent_by === localStorage.getItem('email')) {
        if (chat.to_be_sent_name === undefined) {
          if (chat.uname !== '') {
          // eslint-disable-next-line no-param-reassign
            chat.to_be_sent_name = chat.uname;
          }
          const email = chat.to_be_sent;
          const namePart = email.split('@')[0];
          // eslint-disable-next-line no-param-reassign
          chat.to_be_sent_name = namePart;
        }

        const content = formatCodeSnippets(chat.content);
        const newChat = `<div class="user-chat mb-3">
      <div class="d-inline-block float-right mb-1" style="maxWidth:50%;">
      <small class="px-3">sent to <span> ${chat.to_be_sent_name}</span></small>
        <p class="sentmsg py-2 px-3 rounded text-break mb-1 mr-3">${content} </p>
        <small class="msgtime rounded float-right fs-6 mr-3">${localTime}</small>
      </div>
      <div class="clearfix">
      </div>
      </div>`;
        $('.chat-div').append(newChat);
      } else {
        let userEmail = chat.to_be_sent;
        if (userEmail === localStorage.getItem('email')) {
          userEmail = 'you';
        }
        if (index === chatData.length - 1 && currentTime >= sTime && currentTime < eTime) {
          receivedSound.currentTime = 0;
          receivedSound.play();
        }
        const content = formatCodeSnippets(chat.content);
        const newChat = `<div class="user-chat">
      <div class="d-inline-block float-left mb-1" style="maxWidth:50%;">
      <img src="build/images/class/profile.webp" class="rounded-circle" width="34px" height="34px">
        <p class="uname rounded text-break mb-1 d-inline-block ml-1">${chat.uname.charAt(0).toUpperCase() + chat.uname.slice(1)} <small>to <span> ${userEmail}</span> </small></p>
        <p class="receivedmsg py-2 px-3 rounded text-break mb-1 ml-5">${content}</p>
        <small class="msgtime rounded fs-6 ml-5">${localTime}</small>
      </div>
      <div class="clearfix">
      </div>
      </div>`;
        $('.chat-div').append(newChat);
      }
    });
  } else {
    // $('.livechat').addClass('d-none');
    // $('.endedchat').removeClass('d-none');
    // $('.endedchat').addClass('chat-off');
    $('.chatAvailable').addClass('d-none');
    $('.chatUnavailable').removeClass('d-none');
  }

  // chatDiv.scrollTop = chatDiv.scrollHeight;
}

socket.on('connect', (msg) => {
  console.log('Connected to server');
  if (msg) {
    // renderVideo();
    $('#chatloadAlert').removeClass('show').addClass('d-none');
    $('#chatloadAlert').removeClass('show').addClass('d-none');
    renderChatBox(msg.chats);
  }
});
socket.on('connect_error', () => {
  // console.log('Connection error:', error);
  // $('.livechat').addClass('d-none');
  // $('.endedchat').removeClass('d-none');
  // $('.chatAvailable').addClass('d-none');
  // $('.chatUnavailable').removeClass('d-none');

  // $('#chatAlert').removeClass('d-none').addClass('show');
});

socket.on('getcontents', (msg) => {
  if (msg) {
    if ((msg.length === 1 && localStorage.getItem('role') === 'stud') || (msg.length === 1 && localStorage.getItem('role') === 'ment')) {
      $('.chatAvailable').addClass('d-none');
      $('.chatUnavailable').removeClass('d-none');
    }
  }
});
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('chat', (msg) => {
  // if msg is  not undefined
  if (msg) {
    renderChatBox(msg);
  }
});

// socket.on('meetExtend', (atime) => {
//   if (getSession('role') === 'ment' || getSession('admin') === 'true') {
//     const date = new Date(atime * 1000);
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     const endDate = new Date(endTimeSet * 1000);
//     const formattedEndTime = endDate.toISOString().slice(0, 16);
//     $('#newEndTime').val(formattedEndTime);

//     // Create a formatted time string
//     const time = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
//     $('#meetExtendModal #alertTitle').text(`Alert!!! Class will be ending at ${time}`);
//     $('#meetExtendModal #alertBody').text(`The Meet is scheduled to end at ${time}`);
//     $('#meetExtendModal').modal({
//       backdrop: 'static',
//     });

//     $('#extendBtn').click(() => {
//       $('#extendSection').removeClass('d-none');
//     });

//     $('#setNewEndTimeBtn').click(() => {
//       const newEndTime = $('#newEndTime').val();
//       if (newEndTime) {
//         const newEndTimestamp = new Date(newEndTime).getTime() / 1000;
//         // socket.emit('newEndTime', { newEndTime: newEndTimestamp, session });
//         console.log(newEndTimestamp);
//         $('#meetExtendModal').modal('hide');
//       } else {
//         console.log('Please select a valid date and time.');
//       }
//     });
//   }
// });

$('.chatInput').on('keydown', (event) => {
  if (event.which === 13) { // 13 corresponds to Enter key
    event.preventDefault();
    $('.sendChat').trigger('click');
  }
});

function sendChat(chatInput, toBeSent, nameToBeSent) {
  const sendChatButton = $('.sendChat');
  const originalHTML = sendChatButton.html();
  $('.chatInput').val('');
  sendChatButton.prop('disabled', true);
  sendChatButton.html('<i class="fas fa-spinner fa-spin"></i>');
  try {
    const obj = {
      chatContent: chatInput,
      classID: localStorage.getItem('class_id'),
      userID: localStorage.getItem('userId'),
      email: localStorage.getItem('email'),
      role: localStorage.getItem('role'),
      toBeSent,
      name: localStorage.getItem('chatUsername') !== '' ? localStorage.getItem('chatUsername') : localStorage.getItem('userName'),
      isAdmin: localStorage.getItem('admin'),
      nameToBeSent,
    };
    if (socket.connected) {
      socket.emit('chat', obj);
    } else {
      $('#chatAlert').removeClass('d-none').addClass('show');
      // Hide the alert after 3 seconds
      setTimeout(() => {
        $('#chatAlert').fadeOut(300, function () {
          $(this).removeClass('show').addClass('d-none').css('display', '');
        });
      }, 1000);
    }
  } catch (error) {
    // remove the spinner
    sendChatButton.html(originalHTML);
    sendChatButton.prop('disabled', false);
    // show the error message
  } finally {
    // remove the spinner
    sendChatButton.html(originalHTML);
    sendChatButton.prop('disabled', false);
  }
}
$('.sendChat').on('click', () => {
  const chatInput = $('.chatInput').val().trim();
  const toBeSent = $('#select-recepient').val();
  const selectedOptionText = $(`#select-recepient option[value="${toBeSent}"]`).text();
  if (chatInput !== '') {
    sentSound.currentTime = 0;
    sentSound.play();
  }
  if (chatInput && toBeSent && selectedOptionText) {
    sendChat(chatInput, toBeSent, selectedOptionText);
  }
});

$('#joinchat').on('click', () => {
  $('.chatm').removeClass('d-none');
  $('.joinchat').addClass('d-none');
});

$(document).ready(() => {
  $('body').css({
    '--domain-joinColor': getSession('joinColor') || 'white',
    '--domain-borderColor': getSession('borderColor') || '#0dba4b',
    '--domain-color': getSession('borderColor') || '#0dba4b',
  });

  // for profile disappear on cliking somewhere
  $(document).on('click', (event) => {
    const accountBox = $('#account-box');
    if (!accountBox.is(event.target) && accountBox.has(event.target).length === 0) {
      accountBox.addClass('d-none');
    }
  });
  // profile display
  $('#account-pop-button').on('click', () => {
    const accountBox = $('#account-box');
    if (accountBox.hasClass('d-none')) {
      accountBox.removeClass('d-none');
    } else {
      accountBox.addClass('d-none');
    }
    return false;
  });
  $('.navbar-toggler').click(() => {
    $('.menu-sidebar-modal').toggle(); // Toggle the sidebar
  });
  $('.menu-sidebar-close').click(() => {
    $('.menu-sidebar-modal').hide(); // Hide the sidebar
  });
  $('.chat-div').scrollTop($('.chat-div').prop('scrollHeight'));
  // checkSession();
  // const banner1 = document.querySelector('.navbar-nav .banner');
  // banner1.parentNode.removeChild(banner1);
  claculateVideoSize('.video-box');
  $(window).resize(() => {
    claculateVideoSize('.video-box');
  });
  renderVideo();
  if (window.location.href === 'class') {
    // window.location.href = 'classes';
  }

  if (localStorage.getItem('product') === 'hackerkid') {
    // $('.sendChat').addClass('hackerkid-chat');
    $('.chatInput').css('box-shadow', 'none');
    $('.chatInput').css('border', '1px solid #FE6A07');
    $('.sendChat').removeClass('btn-primary');
    document.getElementById('logo').src = srcVal;
    document.getElementById('logo-admin-sidebar').src = srcVal;
    document.getElementById('logo').width = width;
    // document.querySelector('.chat-mentor-imgs').innerHTML
    //  = `<img src="${srcChat}"><img src="./images/class/Chat with your Mentor.png">`;
  }
  $(document).on('click', '.copyLinkDiv', function () {
    const id = getQueryStringVal('session');
    if (id) {
      let link = `https://classify.zenclass.in/meet-dashboard-new?session=${id}`;
      if (meetingType === 'instant' || meetingType === 'open') {
        const product = localStorage.getItem('product');
        link = `https://classify.zenclass.in/open-integration?session=${id}&path=meet&product=${product}`;
      }
      const $tooltipElement = $(this);
      $tooltipElement.attr('data-original-title', 'Meet Link Copied');
      $tooltipElement.attr('title', '');
      $tooltipElement.tooltip('show');
      navigator.clipboard.writeText(link).then(() => {
        setTimeout(() => {
          $tooltipElement.removeAttr('data-original-title');
          $tooltipElement.attr('title', 'Copy meet link');
        }, 1500);
      });
    }
  });
  $('#logout,#logout-sidebar').on('click', (e) => {
    e.preventDefault();
    customPost({}, 'logout').then(() => {
    }).catch((err) => {
      console.log('error in ajax request', err);
    });
    localStorage.clear();
    window.location = '/index.html';
  });
});
let isUpdate = false;
let isJoinBtnHided = 0;
$(document).ready(() => {
  $(document).on('click', '#endMeetBtn', () => {
    if (!adminOrHost) {
      $('#toast-container').empty();
      showToast('Cannot end the meet. Host/Admin can only end the meet', '#e05656');
      return;
    }
    isUpdate = true;
    $('#endMeetLoader').removeClass('d-none'); // Show loader
    $('#endMeetBtn').prop('disabled', true);
    // emit the socket to update the new end time of the meeting
    const newEndTime = Math.floor((getCurrentTimeInTimezone(timez).toMillis() / 1000));
    const obj = {
      classID: localStorage.getItem('class_id'),
      endTime: newEndTime,
    };
    if (socket.connected) {
      socket.emit('updateEndMeet', obj);
    } else {
      showToast('Something went wrong, unable to end meet now, try again later', '#e05656');
      $('#endMeetLoader').addClass('d-none');
      $('#endMeetBtn').prop('disabled', false);
    }
  });
  // Function to attach click handler
  function attachClickHandler() {
    const joinNowButton100ms = $('.hms-ui-c-bmOnJD')
      .find('button[type="submit"].hms-ui-c-jxehuX.hms-ui-c-jxehuX-gbvAgY-variant-primary');
    if ($('#stopStream').length) {
      if ($('#endMeetBtn').length === 0) {
        $('#endMeetBtn').remove();
        const customButton = '<button id="endMeetBtn" class="btn">End Session<span id="endMeetLoader" class="spinner-border spinner-border-sm d-none"></span></button>';
        $('.hms-ui-c-dhzjXW.hms-ui-c-dhzjXW-knmidH-justify-between.hms-ui-c-dhzjXW-jroWjL-align-center.hms-ui-c-dhzjXW-icGrVTY-css').append(customButton);
      }
    }
    if (
      joinNowButton100ms.length > 0 && $('#JoinRoomNow').length < 1
     && isJoinBtnHided === 0) {
      isJoinBtnHided = 1;
      $('.hms-ui-c-jxehuX.hms-ui-c-jxehuX-gbvAgY-variant-primary').addClass('d-none');
      $('.hms-ui-c-bmOnJD').append('<button id="JoinRoomNow" class="hms-ui-c-jxehuX-gbvAgY-variant-primary hms-ui-c-jxehuX hms-ui-c-jxehuX-gbvAgY-variant-primary">Join Now</button>');
    }

    $('#stopStream').remove();
    $('.hms-ui-c-PJLV.hms-ui-c-PJLV-ichPiai-css img').attr('src', 'build/images/class/empty-chat.jpg');
  }

  // Initial call to attach the click handler
  attachClickHandler();

  // Observe changes to the DOM
  const observer = new MutationObserver(attachClickHandler);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  $('#navigateBtn').click(() => {
    const parentPage = getQueryStringVal('pre');
    const ses = getQueryStringVal('session');
    const mTab = getQueryStringVal('mTab');
    const cTab = getQueryStringVal('cTab');
    const startTimeNavigation = getQueryStringVal('start_time');
    const endTimeNavigation = endTime;
    if (parentPage === 'admin' && localStorage.getItem('role') === 'ment') {
      window.location.href = `zen-class-admin?session=${ses}&type=meet&mTab=${mTab}&cTab=${cTab}&start_time=${startTimeNavigation}&end_time=${endTimeNavigation}`;
    } else if (parentPage === 'classes') {
      window.location.href = `classes?session=${ses}&type=meet&mTab=${mTab}&cTab=${cTab}&start_time=${startTimeNavigation}&end_time=${endTimeNavigation}`;
    } else {
      window.location.href = './classes';
    }
  });
});

$(document).on('click', '[data-testid="join_again_btn"]', () => {
  isJoinBtnHided = 0;
});

function endMeet() {
  const data1 = {
    uniqueId: getQueryStringVal('session'),
    authToken: getSession('authToken'),
    product: getSession('product'),
  };
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data1),
    url: `${API_PATH}/endMeet`,
  }).then((res) => {
    if (!res && !res.access) {
      // window.location.href = './';
    }
    $('#endMeetLoader').addClass('d-none'); // Hide loader
    $('#endMeetBtn').prop('disabled', false);
  }).catch((e) => {
    $('#ajaxFailureModal').modal({
      backdrop: 'static',
      keyboard: false,
    });
    renderAjaxFailureModalContent(
      'Something went wrong',
      'Something is temporarily wrong. Please make sure you are connected to the internet and then reload your browser',
    );
    $('#ajaxFailureModal').modal('show');
    $('#spinner-container').addClass('d-none');
    console.log('error in ajax request', e);
    $('#endMeetLoader').addClass('d-none'); // Hide loader
    $('#endMeetBtn').prop('disabled', false);
  });
}

$(document).on('click', '#JoinRoomNow', () => {
  $('#JoinRoomNow').prop('disabled', true);
  customPost({ uniqueId: `${getQueryStringVal('session')}` }, 'checkPeerSessionIsActive').then((response) => {
    if (!response.access) {
      // window.location.href = './';
    } else if (!response.session_live) {
      $('.hms-ui-c-jxehuX.hms-ui-c-jxehuX-gbvAgY-variant-primary').removeClass('d-none');
      $('#JoinRoomNow').remove();
      const joinButton = document.querySelector(
        '.hms-ui-c-jxehuX.hms-ui-c-jxehuX-gbvAgY-variant-primary',
      );
      if (response.recordingStatus === 'active') {
        const audio = new Audio('build/audios/recordingOn.mp3');

        audio.play()
          .then(() => {
            console.log('Audio is playing.');
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
          });
      }

      if (joinButton) {
        joinButton.click();
      }
    } else {
      $('#JoinRoomNow').prop('disabled', false);
      $('#ajaxFailureModal').modal({
        backdrop: 'static',
        keyboard: false,
      });
      renderAjaxFailureModalContent('Session Already Live', 'It seems this session is already live in another tab or device. Please close the other session and return here to join successfully.');
      $('#ajaxFailureModal').modal('show');
      $('#spinner-container').addClass('d-none');
      renderErrorFlag = true;
      $('#page').addClass('d-none');
    }
  });
});

socket.on('updateDropdown', (data) => {
  if (data.userType === 'student') {
    if (localStorage.getItem('role') === 'ment') {
      const selectRecipient = $('#select-recepient');
      const optionExists = selectRecipient.find(`option[value="${data.email}"]`).length > 0;
      if (!optionExists) {
        const options = `<option value=${data.email}  title=${data.email}>${data.chatUsername}</option>`;
        $('#select-recepient').append(options);
      }
    }
  } else if (data.userType === 'host' || data.userType === 'admin') {
    const isAdmin = localStorage.getItem('role');
    if (data.email !== localStorage.getItem('email')) {
      const selectRecipient = $('#select-recepient');
      const optionExists = selectRecipient.find(`option[value="${data.email}"]`).length > 0;
      if (!optionExists) {
        const options = isAdmin === 'ment' ? `<option value=${data.email}  title=${data.email}>${data.chatUsername}</option>` : `<option value=${data.email}>${data.chatUsername}</option>`;
        $('#select-recepient').append(options);
      }
    }
  }
});
socket.on('updateEndMeet', (data) => {
  if (data.classID === getQueryStringVal('session')) {
    eTime = data.endTime;
    endTime = data.endTime;
    if (isUpdate) {
      endMeet();
    }
    disableCameraAndMicrophone();
  }
});

$(document).ready(() => {
  // const $navContainer = $('#chat-nav').parent();
  const $navList = $('#chat-nav');

  const $leftArrow = $('<button class="nav-arrow left-arrow" style="display:none">&lt;</button>');
  const $rightArrow = $('<button class="nav-arrow right-arrow" style="display:none">&gt;</button>');

  $navList.prepend($leftArrow);
  $navList.append($rightArrow);

  $leftArrow.on('click', () => {
    $navList.animate({ scrollLeft: '-=200' }, 300);
  });

  $rightArrow.on('click', () => {
    $navList.animate({ scrollLeft: '+=200' }, 300);
  });

  $('header').removeClass('bg-white');
});

$('.reloadBtn').click(() => {
  window.location.reload();
});
function setTheme(themeName) {
  $('body').removeClass('light-theme dark-theme');
  $('body').addClass(themeName);
  localStorage.setItem('hmsTheme', themeName);
  toggleTheme();
}

// Event handler for light mode
$(document).on('click', '#lightMode', () => {
  setTheme('light-theme');
});

// Event handler for dark mode
$(document).on('click', '#darkMode', () => {
  setTheme('dark-theme');
});

$(document).on('click', '#copy-btn-rec', function () {
  const $button = $(this);
  const copyLinkValue = $('.copy-link').val();

  // Copy text to clipboard
  navigator.clipboard.writeText(
    copyLinkValue,
  ).then(() => {
    // Change button text and color
    $button.text('Copied');

    // Reset button after 2 seconds
    setTimeout(() => {
      $button.blur();
      $button.text('Copy');
    }, 2000);
  });
});

$(document).on('mouseenter', '.copy-link', () => {
  $('.copy-link').addClass('no-ellipsis');
});

$(document).on('mouseleave', '.copy-link', () => {
  $(this).removeClass('no-ellipsis');
  this.scrollLeft = 0;
});

const getCurrentTimeInTimezone = (timezone) => DateTime.now().setZone(timezone);

const convertToTimeZoneUnixTime = (unixTime, timezone) => {
  const istDateTime = DateTime.fromSeconds(unixTime).setZone(timezone);
  return istDateTime;
};
