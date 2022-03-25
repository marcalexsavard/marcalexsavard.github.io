import {
  IonContent,
  IonItem,
  IonCard,
  IonLabel,
  IonCardTitle,
  IonCardContent,
  IonInput,
} from "@ionic/react";

import React, { useState } from "react";
import "./Login.css";

var username = "";
var password = "";

interface auth {
  setAuth: React.Dispatch<React.SetStateAction<number>>;
  wsConnect: any
}

function sendAuthRequest(username: string, password: string, 
  setAuth: React.Dispatch<React.SetStateAction<number>>,
  wsConnect: any,
  setIsLoggingIn: React.Dispatch<React.SetStateAction<boolean>>){

  // Prepare json with auth
  let data = {
    username: username,
    password: password
  };
  
  let auth = JSON.stringify(data);

  // Prepare AUTH request
  let request = new Request('', {
    method: 'AUTH',
    headers: {auth},
  });

  // Send request to serveur and set Auth state
  fetch(request)
  .then((response) => {
    if(response.statusText === "ctrl"){
      setAuth(1);
      wsConnect(1);
    }
    else if(response.statusText === "spec"){
      setAuth(0);
      wsConnect(0);
    }
    else{
      setAuth(-1);
      setIsLoggingIn(false);
    }})
  .catch((error) => {
    console.error('Error:', error);
    setAuth(-1);
    setIsLoggingIn(false);
  });

}

const Login: React.FC<auth> = ({setAuth, wsConnect}) => {

  const [isUsernameEntered, setIsUsernameEntered] = useState(false);
  const [isPasswordEntered, setIsPasswordEntered] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <IonContent id="login">
      <IonCard>
        <IonCardTitle>Login</IonCardTitle>
        <IonCardContent>
          <IonItem>
            <IonLabel>Username : </IonLabel>
            <IonInput onIonInput={
              (e: any) => {
                username = e.target.value;
                if(username.length > 0) {
                  setIsUsernameEntered(true);
                }
                else {
                  setIsUsernameEntered(false);
                }
              }
            } />
          </IonItem>
          <IonItem>
            <IonLabel>Password : </IonLabel>
            <IonInput onIonInput={
              (e: any) => {
                password = e.target.value;
                if(password.length > 0) {
                  setIsPasswordEntered(true);
                }
                else {
                  setIsPasswordEntered(false);
                }
              }
            } type="password" clearOnEdit={false}/>
          </IonItem>
          <IonItem id="enter" button={(isUsernameEntered && isPasswordEntered && !isLoggingIn)} 
          className={(isUsernameEntered && isPasswordEntered && !isLoggingIn) ? "unlocked" : ""}
          onClick={() => { setIsLoggingIn(true); sendAuthRequest(username.trim(), password.trim(), setAuth, wsConnect, setIsLoggingIn);}} detail={false}>
            <IonLabel>LOGIN</IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default Login;
