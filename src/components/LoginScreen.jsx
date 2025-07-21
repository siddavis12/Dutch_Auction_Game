import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PatchNotes from './PatchNotes';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  padding: 20px;
  gap: 30px;
  padding-top: 20vh;
`;

const LoginBox = styled(motion.div)`
  background: rgba(0, 0, 0, 0.5);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  color: #f39c12;
  margin-bottom: 30px;
  font-size: 24px;
`;

const Input = styled.input`
  width: 300px;
  padding: 15px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-bottom: 20px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  background: #f39c12;
  color: #1a1a2e;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Status = styled.div`
  margin-top: 20px;
  color: ${props => props.$connected ? '#27ae60' : '#e74c3c'};
`;

const ErrorMessage = styled.div`
  margin-top: 15px;
  color: #e74c3c;
  font-size: 14px;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 5px;
  border: 1px solid rgba(231, 76, 60, 0.3);
`;

const UserCount = styled.div`
  margin-top: 10px;
  color: #95a5a6;
  font-size: 14px;
  
  span {
    color: ${props => props.$isFull ? '#e74c3c' : '#3498db'};
    font-weight: bold;
  }
`;

const AuctionAlert = styled(motion.div)`
  margin-top: 15px;
  padding: 12px 20px;
  background: rgba(243, 156, 18, 0.2);
  border: 2px solid #f39c12;
  border-radius: 10px;
  color: #f39c12;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const PulseAnimation = styled(motion.span)`
  display: inline-block;
  font-size: 20px;
`;

function LoginScreen({ onLogin, isConnected, error, userCount, hasActiveAuction }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && isConnected) {
      onLogin(name.trim());
    }
  };

  return (
    <Container>
      <LoginBox
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Krafton Auction</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          <Button
            type="submit"
            disabled={!isConnected || !name.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Game
          </Button>
        </form>
        <Status $connected={isConnected}>
          {isConnected ? '🟢 서버 가동 중' : '🔴 서버 종료 상태'}
        </Status>
        {userCount && (
          <UserCount $isFull={userCount.current >= userCount.max}>
            현재 접속자: <span>{userCount.current}/{userCount.max}</span>
          </UserCount>
        )}
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        {hasActiveAuction && (
          <AuctionAlert
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PulseAnimation
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔔
            </PulseAnimation>
            경매가 진행 중입니다!
          </AuctionAlert>
        )}
      </LoginBox>
      <PatchNotes />
    </Container>
  );
}

export default LoginScreen;