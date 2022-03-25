import React, { useState } from 'react';

export const RemoteButtonsContext = React.createContext<any>(undefined);

export const RemoteButtonsProvider = ({children}:any) => {

    // Index: (0: Stop, 1: Pause, 2: Play, 3: Emerg) 
    // State: (0: Inactif, 1: Actif, 2: Pressed)
    const [remoteButtonsState, setRemoteButtonsState] = useState([0,0,0,0]);

    let buttonsState = {
        remoteButtonsState,
        setRemoteButtonsState
    };

return <RemoteButtonsContext.Provider value={buttonsState}>{children}</RemoteButtonsContext.Provider>
};

export default RemoteButtonsContext;
