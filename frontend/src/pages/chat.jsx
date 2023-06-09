import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/ChatBox';
import ConversationSelector from '../assets/components/ConversationSelector';
import DeleteChatButton from '../assets/components/DeleteChatButton';
import { fetchCharacter, fetchSettings, getCharacterImageUrl } from "../assets/components/Api";
import "../assets/css/chat.css";

const defaultChar = 'Vapor'
const Chat = () => {
const [selectedCharacter, setSelectedCharacter] = useState(null);
const [settings, setSettings] = useState(null);
const [characterAvatar, setCharacterAvatar] = useState(null);
const [selectedConversation, setSelectedConversation] = useState('');
const [configuredEndpoint, setconfiguredEndpoint] = useState('http://localhost:5100/');
const [configuredEndpointType, setconfiguredEndpointType] = useState('AkikoBackend');

const handleConversationSelect = (conversationName) => {
  setSelectedConversation(conversationName || null); // Set to null if conversationName is empty
};

useEffect(() => {
    const fetchData = async () => {
        setconfiguredEndpoint(localStorage.getItem('endpoint'));
        setconfiguredEndpointType(localStorage.getItem('endpointType'));
        var selectedChar = localStorage.getItem('selectedCharacter');
        var convoName = localStorage.getItem('convoName');
        setSettings(fetchSettings())
        if (convoName){
            setSelectedConversation(convoName);
        }
        if (selectedChar) {
            selectedChar = await fetchCharacter(selectedChar);
            setSelectedCharacter(selectedChar); // set the state to the character object
			setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
        } else {
            const customDefault = settings.customDefault
            if (customDefault) {
                selectedChar = await fetchCharacter(customDefault);
                setSelectedCharacter(selectedChar)
				setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
            } else {
                selectedChar = await fetchCharacter(defaultChar);
                setSelectedCharacter(selectedChar)
				setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
            }
        }
    }
    fetchData();
}, []);

const handleDelete = () => {
    setSelectedConversation('')
    window.location.reload();
}

return (
	<div className="container">
        <ConversationSelector onConversationSelect={handleConversationSelect} characterName={selectedCharacter} charAvatar={characterAvatar}/>
        {selectedConversation && (
            <DeleteChatButton
                conversationName={selectedConversation}
                onDelete={handleDelete}
            />
        )};
		<Chatbox selectedCharacter={selectedCharacter} charAvatar={characterAvatar} endpoint={configuredEndpoint} endpointType={configuredEndpointType} convoName={selectedConversation}/>
	</div>
);
};

export default Chat;
