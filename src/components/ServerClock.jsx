import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ClockContainer = styled(motion.div)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 10px;
  border: 2px solid rgba(243, 156, 18, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const ClockIcon = styled.span`
  font-size: 20px;
`;

const TimeDisplay = styled.div`
  color: #f39c12;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Monaco', 'Courier New', monospace;
  letter-spacing: 1px;
`;

function ServerClock({ socket }) {
  const [serverTime, setServerTime] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleServerTime = (data) => {
      if (data.formatted) {
        // Extract only the time part (HH:MM:SS)
        const timePart = data.formatted.split(' ').pop();
        setServerTime(timePart);
      }
    };

    socket.on('serverTime', handleServerTime);

    return () => {
      socket.off('serverTime', handleServerTime);
    };
  }, [socket]);

  if (!serverTime) return null;

  return (
    <ClockContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ClockIcon>🕐</ClockIcon>
      <TimeDisplay>{serverTime}</TimeDisplay>
    </ClockContainer>
  );
}

export default ServerClock;