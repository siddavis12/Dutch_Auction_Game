import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../utils/currency';

const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
  position: relative;
`;

const Title = styled.h2`
  color: #f39c12;
  margin: 0 0 20px 0;
  font-size: 20px;
  text-align: center;
  flex-shrink: 0;
`;

const UserList = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 5px;
  min-height: 0;
  max-height: 100%;
  position: relative;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(243, 156, 18, 0.6);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(243, 156, 18, 0.8);
  }
`;

const UserItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  margin: 8px 0;
  border-radius: 10px;
  border-left: 4px solid ${props => props.$isCurrentUser ? '#f39c12' : '#3498db'};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 2px solid ${props => props.$isCurrentUser ? '#f39c12' : 'rgba(255, 255, 255, 0.3)'};
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0; /* overflow 처리를 위해 */
`;

const UserName = styled.div`
  color: ${props => props.$isCurrentUser ? '#f39c12' : '#fff'};
  font-weight: ${props => props.$isCurrentUser ? 'bold' : 'normal'};
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ConnectionTime = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  margin-bottom: 2px;
`;

const UserStatus = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const UserCount = styled.div`
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(243, 156, 18, 0.3);
  flex-shrink: 0;
`;

const AuctionWinnersSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const WinnersList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(243, 156, 18, 0.6);
    border-radius: 3px;
  }
`;

const WinnerItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  margin: 8px 0;
  border-radius: 8px;
  border-left: 3px solid #27ae60;
`;

const WinnerName = styled.div`
  color: #f39c12;
  font-weight: bold;
  font-size: 13px;
`;

const WinnerItemName = styled.div`
  color: #ccc;
  font-size: 11px;
  margin-top: 2px;
`;

const WinnerPrice = styled.div`
  color: #2ecc71;
  font-weight: bold;
  font-size: 12px;
  margin-top: 2px;
`;

const avatarColors = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#16a085', '#27ae60'
];

const avatarEmojis = ['😀', '😎', '🤖', '👽', '🦄', '🐱', '🦊', '🐼', '🦁', '🐸'];

function UserListPanel({ users = [], currentUserId, auctions = [] }) {
  
  // 접속 시간 순으로 정렬 (서버에서 timestamp를 받아야 함)
  const sortedUsers = [...users].sort((a, b) => {
    // timestamp가 있으면 그것으로 정렬, 없으면 id로 정렬
    if (a.joinTime && b.joinTime) {
      return new Date(a.joinTime) - new Date(b.joinTime);
    }
    return a.id.localeCompare(b.id);
  });

  const formatJoinTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const joinTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now - joinTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return joinTime.toLocaleDateString();
  };

  const completedAuctions = auctions.filter(auction => auction.winner && auction.finalPrice);

  return (
    <Container>
      {completedAuctions.length > 0 && (
        <AuctionWinnersSection>
          <Title style={{ fontSize: '18px', marginBottom: '10px' }}>🏆 Auction Winners</Title>
          <WinnersList>
            <AnimatePresence>
              {completedAuctions.map((auction) => (
                <WinnerItem
                  key={auction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WinnerName>{auction.winnerName || 'Unknown'}</WinnerName>
                  <WinnerItemName>{auction.item}</WinnerItemName>
                  <WinnerPrice>{formatPrice(auction.finalPrice)}</WinnerPrice>
                </WinnerItem>
              ))}
            </AnimatePresence>
          </WinnersList>
        </AuctionWinnersSection>
      )}
      
      <Title>Connected Users</Title>
      
      <UserCount>
        👥 {users.length} user{users.length !== 1 ? 's' : ''} online
      </UserCount>
      
      <UserList>
        <AnimatePresence mode="popLayout">
          {sortedUsers.map((user, index) => {
            const avatarIndex = user.avatar ? parseInt(user.avatar.replace('avatar', '')) - 1 : index;
            const userColor = avatarColors[avatarIndex % avatarColors.length];
            const emoji = avatarEmojis[avatarIndex % avatarEmojis.length] || '😀';
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <UserItem
                key={user.id}
                $isCurrentUser={isCurrentUser}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ 
                  opacity: 0, 
                  x: -50, 
                  scale: 0.8,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                layout
              >
                <UserAvatar color={userColor} $isCurrentUser={isCurrentUser}>
                  {emoji}
                </UserAvatar>
                
                <UserInfo>
                  <UserName $isCurrentUser={isCurrentUser}>
                    {user.name} {isCurrentUser && '(You)'}
                  </UserName>
                  <ConnectionTime>
                    Joined {formatJoinTime(user.joinTime)}
                  </ConnectionTime>
                  <UserStatus>
                    <OnlineIndicator />
                    Online
                  </UserStatus>
                </UserInfo>
              </UserItem>
            );
          })}
        </AnimatePresence>
        
        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontStyle: 'italic',
              marginTop: '20px'
            }}
          >
            No users connected
          </motion.div>
        )}
      </UserList>
    </Container>
  );
}

export default UserListPanel;