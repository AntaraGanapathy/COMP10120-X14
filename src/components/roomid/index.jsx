import React, { useState } from 'react';
import {database, ref, set, push} from '../../firebase/firebase';
import firebase from 'firebase/compat/app';


export function saveValue(roomid, name){
    return set(ref('rooms/${roomid}'), {
        username : name,
        exampletext : "test"
    })
    .then(() => console.log("Data written succesfully"))
    .catch((error) => console.error("Error"));
    
}

