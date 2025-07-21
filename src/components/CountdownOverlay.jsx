import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import audioManager from '../utils/audioManager';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(243, 156, 18, 0.8), 0 0 60px rgba(243, 156, 18, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const CountdownContainer = styled(motion.div)`
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircleBg = styled(motion.svg)`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const CircleProgress = styled(motion.circle)`
  fill: none;
  stroke: #f39c12;
  stroke-width: 8;
  stroke-linecap: round;
  filter: drop-shadow(0 0 10px rgba(243, 156, 18, 0.5));
`;

const Number = styled(motion.div)`
  font-size: 120px;
  font-weight: bold;
  color: ${props => 
    props.number === 0 ? '#2ecc71' : 
    props.number === 1 ? '#e74c3c' : 
    '#f39c12'
  };
  text-shadow: ${props => 
    props.number === 0 
      ? `0 0 20px rgba(46, 204, 113, 0.8),
         0 0 40px rgba(46, 204, 113, 0.6),
         0 0 60px rgba(46, 204, 113, 0.4)`
      : props.number === 1 
      ? `0 0 20px rgba(231, 76, 60, 0.8),
         0 0 40px rgba(231, 76, 60, 0.6),
         0 0 60px rgba(231, 76, 60, 0.4)`
      : `0 0 20px rgba(243, 156, 18, 0.8),
         0 0 40px rgba(243, 156, 18, 0.6),
         0 0 60px rgba(243, 156, 18, 0.4)`
  };
  
  ${props => props.number <= 1 && css`
    animation: ${pulseAnimation} 0.5s ease-in-out infinite;
  `}
`;

const Message = styled(motion.div)`
  position: absolute;
  top: -80px;
  font-size: 24px;
  color: white;
  text-align: center;
  width: 100%;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const AuctionInfo = styled(motion.div)`
  position: absolute;
  bottom: -100px;
  text-align: center;
  color: white;
`;

const ItemName = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 10px;
  animation: ${css`${glowAnimation}`} 2s ease-in-out infinite;
`;

const StartingPrice = styled.div`
  font-size: 20px;
  color: #2ecc71;
`;

const Particles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: #f39c12;
  border-radius: 50%;
  left: 50%;
  top: 50%;
`;

function CountdownOverlay({ countdown, auctionData, initialCountdown }) {
  const [particles, setParticles] = useState([]);
  const [maxCountdown, setMaxCountdown] = useState(initialCountdown || 3);
  const prevCountdownRef = useRef(null);
  const circumference = 2 * Math.PI * 140;
  
  
  // Calculate stroke offset based on the initial countdown value
  const strokeDashoffset = countdown !== null 
    ? circumference - (circumference * (maxCountdown - countdown)) / maxCountdown
    : circumference;

  useEffect(() => {
    if (countdown !== null && countdown !== prevCountdownRef.current) {
      // Update max countdown if we receive a higher value
      if (initialCountdown && countdown === initialCountdown) {
        setMaxCountdown(initialCountdown);
      }
      
      // Play countdown sound when number changes
      if (prevCountdownRef.current !== null && countdown < prevCountdownRef.current) {
        audioManager.playCountdownSound(countdown);
      }
      
      // Generate particles for explosion effect
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        angle: (360 / 20) * i,
        distance: Math.random() * 200 + 100,
        duration: Math.random() * 0.5 + 0.5
      }));
      setParticles(newParticles);
      
      prevCountdownRef.current = countdown;
    }
  }, [countdown, initialCountdown]);

  // Don't render if countdown is not a valid number or is negative
  if (typeof countdown !== 'number' || countdown < 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {countdown >= 0 && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
        <CountdownContainer>
          <Message
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Auction Starting In
          </Message>

          <CircleBg width="300" height="300">
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            <CircleProgress
              cx="150"
              cy="150"
              r="140"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transition={{ duration: 1, ease: "linear" }}
            />
          </CircleBg>

          <AnimatePresence mode="wait">
            <Number
              key={countdown}
              number={countdown}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              {countdown}
            </Number>
          </AnimatePresence>

          <Particles>
            {particles.map((particle) => (
              <Particle
                key={particle.id}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                  y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                  opacity: 0
                }}
                transition={{ duration: particle.duration, ease: "easeOut" }}
              />
            ))}
          </Particles>

          {auctionData && (
            <AuctionInfo
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ItemName>{auctionData.item}</ItemName>
              <StartingPrice>Starting at ₩{parseInt(auctionData.startingPrice).toLocaleString('ko-KR')}</StartingPrice>
            </AuctionInfo>
          )}
        </CountdownContainer>

        </Overlay>
      )}
    </AnimatePresence>
  );
}

export default CountdownOverlay;