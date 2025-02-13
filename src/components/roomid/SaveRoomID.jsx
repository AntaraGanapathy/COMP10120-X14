import React, {useState} from "react";
import { saveValue } from ".";

const SaveRoomID = () => {

    const [roomID, setRoomID] = useState("");
    const [name, setName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const handleSave = async () => {

        if (roomID && name) {

            try {
            const response = await saveValue(roomID, name);
            setStatusMessage(response)
            } 
            catch (error) {
                setStatusMessage(error.message);
            }

        }

        else {
            setStatusMessage("Provide valid value");
        }

    };

    return (

        <div>

            <h2>Enter RoomID</h2>

            <input
                type = "text"
                placeholder = "RoomID"
                value = {roomID}
                onChange = {(e) => setRoomID(e.target.value)}
            />

            <input
                type = "text"
                placeholder = "Name"
                value = {name}
                onChange = {(e) => setName(e.target.value)}
            />

            <button onClick = {handleSave}>Save</button>

            {statusMessage && <p>{statusMessage}</p>} {/*Display Message*/}

        </div>

    );

};

export default SaveRoomID;