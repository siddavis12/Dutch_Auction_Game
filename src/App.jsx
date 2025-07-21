import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import GameRoom from './components/GameRoom';
import LoginScreen from './components/LoginScreen';
import ChatPanel from './components/ChatPanel';
import UserListPanel from './components/UserListPanel';
import AdminModal from './components/AdminModal';
import BidSection from './components/BidSection';
import CountdownOverlay from './components/CountdownOverlay';
import AnnouncementOverlay from './components/AnnouncementOverlay';
import ServerClock from './components/ServerClock';
import WinnerDialogueModal from './components/WinnerDialogueModal';
import audioManager from './utils/audioManager';

// 동적 임포트로 큰 컴포넌트 지연 로딩
const CelebrationModal = React.lazy(() => import('./components/CelebrationModal'));

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  
  /* 브라우저 알림이나 기타 요소 숨기기 */
  * {
    box-sizing: border-box;
  }
  
  /* 외부 알림 요소 제거 */
  ::before,
  ::after {
    display: none !important;
  }
`;

const GameContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 420px;
  grid-template-rows: 1fr;
  flex: 1;
  min-height: 0;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
  box-sizing: border-box;
`;

const MainArea = styled.div`
  grid-column: 2;
  grid-row: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  overflow: hidden;
`;

const AdminButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(243, 156, 18, 0.2);
  border: 2px solid rgba(243, 156, 18, 0.5);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(243, 156, 18, 0.3);
    border-color: #f39c12;
    transform: scale(1.1);
  }
`;

function App() {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [gameConfig, setGameConfig] = useState({
    movement: {
      animation_duration: 1.2,
      ease_type: 'ease'
    }
  });
  const [celebrationData, setCelebrationData] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [countdownAuctionData, setCountdownAuctionData] = useState(null);
  const [initialCountdown, setInitialCountdown] = useState(3);
  const [announcement, setAnnouncement] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [hasActiveAuction, setHasActiveAuction] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [bidHoverCount, setBidHoverCount] = useState(0);
  const [showWinnerDialogue, setShowWinnerDialogue] = useState(false);
  const [isWinnerInDialogue, setIsWinnerInDialogue] = useState(false);
  const [winnerDialogueData, setWinnerDialogueData] = useState(null);
  const [selectedDialogue, setSelectedDialogue] = useState(null);
  const [dialogueTimeLeft, setDialogueTimeLeft] = useState(0);

  useEffect(() => {
    // 현재 페이지의 호스트를 자동으로 사용
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3500' 
      : `${window.location.protocol}//${window.location.host}`;
    
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('joined', async (data) => {
      console.log('Joined data:', data);
      console.log('Is admin:', data.isAdmin);
      setCurrentUser({ id: data.userId });
      setUsers(data.users);
      setAuctions(data.auctions);
      setIsAdmin(data.isAdmin);
      setChatEnabled(data.chatEnabled);
      if (data.messages) {
        setMessages(data.messages);
      }
      if (data.config) {
        setGameConfig(data.config);
      }
      // Check if any auction is active
      const activeAuction = data.auctions?.find(a => a.isActive);
      setHasActiveAuction(!!activeAuction);
      setJoinError(''); // Clear any previous error
      
      // Preload auction sounds
      try {
        await audioManager.preloadAudio('auctionStart', '/sounds/auction-start.mp3');
        await audioManager.preloadAudio('auctionWon', '/sounds/auction-won.mp3');
        await audioManager.preloadAudio('fanfare', '/sounds/fanfare.mp3');
      } catch (error) {
        console.error('Failed to preload auction sounds:', error);
      }
    });

    newSocket.on('joinError', (data) => {
      setJoinError(data.message);
    });

    newSocket.on('userJoined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    newSocket.on('userLeft', (userId) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });
    
    newSocket.on('userUpdate', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    newSocket.on('auctionCreated', (auction) => {
      setAuctions(prev => [...prev, auction]);
    });

    newSocket.on('auctionCountdown', ({ countdown, auctionId, auctionData, initialCountdown }) => {
      setCountdown(countdown);
      setCountdownAuctionData(auctionData);
      if (initialCountdown) {
        setInitialCountdown(initialCountdown);
      }
      
      // Clear countdown after showing 0
      if (countdown === 0) {
        setTimeout(() => {
          setCountdown(null);
          setCountdownAuctionData(null);
        }, 1000); // Give time to show "0" before clearing
      }
    });

    newSocket.on('auctionStarted', ({ auctionId, timestamp }) => {
      setAuctions(prev => prev.map(a => 
        a.id === auctionId ? { ...a, isActive: true } : a
      ));
      
      // Set active auction state
      setHasActiveAuction(true);
      
      // Close celebration modal if open when new auction starts
      setShowCelebration(false);
      setCelebrationData(null);
      
      // Stop the auction won sound if it's playing
      audioManager.stop('auctionWon');
      
      // Delay clearing countdown to allow exit animation
      setTimeout(() => {
        setCountdown(null);
        setCountdownAuctionData(null);
      }, 300);
      
      // Play auction start sound with synchronization and loop
      if (timestamp) {
        audioManager.playAtTimestamp('auctionStart', timestamp, { volume: 0.7, loop: true });
      } else {
        audioManager.play('auctionStart', { volume: 0.7, loop: true });
      }
    });

    newSocket.on('priceUpdate', ({ auctionId, currentPrice }) => {
      setAuctions(prev => prev.map(a => 
        a.id === auctionId ? { ...a, currentPrice } : a
      ));
    });

    newSocket.on('bidAccepted', ({ auctionId, winner, winnerName, price, timestamp }) => {
      // This event now only fires after dialogue selection is complete
      
      setAuctions(prev => {
        const auctionItem = prev.find(a => a.id === auctionId);
        
        // Show celebration modal immediately
        setUsers(currentUsers => {
          const winnerUser = currentUsers.find(u => u.id === winner);
          console.log('Setting celebration modal:', { winnerUser, auctionItem, winner, winnerName });
          if (winnerUser && auctionItem) {
            const celebrationData = {
              winnerName: winnerName,
              item: auctionItem.item,
              finalPrice: price,
              avatar: winnerUser.avatar
            };
            console.log('Celebration data:', celebrationData);
            setCelebrationData(celebrationData);
            
            // Close dialogue window and show celebration simultaneously
            setShowWinnerDialogue(false);
            setWinnerDialogueData(null);
            setSelectedDialogue(null);
            setShowCelebration(true);
            
            // Stop heartbeat sound
            audioManager.stopHeartbeat();
            
            console.log('Set showCelebration to true');
          }
          return currentUsers.map(u => 
            u.id === winner ? { ...u, score: u.score + 100 } : u
          );
        });

        return prev.map(a => 
          a.id === auctionId ? { ...a, isActive: false, winner, winnerName, finalPrice: price } : a
        );
      });
      
      // Play winner sound with synchronization
      if (timestamp) {
        audioManager.playAtTimestamp('auctionWon', timestamp, { volume: 0.8 });
      } else {
        audioManager.play('auctionWon', { volume: 0.8 });
      }
    });

    newSocket.on('auctionEnded', ({ auctionId, winner, finalPrice }) => {
      setAuctions(prev => {
        const updated = prev.map(a => 
          a.id === auctionId ? { ...a, isActive: false, winner, finalPrice } : a
        );
        // Check if any auction is still active
        const activeAuction = updated.find(a => a.isActive);
        setHasActiveAuction(!!activeAuction);
        return updated;
      });
    });

    newSocket.on('chatMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('chatToggled', (data) => {
      setChatEnabled(data.enabled);
      setMessages(prev => [...prev, {
        userId: 'system',
        userName: 'System',
        message: data.message,
        timestamp: new Date().toISOString()
      }]);
    });

    newSocket.on('chatDisabled', (data) => {
      setMessages(prev => [...prev, {
        userId: 'system',
        userName: 'System',
        message: data.message,
        timestamp: new Date().toISOString()
      }]);
    });

    newSocket.on('userMoved', (data) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, x: data.x, y: data.y }
          : user
      ));
    });

    newSocket.on('configUpdate', (config) => {
      console.log('Received config update:', config);
      setGameConfig(config);
    });

    newSocket.on('announcement', (data) => {
      setAnnouncement(data);
    });

    newSocket.on('userCount', (data) => {
      setUserCount(data);
    });
    
    newSocket.on('auctionStatus', (data) => {
      console.log('Received auction status:', data);
      setHasActiveAuction(data.hasActiveAuction);
    });
    
    newSocket.on('userReaction', (data) => {
      setUserReactions(prev => ({
        ...prev,
        [data.userId]: { 
          emoji: data.emoji, 
          timestamp: data.timestamp,
          isSpecial: data.isSpecial || false
        }
      }));
      
      // Play fanfare sound for all users when special emoji is used
      if (data.isSpecial && data.soundTimestamp) {
        audioManager.play('fanfare', { volume: 0.8 });
      }
      
      // Remove reaction after 1.5 seconds (5 seconds for special effects)
      const timeout = data.isSpecial ? 5000 : 1500;
      setTimeout(() => {
        setUserReactions(prev => {
          const updated = { ...prev };
          if (updated[data.userId]?.timestamp === data.timestamp) {
            delete updated[data.userId];
          }
          return updated;
        });
      }, timeout);
    });
    
    newSocket.on('bidHoverCount', (data) => {
      setBidHoverCount(data.count);
    });

    newSocket.on('winnerDialogueStart', (data) => {
      setWinnerDialogueData(data);
      setShowWinnerDialogue(true);
      setSelectedDialogue(null); // Clear previous dialogue
      // Check if current user is the winner
      setCurrentUser(prev => {
        if (prev && data.winnerId === prev.id) {
          setIsWinnerInDialogue(true);
        } else {
          setIsWinnerInDialogue(false);
        }
        return prev;
      });
      setDialogueTimeLeft(data.timeLimit);
      
      // Fade out auction music when dialogue starts
      audioManager.fadeOut('auctionStart', 1.5);
      
      // Start heartbeat sound for tension
      audioManager.startHeartbeat(90, 3.0); // 90 BPM, doubled volume
      
      // Start countdown timer
      const interval = setInterval(() => {
        setDialogueTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Time is up - if no dialogue selected, close and show celebration
            if (!selectedDialogue) {
              setShowWinnerDialogue(false);
              setWinnerDialogueData(null);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on('winnerDialogueSelected', (data) => {
      setSelectedDialogue(data.selectedOption);
      // Don't close dialogue here - let bidAccepted event handle it
    });

    return () => {
      newSocket.disconnect();
      audioManager.dispose();
    };
  }, []);

  const handleLogin = (name) => {
    if (socket && isConnected) {
      setJoinError(''); // Clear any previous error
      socket.emit('join', { name });
    }
  };

  const handleCreateAuction = (auctionData) => {
    if (socket) {
      socket.emit('createAuction', auctionData);
    }
  };

  const handleStartAuction = (auctionId, countdownDuration = 3) => {
    if (socket) {
      socket.emit('startAuction', { auctionId, countdownDuration });
    }
  };

  const handleBid = (auctionId) => {
    if (socket) {
      socket.emit('bid', auctionId);
    }
  };

  const handleSendMessage = (message) => {
    if (socket) {
      socket.emit('chatMessage', message);
    }
  };

  const handleToggleChat = () => {
    if (socket) {
      socket.emit('toggleChat');
    }
  };

  const handleMoveUser = (position) => {
    if (socket) {
      socket.emit('moveUser', position);
      // 즉시 본인 위치 업데이트
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, x: position.x, y: position.y }
          : user
      ));
    }
  };
  
  const handleSelectDialogue = (selectedIndex) => {
    if (socket && winnerDialogueData && isWinnerInDialogue) {
      socket.emit('selectDialogue', {
        sessionId: winnerDialogueData.sessionId,
        selectedIndex
      });
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} isConnected={isConnected} error={joinError} userCount={userCount} hasActiveAuction={hasActiveAuction} />;
  }

  return (
    <AppContainer>
      <GameContainer>
        <UserListPanel 
          users={users}
          currentUserId={currentUser.id}
          auctions={auctions}
        />
        <MainArea>
          <GameRoom 
            users={users} 
            messages={messages} 
            currentUserId={currentUser.id} 
            onMoveUser={handleMoveUser}
            auctions={auctions}
            gameConfig={gameConfig}
            onBid={handleBid}
            socket={socket}
            userReactions={userReactions}
            bidHoverCount={bidHoverCount}
            winnerDialogueData={winnerDialogueData}
            selectedDialogue={selectedDialogue}
          />
          <AnnouncementOverlay
            announcement={announcement}
          />
          {isAdmin && (
            <AdminButton onClick={() => setShowAdminModal(true)}>
              ⚙️
            </AdminButton>
          )}
          <ServerClock socket={socket} />
        </MainArea>
        <ChatPanel 
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={currentUser.id}
          chatEnabled={chatEnabled}
          isAdmin={isAdmin}
          socket={socket}
          hasCrown={users.find(u => u.id === currentUser.id)?.hasCrown || false}
        />
        
        <AdminModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          auctions={auctions}
          onCreateAuction={handleCreateAuction}
          onStartAuction={handleStartAuction}
          onToggleChat={handleToggleChat}
          chatEnabled={chatEnabled}
        />
        
        <CountdownOverlay
          countdown={countdown}
          auctionData={countdownAuctionData}
          initialCountdown={initialCountdown}
        />
        
      </GameContainer>
      
      <WinnerDialogueModal
        isOpen={showWinnerDialogue}
        isWinner={isWinnerInDialogue}
        dialogueOptions={winnerDialogueData?.dialogueOptions || []}
        selectedDialogue={selectedDialogue}
        timeLeft={dialogueTimeLeft}
        onSelectDialogue={handleSelectDialogue}
      />
      
      <React.Suspense fallback={null}>
        <CelebrationModal
          isOpen={showCelebration}
          winner={celebrationData}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
            // Ensure the auction won sound is stopped
            audioManager.stop('auctionWon');
          }}
        />
      </React.Suspense>
    </AppContainer>
  );
}

export default App;