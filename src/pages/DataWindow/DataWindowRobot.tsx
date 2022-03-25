import {
  IonCard,
  IonCardContent,
  IonContent,
  IonCardHeader, 
  IonCardTitle,
  IonHeader,
  IonList,
  IonItem, 
  IonPage,
  IonTitle,
  IonRow,
  IonCol,
  IonLabel,
} from '@ionic/react';
import React, {useState} from 'react';
import './DataWindowRobot.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Liste des axes et de leurs variables
interface axisInterface {
  name: string;     // Nom de l'axe, pour affichage, par exemple pour les graphes
  datatype: string[];
  data: number[];   // Le data qu'on recoit du server, sous forme de liste de valeurs (Ajouter un vecteur temps pour correspondre?) 
  icon: string;     // Logo représentant l'axe
}

const axis: axisInterface[] = [
  {
    name: 'Roll',                             // Roulis
    datatype: ['angle'],
    data: [1],                          // Valeurs bidons, temporaire
    icon: 'assets/icon/doritos_man.png',      // Image à créer, doritos man pour l'instant
  },
  {
    name: 'Pitch',                            // Tangage
    datatype: ['angle'],
    data: [2],
    icon: 'assets/icon/doritos_man.png',
  },
  {
    name: 'Yaw',                              // Lacet
    datatype: ['position'],
    data: [3],
    icon: 'assets/icon/doritos_man.png',
  },
  {
    name: 'Wheel',                            // angle du volant
    datatype: ['angle'],
    data: [2],
    icon: 'assets/icon/doritos_man.png',
  },
  {
    name: 'Stick',                            // Angle de manche
    datatype: ['angle'],
    data: [2],
    icon: 'assets/icon/doritos_man.png',
  }
];

function UpdateAxisSelected(index:number,axisSelected:boolean[]){               //  Inverse axesSelected selon le bouton pesé
  switch(index){
      case 0:{return [!axisSelected[0],axisSelected[1],axisSelected[2],axisSelected[3],axisSelected[4]];}
      case 1:{return [axisSelected[0],!axisSelected[1],axisSelected[2],axisSelected[3],axisSelected[4]];}
      case 2:{return [axisSelected[0],axisSelected[1],!axisSelected[2],axisSelected[3],axisSelected[4]];}
      case 3:{return [axisSelected[0],axisSelected[1],axisSelected[2],!axisSelected[3],axisSelected[4]];}
      case 4:{return [axisSelected[0],axisSelected[1],axisSelected[2],axisSelected[3],!axisSelected[4]];}
  
      default:{return axisSelected;}
  }
}

var firstPass = false;
var refTime = 0;

const ctrlfix = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];

var ctrlGraph = ctrlfix       // Tableau vide qui se remplira avec les données qu'on lui donne

  //time:      date.getTime()-refTime,    // Temps
  //posroll:   ctrlData[0] ,              // Position roulis
  //pospitch:  ctrlData[1],               // Position tangage
  //posyaw:    ctrlData[2] ,              // Position lacet
  //poswheel:  ctrlData[3],               // Position volant
  //posstick:  ctrlData[4] ,              // Position manche
  
function UpdateGraphData(ctrlData:number[]){

  let date = new Date();

  if(!firstPass){
    firstPass = true;
    refTime = date.getTime();
  }

  ctrlGraph.push(               // ajout d'un nouvel élément à la liste surfGraph
    {
    time:      date.getTime()-refTime,   // Temps
    posroll:   ctrlData[0] ,          // Position roulis
    pospitch:  ctrlData[1],           // Position tangage
    posyaw:    ctrlData[2] ,          // Position lacet
    poswheel:  ctrlData[3],           // Position volant
    posstick:  ctrlData[4] ,          // Position manche
    
    }
  )
  if(ctrlGraph.length > 50){
    ctrlGraph.shift()
  }
  return(ctrlGraph)
}

interface dataWindow {
  ctrlData: number[];
}

const DataWindowRobot: React.FC<dataWindow> = ({ctrlData}) => {

  const [axisIndex, setAxisIndex] = useState(-1);                                         // Garde trace de quel bouton vient d'être pressé (-1 si aucun)
  const [axisSelected, setAxisSelected] = useState([false, false, false, false, false]);                // Garde trace de si un bouton est pesé ou non
  const [GraphMode, setGraphMode] = useState(false);                                      // True = Mode graphique, False = Mode données numériques
  return (
      <IonPage>
        <IonHeader>
          <IonTitle size="large">Data Window - Robot</IonTitle>
        </IonHeader>
        <IonContent>
          {/**  <img src='assets/icon/doritos_man.png'></img> **/}
          
        <LineChart></LineChart>

          <IonCard id="axis-selection">
            <IonCardHeader>
              <IonRow>
                <IonCardTitle>Controls</IonCardTitle>
                <IonItem id="change-mode" button onClick={()=>{setGraphMode(!GraphMode);firstPass = false; ctrlGraph = [{}];}} detail={false}>
                    <IonLabel>Change Mode</IonLabel>
                </IonItem>
              </IonRow>
            </IonCardHeader>
    
            <IonCardContent>
              <IonList>
                <IonRow>
                  {axis.map((axis, index) => {                // Crée les choses qui suivent pour chaque possibilités de la constante axis
                    return ( 
                      <IonCol key={index}>
                        <IonItem button className={axisSelected[index]?'selected':''} onClick={()=>{setAxisIndex(index); setAxisSelected(UpdateAxisSelected(index,axisSelected))}} detail={false}>  
                          <IonLabel>{axis.name}</IonLabel>       
                        </IonItem>
                      </IonCol>
                    );
                    })}
                </IonRow>
              </IonList>
            </IonCardContent>  
          </IonCard>
          {(axisIndex !== -1) && (!GraphMode) && (                                    // L'équivalent d'un if
          <IonCard id="axis-data">
            <IonCardHeader>
              <IonCardTitle>Data</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonRow>
                <IonCol>
                  
                    {(axisSelected[0]) && axis[0].datatype.map((datatype, index) => {        // Prend le data de axis à la position axisIndex, puis le map
                      return (
                        <IonCol>
                          <IonItem>
                            <IonLabel>{datatype}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                            <IonLabel>{ctrlData[0].toFixed(2)}</IonLabel>
                          </IonItem>
                        </IonCol>
                        
                    );
                    })}
                
                </IonCol>
                <IonCol>
                  {(axisSelected[1]) && axis[1].datatype.map((datatype, index) => {   // Prend le data de axis à la position axisIndex, puis le map
                    return (
                      <IonCol>
                        <IonItem>
                          <IonLabel>{datatype}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          <IonLabel>{ctrlData[1].toFixed(2)}</IonLabel>
                        </IonItem>
                      </IonCol>
                  );
                  })}
                </IonCol>
                <IonCol>
                  {(axisSelected[2]) && axis[2].datatype.map((datatype, index) => {        // Prend le data de axis à la position axisIndex, puis le map
                    return (
                      <IonCol>
                        <IonItem>
                          <IonLabel>{datatype}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          <IonLabel>{ctrlData[2].toFixed(2)}</IonLabel>
                        </IonItem>
                      </IonCol>
                  );
                  })}
                </IonCol>
                <IonCol>
                  {(axisSelected[3]) && axis[3].datatype.map((datatype, index) => {        // Prend le data de axis à la position axisIndex, puis le map
                    return (
                      <IonCol>
                        <IonItem>
                          <IonLabel>{datatype}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          <IonLabel>{ctrlData[3].toFixed(2)}</IonLabel>
                        </IonItem>
                      </IonCol>
                  );
                  })}
                </IonCol>
                <IonCol>
                  {(axisSelected[4]) && axis[4].datatype.map((datatype, index) => {        // Prend le data de axis à la position axisIndex, puis le map
                    return (
                      <IonCol>
                        <IonItem>
                          <IonLabel>{datatype}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          <IonLabel>{ctrlData[4].toFixed(2)}</IonLabel>
                        </IonItem>
                      </IonCol>
                  );
                  })}
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>
          )}
          {(axisIndex !== -1) && (GraphMode) && (             
            <ResponsiveContainer width="98%" height="65%" key={ctrlData[1]}>
              
              <LineChart width={400} height={500} data={UpdateGraphData(ctrlData)}>
                
                {(axisSelected[0]) && (
                <Line type="monotone" dataKey="posroll" stroke="#fa1f0f" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                
                {(axisSelected[1]) && (
                <Line type="monotone" dataKey="pospitch" stroke="#ffea00" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                
                {(axisSelected[2]) && (
                <Line type="monotone" dataKey="posyaw" stroke="#00ad06" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                
                {(axisSelected[3]) && (
                <Line type="monotone" dataKey="poswheel" stroke="#00fff2" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}

                {(axisSelected[4]) && (
                <Line type="monotone" dataKey="posstick" stroke="#0004ff" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}

                <XAxis dataKey="time"></XAxis>
                <YAxis></YAxis> 
                <Tooltip/>
                <Legend/>    
              </LineChart>
            </ResponsiveContainer>    
      )}
        </IonContent>
      </IonPage>
  );
};

export default DataWindowRobot;
