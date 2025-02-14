import React, {useState} from "react";
import { saveValue, generateID } from ".";

const SaveRoomID = () => {

    const [name, setName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const createRoom = async () => {

        if (name) {

            try {            
            const response = await generateID(name);
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

            <h2>Create RoomID</h2>

            <input
                type = "text"
                placeholder = "Name"
                value = {name}
                onChange = {(e) => setName(e.target.value)}
            />

            <button onClick = {createRoom}>Generate</button>

            {statusMessage && <p>{statusMessage}</p>} {/*Display Message*/}

        </div>

    );

};

export default SaveRoomID;