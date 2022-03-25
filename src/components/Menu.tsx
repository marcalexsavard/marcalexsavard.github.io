import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonPopover,
  IonRow,
  IonCol
} from '@ionic/react';

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Menu.css';

interface menu {
  auth: number;
  setAppLocation: any;
}

interface AppPage {
  url: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Input Window',
    url: '/page/InputWindow',
  },
  {
    title: 'Data Window',
    url: '/page/DataWindow',
  },
  {
    title: 'AR Window',
    url: '/page/ARWindow',
  }
];

const Menu: React.FC<menu> = ({auth, setAppLocation}) => {
  const location = useLocation();
  const [showPopover, setShowPopover] = useState(false);
  const [dataWindowType, setDataWindowType] = useState(0); // 0 - None  1 - ISTR  2 - Robot
  
  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="page-list">
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                { !((index === 0) && (auth === 0)) && (
                <IonItem className={((location.pathname === appPage.url) || ((index === 1) && (dataWindowType !== 0))) ? 'selected' : ''} routerLink={(index !== 1) ? appPage.url : location.pathname} 
                routerDirection="none" lines="none" detail={false} button onClick={() => {if(index === 1){setShowPopover(true);}else{if(dataWindowType !== 0){setDataWindowType(0);} setAppLocation(appPage.url);}}}>
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
                )}
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>

    {/** DATA WINDOW POPOVER **/}
      <IonPopover id="data-pop" isOpen={showPopover} onDidDismiss={e => {setShowPopover(false)}}>
       <IonRow>
         <IonCol>
          <IonItem button onClick={() => {setDataWindowType(1); setAppLocation(appPages[1].url + "ISTR"); setShowPopover(false);}} routerLink={appPages[1].url + "ISTR"} detail={false}>
            <IonLabel>ISTR</IonLabel>
          </IonItem>
        </IonCol>
        <IonCol>
        <IonItem button onClick={() => {setDataWindowType(2); setAppLocation(appPages[1].url + "Robot"); setShowPopover(false);}} routerLink={appPages[1].url + "Robot"} detail={false}>
            <IonLabel>ROBOT</IonLabel>
          </IonItem>
        </IonCol>
       </IonRow>
      </IonPopover>

    </IonMenu>
  );
};

export default Menu;
