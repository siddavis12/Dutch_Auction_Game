import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import ini from 'ini';
import fs from 'fs';
import { networkInterfaces } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import MessageStore from './messageStore.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Load configuration from config.ini
const configPath = path.join(__dirname, 'config.ini');
let config = {};
try {
  const configFile = fs.readFileSync(configPath, 'utf-8');
  config = ini.parse(configFile);
  console.log('Configuration loaded from config.ini');
} catch (error) {
  console.warn('Could not load config.ini, using default values:', error.message);
  // Default configuration
  config = {
    server: { port: 3500, environment: 'development' },
    admin: { name: 'Kane Lee' },
    chat: { enabled: true },
    auction: { default_decrement_amount: 10, default_decrement_interval: 1000 },
    socket: { ping_timeout: 60000, ping_interval: 25000, allow_eio3: true },
    cors: { dev_origin: 'http://localhost:3000' },
    winner_dialogue: {
      option1: '와! 정말 좋은 가격에 샀네요!',
      option2: '이거 진짜 필요했던 건데, 감사합니다!',
      option3: '경매 정말 재미있네요!',
      option4: '다음에도 또 참여하고 싶어요!',
      selection_timeout: 3000
    }
  };
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : config.cors.dev_origin,
    methods: ["GET", "POST"]
  },
  pingTimeout: parseInt(config.socket.ping_timeout),
  pingInterval: parseInt(config.socket.ping_interval),
  transports: ['websocket', 'polling'],
  allowEIO3: config.socket.allow_eio3 === 'true' || config.socket.allow_eio3 === true
});

app.use(cors());
app.use(express.json());

// 캐시 제어 미들웨어 (개발/프로덕션 환경에 따라 설정)
app.use((req, res, next) => {
  const disableCache = config.server.disable_cache === 'true' || config.server.disable_cache === true;
  
  if (config.server.environment === 'development' || disableCache) {
    // 개발 환경 또는 캐시 비활성화 설정 시
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"${Date.now()}"` // 항상 새로운 ETag 생성
    });
  } else {
    // 프로덕션 환경에서는 정적 파일만 캐시 허용
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1년
    } else {
      res.set('Cache-Control', 'no-cache, must-revalidate');
    }
  }
  next();
});

// 정적 파일 서빙 (빌드된 클라이언트)
const clientPath = path.join(__dirname, 'dist');
app.use(express.static(clientPath));

// patch.txt 파일 전용 라우트
app.get('/patch.txt', (req, res) => {
  const patchPath = path.join(__dirname, 'patch.txt');
  res.sendFile(patchPath, (err) => {
    if (err) {
      res.status(404).send('Patch notes not found');
    }
  });
});

// 모든 라우트에 대해 index.html 반환 (SPA 라우팅)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = process.env.PORT || config.server.port;
const MAX_USERS = 150; // 최대 접속자 수 제한

const users = new Map();
const auctions = new Map();
let auctionIdCounter = 1;
let chatEnabled = config.chat.enabled === 'true' || config.chat.enabled === true;
const bidHoverers = new Set(); // Track users hovering over bid button
const winnerDialogues = new Map(); // Track winner dialogue sessions

// Initialize message store with 50,000 message limit
const messageStore = new MessageStore(50000);

const ADMIN_NAME = config.admin.name;


function broadcastConfig() {
  const configData = {
    movement: {
      animation_duration: parseFloat(config.movement.animation_duration),
      ease_type: config.movement.ease_type
    }
  };
  io.emit('configUpdate', configData);
  console.log('Config broadcasted to all clients:', configData);
}

function isAdmin(user) {
  console.log(`Checking admin: user=${user?.name}, expected=${ADMIN_NAME}, match=${user?.name === ADMIN_NAME}`);
  return user && user.name === ADMIN_NAME;
}

class DutchAuction {
  constructor(id, item, startPrice, minPrice, decrementAmount, decrementInterval) {
    this.id = id;
    this.item = item;
    this.startPrice = startPrice;
    this.currentPrice = startPrice;
    this.minPrice = minPrice;
    this.decrementAmount = decrementAmount;
    this.decrementInterval = decrementInterval;
    this.isActive = false;
    this.winner = null;
    this.intervalId = null;
    this.participants = new Set();
  }

  start() {
    this.isActive = true;
    this.intervalId = setInterval(() => {
      if (this.currentPrice > this.minPrice) {
        this.currentPrice = Math.max(this.minPrice, this.currentPrice - this.decrementAmount);
        io.emit('priceUpdate', {
          auctionId: this.id,
          currentPrice: this.currentPrice
        });
      } else {
        this.end();
      }
    }, this.decrementInterval);
  }

  bid(userId) {
    if (this.isActive && !this.winner) {
      this.winner = userId;
      this.isActive = false;
      clearInterval(this.intervalId);
      return true;
    }
    return false;
  }

  end() {
    this.isActive = false;
    clearInterval(this.intervalId);
    
    // Log auction end if there was a winner
    if (this.winner) {
      const winnerUser = users.get(this.winner);
      if (winnerUser) {
        logger.auctionEnded(this.item, winnerUser.name, this.currentPrice);
      }
    }
    
    // Clear bid hoverers when auction ends
    bidHoverers.clear();
    io.emit('bidHoverCount', { count: 0 });
    
    io.emit('auctionEnded', {
      auctionId: this.id,
      winner: this.winner,
      finalPrice: this.winner ? this.currentPrice : null
    });
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current user count immediately
  socket.emit('userCount', {
    current: users.size,
    max: MAX_USERS
  });
  
  // Send config to newly connected client immediately
  socket.emit('configUpdate', {
    movement: {
      animation_duration: parseFloat(config.movement.animation_duration),
      ease_type: config.movement.ease_type
    }
  });
  
  // Send current auction status to newly connected client
  const activeAuction = Array.from(auctions.values()).find(a => a.isActive);
  socket.emit('auctionStatus', {
    hasActiveAuction: !!activeAuction,
    activeAuction: activeAuction ? {
      id: activeAuction.id,
      item: activeAuction.item,
      currentPrice: activeAuction.currentPrice
    } : null
  });

  socket.on('join', (userData) => {
    // Check if server is full
    if (users.size >= MAX_USERS) {
      socket.emit('joinError', { message: `Server is full. Maximum ${MAX_USERS} users allowed.` });
      return;
    }
    
    // Check for duplicate username
    const existingUser = Array.from(users.values()).find(u => u.name.toLowerCase() === userData.name.toLowerCase());
    if (existingUser) {
      socket.emit('joinError', { message: 'Username already taken. Please choose another name.' });
      return;
    }
    
    const user = {
      id: socket.id,
      name: userData.name,
      avatar: userData.avatar || `avatar${Math.floor(Math.random() * 10) + 1}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      score: 0,
      hasCrown: false,
      joinTime: new Date().toISOString() // 접속 시간 추가
    };
    
    users.set(socket.id, user);
    
    // Log user join
    logger.userJoin(user.name, socket.id);
    
    const adminStatus = isAdmin(user);
    console.log(`User ${user.name} joined. Admin status: ${adminStatus}`);
    
    socket.emit('joined', {
      userId: socket.id,
      users: Array.from(users.values()).map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        x: u.x,
        y: u.y,
        hasCrown: u.hasCrown || false
      })),
      auctions: Array.from(auctions.values()).map(a => ({
        id: a.id,
        item: a.item,
        currentPrice: a.currentPrice,
        isActive: a.isActive,
        winner: a.winner
      })),
      chatEnabled: chatEnabled,
      isAdmin: adminStatus,
      messages: messageStore.getMessages(100), // Send only last 100 messages
      config: {
        movement: {
          animation_duration: parseFloat(config.movement.animation_duration),
          ease_type: config.movement.ease_type
        }
      }
    });
    
    // Broadcast new user to all other existing users
    socket.broadcast.emit('userJoined', {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      x: user.x,
      y: user.y,
      hasCrown: user.hasCrown || false
    });
    
    // Broadcast updated user count to all clients
    io.emit('userCount', {
      current: users.size,
      max: MAX_USERS
    });
    
    // Broadcast config to all clients to ensure consistency
    broadcastConfig();
  });

  socket.on('createAuction', (auctionData) => {
    const user = users.get(socket.id);
    if (!user || !isAdmin(user)) {
      socket.emit('error', { message: 'Only admin can create auctions' });
      return;
    }
    
    // Validate and ensure minimum interval of 100ms (0.1 seconds)
    let decrementInterval = auctionData.decrementInterval || parseInt(config.auction.default_decrement_interval);
    if (decrementInterval < 100) {
      decrementInterval = 100; // Minimum 100ms to prevent server overload
      console.log(`Auction interval adjusted to minimum 100ms for safety`);
    }
    
    const auction = new DutchAuction(
      auctionIdCounter++,
      auctionData.item,
      auctionData.startPrice,
      auctionData.minPrice,
      auctionData.decrementAmount || parseInt(config.auction.default_decrement_amount),
      decrementInterval
    );
    
    auctions.set(auction.id, auction);
    
    // Log auction creation
    logger.auctionCreated(user.name, auctionData.item, auctionData.startPrice);
    
    io.emit('auctionCreated', {
      id: auction.id,
      item: auction.item,
      startPrice: auction.startPrice,
      currentPrice: auction.currentPrice,
      minPrice: auction.minPrice,
      decrementInterval: auction.decrementInterval
    });
  });

  socket.on('startAuction', (data) => {
    // Handle both old format (just auctionId) and new format ({ auctionId, countdownDuration })
    const auctionId = typeof data === 'string' || typeof data === 'number' ? data : data.auctionId;
    const countdownDuration = typeof data === 'object' && data.countdownDuration ? data.countdownDuration : 3;
    
    const auction = auctions.get(auctionId);
    if (auction && !auction.isActive) {
      // Send countdown events before starting
      let countdown = countdownDuration;
      
      // Emit the first countdown immediately
      io.emit('auctionCountdown', { 
        countdown, 
        auctionId,
        initialCountdown: countdownDuration,
        auctionData: {
          item: auction.item,
          startingPrice: auction.currentPrice
        }
      });
      
      const countdownInterval = setInterval(() => {
        countdown--;
        console.log(`Countdown: ${countdown} for auction ${auctionId}`);
        
        if (countdown >= 0) {
          io.emit('auctionCountdown', { 
            countdown, 
            auctionId,
            initialCountdown: countdownDuration,
            auctionData: {
              item: auction.item,
              startingPrice: auction.currentPrice
            }
          });
          
          if (countdown === 0) {
            clearInterval(countdownInterval);
            // Delay starting auction to show 0
            setTimeout(() => {
              auction.start();
              
              // Log auction start
              logger.auctionStarted(auction.itemName);
              
              io.emit('auctionStarted', { auctionId, timestamp: Date.now() + 100 });
            }, 1000);
          }
        }
      }, 1000);
    }
  });

  socket.on('bid', (auctionId) => {
    const auction = auctions.get(auctionId);
    const user = users.get(socket.id);
    
    if (auction && user && auction.bid(socket.id)) {
      user.score += 100;
      user.hasCrown = true; // Award crown to winner
      
      // Update all clients with new user data including crown status
      io.emit('userUpdate', Array.from(users.values()).map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        x: u.x,
        y: u.y,
        hasCrown: u.hasCrown || false
      })));
      
      // Log bid
      logger.bidPlaced(user.name, auction.itemName, auction.currentPrice);
      
      // Clear bid hoverers when auction ends
      bidHoverers.clear();
      io.emit('bidHoverCount', { count: 0 });
      
      // Start winner dialogue process instead of immediate celebration
      const dialogueOptions = [
        config.winner_dialogue?.option1 || '와! 정말 좋은 가격에 샀네요!',
        config.winner_dialogue?.option2 || '이거 진짜 필요했던 건데, 감사합니다!',
        config.winner_dialogue?.option3 || '경매 정말 재미있네요!',
        config.winner_dialogue?.option4 || '다음에도 또 참여하고 싶어요!'
      ];
      
      const selectionTimeout = parseInt(config.winner_dialogue?.selection_timeout) || 3000;
      
      // Store dialogue session data
      const dialogueSessionId = `dialogue_${auctionId}_${Date.now()}`;
      winnerDialogues.set(dialogueSessionId, {
        auctionId,
        winner: socket.id,
        winnerName: user.name,
        price: auction.currentPrice,
        timestamp: Date.now() + 100,
        dialogueOptions,
        selectionTimeout,
        timeoutHandle: null,
        selectedDialogue: null
      });
      
      // Emit winner dialogue start event
      io.emit('winnerDialogueStart', {
        sessionId: dialogueSessionId,
        auctionId,
        winnerId: socket.id,
        winnerName: user.name,
        price: auction.currentPrice,
        dialogueOptions,
        timeLimit: Math.floor(selectionTimeout / 1000)
      });
      
      // Set timeout for automatic completion
      const timeoutHandle = setTimeout(() => {
        handleDialogueTimeout(dialogueSessionId);
      }, selectionTimeout);
      
      winnerDialogues.get(dialogueSessionId).timeoutHandle = timeoutHandle;
      
      auction.end();
    }
  });

  socket.on('chatMessage', (message) => {
    const user = users.get(socket.id);
    if (user && (chatEnabled || isAdmin(user))) { // Admin can chat even when disabled
      // Check if admin is sending an announcement
      if (isAdmin(user) && message.startsWith('/')) {
        const announcementMessage = message.substring(1).trim();
        if (announcementMessage) {
          // Broadcast announcement to all clients
          io.emit('announcement', {
            message: announcementMessage,
            from: user.name,
            timestamp: new Date().toISOString()
          });
          
          // Log announcement
          logger.announcement(user.name, announcementMessage);
          return;
        }
      }
      
      const chatMessage = {
        userId: socket.id,
        userName: user.name,
        message: message,
        timestamp: new Date().toISOString()
      };
      
      // Store message in message store
      messageStore.addMessage(chatMessage);
      
      // Log chat message
      logger.chatMessage(user.name, message);
      
      // Broadcast to all clients
      io.emit('chatMessage', chatMessage);
      
      // Log message count periodically
      if (messageStore.getMessageCount() % 1000 === 0) {
        console.log(`Total messages stored: ${messageStore.getMessageCount()}`);
      }
    } else if (user && !chatEnabled && !isAdmin(user)) {
      socket.emit('chatDisabled', { message: 'Chat is currently disabled by admin' });
    }
  });

  socket.on('toggleChat', () => {
    const user = users.get(socket.id);
    if (user && isAdmin(user)) {
      chatEnabled = !chatEnabled;
      io.emit('chatToggled', { 
        enabled: chatEnabled,
        message: chatEnabled ? 'Chat enabled by admin' : 'Chat disabled by admin'
      });
    }
  });

  socket.on('moveUser', (position) => {
    const user = users.get(socket.id);
    if (user) {
      // 위치 제한 (0~90% 범위)
      const newX = Math.max(5, Math.min(90, position.x));
      const newY = Math.max(5, Math.min(90, position.y));
      
      user.x = newX;
      user.y = newY;
      
      // 다른 사용자들에게 위치 변경 알림
      socket.broadcast.emit('userMoved', {
        userId: socket.id,
        x: newX,
        y: newY
      });
    }
  });
  
  socket.on('reaction', (emoji) => {
    const user = users.get(socket.id);
    if (user) {
      const isAdmin = user.name === (config.admin?.name || 'Kane Lee');
      
      // Check if user is trying to use money rain effect
      if (emoji === '🤑' && !user.hasCrown && !isAdmin) {
        // User doesn't have permission for special emoji
        console.log(`User ${user.name} tried to use special emoji without crown or admin rights`);
        return;
      }
      
      const isSpecial = emoji === '🤑';
      const timestamp = Date.now();
      console.log(`Reaction from ${user.name}: ${emoji}, isSpecial: ${isSpecial}, hasCrown: ${user.hasCrown}, isAdmin: ${isAdmin}`);
      
      // Broadcast reaction to all users including sender
      io.emit('userReaction', {
        userId: socket.id,
        userName: user.name,
        emoji: emoji,
        timestamp: timestamp,
        isSpecial: isSpecial, // Mark as special effect
        soundTimestamp: isSpecial ? timestamp : null // Include timestamp for synchronized sound
      });
    }
  });
  
  socket.on('bidHoverStart', () => {
    const user = users.get(socket.id);
    if (user) {
      bidHoverers.add(socket.id);
      io.emit('bidHoverCount', { count: bidHoverers.size });
    }
  });
  
  socket.on('bidHoverEnd', () => {
    bidHoverers.delete(socket.id);
    io.emit('bidHoverCount', { count: bidHoverers.size });
  });
  
  // Handle winner dialogue selection
  socket.on('selectDialogue', ({ sessionId, selectedIndex }) => {
    const dialogueSession = winnerDialogues.get(sessionId);
    if (dialogueSession && dialogueSession.winner === socket.id && !dialogueSession.selectedDialogue) {
      const selectedDialogue = dialogueSession.dialogueOptions[selectedIndex];
      
      // Clear timeout
      if (dialogueSession.timeoutHandle) {
        clearTimeout(dialogueSession.timeoutHandle);
      }
      
      // Update session
      dialogueSession.selectedDialogue = selectedDialogue;
      
      // Broadcast selected dialogue to all clients
      io.emit('winnerDialogueSelected', {
        sessionId,
        selectedOption: selectedDialogue,
        winnerId: dialogueSession.winner,
        winnerName: dialogueSession.winnerName
      });
      
      // Calculate remaining time and show dialogue for that duration
      const currentTime = Date.now();
      const timeElapsed = currentTime - dialogueSession.timestamp;
      const remainingTime = Math.max(0, dialogueSession.selectionTimeout - timeElapsed);
      
      setTimeout(() => {
        proceedToCelebration(sessionId);
      }, remainingTime);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      logger.userLeave(user.name, socket.id);
    }
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
    
    // Remove from bid hoverers if they were hovering
    if (bidHoverers.has(socket.id)) {
      bidHoverers.delete(socket.id);
      io.emit('bidHoverCount', { count: bidHoverers.size });
    }
    
    io.emit('userLeft', socket.id);
    
    // Broadcast updated user count to all clients
    io.emit('userCount', {
      current: users.size,
      max: MAX_USERS
    });
  });
});

// Helper functions for dialogue handling
function handleDialogueTimeout(sessionId) {
  const dialogueSession = winnerDialogues.get(sessionId);
  if (dialogueSession && !dialogueSession.selectedDialogue) {
    // No dialogue was selected, proceed directly to celebration
    proceedToCelebration(sessionId);
  }
}

function proceedToCelebration(sessionId) {
  const dialogueSession = winnerDialogues.get(sessionId);
  if (dialogueSession) {
    // Emit the final celebration event
    io.emit('bidAccepted', {
      auctionId: dialogueSession.auctionId,
      winner: dialogueSession.winner,
      winnerName: dialogueSession.winnerName,
      price: dialogueSession.price,
      timestamp: dialogueSession.timestamp
    });
    
    // Clean up dialogue session
    winnerDialogues.delete(sessionId);
  }
}

function getLocalIPAddress() {
  const nets = networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  return results;
}

httpServer.listen(PORT, () => {
  const localIPs = getLocalIPAddress();
  
  // Log server start
  logger.serverStarted(PORT);
  
  console.log(`\n🚀 Dutch Auction Server Started!`);
  console.log(`📍 Local access: http://localhost:${PORT}`);
  
  if (localIPs.length > 0) {
    console.log(`🌐 Network access:`);
    localIPs.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  }
  
  const disableCache = config.server.disable_cache === 'true' || config.server.disable_cache === true;
  
  console.log(`\n📊 Current settings:`);
  console.log(`   • Admin user: ${ADMIN_NAME}`);
  console.log(`   • Chat enabled: ${chatEnabled}`);
  console.log(`   • Environment: ${config.server.environment}`);
  console.log(`   • Cache disabled: ${disableCache}`);
  console.log(`   • Default decrement: ${config.auction.default_decrement_amount}`);
  console.log(`   • Default interval: ${config.auction.default_decrement_interval}ms`);
  console.log(`\n✨ Server is ready for connections!\n`);
  
  // Send server time to all clients every second
  setInterval(() => {
    io.emit('serverTime', {
      timestamp: Date.now(),
      formatted: new Date().toLocaleString('ko-KR', { 
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    });
  }, 1000);
});