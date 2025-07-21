import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.ensureLogDirectory();
    
    const dateStr = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `server-${dateStr}.log`);
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  writeLog(type, message, data = null) {
    const logEntry = {
      timestamp: this.formatTimestamp(),
      type: type,
      message: message,
      ...(data && { data: data })
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(this.logFile, logLine, 'utf8');
    
    console.log(`[${logEntry.timestamp}] [${type}] ${message}`);
  }

  userJoin(username, socketId) {
    this.writeLog('USER_JOIN', `User joined: ${username}`, {
      username: username,
      socketId: socketId
    });
  }

  userLeave(username, socketId) {
    this.writeLog('USER_LEAVE', `User left: ${username}`, {
      username: username,
      socketId: socketId
    });
  }

  chatMessage(username, message) {
    this.writeLog('CHAT', `${username}: ${message}`, {
      username: username,
      message: message
    });
  }

  bidPlaced(username, itemName, amount) {
    this.writeLog('BID', `Bid placed by ${username} on ${itemName} for $${amount}`, {
      username: username,
      itemName: itemName,
      amount: amount
    });
  }

  auctionCreated(adminUsername, itemName, startingPrice) {
    this.writeLog('AUCTION_CREATE', `Auction created by ${adminUsername} for ${itemName} at $${startingPrice}`, {
      adminUsername: adminUsername,
      itemName: itemName,
      startingPrice: startingPrice
    });
  }

  auctionStarted(itemName) {
    this.writeLog('AUCTION_START', `Auction started for ${itemName}`, {
      itemName: itemName
    });
  }

  auctionEnded(itemName, winner, finalPrice) {
    this.writeLog('AUCTION_END', `Auction ended: ${itemName} won by ${winner} at $${finalPrice}`, {
      itemName: itemName,
      winner: winner,
      finalPrice: finalPrice
    });
  }

  serverStarted(port) {
    this.writeLog('SERVER_START', `Server started on port ${port}`, {
      port: port
    });
  }

  announcement(adminUsername, message) {
    this.writeLog('ANNOUNCEMENT', `Announcement by ${adminUsername}: ${message}`, {
      adminUsername: adminUsername,
      message: message
    });
  }

  error(message, error) {
    this.writeLog('ERROR', message, {
      error: error.message || error,
      stack: error.stack
    });
  }
}

export default new Logger();