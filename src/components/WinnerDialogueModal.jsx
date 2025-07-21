import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import audioManager from '../utils/audioManager';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DialogueContainer = styled(motion.div)`
  text-align: center;
  color: white;
  max-width: 800px;
  width: 90%;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 40px;
`;

const OptionButton = styled(motion.button)`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(243, 156, 18, 0.2);
    border-color: #f39c12;
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const WaitingMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const SpeechBubble = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 20px 30px;
  border-radius: 25px;
  font-size: 24px;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 15px solid rgba(255, 255, 255, 0.9);
  }
`;

const TimerDisplay = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: 50px;
  background: ${props => props.$timeLeft <= 3 ? 'rgba(231, 76, 60, 0.9)' : 'rgba(243, 156, 18, 0.9)'};
  color: white;
  padding: 15px 25px;
  border-radius: 30px;
  font-size: 28px;
  font-weight: bold;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '⏱️';
    font-size: 24px;
  }
`;

const WaitingDots = styled(motion.span)`
  display: inline-block;
`;

function WinnerDialogueModal({ 
  isOpen, 
  isWinner, 
  dialogueOptions, 
  selectedDialogue, 
  timeLeft,
  onSelectDialogue 
}) {
  const [dots, setDots] = useState('');
  const [heartbeatScale, setHeartbeatScale] = useState(1);

  // Animate waiting dots
  useEffect(() => {
    if (!isWinner && !selectedDialogue) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isWinner, selectedDialogue]);

  // Subscribe to heartbeat events for speech bubble bounce
  useEffect(() => {
    if (selectedDialogue) {
      const unsubscribe = audioManager.onHeartbeat((beat) => {
        if (beat === 'lub') {
          setHeartbeatScale(1.05);
          setTimeout(() => setHeartbeatScale(1), 100);
        } else if (beat === 'dub') {
          setHeartbeatScale(1.03);
          setTimeout(() => setHeartbeatScale(1), 80);
        }
      });

      return unsubscribe;
    }
  }, [selectedDialogue]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        // Show overlay for all users when dialogue is active
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
        {timeLeft > 0 && isWinner && !selectedDialogue && (
          <TimerDisplay
            $timeLeft={timeLeft}
            initial={{ scale: 0 }}
            animate={{ 
              scale: timeLeft <= 3 ? [1, 1.1] : 1,
              backgroundColor: timeLeft <= 3 ? ['rgba(231, 76, 60, 0.9)', 'rgba(255, 0, 0, 0.9)'] : undefined
            }}
            transition={{ 
              type: timeLeft <= 3 ? "tween" : "spring", 
              stiffness: 300,
              repeat: timeLeft <= 3 ? Infinity : 0,
              repeatType: "reverse",
              duration: 0.5
            }}
          >
            {timeLeft}초
          </TimerDisplay>
        )}

        <DialogueContainer
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {selectedDialogue ? (
            // Show selected dialogue for all users
            <SpeechBubble
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: heartbeatScale, 
                opacity: 1 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                duration: 0.1
              }}
            >
              {selectedDialogue}
            </SpeechBubble>
          ) : isWinner ? (
            // Winner selection screen
            <>
              <motion.h2
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '20px', fontSize: '32px' }}
              >
                축하합니다! 한마디 해보세요:
              </motion.h2>
              
              {timeLeft > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ 
                    marginBottom: '30px', 
                    fontSize: '18px', 
                    color: timeLeft <= 3 ? '#e74c3c' : '#f39c12',
                    fontWeight: 'bold'
                  }}
                >
                  {timeLeft}초 후 자동으로 진행됩니다
                </motion.div>
              )}
              
              <OptionsGrid>
                {dialogueOptions.map((option, index) => (
                  <OptionButton
                    key={index}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => onSelectDialogue(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </OptionButton>
                ))}
              </OptionsGrid>
            </>
          ) : (
            // Waiting screen for non-winners
            <div>
              <motion.h2
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '30px', fontSize: '28px', color: 'white', textAlign: 'center' }}
              >
                누군가 입찰하였습니다...!
              </motion.h2>
              <SpeechBubble
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300,
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1
                }}
              >
                <WaitingDots>{dots || '...'}</WaitingDots>
              </SpeechBubble>
            </div>
          )}
        </DialogueContainer>
      </Overlay>
      )}
    </AnimatePresence>
  );
}

export default WinnerDialogueModal;