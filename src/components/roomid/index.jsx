import React, { useState } from 'react';
import {database, ref, set, push, get, onValue} from '../../firebase/firebase';
import firebase from 'firebase/compat/app';
import { data } from 'autoprefixer';


export function saveValue(roomid, name){

    return set(ref(database, `rooms/${roomid}`), {
        username : name,
        exampletext : "test"
    })
    .then(() => console.log("Data written succesfully"))
    .catch((error) => console.error("Error"));
    
}


export function generateID(name){

    const dataref = ref(database, 'rooms');

    get(dataref)
        .then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                const roomIDs = Object.keys(snapshot.val());
                return (storeData(roomIDs, name));
            }
            else {
                const roomIDs = null;
                return (storeData(roomIDs, name));
                console.log("No data");
            }
        }) 
        .catch((error) => {
            console.log(error)
        });

    // onValue(dataref, (snapshot) => {
        
    //     if (snapshot.exists()) {
    //     const roomIDs = Object.keys(snapshot.val());
    //     return (storeData(roomIDs, name));
    //     } 
    //     else {
    //     const roomIDs = null;
    //     return (storeData(roomIDs, name));
    //     }

    // }, (errorObject) => {
    //     console.log("Failed read", errorObject.name);
    // })
}

function storeData(roomIDs, name) {

    if (roomIDs) {

        do {
        var randNum = Math.floor(100000 + Math.random() * 900000);
        } while (roomIDs.includes(randNum))
        
        if (!roomIDs.includes(randNum)) {
            return set(ref(database, `rooms/${randNum}`), {
                username : name
            })
            .then(() => console.log("Data written succesfully"))
            .catch((error) => console.error("Error"));
        }
    }
    else {

        var randNum = Math.floor(100000 + Math.random() * 900000);

        return set(ref(database, `rooms/${randNum}`), {
            username : name
        })
        .then(() => console.log("Data written succesfully"))
        .catch((error) => console.error("Error"));
    }

}