import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonRow,
  IonCol,
  IonPopover,
  IonLabel,
  IonCheckbox,
  IonButton,
} from "@ionic/react";

import React, { useState } from "react";
import "./Header.css";

// remote buttons off
import stopButtonOff from "./remoteButtons/stop/stop_off.svg";
import pauseButtonOff from "./remoteButtons/pause/pause_off.svg";
import playButtonOff from "./remoteButtons/play/play_off.svg";
import emergButton from "./remoteButtons/emerg/emerg.svg";
import resetButton from "./remoteButtons/sys_reset/reset.svg";

// remote buttons On
import stopButtonOn from "./remoteButtons/stop/stop_on.svg";
import pauseButtonOn from "./remoteButtons/pause/pause_on.svg";
import playButtonOn from "./remoteButtons/play/play_on.svg";

// remote buttons Pressed
import stopButtonPressed from "./remoteButtons/stop/stop_pressed.svg";
import pauseButtonPressed from "./remoteButtons/pause/pause_pressed.svg";
import playButtonPressed from "./remoteButtons/play/play_pressed.svg";
import emergButtonPressed from "./remoteButtons/emerg/emerg_pressed.svg";
import resetButtonPressed from "./remoteButtons/sys_reset/reset_pressed.svg";

// remote buttons context
import { RemoteButtonsContext } from "../contexts/remoteButtonsContext";

interface header {
  auth: number;
  sysInfo: boolean[];
}

interface RemoteButton {
  title: string;
  icons: string[];
}

// calibration
const axis = ["Roll", "Pitch", "Yaw"];
var axisCalib = [false, false, false];

const remoteButtons: RemoteButton[] = [
  {
    title: "Stop",
    icons: [stopButtonOff, stopButtonOn, stopButtonPressed],
  },
  {
    title: "Pause",
    icons: [pauseButtonOff, pauseButtonOn, pauseButtonPressed],
  },
  {
    title: "Play",
    icons: [playButtonOff, playButtonOn, playButtonPressed],
  },
];

const emergencyButton: RemoteButton = 
  {
    title: "Emergency",
    icons: [emergButton, emergButton, emergButtonPressed],
}

const sysResetButton: RemoteButton = 
  {
    title: "System Reset",
    icons: [resetButton, resetButton, resetButtonPressed],
}

enum sys {
  emerg_r,
  emerg_m,
  emerg_u,
  uartError,
  sensor1Error,
  sensor2Error,
  modbusError,
  init,
  sysReset,
  calib,
  robotState
}

function updateRemoteButtons(buttonIndex: number, buttonsState: number[], emerg: boolean, setRemoteButtonsState: any) {

    // if not emergency or sys-reset
    if (buttonIndex !== 3){
    
      // Send QAB update to server 
      let request = new Request('', {
        method: 'UPDATE_QAB',
        headers: {QAB: buttonIndex.toString()},
      });
    
      fetch(request)
      .then((response) => {
        if (response.status === 200){
          switch (buttonIndex) {
            case 0: {
              setRemoteButtonsState([0, 0, 1, buttonsState[3]]); 
              break;
            }
            case 1: {
              setRemoteButtonsState([buttonsState[0], 2, 1, buttonsState[3]]);
              break;
            }
            case 2: {
              setRemoteButtonsState([1, 1, 2, buttonsState[3]]);
              break;
            }
            case 3: {
              setRemoteButtonsState([buttonsState[0], buttonsState[1], buttonsState[2], 2]);
              break;
            }
            default: {
              setRemoteButtonsState(buttonsState);
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
    // Send Emergency or system reset request
    else{
      // If sys not in emergency
      if(!emerg){
        // Send Emergency request
        let request = new Request('', {
          method: 'EMERG',
        });
      
        fetch(request)
        .then((response) => {
          if (response.status === 200){
            setRemoteButtonsState([buttonsState[0], buttonsState[1], buttonsState[2], 2]);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
      // If sys in emergency
      else{
        // Send sys reset request
        let request = new Request('', {
          method: 'SYS_RESET',
        });
      
        fetch(request)
        .then((response) => {
          if (response.status === 200){
            setRemoteButtonsState([buttonsState[0], buttonsState[1], buttonsState[2], 2]);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    } 
  
    // TO DO : The application should wait for the
    //         update of the robot state
    //         before updating the QAB graphics
  

 }

function sendCalibration(axisCalib: boolean[]){

  var axisNumber = 0;

  axisCalib.forEach((axis, key) => {
    if(axis === true){
      switch (key) {
        case 0: {
          axisNumber += 1;
          break;
        }
        case 1: {
          axisNumber += 2;
          break;
        }
        case 2: {
          axisNumber += 4;
          break;
        }
        default: {
          axisNumber += 0;
          break;
        }
      }
    }
  });

  // Send axis calibration to server 
  let request = new Request('', {
    method: 'CALIB',
    headers: {CALIB: axisNumber.toString()},
  });

  fetch(request)
  .catch((error) => {
    console.error('Error:', error);
    return false;
  });

  // TO DO : The application should wait for the
  //         update of the robot state
  //         before proceeding

  return true;

}

function infoText(sysInfo: boolean[]){
  let text = "";
  let idx = sys.robotState + 1;
  for(var i = 0; i < sysInfo.length; i++){
    if(sysInfo[i] && i !== sys.emerg_u){idx = i; break;}
  }

  switch(idx){
    case sys.emerg_r:       {text="Emergency"; break;}
    case sys.emerg_m:       {text="Emergency"; break;}
    case sys.uartError:     {text="UART communication down"; break;}
    case sys.sensor1Error:  {text="Sensor 1 down"; break;}
    case sys.sensor2Error:  {text="Sensor 2 down"; break;}
    case sys.modbusError:   {text="Modbus communication down"; break;}
    case sys.init:          {text="Initialisation..."; break;}
    case sys.sysReset:      {text="Resetting..."; break;}
    case sys.calib:         {text="Calibrating..."; break;}
    case sys.robotState:    {text="In motion"; break;}
    default:                {text="Idle"; break;}
  }

  return text;
 
}

function infoColor(sysInfo: boolean[]){
  if(sysInfo[sys.emerg_r] || sysInfo[sys.emerg_m]){
    return 'red';
  }
  else if(sysInfo[sys.uartError] || sysInfo[sys.sensor1Error] || sysInfo[sys.sensor2Error]){
    return 'orange';
  }
  else{
    return 'blue';
  }
}

const Header: React.FC<header> = ({auth, sysInfo}) => {

  const { remoteButtonsState, setRemoteButtonsState } = React.useContext(RemoteButtonsContext);

  const [showPlayPopover, setShowPlayPopover]   = useState(false); // Set to true whenever we want to show the play button popover
  const [showEmSysPopover, setShowEmSysPopover] = useState(false); // Set to true whenever we want to show the emergency or sys_reset button popover
  const [showStopPopover, setShowStopPopover]   = useState(false); // Set to true whenever we want to show the stop button popover
  const [showCalibPopover, setShowCalibPopover] = useState(false); // Set to true whenever we want to show the calibration button popover

  //const [emerg, setEmerg] = useState(false); // Wether the sys is in emergency or not (updated by the server)

  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>
          <IonRow id="remote" slot='start'>
            <IonCol id="sys-info" size='6.8'>
              <IonRow>
                <IonCol id="desc" size="3">
                  <IonLabel >System info : </IonLabel>
                </IonCol>
                <IonCol id="info">
                <IonLabel style={{color: infoColor(sysInfo)}}>{infoText(sysInfo)}</IonLabel>
                </IonCol>
              </IonRow>
            </IonCol>
            <IonCol size="1">
            {(auth === 1) && (
              <IonButton id="calib" onClick={() => setShowCalibPopover(true)}>
                Calib
              </IonButton>
            )}
            </IonCol>
            {remoteButtons.map((remoteButton, index) => {
              return (
                <IonCol key={index} size="0.5">
                  {(auth === 1) && (
                  <IonItem
                    button
                    onClick={() => {
                      if (
                        remoteButtonsState[index] === 1 &&
                        index !== 2 &&
                        index !== 0
                      ) {
                        updateRemoteButtons(index, remoteButtonsState, false, setRemoteButtonsState);
                      }
                      if (remoteButtonsState[2] === 1 && index === 2) {
                        setShowPlayPopover(true);
                      }
                      if (remoteButtonsState[index] === 1 && index === 0) {
                        setShowStopPopover(true);
                      }
                    }}
                    detail={false} lines="none"
                  >
                    <img src={remoteButton.icons[remoteButtonsState[index]]} alt=""/>
                  </IonItem>
                  )}
                </IonCol>
              );
            })}
            <IonCol id="emerg-sysreset" size="0.5">
              { !sysInfo[sys.emerg_r] && (
                <IonItem button onClick={() => {if(remoteButtonsState[3] !== 2){setShowEmSysPopover(true);}}} detail={false} lines="none">
                  <img src={emergencyButton.icons[remoteButtonsState[3]]} alt=""/>
                </IonItem>
              )}
              { sysInfo[sys.emerg_r] && (
                <IonItem button onClick={() => {if(remoteButtonsState[3] !== 2){setShowEmSysPopover(true);}}} detail={false} lines="none">
                  <img src={sysResetButton.icons[remoteButtonsState[3]]} alt=""/>
                </IonItem>
              )}
            </IonCol>
          </IonRow>
      </IonToolbar>

      {/** CAUTION POPOVER BEFORE EMERG or SYSRESET **/}
      <IonPopover
        id="emerg-sys-pop"
        isOpen={showEmSysPopover}
        onDidDismiss={(e) => setShowEmSysPopover(false)}
      >
        <IonRow>
        { !sysInfo[sys.emerg_r] && (
          <IonCol id="desc">
              **CAUTION**
              <br />
              You are about to declare an emergency.
              <br />
              Are you sure you want to proceed?
          </IonCol>
        )}
        { sysInfo[sys.emerg_r] && (
          <IonCol id="desc">
              **CAUTION**
              <br />
              You are about to run a system reset.
              <br />
              Are you sure you want to proceed?
          </IonCol>
        )}
        </IonRow>
        <IonRow>
          <IonCol>
            <IonItem
              button
              onClick={() => {
                updateRemoteButtons(3, remoteButtonsState, sysInfo[sys.emerg_r], setRemoteButtonsState);
                setShowEmSysPopover(false);
              }}
              detail={false}
            >
              <IonLabel>YES</IonLabel>
            </IonItem>
          </IonCol>
          <IonCol>
            <IonItem
              button
              onClick={() => {
                setShowEmSysPopover(false);
              }}
              detail={false}
            >
              <IonLabel>NO</IonLabel>
            </IonItem>
          </IonCol>
        </IonRow>
      </IonPopover>

      {/** CAUTION POPOVER BEFORE PLAY **/}
      <IonPopover
        id="play-pop"
        isOpen={showPlayPopover}
        onDidDismiss={(e) => setShowPlayPopover(false)}
      >
        <IonRow>
          <IonCol id="desc">  
              **CAUTION**
              <br />
              You are about to run a command.
              <br />
              Are you sure you want to proceed?
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonItem
              button
              onClick={() => {
                updateRemoteButtons(2, remoteButtonsState, false, setRemoteButtonsState);
                setShowPlayPopover(false);
              }}
              detail={false}
            >
              <IonLabel>YES</IonLabel>
            </IonItem>
          </IonCol>
          <IonCol>
            <IonItem
              button
              onClick={() => {
                setShowPlayPopover(false);
              }}
              detail={false}
            >
              <IonLabel>NO</IonLabel>
            </IonItem>
          </IonCol>
        </IonRow>
      </IonPopover>

      {/** CAUTION POPOVER BEFORE STOP **/}
      <IonPopover
        id="stop-pop"
        isOpen={showStopPopover}
        onDidDismiss={(e) => setShowStopPopover(false)}
      >
        <IonRow>
          <IonCol id="desc">
                **CAUTION**
                <br />
                Please select between one of the presented options before
                proceeding.
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonItem
              button
              color="danger"
              onClick={() => {
                updateRemoteButtons(0, remoteButtonsState, false, setRemoteButtonsState);
                setShowStopPopover(false);
              }}
              detail={false}
            >
              <IonLabel>RTZ</IonLabel>
            </IonItem>
          </IonCol>
          <IonCol>
            <IonItem
              button
              color="warning"
              onClick={() => {
                updateRemoteButtons(0, remoteButtonsState, false, setRemoteButtonsState);
                setShowStopPopover(false);
              }}
              detail={false}
            >
              <IonLabel>HOLD</IonLabel>
            </IonItem>
          </IonCol>
        </IonRow>
      </IonPopover>

      {/** CALIB POPOVER **/}
      <IonPopover
        id="calib-pop"
        isOpen={showCalibPopover}
        onDidDismiss={(e) => {
          setShowCalibPopover(false);
          axisCalib = [false, false, false];
        }}
      >
        <IonRow id="text">
          <IonCol>
            <div>
              <br />
              Please select which axis you want to calibrate
            </div>
          </IonCol>
        </IonRow>
        <div id="calib-checkboxes">
          {axis.map((axis, index) => {
            return (
              <IonItem key={index}>
                <IonLabel>{axis}</IonLabel>
                <IonCheckbox
                  slot="start"
                  onClick={() => {
                    axisCalib[index] = !axisCalib[index];
                  }}
                />
              </IonItem>
            );
          })}
        </div>
        <IonRow id="ok-cancel-buttons">
          <IonCol>
            <IonItem
              button
              onClick={() => {
                setShowCalibPopover(false);
                sendCalibration(axisCalib);
              }}
              detail={false}
            >
              <IonLabel>Proceed</IonLabel>
            </IonItem>
          </IonCol>
          <IonCol>
            <IonItem
              button
              onClick={() => {
                setShowCalibPopover(false);
                axisCalib = [false, false, false];
              }}
              detail={false}
            >
              <IonLabel>Cancel</IonLabel>
            </IonItem>
          </IonCol>
        </IonRow>
      </IonPopover>
    </IonHeader>
  );
};

export default Header;
