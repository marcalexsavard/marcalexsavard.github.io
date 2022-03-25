import Login from './components/Login';
import Menu from './components/Menu';
import Header from './components/Header';
import InputWindow from './pages/InputWindow/InputWindow';
import DataWindowISTR from './pages/DataWindow/DataWindowISTR';
import DataWindowRobot from './pages/DataWindow/DataWindowRobot';
import ARWindow from './pages/ARWindow/ARWindow';
import React, { useCallback, useState } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, IonContent } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import {RemoteButtonsProvider} from "./contexts/remoteButtonsContext";

// Server IP and PORT for websocket communication
const serverIP = "132.207.84.26";
const serverPORT = "5000"; 

// Size of the joystick
const joystickSize = 100;

const reconnectTimeout = 5;

var appLocation = "/" // url path location

// manual ctrl variables
var axisStatus = [false, false, false]; // 0 - Roll;   1 - Pitch;   2 - Yaw;
var axisRTZ = [false, false, false];    // 0 - Roll;   1 - Pitch;   2 - Yaw;
var yawArrows = [false, false];         // 0 - Left;   1 - Right;
var joystickValues = [0, 0];            // 0 - X;   1 - Y;
var axisSpeeds = [0, 0, 0];             // 0 - Roll;   1 - Pitch;   2 - Yaw;

var wsReconnect = 0;

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

enum surf {
  L_aileron,
  R_aileron,
  L_elevator,
  R_elevator,
  rudder,
  trims,
}

enum ctrl {
  roll,
  pitch,
  yaw,
  wheel,
  stick
}

function ctrlMessage(){
  let msg = new Uint8Array([1, 0, 0, 0, 0, 0, 0]);

  if(axisStatus[0]){msg[1] += 128;}
  if(axisStatus[1]){msg[1] += 64;}
  if(axisStatus[2]){msg[1] += 32;}
  if(axisRTZ[0]){msg[1] += 16;}
  if(axisRTZ[1]){msg[1] += 8;}
  if(axisRTZ[2]){msg[1] += 4;}
  if(yawArrows[0]){msg[1] += 2;}
  if(yawArrows[1]){msg[1] += 1;}
  msg[2] = joystickValues[0] + Math.round(joystickSize/2);
  msg[3] = joystickValues[1] + Math.round(joystickSize/2);
  msg[4] = axisSpeeds[0];
  msg[5] = axisSpeeds[1];
  msg[6] = axisSpeeds[2];

  return msg
}

function updateSurfData(data: Uint8Array){
  let surfData = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0, 0]];

  // ailerons data
  surfData[surf.L_aileron][0] = ((((data[0] << 8) + data[1]) - 32768)/32);
  surfData[surf.L_aileron][1] = ((((data[2] << 8) + data[3]) - 32768)/32);
  surfData[surf.R_aileron][0] = ((((data[4] << 8) + data[5]) - 32768)/32);
  surfData[surf.R_aileron][1] = ((((data[6] << 8) + data[7]) - 32768)/32);

  // elevators data
  surfData[surf.L_elevator][0] = ((((data[8] << 8) + data[9]) - 32768)/32);
  surfData[surf.L_elevator][1] = ((((data[10] << 8) + data[11]) - 32768)/32);
  surfData[surf.R_elevator][0] = ((((data[12] << 8) + data[13]) - 32768)/32);
  surfData[surf.R_elevator][1] = ((((data[14] << 8) + data[15]) - 32768)/32);

  // rudder data
  surfData[surf.rudder][0] = ((((data[16] << 8) + data[17]) - 32768)/32);
  surfData[surf.rudder][1] = ((((data[18] << 8) + data[19]) - 32768)/32);

  // trims data
  surfData[surf.trims][0] = ((((data[20] << 8) + data[21]) - 32768)/32);
  surfData[surf.trims][1] = ((((data[22] << 8) + data[23]) - 32768)/32);
  surfData[surf.trims][2] = ((((data[24] << 8) + data[25]) - 32768)/32);

  return surfData;
}

function updateCtrlData(data: Uint8Array){
  let ctrlData = [0, 0, 0, 0, 0];

  // Sensors data
  ctrlData[ctrl.roll]  = (data[0] << 8) + data[1]; // Check how to convert
  ctrlData[ctrl.pitch] = (data[2] << 8) + data[3]; // Check how to convert
  ctrlData[ctrl.yaw]   = (data[4] << 8) + data[5]; // Check how to convert

  // Sensors data
  ctrlData[ctrl.wheel] = ((((data[6] << 8) + data[7]) - 32768)/32);
  ctrlData[ctrl.stick] = ((((data[8] << 8) + data[9]) - 32768)/32);

  return ctrlData;
}

function updateSysInfo(info: Uint8Array){
  let systemInfo = [false, false, false, false, false, false, false, false, false, false, false];
  // Decode first byte
  if((info[0] - 128) >= 0){info[0] -= 128; systemInfo[sys.emerg_u]  = true;}
  if((info[0] - 64)  >= 0){info[0] -= 64;  systemInfo[sys.emerg_m]  = true;}
  if((info[0] - 32)  >= 0){info[0] -= 32;  systemInfo[sys.emerg_r]  = true;}
  if((info[0] - 16)  >= 0){info[0] -= 16;  systemInfo[sys.sysReset] = true;}

  // Decode second byte
  if((info[1] - 128) >= 0){info[1] -= 128; systemInfo[sys.init]         = true;}
  if((info[1] - 64)  >= 0){info[1] -= 64;  systemInfo[sys.calib]        = true;}
  if((info[1] - 32)  >= 0){info[1] -= 32;  systemInfo[sys.robotState]   = true;}
  if((info[1] - 16)  >= 0){info[1] -= 16;  systemInfo[sys.sensor1Error] = true;}
  if((info[1] - 8)   >= 0){info[1] -= 8;   systemInfo[sys.sensor2Error] = true;}
  if((info[1] - 4)   >= 0){info[1] -= 4;   systemInfo[sys.uartError]    = true;}
  if((info[1] - 2)   >= 0){info[1] -= 2;   systemInfo[sys.modbusError]  = true;}

  return systemInfo;
}

const App: React.FC = () => {

  // Callbacks for the manual ctrl variables

  // Axis Status
  const setAxisStatus = useCallback((status: boolean[]) => {
    axisStatus = status;
  },
  []);

  // Axis RTZ
  const setAxisRTZ = useCallback((rtz: boolean[]) => {
    axisRTZ = rtz;
  },
  []);

  // Yaw arrows
  const setYawArrows = useCallback((arrows: boolean[]) => {
    yawArrows = arrows;
  },
  []);

  // Joystick values
  const setJoystickValues = useCallback((jsck: number[]) => {
    joystickValues = jsck;
  },
  []);

  // Axis speeds
  const setAxisSpeeds = useCallback((speeds: number[]) => {
    axisSpeeds = speeds;
  },
  []);

  // Callback for the url path location
  const setAppLocation = useCallback(location => {
    appLocation = location;
  },
  []);

  // States

  // Change the authentification state to test the app without the login
  const [auth, setAuth] = useState(-1); // Authentification : -1 - not authentified, 0 - user spectator, 1 - user ctrl 

  // System info from most important to least important
  // 0 - emerg_r, 1 - emerg_m, 2 - emerg_u, 3 - uartError, 4 - sensor1Error, 5 - sensor2Error, 6 - modbusError, 7 - init, 8 - sysReset, 9 - calib, 10 - robotState
  const [sysInfo,  setSysInfo] = useState([false, false, false, false, false, false, false, false, false, false, false]);
  const [surfData, setSurfData] = useState([[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0, 0]]); // 0 - L_aileron, 1 - R_aileron, 2 - L_elevator, 3 - R_elevator, 4 - Rudder, 5 - Trims (ailerons, elevators, rudder)
  const [ctrlData, setCtrlData] = useState([0, 0, 0, 0, 0]); // 0 - Roll_angle, 1 - Pitch_angle, 2 - Yaw_angle, 3 - wheel_angle, 4 - stick_angle
  
  const wsConnect = useCallback(auth => {

    let connectionTimeout = 250;
    let socketType = (auth === 1) ? "/ctrl" : "/spec";
    let ws = new WebSocket("wss://".concat(serverIP, ":", serverPORT, socketType));

    ws.onmessage = function(msgEvent) {
      // Recover msg blob
      let msg = new Blob()
      msg = msgEvent.data

      // On buffer received
      msg.arrayBuffer().then((buffer) => {
        // Decode message
        let array = new Uint8Array(buffer);

        // Check if msg received is data
        if(array.length > 2){
          // Decode data depending on buffer length
          console.log(array.length);
          // Check if data is from ISTR surfs
          if(array.length > 10){
            setSurfData(updateSurfData(array));
          }
          // data is from ctrl
          else{
            setCtrlData(updateCtrlData(array));
          }
        }
        else{
          // Decode essential message
          setSysInfo(updateSysInfo(array));

          // Send response depending on location
          let reponse;
          if(appLocation === "/page/ARWindow"){
            if(auth === 1){
              reponse = new Blob([ctrlMessage()]);
            }
            else{
              reponse = new Blob([(new Uint8Array([1]))]);
            }
          }
          else if(appLocation === "/page/DataWindowISTR"){
            reponse = new Blob([(new Uint8Array([2]))]);
          }
          else if(appLocation === "/page/DataWindowRobot"){
            reponse = new Blob([(new Uint8Array([3]))]);
          }
          else{
            reponse = new Blob([(new Uint8Array([0]))]);
          }

          if(this.readyState === this.OPEN){
            this.send(reponse);
          }

          }

      });
    }

    ws.onopen = function(evt) {
      console.log("websocket is opened");
    }

    ws.onclose = function(evt) {
      console.log("websocket is closing");
      console.log(evt.reason);
      console.log(evt.code);
      if(wsReconnect > reconnectTimeout){
        console.log("disconnected");
        wsReconnect = 0;
        setAuth(-1);
      }
      else{
        setTimeout(()=>{
          if(!this || this.readyState === WebSocket.CLOSED){ wsReconnect++; wsConnect(auth); }
        }, connectionTimeout)
      }

    }

    ws.onerror = function(evt) {
      console.log("An error occured with the websocket connection");
      this.close();
    }

  },
  []);
  
  return (
    
    <IonApp>
      { (auth === -1)  && (<Login setAuth={setAuth} wsConnect={wsConnect}/>)}
      { (auth !== -1) && (
      <RemoteButtonsProvider>
        <IonReactRouter>
          <Header auth={auth} sysInfo={sysInfo}/>
          <IonContent>
            <IonSplitPane contentId="main" when={false}> 
              <Menu auth={auth} setAppLocation={setAppLocation}/>
              <IonRouterOutlet id="main">
                <Route path="/page/InputWindow" render={() => (<InputWindow />)} exact />
                <Route path="/page/DataWindowISTR" render={() => (<DataWindowISTR surfData={surfData} />)} exact />
                <Route path="/page/DataWindowRobot" render={() => (< DataWindowRobot ctrlData={ctrlData}/>)} exact />
                <Route path="/page/ARWindow" render={() => (<ARWindow auth={auth} surfData={surfData} setJoystickValues={setJoystickValues}
                  setAxisSpeeds={setAxisSpeeds} setAxisStatus={setAxisStatus} setAxisRTZ={setAxisRTZ} setYawArrows={setYawArrows}/>)} exact />
                <Redirect from="/" to={auth !== -1 ? (auth === 1 ? "/page/InputWindow" : "/page/DataWindowISTR") : "/"} exact />
              </IonRouterOutlet>
            </IonSplitPane>
          </IonContent>
        </IonReactRouter>
      </RemoteButtonsProvider>
      )}
    </IonApp>
    
  );
};

export default App;
