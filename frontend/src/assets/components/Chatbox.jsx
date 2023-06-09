import React, { useState, useEffect, useRef } from "react";
import ChatboxInput from './ChatBoxInput';
import Avatar from './Avatar';
import { saveConversation, fetchConversation } from "./Api";
import { characterTextGen } from "./ChatApi";
import { getBase64 } from "./miscfunctions";

function Chatbox({ selectedCharacter, endpoint, endpointType, convoName, charAvatar}) {
  const [messages, setMessages] = useState([]);
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [conversationName, setConversationName] = useState('');
  const [configuredName, setconfiguredName] = useState('You');
  const [invalidActionPopup, setInvalidActionPopup] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('default');
  const messagesEndRef = useRef(null); // create ref to last message element in chatbox

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem('configuredName') == null){
        setconfiguredName(localStorage.getItem('configuredName'));
      }
      if (selectedCharacter && selectedCharacter.avatar) {
        setCharacterAvatar(charAvatar);
        console.log(selectedCharacter.name, "is selected.");
      }else{
        return;
      }
      if (convoName !== null) {
        setConversationName(convoName);
        localStorage.setItem('convoName', convoName);
        const conversation = await fetchConversation(convoName);
        setMessages(conversation.messages);
      }else {
        const now = new Date();
        const newName = selectedCharacter.name + "_" + now.getTime();
        localStorage.setItem('convoName', newName);
        setConversationName(newName);
        if (selectedCharacter && selectedCharacter.name) {
          const defaultMessage = {
            conversationName: newName,
            sender: selectedCharacter.name,
            text: selectedCharacter.first_mes.replace('<USER>', configuredName),
            avatar: characterAvatar,
            isIncoming: true,
            timestamp: Date.now(),
          };
          setMessages([defaultMessage]);
        }
      }
    };
    fetchData();
  }, [selectedCharacter, convoName, charAvatar]);

  useEffect(() => {
    // scroll to last message when messages state updates
    if (messagesEndRef.current !== null) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInvalidAction = () => {
    setInvalidActionPopup(false)
    window.location.href = '/characters'
  }
  
  const handleUserMessage = async (text, image, avatar) => {
    if (!selectedCharacter){
      setInvalidActionPopup(true)
      return;
    }
    if (text.length < 1 && image == null) {
      handleChatbotResponse(messages);
    } else {
      const now = new Date();
      const newMessage = {
        conversationName: conversationName,
        sender: configuredName,
        text: text,
        image: image ? await getBase64(image) : null, // convert image to base64 string
        avatar: avatar || 'https://cdn.discordapp.com/attachments/1070388301397250170/1072227534713921616/tmpu7e13o19.png',
        isIncoming: false,
        timestamp: now.getTime(),
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      // Call chatbot response after user message has been added
      handleChatbotResponse(updatedMessages, image);
      // Save the conversation with the new message
      saveConversation(selectedCharacter, updatedMessages);
    }
  };  
  
  const handleChatbotResponse = async (chatHistory, image) => {
    const history = chatHistory
    .map((message) => `${message.sender}: ${message.text}`)
    .join('\n');

    // Make API call
    const generatedText = await characterTextGen(selectedCharacter, history, endpoint, endpointType, image, configuredName);

    // Add new incoming message to state
    const now = new Date();
    const newIncomingMessage = {
      conversationName: conversationName,
      sender: selectedCharacter.name,
      text: generatedText.replace('<USER>', configuredName),
      avatar: characterAvatar,
      isIncoming: true,
      timestamp: now.getTime(),
    };
    const updatedMessages = [...chatHistory, newIncomingMessage];
    setMessages(updatedMessages);
    saveConversation(selectedCharacter, updatedMessages)
  };
  
  return (
    <>
    {selectedCharacter && (
      <Avatar selectedCharacter={selectedCharacter} emotion={currentEmotion}/>
    )}
    <div className="chatbox-wrapper">
      <div className="message-box">
      {messages.map((message, index) => (
        <div key={index} className={message.isIncoming ? "incoming-message" : "outgoing-message"} >
          <div className={message.isIncoming ? "avatar incoming-avatar" : "avatar outgoing-avatar"}>
            <img src={message.avatar} alt={`${message.sender}'s avatar`} />
          </div>
          <div className="message-info">
            <p className="sender-name">{message.sender}</p>
            <p className="message-text" dangerouslySetInnerHTML={{__html: message.text.replace(/\*(.*?)\*/g, '<i>$1</i>')}}></p>
            {message.image && (
              <img className="sent-image" src={message.image} alt="User image"/>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef}></div>
      </div>
      <ChatboxInput onSend={handleUserMessage} />
      {invalidActionPopup && (
        <div className="modal-overlay">
          <div className="modal-small-box">
            <h2>No Character Selected!</h2>
            <p>If only the void could speak back.</p>
            <button className="select-button" onClick={() => handleInvalidAction()}>Select a Character</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default Chatbox;