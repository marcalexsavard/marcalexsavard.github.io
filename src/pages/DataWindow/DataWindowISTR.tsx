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
import './DataWindowISTR.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface dataWindow {
  surfData: number[][];
}

// Liste des axes et de leurs variables
interface axisInterface {
  name: string;     // Nom de l'axe, pour affichage, par exemple pour les graphes
  datatype: string[];  // Signification du data recu
  data: number[];   // Le data qu'on recoit du server, sous forme de liste de valeurs (Ajouter un vecteur temps pour correspondre?) 
  icon: string;     // Logo représentant l'axe
}

const axis: axisInterface[] = [
  {
    name: 'R Aileron',                            // Roulis Right Aileron
    datatype: ['Pos.','Load'],
    data: [1, 2],                          // Valeurs bidons, temporaire
    icon: 'assets/icon/doritos_man.png',      // Image à créer, doritos man pour l'instant
  },
  {
    name: 'L Aileron',                            // Roulis Left Aileron
    datatype: ['Pos.','Load'],
    data: [7, 2],                          // Valeurs bidons, temporaire
    icon: 'assets/icon/doritos_man.png',      // Image à créer, doritos man pour l'instant
  },
  {
    name: 'R Elevator',                            // Tangage élévateur droit
    datatype: ['Pos.','Load'],
    data: [2, 4],
    icon: 'assets/icon/doritos_man.png',
  },
  {
    name: 'L Elevator',                            // Tangage élévateur gauche
    datatype: ['Pos.','Load'],
    data: [2, 9],
    icon: 'assets/icon/doritos_man.png',
  },
  {
    name: 'Rudder',                              // Lacet
    datatype: ['Pos.','Load'],
    data: [3, 1],
    icon: 'assets/icon/doritos_man.png',
  },
  {
    name: 'Trim',
    datatype: ['Roll','Pitch','Yaw'],
    data: [1,2,3],
    icon: 'assets/icon/doritos_man.png'
  }

];

function UpdateAxisSelected(index:number,axisSelected:boolean[]){               //  Inverse axesSelected selon le bouton pesé

  switch(index){
      case 0:{return [!axisSelected[0],axisSelected[1],axisSelected[2],axisSelected[3],axisSelected[4],axisSelected[5]];}
      case 1:{return [axisSelected[0],!axisSelected[1],axisSelected[2],axisSelected[3],axisSelected[4],axisSelected[5]];}
      case 2:{return [axisSelected[0],axisSelected[1],!axisSelected[2],axisSelected[3],axisSelected[4],axisSelected[5]];}
      case 3:{return [axisSelected[0],axisSelected[1],axisSelected[2],!axisSelected[3],axisSelected[4],axisSelected[5]];}
      case 4:{return [axisSelected[0],axisSelected[1],axisSelected[2],axisSelected[3],!axisSelected[4],axisSelected[5]];}
      case 5:{return [axisSelected[0],axisSelected[1],axisSelected[2],axisSelected[3],axisSelected[4],!axisSelected[5]];}
      default:{return axisSelected;}

  }

}

var firstPass = false;
var refTime = 0;

const surffix = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];

var surfGraph = surffix       // Tableau vide qui se remplira avec les données qu'on lui donne

  
    //time:      0 ,          // Temps
    //posLail:   0 ,          // Position aleron gauche
    //chargLail: 0,           //  chargement aileron gauche
    //posRail:   0 ,          // Position aileron droit
    //chargRail: 0,           //  chargement aileron droit
    //posLele:   0 ,          // Position élévateur gauche
    //chargLele: 0,           //  chargement elevateur gauche
    //posRele:   0 ,          // Position elevateur droit
    //chargRele: 0,           //  chargement elevateur droit
    //posrudd:   0,           //  position rudder
    //chargrudd: 0,           //  chargemetn rudder
    //trimroll:  0,           // trim roulis
    //trimpitch: 0,           // trim roulis
    //trimyaw:   0           // trim roulis
  
function UpdateGraphData(surfData:number[][]){

  let date = new Date();

  if(!firstPass){
    firstPass = true;
    refTime = date.getTime();
  }

  surfGraph.push(               // ajout d'un nouvel élément à la liste surfGraph
    {
    time:      date.getTime()-refTime,   // Temps
    posLail:   surfData[0][0] ,          // Position aleron gauche
    chargLail: surfData[0][1],           //  chargement aileron gauche
    posRail:   surfData[1][0] ,          // Position aileron droit
    chargRail: surfData[1][1],           //  chargement aileron droit
    posLele:   surfData[2][0] ,          // Position élévateur gauche
    chargLele: surfData[2][1],           //  chargement elevateur gauche
    posRele:   surfData[3][0] ,          // Position elevateur droit
    chargRele: surfData[3][1],           //  chargement elevateur droit
    posrudd:   surfData[4][0],           //  position rudder
    chargrudd: surfData[4][1],           //  chargemetn rudder
    trimroll:  surfData[5][0],           // trim roulis
    trimpitch: surfData[5][1],           // trim roulis
    trimyaw:   surfData[5][2]            // trim roulis
    }
  )
  if(surfGraph.length > 50){
    surfGraph.shift()
  }
  return(surfGraph)
}


const DataWindowISTR: React.FC<dataWindow> = ({surfData}) => {

  const [axisIndex, setAxisIndex] = useState(-1);                                         // Garde trace de quel bouton vient d'être pressé (-1 si aucun)
  const [axisSelected, setAxisSelected] = useState([false, false, false, false, false]);  // Garde trace de si un bouton est pesé ou non
  const [GraphMode, setGraphMode] = useState(false);                                      // True = Mode graphique, False = Mode données numériques

  
  return (
      <IonPage>
        <IonHeader>
          <IonTitle size="large">Data Window - ISTR</IonTitle>
        </IonHeader>
        <IonContent>
          
          <IonCard id="axis-selection">
            <IonCardHeader>
              <IonRow>
                <IonCardTitle>Surfaces</IonCardTitle>
                <IonItem id="change-mode" button onClick={()=>{setGraphMode(!GraphMode);firstPass = false; surfGraph = [{}];}} detail={false}>
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
          {(axisIndex !== -1) && (!GraphMode) && (                                 // L'équivalent d'un if
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
                            <IonLabel>{datatype}</IonLabel>
                            <IonLabel>{surfData[0][index].toFixed(2)}</IonLabel>
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
                          <IonLabel>{datatype}</IonLabel>
                          <IonLabel>{surfData[1][index].toFixed(2)}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          {/** Aurait un bouton ici pour acceder aux graphes */}
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
                          <IonLabel>{datatype}</IonLabel>
                          <IonLabel>{surfData[2][index].toFixed(2)}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          {/** Aurait un bouton ici pour acceder aux graphes */}
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
                          <IonLabel>{datatype}</IonLabel>
                          <IonLabel>{surfData[3][index].toFixed(2)}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          {/** Aurait un bouton ici pour acceder aux graphes */}
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
                          <IonLabel>{datatype}</IonLabel>
                          <IonLabel>{surfData[4][index].toFixed(2)}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          {/** Aurait un bouton ici pour acceder aux graphes */}
                        </IonItem>
                      </IonCol>
                  );
                  })}
                </IonCol>
                <IonCol>
                  {(axisSelected[5]) && axis[5].datatype.map((datatype, index) => {        // Prend le data de axis à la position axisIndex, puis le map
                    return (
                      <IonCol>
                        <IonItem>
                          <IonLabel>{datatype}</IonLabel>
                          <IonLabel>{surfData[5][index].toFixed(2)}</IonLabel>                 {/**  data ici est celui dans la parenthese de map*/}
                          {/** Aurait un bouton ici pour acceder aux graphes */}
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
            
                <ResponsiveContainer width="98%" height="65%" key={surfData[1][1]}>
                  
                  <LineChart width={400} height={500} data={UpdateGraphData(surfData)}>
                    
                    {(axisSelected[0]) && (
                    <Line type="monotone" dataKey="posLail" stroke="#fa1f0f" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[0]) && (
                    <Line type="monotone" dataKey="chargLail" stroke="#f58078" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    
                    {(axisSelected[1]) && (
                    <Line type="monotone" dataKey="posRail" stroke="#ffea00" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[1]) && (
                    <Line type="monotone" dataKey="chargRail" stroke="#d4ff00" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    
                    {(axisSelected[2]) && (
                    <Line type="monotone" dataKey="posLele" stroke="#00ad06" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[2]) && (
                    <Line type="monotone" dataKey="chargLele" stroke="#84b886" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    
                    {(axisSelected[3]) && (
                    <Line type="monotone" dataKey="posRele" stroke="#00fff2" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[3]) && (
                    <Line type="monotone" dataKey="chargRele" stroke="#24706c" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}

                    {(axisSelected[4]) && (
                    <Line type="monotone" dataKey="posrudd" stroke="#0004ff" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[4]) && (
                    <Line type="monotone" dataKey="chargrudd" stroke="#6768a1" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    
                    {(axisSelected[5]) && (
                    <Line type="monotone" dataKey="trimroll" stroke="#9500ff" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[5]) && (
                    <Line type="monotone" dataKey="trimpitch" stroke="#ff00ea" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}
                    {(axisSelected[5]) && (
                    <Line type="monotone" dataKey="trimyaw" stroke="#5c5c5c" strokeWidth="2" isAnimationActive={false} animationEasing='linear' dot={false}/>)}  

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

export default DataWindowISTR;


    //time:      0 ,          // Temps
    //posLail:   0 ,          // Position aleron gauche
    //chargLail: 0,           //  chargement aileron gauche
    //posRail:   0 ,          // Position aileron droit
    //chargRail: 0,           //  chargement aileron droit
    //posLele:   0 ,          // Position élévateur gauche
    //chargLele: 0,           //  chargement elevateur gauche
    //posRele:   0 ,          // Position elevateur droit
    //chargRele: 0,           //  chargement elevateur droit
    //posrudd:   0,           //  position rudder
    //chargrudd: 0,           //  chargemetn rudder
    //trimroll:  0,           // trim roulis
    //trimpitch: 0,           // trim roulis
    //trimyaw:   0           // trim roulis