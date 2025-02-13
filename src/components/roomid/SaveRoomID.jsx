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

            <h1>Enter RoomID</h1>

        </div>

    );

};

export default SaveRoomID;