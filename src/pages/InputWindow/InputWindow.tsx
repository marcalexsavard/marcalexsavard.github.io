import { 
  IonCard, IonCardContent, IonContent, IonCardHeader, 
  IonCardTitle, IonHeader, IonInput, IonList, IonItem, 
  IonPage, IonTitle, IonRow, IonCol, IonLabel, IonPopover, IonSelect, IonSelectOption } from '@ionic/react';
import React, {useState} from 'react';
import './InputWindow.css';

import rampIcon  from './icons/rampIcon.svg';
import sinusIcon  from './icons/sinusIcon.svg';
import stepIcon   from './icons/stepIcon.svg';
import squareIcon from './icons/squareIcon.svg';
import simIcon    from './icons/simIcon.svg';

// remote buttons context
import {RemoteButtonsContext} from "../../contexts/remoteButtonsContext";

// Decimal precision
const DEC_PREC = 100;

// Maximums and minimums
const ANGLE_SAFETY_FACTOR = 1;
// In deg
const MAX_ROLL_ANGLE  = 17.0*ANGLE_SAFETY_FACTOR;
const MIN_ROLL_ANGLE  = -16.0*ANGLE_SAFETY_FACTOR;
const MAX_PITCH_ANGLE = 26.0*ANGLE_SAFETY_FACTOR;
const MIN_PITCH_ANGLE = -14.0*ANGLE_SAFETY_FACTOR;
const MAX_YAW_ANGLE   = 17.0*ANGLE_SAFETY_FACTOR;
const MIN_YAW_ANGLE   = -17.0*ANGLE_SAFETY_FACTOR;

// Precisions
// In deg
const ROLL_ANGLE_PREC   = 0.1
const PITCH_ANGLE_PREC  = 0.1
const YAW_ANGLE_PREC    = 0.1

// Speeds
const SPEED_SAFETY_FACTOR = 1;
// In deg/sec
const MAX_ROLL_SPEED  = 10.0*SPEED_SAFETY_FACTOR;
const MIN_ROLL_SPEED  = 1.0;
const MAX_PITCH_SPEED = 10.0*SPEED_SAFETY_FACTOR;
const MIN_PITCH_SPEED = 1.0;
const MAX_YAW_SPEED   = 10.0*SPEED_SAFETY_FACTOR;
const MIN_YAW_SPEED   = 1.0;


const inputAxis = ['Roll', 'Pitch', 'Yaw'];
var inputStored = [false, false, false]; 

var storedFiles = ["", "myFlightPlan", ""]; // Server should give that
var fileList = ["file1", "file2", "file3", "file4", "file5"]; // Server should give that
var selectedFiles = ["", "", ""];

var entriesErrorMessage = '';

interface inputType {
  name: string;
  parameters: string[];
  icon: string;
}

const inputTypes: inputType[] = [
    {
      name: 'Ramp',
      parameters: ['Initial value', 'Final value', 'Rise time'],
      icon: rampIcon,
    },
    {
      name: 'Sinus',
      //parameters: ['Maximum', 'Minimum', 'Phase shift', 'Period'],
      parameters: ['Maximum', 'Minimum', 'Period'],
      icon: sinusIcon,
    },
    {
      name: 'Step',
      parameters: ['Initial value', 'Final value', 'Step time'],
      icon: stepIcon,
    },
    {
      name: 'Square',
      //parameters: ['Maximum', 'Minimum', 'Phase shift', 'Period'],
      parameters: ['Maximum', 'Minimum', 'Period'],
      icon: squareIcon,
    },
    {
      name: 'Simulation',
      parameters: [],
      icon: simIcon,
    }
  ];

function handleEntry(inputType: number, axisIndex: number, value: string, entries: string[]) {

  let entryMissing = false;
  let number = 0;

  switch(inputType) {
    case 0: {for(let i of entries){if(i === ""){break;}else{number++;}}; if(number < 3){entryMissing = true}  break;} 
    case 1: {for(let i of entries){if(i === ""){break;}else{number++;}}; if(number < 3/*4*/){entryMissing = true}  break;} 
    case 2: {for(let i of entries){if(i === ""){break;}else{number++;}}; if(number < 3){entryMissing = true}  break;} 
    case 3: {for(let i of entries){if(i === ""){break;}else{number++;}}; if(number < 3/*4*/){entryMissing = true}  break;} 
  }

  return !entryMissing;

}

function popOverDescriptionMessage(inputType: number, axisIndex: number, entries: string[]) {

  if(inputStored[axisIndex] === false){
    switch(inputType) {
      case 0: {return "add a Ramp input (I.V. : " + parseFloat(entries[0]).toString(10) + ", F.V. : " + parseFloat(entries[1]).toString(10) + ", R.T. : " + parseFloat(entries[2]).toString(10) + ") to the " + inputAxis[axisIndex];}
      case 1: {/*return "add a Sin input (MAX. : " +  entries[0] + ", MIN. : " + entries[1] + ", P.S. : " + entries[2] + ", P. : " + entries[3] + ") to the " + inputAxis[axisIndex];*/
               return "add a Sin input (MAX. : " +  parseFloat(entries[0]).toString(10) + ", MIN. : " + parseFloat(entries[1]).toString(10) + ", P. : " + parseFloat(entries[2]).toString(10) + ") to the " + inputAxis[axisIndex];} 
      case 2: {return "add a Step input (I.V. : " + parseFloat(entries[0]).toString(10) + ", F.V. : " + parseFloat(entries[1]).toString(10) + ", S.T. : " + parseFloat(entries[2]).toString(10) + ") to the " + inputAxis[axisIndex];} 
      case 3: {/*return "add a Square input (MAX. : " + entries[0] + ", MIN. : " + entries[1] + ", P.S. : " + entries[2] + ", P. : " + entries[3] + ") to the " + inputAxis[axisIndex];*/
               return "add a Square input (MAX. : " +  parseFloat(entries[0]).toString(10) + ", MIN. : " + parseFloat(entries[1]).toString(10) + ", P. : " + parseFloat(entries[2]).toString(10) + ") to the " + inputAxis[axisIndex];} 
    }
  }
  else {
    let input = getStoredInput(axisIndex);
    if(input != null){
      return "remove the " + input.inputType + " input from " + inputAxis[axisIndex];
    }
    else{
      return "None";
    }
    
  }
}

function removeInput(inputType: number, axisIndex: number, remoteButtonsState: any, setRemoteButtonsState: any){

  // Send axis to server (RM_SIGNAL request)
  let request = new Request('', {
    method: 'RM_SIGNAL',
    headers: {axis: inputAxis[axisIndex]},
  });

  fetch(request)
  .then((response) => {
    if (response.status === 200) {
    // Remove signal data
    sessionStorage.removeItem(inputAxis[axisIndex]);
    inputStored[axisIndex] = false;

    // Update QAB
    setRemoteButtonsState(updateRemoteButtons(inputType, axisIndex, remoteButtonsState));
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

}

function storeInput(inputType: number, axisIndex: number, entries: string[], remoteButtonsState: any, setRemoteButtonsState: any){
  
  let data = {
    inputType: inputTypes[inputType].name,
    parameters: entries
  }

  let json_data = JSON.stringify(data);

  // Send data to server (ADD_SIGNAL request)
  let request = new Request('', {
    method: 'ADD_SIGNAL',
    headers: {axis: inputAxis[axisIndex], json_data},
  });

  fetch(request)
  .then((response) => {
    if (response.status === 200) {
      // Remove flight plan
      sessionStorage.removeItem('FP');
      
      // Store signal data
      sessionStorage.setItem(inputAxis[axisIndex], json_data);
      inputStored[axisIndex] = true;
      
      // Update QAB
      setRemoteButtonsState(updateRemoteButtons(inputType, axisIndex, remoteButtonsState));
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

}

function storeSelectedFlightPlan(axisIndex: number){

  if(axisIndex >= 0){
    if(storedFiles[axisIndex] !== ''){
      sessionStorage.setItem('FP', storedFiles[axisIndex]);
    }
    else{
      sessionStorage.removeItem('FP');
    }
  }

}

function getSelectedFPnumber(){

  let selectedFP = sessionStorage.getItem("FP");
  let index = -1;

  if(typeof selectedFP === "string"){
    for(let i=0; i<storedFiles.length; i++){
      if(selectedFP === storedFiles[i]){index = i;}
    }
  }

  return index;
  
}

function getStoredInput(axisIndex: number) {
  let inputString = sessionStorage.getItem(inputAxis[axisIndex]);

  if (typeof inputString === 'string'){
    let input = JSON.parse(inputString);
    return input;
  }

  return null;
}

function getInputIndex(axisIndex: number) {
  let input =  getStoredInput(axisIndex);

  if(input != null){
    for(let i = 0; i < inputTypes.length; i++){
      if(inputTypes[i].name === input.inputType){
        return i;
      }
    }
  }

  return 0;
}

function isInputTypeBlocked(inputTypeIndex: number) {

  let isBlocked;

  if(inputTypeIndex < 4){
    for(let i = 0; i < inputStored.length; i++){
      if(inputStored[i] === false) { isBlocked = false; break; }
      isBlocked = true;
    }
  }
  else{
    for(let i = 0; i < inputStored.length; i++){
      if(inputStored[i] === true) { isBlocked = true; break; }
      isBlocked = false;
    }
  }

  return isBlocked;

}

function updateStoredFiles(fileIndex: number, toBeRemove: boolean){  

  if(fileIndex === 0){
    if(!toBeRemove) {
      storedFiles = [selectedFiles[fileIndex], storedFiles[1], storedFiles[2]];
    }
    else{
      storedFiles = ["", storedFiles[1], storedFiles[2]];
    }
    
    return storedFiles;
  } 
  else if(fileIndex === 1){

    if(!toBeRemove) {
      storedFiles = [storedFiles[0], selectedFiles[fileIndex], storedFiles[2]];
    }
    else{
      storedFiles = [storedFiles[0], "", storedFiles[2]];
    }

    return storedFiles;
  }
  else{

    if(!toBeRemove) {
    storedFiles = [storedFiles[0], storedFiles[1], selectedFiles[fileIndex]];
    }
    else{
      storedFiles = [storedFiles[0], storedFiles[1], ""];
    }

    return storedFiles;
  }
}

function updateRemoteButtons(inputType: number, axisIndex: number, buttonsState:number[]){

  let isInputStored = false;

  if(inputType === 4) {
    if(storedFiles[axisIndex] !== ""){
      return [buttonsState[0], buttonsState[1], 1, buttonsState[3]];
    }
    else{
      return [buttonsState[0], buttonsState[1], 0, buttonsState[3]];
    }
  }
  else{
    inputStored.forEach(input => {
      if(input === true){isInputStored = true;}
    });
  }

  if(isInputStored){
    return [buttonsState[0], buttonsState[1], 1, buttonsState[3]];
  }
  else{
    return [buttonsState[0], buttonsState[1], 0, buttonsState[3]];
  }
}

function inSimulation(remoteButtons: number[]){
  return (remoteButtons[2] === 2 || remoteButtons[1] === 2);
} 

function validateEntries(inputTypeIndex: number, axisIndex: number, entries: string[]){
  
  var IsEntriesValid = true;

  var entryValue1 = 0.0;
  var entryValue2 = 0.0;
  var entryValue3 = 0.0;
  //var entryValue4 = 0.0; - Entry 4 is not used

  try{
    entryValue1 = parseFloat(entries[0]);
    entryValue2 = parseFloat(entries[1]);
    entryValue3 = parseFloat(entries[2]);
    //entryValue4 = parseFloat(entries[3]); - Entry 4 is not used
  }
  catch(err){
    console.log(err);
    entriesErrorMessage = 'Entry type is not a number';
    IsEntriesValid = false;
    return IsEntriesValid;
  }

  var MAX_ANGLE   = 0.0;
  var MIN_ANGLE   = 0.0;
  var ANGLE_PREC  = 0.0;
  var MAX_SPEED   = 0.0;
  var MIN_SPEED   = 0.0;

  switch(axisIndex){
    // Roll
    case 0: {
      MAX_ANGLE   = MAX_ROLL_ANGLE;
      MIN_ANGLE   = MIN_ROLL_ANGLE;
      ANGLE_PREC  = ROLL_ANGLE_PREC;
      MAX_SPEED   = MAX_ROLL_SPEED;
      MIN_SPEED   = MIN_ROLL_SPEED;
      break;
    }
    // Pitch
    case 1: {
      MAX_ANGLE   = MAX_PITCH_ANGLE;
      MIN_ANGLE   = MIN_PITCH_ANGLE;
      ANGLE_PREC  = PITCH_ANGLE_PREC;
      MAX_SPEED   = MAX_PITCH_SPEED;
      MIN_SPEED   = MIN_PITCH_SPEED;
      break;
    }
    // Yaw
    case 2: {
      MAX_ANGLE   = MAX_YAW_ANGLE;
      MIN_ANGLE   = MIN_YAW_ANGLE;
      ANGLE_PREC  = YAW_ANGLE_PREC;
      MAX_SPEED   = MAX_YAW_SPEED;
      MIN_SPEED   = MIN_YAW_SPEED;
      break;
    }
  }

  // Check if entry 1 is not greater than max value
  if(entryValue1 > MAX_ANGLE)
  {
    entriesErrorMessage = 'First entry is greater than the maximum value allowed';
    IsEntriesValid = false;
    return IsEntriesValid;
  }
  // Check if entry 1 is not smaller than min value
  if(entryValue1 < MIN_ANGLE)
  {
    entriesErrorMessage = 'First entry is smaller than the minimum value allowed';
    IsEntriesValid = false;
    return IsEntriesValid;
  }
  // Check entry 1 precision 
  let val1 = (entryValue1*DEC_PREC - Math.floor(entryValue1)*DEC_PREC)%(ANGLE_PREC*DEC_PREC);
  if(val1 > 0)
  {
    entriesErrorMessage = 'First entry is not within precision';
    IsEntriesValid = false;
    return IsEntriesValid;
  }
  // Check if entry 2 is not greater than max value
  if(entryValue2 > MAX_ANGLE)
  {
    entriesErrorMessage = 'Second entry is greater than the maximum value allowed';
    IsEntriesValid = false;
    return IsEntriesValid;
  }
  // Check if entry 2 is not smaller than min value
  if(entryValue2 < MIN_ANGLE)
  {
    entriesErrorMessage = 'Second entry is smaller than the minimum value allowed';
    IsEntriesValid = false;
    return IsEntriesValid;
  }
  // Check entry 2 precision
  let val2 = (entryValue2*DEC_PREC - Math.floor(entryValue2)*DEC_PREC)%(ANGLE_PREC*DEC_PREC);
  if(val2 > 0)
  {
    entriesErrorMessage = 'Second entry is not within precision';
    IsEntriesValid = false;
    return IsEntriesValid;
  }

  var MAX_TIME = Math.abs((entryValue1 - entryValue2))/MIN_SPEED;
  var MIN_TIME = ANGLE_PREC/MAX_SPEED;

  // Check entry 3 
  switch(inputTypeIndex){
    // Ramp
    case 0: {
      // Check Rise Time

      // Check if entry 3 is greater than zero
      if(entryValue3 < MIN_TIME)
      {
        entriesErrorMessage = 'Third entry must be greater the minimum value allowed';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      // Check precision
      let val3 = (entryValue3*DEC_PREC - Math.floor(entryValue3)*DEC_PREC)%(0.1*DEC_PREC);
      if(val3 > 0)
      {
        entriesErrorMessage = 'Third entry is not within precision';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      // Check if entry 3 is smaller than max value
      if(entryValue3 > MAX_TIME)
      {
        entriesErrorMessage = 'Third entry must be smaller than the maximum value allowed';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      break;
    }
    // Sinus
    case 1: {
      // Check if entry 1 > entry2
      if(entryValue1 < entryValue2)
      {
        entriesErrorMessage = 'The minimum value cannot be greater than or equal to the maximum value';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      // Check Period
      // TO DO : ADD VERIFICATION TO SIN WAVE PERIOD
      break;
    }
    // Step
    case 2: {
      // Check Step time

      // Check if entry 3 is greater than zero
      if(entryValue3 < 0)
      {
        entriesErrorMessage = 'Third entry must be greater than zero';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      // Check precision
      let val3 = (entryValue3*DEC_PREC - Math.floor(entryValue3)*DEC_PREC)%(0.1*DEC_PREC);
      if(val3 > 0)
      {
        entriesErrorMessage = 'Third entry is not within precision';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      // Check if entry 3 is smaller than max value
      if(entryValue3 > 255)
      {
        entriesErrorMessage = 'Third entry must be smaller than the maximum value allowed';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      break;
    }
    // Square
    case 3: {
      // Check if entry 1 > entry2
      if(entryValue1 < entryValue2)
      {
        entriesErrorMessage = 'The minimum value cannot be greater than or equal to the maximum value';
        IsEntriesValid = false;
        return IsEntriesValid;
      }
      // Check Period
      // TO DO : ADD VERIFICATION TO SQUARE WAVE PERIOD
      break;
    }
  }

  return IsEntriesValid
}

function inputPlaceHolder(axisIndex: number, inputTypeIndex: number, parameterIndex: number){

  var placeHolder = "";

  var MAX_ANGLE   = 0.0;
  var MIN_ANGLE   = 0.0;
  var ANGLE_PREC  = 0.0;
  var MAX_SPEED   = 0.0;
  var MIN_SPEED   = 0.0;

  switch(axisIndex){
    // Roll
    case 0: {
      MAX_ANGLE   = MAX_ROLL_ANGLE;
      MIN_ANGLE   = MIN_ROLL_ANGLE;
      ANGLE_PREC  = ROLL_ANGLE_PREC;
      MAX_SPEED   = MAX_ROLL_SPEED;
      MIN_SPEED   = MIN_ROLL_SPEED;
      break;
    }
    // Pitch
    case 1: {
      MAX_ANGLE   = MAX_PITCH_ANGLE;
      MIN_ANGLE   = MIN_PITCH_ANGLE;
      ANGLE_PREC  = PITCH_ANGLE_PREC;
      MAX_SPEED   = MAX_PITCH_SPEED;
      MIN_SPEED   = MIN_PITCH_SPEED;
      break;
    }
    // Yaw
    case 2: {
      MAX_ANGLE   = MAX_YAW_ANGLE;
      MIN_ANGLE   = MIN_YAW_ANGLE;
      ANGLE_PREC  = YAW_ANGLE_PREC;
      MAX_SPEED   = MAX_YAW_SPEED;
      MIN_SPEED   = MIN_YAW_SPEED;
      break;
    }
  }

  var MAX_TIME = (MAX_ANGLE - MIN_ANGLE)/MIN_SPEED;
  var MIN_TIME = ANGLE_PREC/MAX_SPEED;

  switch(inputTypeIndex){
    // Ramp
    case 0: {
      switch(parameterIndex){
        // Initial value
        case 0: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Final value
        case 1: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Rise Time
        case 2: { placeHolder = "max: ".concat(MAX_TIME.toFixed(1), " sec \t\tmin: ", MIN_TIME.toFixed(1), " sec \t\tprecision: ", "0.1 sec"); break;}
      } break;
    }
    // Sinus
    case 1: {
      switch(parameterIndex){
        // Maximum
        case 0: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Minimum
        case 1:{ placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Phase shift
        //case 2: { placeHolder = "max: ".concat("180 deg", "\t\tmin: ", "0 deg", "\tprecision: ", "1 deg"); break;}
        // Period
        case 2: { placeHolder = "max: ".concat("x sec", "\t\tmin: ", "y sec", "\tprecision: ", "z sec"); break;} // TO DO: SET VALUE X, Y AND Z
        //case 3: {break;} 
      } break;
    }
    // Step
    case 2: {
      switch(parameterIndex){
        // Initial value
        case 0: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Final value
        case 1: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Step time
        case 2: {placeHolder = "max: ".concat("255.0 sec", "\t\tmin: ", "0.0 sec", "\t\tprecision: ", "0.1 sec"); break;}
      } break;
    }
    // Square
    case 3: {
      switch(parameterIndex){
        // Maximum
        case 0: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Minimum
        case 1: { placeHolder = "max: ".concat(MAX_ANGLE.toFixed(1), " deg \tmin: ", MIN_ANGLE.toFixed(1), " deg \tprecision: ", ANGLE_PREC.toFixed(1), " deg"); break; }
        // Phase shift
        //case 2: { placeHolder = "max: ".concat("180 deg", "\t\tmin: ", "0 deg", "\tprecision: ", "1 deg"); break;}
        // Period
        case 2: { placeHolder = "max: ".concat("x sec", "\t\tmin: ", "y sec", "\tprecision: ", "z sec"); break;} // TO DO: SET VALUE X, Y AND Z
        //case 3: {break;}
      } break;
    }
  }

  return placeHolder;

}

const InputWindow: React.FC = () => {

  const [inputTypeIndex, setInputTypeIndex] = useState(-1);                                     // Choosen Input type (-1: none is choosen) (0: Ramp, 1: Sinus, 2: Step, 3: Square)
  const [axisIndex, setAxisIndex] = useState(-1);                                               // Choosen axis (-1: none is choosen) (0: Roll, 1: Pitch, 2: Yaw)
  const [entries, setEntries] = useState(["", "", "", ""]);                                     // Entries for parameters ("": empty entry) *up to 4
  const [inputStored_state, setInputStored_state] = useState(inputStored);                      // State that indicates if an input is added to particular axis (true = yes) 

  const [entriesFilledOut, setEntriesFilledOut] = useState(false);                              // Set to true if all the input entries are filled out for a particular input type
  const [showDescriptionPopover, setShowDescriptionPopover] = useState(false);                  // Set to true whenever we want to show the input description popover
  const [showEntriesErrorPopover, setShowEntriesErrorPopover] = useState(false);                // Set to true whenever we want to show the entries error popover

  const [flightPlans, setFlightPlans] = useState(storedFiles);                                  // List of the flight plans stored

  const { remoteButtonsState, setRemoteButtonsState } = React.useContext(RemoteButtonsContext);

  return (
    <IonPage>
      
      <IonHeader>
        <IonTitle size="large">Input Window</IonTitle>
      </IonHeader>

      <IonContent fullscreen>
        
        {/** INPUT TYPE CARD **/}
        <IonCard id="input-type">
          <IonCardHeader>
            <IonCardTitle>Input type</IonCardTitle>
          </IonCardHeader>
  
          <IonCardContent>
            <IonList>
              <IonRow>
                {inputTypes.map((inputType, index) => {
                  return ( 
                    <IonCol key={index}>
                      <IonItem className={(inputTypeIndex === index) && !isInputTypeBlocked(index) ? 'selected' : ''+((isInputTypeBlocked(index) || inSimulation(remoteButtonsState))? 'blocked' : '')} 
                               button onClick={() => {if(!inSimulation(remoteButtonsState)){setInputTypeIndex(index); if(index === 4){setAxisIndex(getSelectedFPnumber());}else{selectedFiles = ["", "", ""]; setAxisIndex(-1);}}
                               setEntries(["", "", "", ""]); setEntriesFilledOut(false);}} detail={false}>
                        <img src={inputType.icon} alt=""/>
                      </IonItem>
                    </IonCol>
                   );
                  })}
              </IonRow>
            </IonList>
          </IonCardContent>  
        </IonCard>

        <IonRow>
          {/** AXIS OR FLIGHT PLANS CARD **/}
          <IonCol size="4">
            <IonCard id="input-axis">
              <IonCardHeader>
              { (inputTypeIndex < 4 || isInputTypeBlocked(inputTypeIndex)) && (
                <IonCardTitle>Axis</IonCardTitle>
              )}
              { inputTypeIndex >= 4 && !isInputTypeBlocked(inputTypeIndex) && (
                <IonCardTitle>Flight plans</IonCardTitle>
              )}
              </IonCardHeader>
              <IonCardContent>
                <IonList id="axis-list">
                {inputAxis.map((axis, index) => {
                  if(inputTypeIndex < 4 || isInputTypeBlocked(inputTypeIndex)) { return ( 
                    <IonItem className={axisIndex === index ? 'selected'+(inputStored_state[index] ? '-stored' : '') : ''+(inputStored_state[index] ? 'stored' : '')}
                             button onClick={() => {setAxisIndex(index); setEntries(["", "", "", ""]); setEntriesFilledOut(false);}} detail={false}>
                      <IonLabel>{axis}</IonLabel>
                    </IonItem>
                  );} 
                  else { return (
                    <IonItem className={(axisIndex === index) ? 'selected' : ''} 
                             button detail={false} onClick={() => {if(!inSimulation(remoteButtonsState)){setAxisIndex(index); storeSelectedFlightPlan(index); 
                             setRemoteButtonsState(updateRemoteButtons(inputTypeIndex, index, remoteButtonsState));} setEntries(["", "", "", ""]); setEntriesFilledOut(false); }} >
                      <IonLabel>{index + 1}</IonLabel>
                    </IonItem>
                  );}
                })}
                </IonList>
              </IonCardContent>
            </IonCard>
          </IonCol>

          {/** PARAMETERS ENTRY CARD **/}
          <IonCol>
          { (inputTypeIndex >= 0 && axisIndex >= 0 && inputTypeIndex < 4 && !inputStored_state[axisIndex]) && !inSimulation(remoteButtonsState) && (
            <IonCard id="input-parameters">
              <IonCardHeader>
                <IonCardTitle>Parameters</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList id="parameters-list">
                {inputTypes[inputTypeIndex].parameters.map((parameter, index) => {
                return ( 
                    <IonItem>
                      <IonLabel position="stacked">{parameter}</IonLabel>
                      <IonInput type="number" value={parseFloat(entries[index]).toString(10)}
                                placeholder={inputPlaceHolder(axisIndex, inputTypeIndex, index)}
                                onIonInput={ (e: any) => {entries[index] = e.target.value; 
                                setEntriesFilledOut(handleEntry(inputTypeIndex, index, e.target.value, entries));}}>
                      </IonInput>
                    </IonItem>
                  );
                })}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
          {/** PARAMETERS DESCRIPTION CARD **/}
          { inputStored_state[axisIndex] && (
            <IonCard id="stored-parameters">
              <IonCardHeader>
                <IonCardTitle>{getStoredInput(axisIndex).inputType}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
              <IonList>
                {inputTypes[getInputIndex(axisIndex)].parameters.map((parameter, index) => {
                return ( 
                    <IonItem>
                      <IonLabel position="stacked">{parameter} : {getStoredInput(axisIndex).parameters[index]}</IonLabel>
                    </IonItem>
                  );
                })}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
          {/** FILES DESCRIPTION/ENTRY CARD **/}
          { inputTypeIndex === 4 && !isInputTypeBlocked(inputTypeIndex) && (
            <IonCard id="flight-plans">
            <IonCardContent>
              <IonRow>
                <IonCol>
                  <IonList id="select-file">
                    {flightPlans.map((flightplan, index) => {
                     if(flightplan === "" && !inSimulation(remoteButtonsState)) { return ( 
                        <IonSelect key={index} placeholder="Select file" onIonChange={e => {selectedFiles[index] = e.detail.value;}}> 
                          {fileList.map((file) => {
                            return (
                            <IonSelectOption>{file}</IonSelectOption>
                            );
                          })}
                        </IonSelect>
                      );}
                      else { return (
                        <IonItem lines="none">{flightplan}</IonItem>
                      );}
                    })}
                  </IonList>
                </IonCol>
                <IonCol>
                {/** THIS STEP WILL NORMALLY INITIALIZE A DOWNLOAD OR A ERASE FILE COMMAND TO THE SERVER **/}
                {!inSimulation(remoteButtonsState) && (
                  <IonList id="add-rm">
                    {flightPlans.map((flightplan, index) => {
                     if(flightplan === "") { return (
                      <IonItem key={index} button onClick={() => {setFlightPlans(updateStoredFiles(index, false)); storeSelectedFlightPlan(axisIndex); 
                          if(axisIndex !== -1){setRemoteButtonsState(updateRemoteButtons(inputTypeIndex, axisIndex, remoteButtonsState));}}} detail={false} lines="none">
                        <IonLabel>Add</IonLabel>
                      </IonItem>
                      );}
                      else { return (
                      <IonItem key={index} button onClick={() => {setFlightPlans(updateStoredFiles(index, true)); storeSelectedFlightPlan(axisIndex); 
                          if(axisIndex !== -1){setRemoteButtonsState(updateRemoteButtons(inputTypeIndex, axisIndex, remoteButtonsState));}}} detail={false} lines="none">
                        <IonLabel>Remove</IonLabel>
                      </IonItem>
                      );}
                    })}
                  </IonList>
                )}
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>
          )}
          </IonCol>
        </IonRow>

        {/** INPUT DESCRIPTION POPOVER **/}
        <IonPopover id="add-rm" isOpen={showDescriptionPopover} onDidDismiss={e => setShowDescriptionPopover(false)}>
          <IonRow>
            <IonCol id="desc">
              Are you sure you want to {popOverDescriptionMessage(inputTypeIndex, axisIndex, entries)} axis?
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem button onClick={() => {if(!inputStored_state[axisIndex]) {
                                                // TO DO: else -> setErrorPopover
                                                storeInput(inputTypeIndex, axisIndex, entries, remoteButtonsState, setRemoteButtonsState);}
                                              else{
                                                // TO DO: else -> setErrorPopover
                                                removeInput(inputTypeIndex, axisIndex, remoteButtonsState, setRemoteButtonsState); setEntries(["", "", "", ""]);
                                              }
                                              setShowDescriptionPopover(false); 
                                              setInputStored_state(inputStored); 
                                              }} detail={false}>
                <IonLabel>YES</IonLabel>
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem button onClick={() => {setShowDescriptionPopover(false);}} detail={false}>
                <IonLabel>NO</IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonPopover>

        {/** ENTRY ERROR POPOVER **/}
        <IonPopover id="error" isOpen={showEntriesErrorPopover} onDidDismiss={e => setShowEntriesErrorPopover(false)}>
          <IonRow>
            <IonCol>
              <h1>**ENTRY ERROR**</h1>
              <h2>{entriesErrorMessage}</h2>
            </IonCol>
          </IonRow>
        </IonPopover>
        
        {/** ADD & REMOVE BUTTONS **/}
        <IonRow id="add-rm" >
        { (entriesFilledOut && !inputStored_state[axisIndex]) && !inSimulation(remoteButtonsState) && (
          <IonItem button onClick={() => {if(validateEntries(inputTypeIndex, axisIndex, entries)){setShowDescriptionPopover(true);}else{setShowEntriesErrorPopover(true);}}} detail={false}>
            <IonLabel>Add</IonLabel>
          </IonItem> )}
        { (inputStored_state[axisIndex]) && !inSimulation(remoteButtonsState) && (
        <IonItem button onClick={() => {setShowDescriptionPopover(true);}} detail={false}>
          <IonLabel>Remove</IonLabel>
        </IonItem> )}
        </IonRow>

      </IonContent>
    </IonPage>
  );
};

export default InputWindow;
