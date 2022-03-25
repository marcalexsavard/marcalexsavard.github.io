const serverIP = "132.207.84.26";
const serverPORT = "5000"; 
const reconnectTimeout = 5;
var wsReconnect = 0;
let ws;

 function updateSurfData(data){
  let surfData = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0, 0]];

  // ailerons data
  surfData[0][0] = ((((data[0] << 8) + data[1]) - 32768)/32);
  surfData[0][1] = ((((data[2] << 8) + data[3]) - 32768)/32);
  surfData[1][0] = ((((data[4] << 8) + data[5]) - 32768)/32);
  surfData[1][1] = ((((data[6] << 8) + data[7]) - 32768)/32);

  // elevators data
  surfData[2][0] = ((((data[8] << 8) + data[9]) - 32768)/32);
  surfData[2][1] = ((((data[10] << 8) + data[11]) - 32768)/32);
  surfData[3][0] = ((((data[12] << 8) + data[13]) - 32768)/32);
  surfData[3][1] = ((((data[14] << 8) + data[15]) - 32768)/32);

  // rudder data
  surfData[4][0] = ((((data[16] << 8) + data[17]) - 32768)/32);
  surfData[4][1] = ((((data[18] << 8) + data[19]) - 32768)/32);

  // trims data
  surfData[5][0] = ((((data[20] << 8) + data[21]) - 32768)/32);
  surfData[5][1] = ((((data[22] << 8) + data[23]) - 32768)/32);
  surfData[5][2] = ((((data[24] << 8) + data[25]) - 32768)/32);

  // update HTML

  // RH AILERON
  document.getElementById('rh-ail-pos').setAttribute('text', "value: ".concat(surfData[0][0].toFixed(2), "; align: left; color: black; width: 6; height: auto"));
  document.getElementById('rh-ail-ld').setAttribute('text', "value: ".concat(surfData[0][1].toFixed(2), " lb;  align: left; color: black; width: 6; height: auto"));
  //document.getElementById('rh-ail-lding').setAttribute('text', "value: ".concat("ON", ";  align: left; color: black; width: 6; height: auto"));

  // LF AILERON
  document.getElementById('lf-ail-pos').setAttribute('text', "value: ".concat(surfData[1][0].toFixed(2), "; align: left; color: black; width: 6; height: auto"));
  document.getElementById('lf-ail-ld').setAttribute('text', "value: ".concat(surfData[1][1].toFixed(2), " lb;  align: left; color: black; width: 6; height: auto"));
  //document.getElementById('lf-ail-lding').setAttribute('text', "value: ".concat("ON", ";  align: left; color: black; width: 6; height: auto"));

  // RH ELEVATOR
  document.getElementById('rh-elv-pos').setAttribute('text', "value: ".concat(surfData[2][0].toFixed(2), "; align: left; color: black; width: 6; height: auto"));
  document.getElementById('rh-elv-ld').setAttribute('text', "value: ".concat(surfData[2][1].toFixed(2), " lb;  align: left; color: black; width: 6; height: auto"));
  //document.getElementById('rh-elv-lding').setAttribute('text', "value: ".concat("ON", ";  align: left; color: black; width: 6; height: auto"));

  // LF ELEVATOR
  document.getElementById('lf-elv-pos').setAttribute('text', "value: ".concat(surfData[3][0].toFixed(2), "; align: left; color: black; width: 6; height: auto"));
  document.getElementById('lf-elv-ld').setAttribute('text', "value: ".concat(surfData[3][1].toFixed(2), " lb;  align: left; color: black; width: 6; height: auto"));
  //document.getElementById('lf-elv-lding').setAttribute('text', "value: ".concat("ON", ";  align: left; color: black; width: 6; height: auto"));

    // RUDDER
    document.getElementById('rudder-pos').setAttribute('text', "value: ".concat(surfData[3][0].toFixed(2), "; align: left; color: black; width: 6; height: auto"));
    document.getElementById('rudder-ld').setAttribute('text', "value: ".concat(surfData[3][1].toFixed(2), " lb;  align: left; color: black; width: 6; height: auto"));
    //document.getElementById('rudder-lding').setAttribute('text', "value: ".concat("ON", ";  align: left; color: black; width: 6; height: auto"));
}

function wsConnect(){

  let connectionTimeout = 250;
  ws = new WebSocket("wss://".concat(serverIP, ":", serverPORT, "/AR"));

  ws.onopen = function(e) {
  };

  ws.onmessage = function(event) {
    // Recover msg blob
    let msg = new Blob()
    msg = event.data
    // On buffer received
    msg.arrayBuffer().then((buffer) => {
      // Decode message
      let array = new Uint8Array(buffer);
      updateSurfData(array)
    });
  };

  ws.onclose = function(event) {
      console.log("AR websocket is closing");
      console.log(event.reason);
      console.log(event.code);
      if(wsReconnect > reconnectTimeout){
        wsReconnect = 0;
        alert(`[error] data link lost`);
      }
      else{
        setTimeout(()=>{
          if(!this || this.readyState == WebSocket.CLOSED){ wsReconnect++; wsConnect(ws); }
        }, connectionTimeout)
      }
  };

  ws.onerror = function(error) {
    console.log(error.message);
  };

}

function wsDisconnect(){
  ws.close(1000, "AR scene going away")
}

 