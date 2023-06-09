import React from 'react';
import { deleteConversation } from './Api';

const DeleteChatButton = ({ conversationName, onDelete }) => {
  const handleClick = async () => {
    try {
      await deleteConversation(conversationName);
      onDelete();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <button className='chat-delete' onClick={handleClick}>Delete Selected Chat</button>
  );
};

export default DeleteChatButton;
