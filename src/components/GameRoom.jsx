import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleBidSection from './SimpleBidSection';
import audioManager from '../utils/audioManager';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%23252547" width="1200" height="800"/><path fill="none" stroke="%23353568" stroke-width="1" d="M0 400 L1200 400 M600 0 L600 800 M300 0 L300 800 M900 0 L900 800 M0 200 L1200 200 M0 600 L1200 600"/></svg>');
  background-size: cover;
  overflow: hidden;
`;

const UserAvatar = styled(motion.div)`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid ${props => props.$isCurrentUser ? '#f39c12' : '#fff'};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const UserName = styled.div`
  position: absolute;
  top: 60px;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  color: white;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const ChatBubble = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 8px 12px;
  border-radius: 15px;
  width: 180px;
  bottom: 70px;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: keep-all;
  overflow-wrap: anywhere;
  text-align: center;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(255, 255, 255, 0.9);
  }
`;

const ReactionBubble = styled(motion.div)`
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const CrownEmoji = styled(motion.div)`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const MoneyRainContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MoneyBill = styled(motion.div)`
  position: absolute;
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;


const avatarColors = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#16a085', '#27ae60'
];

const avatarEmojis = ['😀', '😎', '🤖', '👽', '🦄', '🐱', '🦊', '🐼', '🦁', '🐸'];

// 돈다발 이펙트를 DOM으로 직접 생성하는 함수
function createMoneyRainEffect(avatarElement, userId, timestamp) {
  const moneyEmojis = ['💵', '💴', '💶', '💷', '🪙'];
  const effectId = `money-rain-${userId}-${timestamp}`;
  
  
  // 이미 존재하는 이펙트가 있으면 제거
  const existingEffect = document.getElementById(effectId);
  if (existingEffect) {
    existingEffect.remove();
  }
  
  // 아바타의 현재 위치를 고정값으로 가져오기
  const avatarRect = avatarElement.getBoundingClientRect();
  const gameRoomRect = avatarElement.closest('[data-testid="game-room"]')?.getBoundingClientRect() || 
                       avatarElement.parentElement.getBoundingClientRect();
  
  // 아바타의 게임룸 내 상대적 위치 계산
  const relativeX = avatarRect.left - gameRoomRect.left + (avatarRect.width / 2);
  const relativeY = avatarRect.top - gameRoomRect.top + (avatarRect.height / 2);
  
  // 컨테이너 생성 - 고정된 위치에 생성
  const container = document.createElement('div');
  container.id = effectId;
  container.style.cssText = `
    position: absolute;
    top: ${relativeY}px;
    left: ${relativeX}px;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    pointer-events: none;
    z-index: 1000;
  `;
  
  // 돈 이모지들 생성 - 더 많은 이모지와 랜덤성
  const numEmojis = 15; // 10개에서 15개로 증가
  for (let i = 0; i < numEmojis; i++) {
    const moneyBill = document.createElement('div');
    // 랜덤하게 이모지 선택
    moneyBill.textContent = moneyEmojis[Math.floor(Math.random() * moneyEmojis.length)];
    moneyBill.style.cssText = `
      position: absolute;
      font-size: ${20 + Math.random() * 8}px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.5s ease-out;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      pointer-events: none;
      cursor: default;
    `;
    
    container.appendChild(moneyBill);
    
    // 아래에서 위로 터지는 폭죽 애니메이션 - 더 많은 랜덤성
    setTimeout(() => {
      // 시작점에 약간의 랜덤성 추가
      const startX = 45 + Math.random() * 10; // 45-55% 범위
      const startY = 75 + Math.random() * 10; // 75-85% 범위
      moneyBill.style.left = `${startX}%`;
      moneyBill.style.top = `${startY}%`;
      moneyBill.style.transform = 'translate(-50%, -50%)';
      
      // 더 넓은 각도와 거리 범위
      const angle = Math.random() * Math.PI - Math.PI/2; // 완전 랜덤 각도 (-90도~90도)
      const distance = 60 + Math.random() * 80; // 60~140px 랜덤 거리
      const x = Math.sin(angle) * distance;
      const y = -Math.abs(Math.cos(angle) * distance * (1 + Math.random() * 0.5)); // 위쪽으로, 높이도 랜덤
      
      // 빠른 폭죽 애니메이션 - 속도와 이징 랜덤화
      const animDuration = 0.25 + Math.random() * 0.15; // 0.25~0.4초
      moneyBill.style.transition = `all ${animDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      moneyBill.style.transform = `translate(${x - 12}px, ${y - 12}px) rotate(${Math.random() * 720 - 360}deg)`;
      moneyBill.style.opacity = '1';
      
      // 0.5초 후 투명도 완전히 제거하고 또렷하게 유지
      setTimeout(() => {
        moneyBill.style.transition = 'none';
        moneyBill.style.opacity = '1';
      }, 500);
      
      // 4.5초 후 페이드 아웃
      setTimeout(() => {
        moneyBill.style.transition = 'opacity 0.5s ease-out';
        moneyBill.style.opacity = '0';
      }, 4500);
      
    }, i * (20 + Math.random() * 20)); // 각 돈다발을 20~40ms 랜덤 간격으로
  }
  
  // 게임룸에 추가 (아바타가 아닌 부모 컨테이너에)
  const gameRoom = avatarElement.closest('[data-testid="game-room"]') || avatarElement.parentElement;
  gameRoom.appendChild(container);
  
  // 5초 후 완전히 제거
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 5000);
}

// Money rain effect는 이제 DOM 직접 조작으로 처리


function GameRoom({ users, messages, currentUserId, onMoveUser, auctions, gameConfig, onBid, socket, userReactions, bidHoverCount, winnerDialogueData, selectedDialogue }) {
  const [visibleChats, setVisibleChats] = React.useState({});
  const timersRef = React.useRef({});
  const reactionTimersRef = React.useRef({});
  const processedEffects = React.useRef(new Set());
  
  const getUserChatMessage = (userId) => {
    const userMessages = messages.filter(m => m.userId === userId);
    return userMessages[userMessages.length - 1];
  };
  
  // 메시지가 변경될 때만 타이머 설정
  React.useEffect(() => {
    // 마지막 메시지만 확인하여 새로운 메시지인지 판단
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const userId = lastMessage.userId;
    
    // 시스템 메시지는 무시
    if (userId === 'system') return;
    
    const existingTimer = timersRef.current[userId];
    
    // 이미 같은 타임스탬프의 타이머가 있으면 스킵
    if (existingTimer && existingTimer.timestamp === lastMessage.timestamp) {
      return;
    }
    
    // 기존 타이머 정리
    if (existingTimer) {
      clearTimeout(existingTimer.timer);
    }
    
    // 새 메시지 표시 전에 이모지 숨기기 (특별 이모지는 제외)
    if (userReactions[userId] && !userReactions[userId].isSpecial) {
      const reactionTimer = reactionTimersRef.current[userId];
      if (reactionTimer) {
        clearTimeout(reactionTimer);
        delete reactionTimersRef.current[userId];
      }
    }
    
    // 새 메시지 표시
    setVisibleChats(prev => ({ ...prev, [userId]: true }));
    
    // 5초 후 숨기기 타이머 설정
    const timer = setTimeout(() => {
      setVisibleChats(prev => ({ ...prev, [userId]: false }));
      delete timersRef.current[userId];
    }, 5000);
    
    timersRef.current[userId] = { timer, timestamp: lastMessage.timestamp };
  }, [messages]);
  
  // 이모지가 변경될 때 채팅 말풍선 숨기기 처리 (특별 이모지는 제외)
  React.useEffect(() => {
    // 새로운 이모지가 추가된 경우 해당 유저의 채팅 말풍선 즉시 숨기기
    Object.entries(userReactions).forEach(([userId, reaction]) => {
      // 특별 이모지는 채팅 말풍선 숨기기 처리를 하지 않음
      if (!reaction.isSpecial && visibleChats[userId]) {
        // 채팅 타이머 정리
        const chatTimer = timersRef.current[userId];
        if (chatTimer) {
          clearTimeout(chatTimer.timer);
          delete timersRef.current[userId];
        }
        // 채팅 말풍선 즉시 숨기기
        setVisibleChats(prev => ({ ...prev, [userId]: false }));
      }
    });
  }, [userReactions]); // visibleChats를 의존성에서 제거

  // 특별 이모지 감지 시 DOM 직접 조작으로 이펙트 생성
  React.useEffect(() => {
    Object.entries(userReactions).forEach(([userId, reaction]) => {
      if (reaction.isSpecial) {
        const effectKey = `${userId}-${reaction.timestamp}`;
        
        // 이미 처리된 이펙트인지 확인
        if (processedEffects.current.has(effectKey)) {
          return;
        }
        
        processedEffects.current.add(effectKey);
        
        // DOM에서 아바타 요소 찾기
        const avatarElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (avatarElement) {
          createMoneyRainEffect(avatarElement, userId, reaction.timestamp);
        }
        
        // 5초 후 처리된 이펙트 목록에서 제거
        setTimeout(() => {
          processedEffects.current.delete(effectKey);
        }, 5000);
      }
    });
  }, [userReactions]);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  React.useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(({ timer }) => clearTimeout(timer));
      Object.values(reactionTimersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleContainerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (onMoveUser) {
      onMoveUser({ x, y });
    }
  };

  const formatChatMessage = (message) => {
    // Canvas를 사용하여 실제 텍스트 너비 측정
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    const maxWidth = 156; // 180px - padding(24px)
    const lines = [];
    let currentLine = '';
    
    // 각 문자를 하나씩 추가하면서 너비 체크
    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const testLine = currentLine + char;
      const metrics = context.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    
    // 마지막 라인 추가
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  };

  // activeAuction을 memoize하여 ID가 같으면 같은 객체로 유지
  const activeAuction = React.useMemo(() => {
    return auctions?.find(a => a.isActive);
  }, [auctions]);

  return (
    <Container onClick={handleContainerClick} data-testid="game-room">
      <AnimatePresence>
        {users.map((user, index) => {
          const lastMessage = getUserChatMessage(user.id);
          const showChat = lastMessage && visibleChats[user.id];
          const userReaction = userReactions?.[user.id];
          
          return (
            <UserAvatar
              key={user.id}
              data-user-id={user.id}
              data-testid="user-avatar"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                left: `${user.x}%`,
                top: `${user.y}%`
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "tween", 
                duration: gameConfig?.movement?.animation_duration || 0.8, 
                ease: [0.25, 1, 0.5, 1] // Smooth ease-out without overshoot or wobble
              }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Crown for auction winners */}
              {user.hasCrown && (
                <CrownEmoji
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    y: [0, -5, 0]
                  }}
                  transition={{
                    scale: { type: "spring", stiffness: 500, damping: 30 },
                    rotate: { type: "spring", stiffness: 200, damping: 20 },
                    y: { 
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }
                  }}
                >
                  👑
                </CrownEmoji>
              )}
              
              {/* Money rain effect is now handled by DOM manipulation */}
              
              {userReaction && !visibleChats[user.id] && !userReaction.isSpecial && (
                <ReactionBubble
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      scale: { type: "spring", stiffness: 500, damping: 30 },
                      opacity: { duration: 0.2 },
                      y: { type: "spring", stiffness: 300, damping: 25 }
                    }
                  }}
                  exit={{ 
                    scale: 0.8, 
                    opacity: 0, 
                    y: -10,
                    transition: { 
                      duration: 0.3,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {userReaction.emoji}
                </ReactionBubble>
              )}
              <Avatar 
                color={avatarColors[index % avatarColors.length]}
                $isCurrentUser={user.id === currentUserId}
              >
                {avatarEmojis[parseInt(user.avatar.replace('avatar', '')) - 1] || '😀'}
              </Avatar>
              <UserName>{user.name}</UserName>
              {/* Show regular chat (excluding winner dialogue) */}
              {showChat && (
                <ChatBubble
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      scale: { type: "spring", stiffness: 500, damping: 30 },
                      opacity: { duration: 0.2 },
                      y: { type: "spring", stiffness: 300, damping: 25 }
                    }
                  }}
                  exit={{ 
                    scale: 0.8, 
                    opacity: 0, 
                    y: -10,
                    transition: { 
                      duration: 0.3,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {formatChatMessage(lastMessage.message)}
                </ChatBubble>
              )}
            </UserAvatar>
          );
        })}
      </AnimatePresence>
      
      <SimpleBidSection 
        auction={activeAuction}
        onBid={onBid}
        socket={socket}
        hoverCount={bidHoverCount}
      />
    </Container>
  );
}

export default GameRoom;