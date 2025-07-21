import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../utils/currency';
import audioManager from '../utils/audioManager';

const confettiColors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#1abc9c'];

const curtainDrop = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(0);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(2deg);
  }
  66% {
    transform: translateY(-10px) rotate(-2deg);
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Curtain = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(139, 69, 19, 0.95) 0%,
    rgba(160, 82, 45, 0.95) 25%,
    rgba(139, 69, 19, 0.95) 50%,
    rgba(160, 82, 45, 0.95) 75%,
    rgba(139, 69, 19, 0.95) 100%
  );
  background-size: 50px 50px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(180deg, 
      rgba(101, 67, 33, 1) 0%,
      rgba(139, 69, 19, 0.8) 100%
    );
    border-bottom: 5px solid #8B4513;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
`;

const CelebrationContainer = styled(motion.div)`
  position: relative;
  text-align: center;
  z-index: 10001;
  padding: 40px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  border: 3px solid #f39c12;
  box-shadow: 0 0 50px rgba(243, 156, 18, 0.5);
`;

const Title = styled(motion.h1)`
  color: #f39c12;
  font-size: 48px;
  margin: 0 0 20px 0;
  text-shadow: 0 0 20px rgba(243, 156, 18, 0.8);
  animation: ${bounce} 2s infinite;
`;

const WinnerAvatar = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  margin: 20px auto;
  border: 5px solid #f39c12;
  box-shadow: 0 0 30px rgba(243, 156, 18, 0.8);
  animation: ${float} 3s ease-in-out infinite;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const WinnerName = styled(motion.h2)`
  color: #fff;
  font-size: 36px;
  margin: 20px 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const AuctionItem = styled(motion.h3)`
  color: #e67e22;
  font-size: 24px;
  margin: 15px 0;
  font-style: italic;
`;

const FinalPrice = styled(motion.div)`
  color: #27ae60;
  font-size: 42px;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 0 0 15px rgba(39, 174, 96, 0.8);
`;

const Confetti = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  border-radius: 2px;
`;

const Sparkle = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
  border-radius: 50%;
  animation-delay: ${props => props.$delay}s;
  animation: ${sparkle} 1.5s ease-in-out infinite;
`;

const CrownIcon = styled(motion.div)`
  font-size: 64px;
  margin: 10px 0;
  filter: drop-shadow(0 0 10px rgba(243, 156, 18, 0.8));
`;

const ClickHint = styled(motion.div)`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  
  &:hover {
    color: rgba(255, 255, 255, 1);
  }
`;

const avatarColors = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#16a085', '#27ae60'
];

const avatarEmojis = ['😀', '😎', '🤖', '👽', '🦄', '🐱', '🦊', '🐼', '🦁', '🐸'];

function CelebrationModal({ isOpen, winner, onClose }) {
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const fadeOutRef = useRef(null);

  const handleClose = () => {
    if (!isClosing && canClose) {
      setIsClosing(true);
      
      // Immediately stop any existing fade interval
      if (fadeOutRef.current) {
        clearInterval(fadeOutRef.current);
        fadeOutRef.current = null;
      }
      
      // Fade out music
      let currentVolume = 0.8;
      const fadeInterval = setInterval(() => {
        currentVolume -= 0.08;
        if (currentVolume <= 0) {
          clearInterval(fadeInterval);
          fadeOutRef.current = null;
          audioManager.stop('auctionWon');
        } else {
          try {
            audioManager.setVolume('auctionWon', currentVolume);
          } catch (e) {
            // If there's any error, just stop the sound
            clearInterval(fadeInterval);
            fadeOutRef.current = null;
            audioManager.stop('auctionWon');
          }
        }
      }, 50);
      
      fadeOutRef.current = fadeInterval;
      
      // Wait for exit animation to complete before actually closing
      setTimeout(() => {
        // Ensure music is stopped
        if (fadeOutRef.current) {
          clearInterval(fadeOutRef.current);
          fadeOutRef.current = null;
        }
        audioManager.stop('auctionWon');
        
        onClose();
        setIsClosing(false);
        setCanClose(false);
      }, 800); // Match the exit animation duration
    }
  };

  // Generate new confetti continuously
  useEffect(() => {
    if (isOpen && !isClosing) {
      const generateConfetti = () => {
        const pieces = Array.from({ length: 50 }, (_, i) => ({
          id: `${confettiKey}-${i}`,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5
        }));
        setConfettiPieces(pieces);
        setConfettiKey(prev => prev + 1);
      };
      
      // Generate initial confetti
      generateConfetti();
      
      // Generate new confetti every 2 seconds
      const confettiInterval = setInterval(generateConfetti, 2000);
      
      return () => clearInterval(confettiInterval);
    }
  }, [isOpen, isClosing]);
  
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Generate sparkles
      const sparkleElements = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 2
      }));
      setSparkles(sparkleElements);

      // Enable closing after 5 seconds
      const timer = setTimeout(() => {
        setCanClose(true);
      }, 5000);

      return () => {
        clearTimeout(timer);
        if (fadeOutRef.current) {
          clearInterval(fadeOutRef.current);
          fadeOutRef.current = null;
        }
      };
    }
  }, [isOpen, isClosing]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeOutRef.current) {
        clearInterval(fadeOutRef.current);
      }
      audioManager.stop('auctionWon');
    };
  }, []);

  if (!isOpen || !winner) return null;

  const avatarIndex = winner.avatar ? parseInt(winner.avatar.replace('avatar', '')) - 1 : 0;
  const userColor = avatarColors[avatarIndex % avatarColors.length];
  const emoji = avatarEmojis[avatarIndex] || '😀';

  return (
    <AnimatePresence mode="wait">
      {(isOpen && !isClosing) && (
        <Overlay
          key="celebration-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.8,
            ease: "easeInOut"
          }}
          onClick={canClose ? handleClose : undefined}
          style={{ cursor: canClose ? 'pointer' : 'default' }}
        >
          <Curtain 
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
        
        {/* Confetti */}
        {confettiPieces.map((piece) => (
          <Confetti
            key={piece.id}
            color={piece.color}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              scale: piece.scale
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: piece.rotation + 720,
              transition: {
                duration: 3,
                ease: "easeIn",
                delay: Math.random() * 1
              }
            }}
            style={{
              left: piece.x,
              top: piece.y
            }}
          />
        ))}

        {/* Sparkles */}
        {sparkles.map((sparkle) => (
          <Sparkle
            key={sparkle.id}
            $delay={sparkle.delay}
            style={{
              left: sparkle.x,
              top: sparkle.y
            }}
          />
        ))}

          <CelebrationContainer
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ 
              scale: 0.3, 
              rotate: 90, 
              opacity: 0,
              y: -100
            }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.5
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (canClose) {
                handleClose();
              }
            }}
          >
          <CrownIcon
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            👑
          </CrownIcon>
          
          <Title
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            AUCTION WON!
          </Title>

          <WinnerAvatar
            color={userColor}
            initial={{ scale: 0, rotate: -360 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 1.5, 
              duration: 1,
              type: "spring",
              stiffness: 150
            }}
          >
            {emoji}
          </WinnerAvatar>

          <WinnerName
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            {winner.winnerName}
          </WinnerName>

          <AuctionItem
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            "{winner.item}"
          </AuctionItem>

          <FinalPrice
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 2.5, 
              duration: 0.8,
              type: "spring",
              stiffness: 200
            }}
          >
            {formatPrice(winner.finalPrice)}
          </FinalPrice>

          </CelebrationContainer>
          
          {canClose && (
            <ClickHint
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Click anywhere to close
            </ClickHint>
          )}
        </Overlay>
      )}
    </AnimatePresence>
  );
}

export default CelebrationModal;