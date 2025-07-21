import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3500;

// 기존 서버가 있으면 재시도
const startServer = (port, retries = 5) => {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // 서버 로직은 동일
  const users = new Map();
  const auctions = new Map();
  let auctionIdCounter = 1;

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
      io.emit('auctionEnded', {
        auctionId: this.id,
        winner: this.winner,
        finalPrice: this.winner ? this.currentPrice : null
      });
    }
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userData) => {
      const user = {
        id: socket.id,
        name: userData.name,
        avatar: userData.avatar || `avatar${Math.floor(Math.random() * 10) + 1}`,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        score: 0
      };
      
      users.set(socket.id, user);
      
      socket.emit('joined', {
        userId: socket.id,
        users: Array.from(users.values()),
        auctions: Array.from(auctions.values()).map(a => ({
          id: a.id,
          item: a.item,
          currentPrice: a.currentPrice,
          isActive: a.isActive,
          winner: a.winner
        }))
      });
      
      // Broadcast new user to all other existing users
      socket.broadcast.emit('userJoined', user);
    });

    socket.on('createAuction', (auctionData) => {
      const auction = new DutchAuction(
        auctionIdCounter++,
        auctionData.item,
        auctionData.startPrice,
        auctionData.minPrice,
        auctionData.decrementAmount || 10,
        auctionData.decrementInterval || 1000
      );
      
      auctions.set(auction.id, auction);
      io.emit('auctionCreated', {
        id: auction.id,
        item: auction.item,
        startPrice: auction.startPrice,
        currentPrice: auction.currentPrice,
        minPrice: auction.minPrice
      });
    });

    socket.on('startAuction', (auctionId) => {
      const auction = auctions.get(auctionId);
      if (auction && !auction.isActive) {
        auction.start();
        io.emit('auctionStarted', { auctionId });
      }
    });

    socket.on('bid', (auctionId) => {
      const auction = auctions.get(auctionId);
      const user = users.get(socket.id);
      
      if (auction && user && auction.bid(socket.id)) {
        user.score += 100;
        io.emit('bidAccepted', {
          auctionId,
          winner: socket.id,
          winnerName: user.name,
          price: auction.currentPrice
        });
        auction.end();
      }
    });

    socket.on('chatMessage', (message) => {
      const user = users.get(socket.id);
      if (user) {
        io.emit('chatMessage', {
          userId: socket.id,
          userName: user.name,
          message: message,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      users.delete(socket.id);
      io.emit('userLeft', socket.id);
    });
  });

  httpServer.listen(port)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retries > 0) {
        console.log(`Port ${port} is in use, trying port ${port + 1} (${retries} retries left)`);
        setTimeout(() => startServer(port + 1, retries - 1), 1000);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    })
    .on('listening', () => {
      console.log(`Server running on port ${port}`);
      if (port !== PORT) {
        console.log(`Note: Original port ${PORT} was in use`);
        console.log(`\nUpdate your client to connect to: http://localhost:${port}`);
      }
    });
};

// 서버 시작
startServer(PORT);