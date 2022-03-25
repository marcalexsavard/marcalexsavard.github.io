import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonPopover,
  IonCheckbox,
  IonCard,
} from "@ionic/react";
import React, {useState} from "react";
import { useLocation } from 'react-router-dom';
import "./ARWindow.css";

//IMPORT ICONS:
//Right yaw arrow
import chevronFowardOutline from "./icons/chevron-forward-outline.svg";

//Left yaw arrow
import chevronBackOutline from "./icons/chevron-back-outline.svg"; 

//JOYSTICK IMPORT:
import { Joystick } from "react-joystick-component";

//SLIDER IMPORT:
import { Direction, Range } from 'react-range';

//Browser vs mobile detect
import { isBrowser } from 'react-device-detect';

//onLongPress event
import useLongPress from '../../scripts/useLongPress';

const joystickSize = 100;

const axis = ['Roll', 'Pitch', 'Yaw'];
var axisRepos = [false, false, false];

interface ARWindowInterface {
  auth: number;
  surfData: number[][];
  setJoystickValues: any;
  setAxisSpeeds: any;
  setAxisStatus: any;
  setAxisRTZ: any;
  setYawArrows: any;
}

function updateSliderValues(index: number, values: number[], sliderValue: number[][]){
  switch(index) {
    case 0: {return [values[0], sliderValue[1][0], sliderValue[2][0]];}
    case 1: {return [sliderValue[0][0], values[0], sliderValue[2][0]];}
    case 2: {return [sliderValue[0][0], sliderValue[1][0], values[0]];}
  }
  return [0, 0, 0];
}

function isAnySignalLoaded(){
  let isAnySignalLoaded = false;
  axis.forEach((axis) => {
    let inputString = sessionStorage.getItem(axis);
    if(typeof inputString === 'string'){isAnySignalLoaded = true;}
  });

  return isAnySignalLoaded;
}

const ARWindow: React.FC<ARWindowInterface> = ({auth, surfData, setJoystickValues, setAxisSpeeds, setAxisStatus, setAxisRTZ, setYawArrows}) => {

  const location = useLocation();
  const [axisButtonStates, setAxisButtonStates] = useState([false, false, false]);     // true : associated axis selected   false : associated axis unselected
  const [leftArrowState, setLeftArrowState] = useState(false);                         // true : left arrow pressed         false : left arrow release
  const [rightArrowState, setRightArrowState] = useState(false);                       // true : right arrow pressed        false : right arrow release
  const [sliderValue, setSliderValue] = useState([[0], [0], [0]]);                     // Value for each slider
  const [selectedSlider, setSelectedSlider] = useState(-1);                            // -1 : Unselected  0 : Roll slider selected  1 : Pitch slider selected  2 : Yaw slider selected
  
  const [showPopover, setShowPopover] = useState(false);                               // Set to true whenever we want to show a popover

  //Roll button click and hold events
  const rollPressEvent  = useLongPress(
    () => {
      if(axisButtonStates[0]){setSelectedSlider(0);}
    }, 
    () => {
      if(axisButtonStates[0] && (selectedSlider === 0)){setSelectedSlider(-1);}
      setAxisButtonStates([!axisButtonStates[0], axisButtonStates[1], axisButtonStates[2]]);
      setAxisStatus([!axisButtonStates[0], axisButtonStates[1], axisButtonStates[2]]);
    }
  );
  
  //Pitch button click and hold events
  const pitchPressEvent  = useLongPress(
    () => {
      if(axisButtonStates[1]){setSelectedSlider(1);}
    }, 
    () => {
      if(axisButtonStates[1] && (selectedSlider === 1)){setSelectedSlider(-1);}
      setAxisButtonStates([axisButtonStates[0], !axisButtonStates[1], axisButtonStates[2]]);
      setAxisStatus([axisButtonStates[0], !axisButtonStates[1], axisButtonStates[2]]);
    }
  );
  
  //Yaw button click and hold events
  const yawPressEvent  = useLongPress(
    () => {
      if(axisButtonStates[2]){setSelectedSlider(2);}
    }, 
    () => {
      if(axisButtonStates[2] && (selectedSlider === 2)){setSelectedSlider(-1);}
      setAxisButtonStates([axisButtonStates[0], axisButtonStates[1], !axisButtonStates[2]]);
      setAxisStatus([axisButtonStates[0], axisButtonStates[1], !axisButtonStates[2]]);
    }
  );
  
  return (
    <IonPage id="ar-window">
      <IonContent>
        {(location.pathname === '/page/ARWindow') && (
        <iframe title="AR Scene" src="../../../assets/AR_scene.html" scrolling="no" frameBorder='0'></iframe>
        )}
        {(auth === 1) && !(isAnySignalLoaded()) && (
        <IonGrid>
          <IonRow id="buttons">
            <IonCol size="2" className="axis-buttons">
              <IonItem className={axisButtonStates[0] ? "selected" : ''} 
              {...rollPressEvent} detail={false} lines='none'>
                <IonLabel>Roll</IonLabel>
              </IonItem>
            </IonCol>
            <IonCol size="2" className="axis-buttons">
              <IonItem className={axisButtonStates[1] ? "selected" : ''} 
              {...pitchPressEvent} detail={false} lines='none'>
                <IonLabel>Pitch</IonLabel>
              </IonItem>
            </IonCol>
            <IonCol size="2" className="axis-buttons">
              <IonItem className={axisButtonStates[2] ? "selected" : ''} 
              {...yawPressEvent} detail={false} lines='none'>
                <IonLabel>Yaw</IonLabel>
              </IonItem>
            </IonCol>
            <IonCol size="6" id="repos-button">
              <IonItem button onClick={() => {setShowPopover(true)}} detail={false} lines='none'>
                <IonLabel>Repos</IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow id="sliders">
            {axis.map((axis, index) => {
                return (
                  <IonCol size="2" key={index}>
                    {(selectedSlider === index) && (<IonCard key={index} onBlur={() => setSelectedSlider(-1)}> 
                      <Range key={index}
                        step={1}
                        min={0}
                        max={100}
                        values={sliderValue[index]}
                        onChange={(values) => {
                          let sliderValues = updateSliderValues(index,values,sliderValue)
                          setSliderValue([[sliderValues[0]], [sliderValues[1]], [sliderValues[2]]]);
                          setAxisSpeeds(sliderValues);
                        }}
                        direction={Direction.Down}
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '90%',
                              width: '10%',
                              backgroundColor: '#ccc'
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ props }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '10%',
                              width: '600%',
                              backgroundColor: '#999'
                            }}>
                            <div
                              style={{
                                position: 'absolute',
                                right: '-60%',
                                top: '-85%',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '120%',
                                fontFamily: 'Bebas Neue',
                                borderRadius: '4px',
                              }}>
                              {sliderValue[index][0]}
                            </div>
                         </div>
                        )}
                      />
                    </IonCard>
                    )}
                  </IonCol>
                );
            })}
            <IonCol size="6"></IonCol>
          </IonRow>
          <IonRow id="controls">
            <IonCol id="joystick">
              {" "}
              <Joystick
                size={joystickSize}
                baseColor="#92949c"
                stickColor="#3880ff"
                move={(evt) => {
                  let x = 0;
                  let y = 0;
                  if(typeof(evt.x) !== null){x = evt.x}
                  if(typeof(evt.y) !== null){y = evt.y}
                  setJoystickValues([Math.round(x), Math.round(y)]);
                }}
                stop={(evt) => {
                  let x = 0;
                  let y = 0;
                  setJoystickValues([Math.round(x), Math.round(y)]);
                }}
              ></Joystick>
            </IonCol>
            { isBrowser && (
            <IonCol id="yaw-arrows">
              <IonButton className={leftArrowState ? 'pressed' : ''} onMouseDown={() => {if(!leftArrowState){setLeftArrowState(true);setYawArrows([true, rightArrowState]);}}} 
                                                              onMouseUp={() => {if(leftArrowState){setLeftArrowState(false);setYawArrows([false, rightArrowState]);}}} onMouseOut={() => {if(leftArrowState){setLeftArrowState(false);}}}>
                <IonIcon slot="start" icon={chevronBackOutline}></IonIcon>
              </IonButton>
              <IonButton className={rightArrowState ? 'pressed' : ''} onMouseDown={() => {if(!rightArrowState){setRightArrowState(true);setYawArrows([leftArrowState, true]);}}} 
                                                              onMouseUp={() => {if(rightArrowState){setRightArrowState(false);setYawArrows([leftArrowState, false]);}}} onMouseOut={() => {if(rightArrowState){setRightArrowState(false);}}}>
                <IonIcon slot="end" icon={chevronFowardOutline}></IonIcon>
              </IonButton>
            </IonCol>
            )}
            { !isBrowser && (
            <IonCol id="yaw-arrows">
              <IonButton className={leftArrowState ? 'pressed' : ''} onTouchStart={() => {if(!leftArrowState){setLeftArrowState(true);setYawArrows([true, rightArrowState]);}}} 
                                                              onTouchEnd={() => {if(leftArrowState){setLeftArrowState(false);setYawArrows([false, rightArrowState]);}}}>
                <IonIcon slot="start" icon={chevronBackOutline}></IonIcon>
              </IonButton>
              <IonButton className={rightArrowState ? 'pressed' : ''} onTouchStart={() => {if(!rightArrowState){setRightArrowState(true);setYawArrows([leftArrowState, true]);}}} 
                                                              onTouchEnd={() => {if(rightArrowState){setRightArrowState(false);setYawArrows([leftArrowState, false]);}}}>
                <IonIcon slot="end" icon={chevronFowardOutline}></IonIcon>
              </IonButton>
            </IonCol>
            )} 
          </IonRow>
        </IonGrid>
        )}
        {/** REPOS POPOVER */}
        <IonPopover id="repos-pop" isOpen={showPopover} onDidDismiss={e => {setShowPopover(false); axisRepos=[false, false, false];}}>
          <IonRow id="text">
            <IonCol>
             <div>
               <br />Please select which axis you want to repositioned to zero  
             </div>
           </IonCol>
          </IonRow>
          <div id="checkboxes">
          {axis.map((axis, index) => {
                return (
                  <IonItem key={index}>
                    <IonLabel>{axis}</IonLabel>
                    <IonCheckbox slot="start" onClick={() => {axisRepos[index] = !axisRepos[index];}}/>
                  </IonItem> 
                  );
                })}
          </div>
          <IonRow id="ok-cancel-buttons">
            <IonCol>
              <IonItem button onClick={() => {setShowPopover(false); setAxisRTZ(axisRepos);}} detail={false}>
                <IonLabel>Ok</IonLabel>
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem button onClick={() => {setShowPopover(false); axisRepos=[false, false, false];}} detail={false}>
                <IonLabel>Cancel</IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonPopover>
      </IonContent>
    </IonPage>
  );
};

export default ARWindow;