import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
`;

const Title = styled.h3`
  color: #f39c12;
  margin: 0 0 10px 0;
  font-size: 16px;
`;

const MessagesContainer = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 10px;
  min-height: 0;
  max-height: 100%;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(243, 156, 18, 0.5);
    border-radius: 4px;
  }
`;

const Message = styled(motion.div)`
  margin: 5px 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid ${props => 
    props.isSystem ? '#95a5a6' : 
    props.isOwn ? '#f39c12' : '#3498db'};
`;

const MessageAuthor = styled.span`
  font-weight: bold;
  color: ${props => 
    props.isSystem ? '#95a5a6' : 
    props.isOwn ? '#f39c12' : '#3498db'};
  margin-right: 8px;
`;

const MessageText = styled.span`
  color: #fff;
`;

const InputContainer = styled.form`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
  }
`;

const SendButton = styled(motion.button)`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #f39c12;
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const ReactionContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  justify-content: center;
  flex-shrink: 0;
`;

const ReactionButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #f39c12;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SpecialReactionButton = styled(ReactionButton)`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 2px solid #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8); }
    100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
  }
  
  &:hover {
    background: linear-gradient(135deg, #FFA500 0%, #FFD700 100%);
    transform: scale(1.15) rotate(10deg);
  }
`;

function ChatPanel({ messages, onSendMessage, currentUserId, chatEnabled, isAdmin, socket, hasCrown }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Debounce scrolling for performance with many messages
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  const handleReaction = (emoji) => {
    if (socket) {
      socket.emit('reaction', emoji);
    }
  };
  
  const reactions = ['🤔', '🤬', '💸', '👏'];

  // Only show last 200 messages in UI for performance
  const displayMessages = useMemo(() => {
    return messages.slice(-200);
  }, [messages]);

  return (
    <Container>
      <Title>Chat Room</Title>
      <MessagesContainer>
        {displayMessages.map((msg, index) => (
          <Message
            key={msg.id || `${msg.timestamp}-${index}`}
            isOwn={msg.userId === currentUserId}
            isSystem={msg.userId === 'system'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageAuthor 
              isOwn={msg.userId === currentUserId}
              isSystem={msg.userId === 'system'}
            >
              {msg.userName}:
            </MessageAuthor>
            <MessageText>{msg.message}</MessageText>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <ReactionContainer>
        {reactions.map((emoji) => (
          <ReactionButton
            key={emoji}
            onClick={() => handleReaction(emoji)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {emoji}
          </ReactionButton>
        ))}
        {(hasCrown || isAdmin) && (
          <SpecialReactionButton
            onClick={() => handleReaction('🤑')}
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            title={isAdmin ? "Admin Special Power!" : "Special Crown Power!"}
          >
            🤑
          </SpecialReactionButton>
        )}
      </ReactionContainer>
      <InputContainer onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder={chatEnabled || isAdmin ? "Type a message..." : "Chat is disabled"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={200}
          disabled={!chatEnabled && !isAdmin}
        />
        <SendButton
          type="submit"
          disabled={!chatEnabled && !isAdmin}
          whileHover={{ scale: (chatEnabled || isAdmin) ? 1.05 : 1 }}
          whileTap={{ scale: (chatEnabled || isAdmin) ? 0.95 : 1 }}
        >
          Send
        </SendButton>
      </InputContainer>
    </Container>
  );
}

export default ChatPanel;