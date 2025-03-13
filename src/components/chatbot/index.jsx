import React, { useCallback, useEffect, useState } from "react";
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput} from "@chatscope/chat-ui-kit-react";

const ChatBot = () => {

    return(
        <div className="ChatBot">
            <div style={{position: "relative", height: "800px", width: "1000px"}}>
                <MainContainer>
                    <ChatContainer>
                        <MessageList>
                            <Message model={{
                                message: "Hello",
                                sentTime: "just now",
                                sender: "Joe"
                            }} />
                        </MessageList>
                        <MessageInput placeholder="Type here" />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    )

}

export default ChatBot