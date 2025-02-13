 // src/firebaseFunctions.js
import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

export const createRoom = async () => {
  try {
    const docRef = await addDoc(collection(db, "rooms"), {
      createdAt: new Date(),
    });
    console.log("Room created with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const joinRoom = async (roomId) => {
  try {
    const docRef = doc(db, "rooms", roomId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("Room data:", docSnap.data());
    } else {
      console.log("No such room!");
    }
  } catch (e) {
    console.error("Error getting document: ", e);
  }
};
