# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time Dutch auction game built with React and Node.js, supporting up to 500 concurrent users. The game features a game-style UI with real-time chat functionality and avatar movement on a grid-based game board.

## Development Commands

### Starting the Application

**Production/Demo:**
```bash
npm run start              # Start production server (port 3500)
npm run start:cluster      # Start with basic cluster mode for high concurrency
npm run start:cluster-opt  # Start with optimized cluster mode (best for 500+ users)
```

**Development:**
```bash
npm run dev          # Start development server with Vite proxy
npm run dev:force    # Force start development server (handles port conflicts)
npm run dev:watch    # Start with nodemon for auto-restart
```

**Build:**
```bash
npm run build        # Build client with Vite for production
npm run build:dev    # Start Vite dev server directly
```

**Port Management:**
```bash
npm run kill-port     # Kill processes on port 3500 (Unix/Mac)
npm run kill-port:win # Kill processes on port 3500 (Windows)
```

**Quick Deploy:**
```bash
# Windows
deploy.bat

# Unix/Mac  
./deploy.sh
```

**Testing:**
No automated tests are currently configured. Manual testing is required for all features.

## Architecture Overview

### Server Architecture
- **server.js**: Main Express + Socket.io server on port 3500
- **cluster.js**: Basic cluster implementation for multi-core support
- **cluster-optimized.js**: Advanced cluster with sticky sessions for 500+ users
- **DutchAuction class**: Manages auction logic with automatic price decrementation
- **Admin system**: Configurable admin user (default: "Kane Lee") 
- **Real-time communication**: WebSocket with fallback to polling
- **Static file serving**: Built React client from /dist
- **Message persistence**: In-memory storage via messageStore.js

### Client Architecture (React + Vite)
- **Grid-based layout** with main game area, auction panel, and chat panel
- **Socket.io-client** for real-time server communication
- **Styled-components** for component styling
- **Framer Motion** for animations and transitions
- **Auto-detection** of server URL (localhost vs network IP)

### Key Components
- **GameRoom**: Main game board with clickable avatar movement and chat bubbles
- **AuctionPanel**: Auction creation, bidding interface, and admin controls
- **ChatPanel**: Real-time messaging with admin toggle functionality
- **LoginScreen**: User authentication and connection status
- **AdminPanel**: Admin-only controls for auction and chat management
- **AnnouncementOverlay**: Admin announcements displayed at top of game board (triggered by `/` prefix)
- **CountdownOverlay**: Auction countdown animation with 3-2-1 display
- **CelebrationModal**: Winner celebration animation when auction is won
- **WinnerDialogueModal**: Post-auction winner dialogue selection system with real-time broadcasting

### Game Logic
- **Dutch auction**: Prices decrease over time until someone bids
- **Real-time positioning**: Click-to-move avatar system with smooth animations
- **Auction winners display**: Shows who won which items and at what price
- **Chat system**: 5-second chat bubbles with admin disable/enable
- **Admin privileges**: Configurable admin user can create auctions and toggle chat
- **Admin announcements**: Messages starting with `/` from admin appear as announcements (5-second display)
- **Currency display**: All prices shown in Korean Won (₩) with thousand separators
- **Logging system**: JSON-formatted logs for all major events (joins, chats, bids, auctions)
- **Audio system**: Web Audio API for synchronized sound effects and procedural audio generation
- **Winner dialogue system**: Post-auction interactive dialogue selection with real-time broadcasting

### Data Flow
1. Client connects via Socket.io with automatic server URL detection
2. User authentication stores user data in server-side Map
3. Real-time events broadcast game state changes to all connected clients
4. Admin actions verified server-side before execution
5. Game state persisted in memory (auctions, users, messages)

## Configuration

### config.ini Settings
The server uses a `config.ini` file for configuration management:

```ini
[server]
port = 3500
environment = development

[admin]
name = Kane Lee

[chat]
enabled = true

[auction]
default_decrement_amount = 10
default_decrement_interval = 1000

[movement]
animation_duration = 1.3
ease_type = cubic-bezier

[socket]
ping_timeout = 60000
ping_interval = 25000
allow_eio3 = true

[cors]
dev_origin = http://localhost:3000

[winner_dialogue]
option1 = 이건 제가 가져갑니돠
option2 = 내 물건에 입찰하지 말랬즤
option3 = 어머 이건 사야 해
option4 = 후후, 다음 기회를 노리세요
selection_timeout = 7000
```

**Configuration sections:**
- **[server]**: Port and environment settings
- **[admin]**: Admin user configuration
- **[chat]**: Chat system settings
- **[auction]**: Default auction parameters
- **[movement]**: Avatar animation settings (duration and easing)
- **[socket]**: Socket.io connection settings
- **[cors]**: CORS configuration for development
- **[winner_dialogue]**: Winner dialogue system settings and customizable dialogue options

If `config.ini` is missing, the server will use hardcoded defaults and continue running.

## Development Notes

### Port Configuration
- **Development**: Client on 3000, Server on configurable port (default: 3500)
- **Production**: Server serves both client and API on configured port
- **Cluster mode**: Automatic port conflict resolution with retry logic

### Admin Access
- Admin username configurable via config.ini [admin] name setting
- Admin can create auctions, start auctions, and toggle chat
- Admin status checked on both client and server sides

### Real-time Features
- Socket.io handles user connections, movement, chat, and auction events
- Socket.io settings configurable via config.ini [socket] section
- Automatic reconnection and connection status indicators
- Optimistic UI updates for smooth user experience

### Important Development Workflow
- **Client changes**: Must run `npm run build` after modifying React components to reflect changes in production mode (`npm start`)
- **Server changes**: Only require server restart to take effect
- **Config changes**: Modify config.ini and restart server; client will receive new settings automatically
- **Movement animations**: Configured via config.ini [movement] section, sent to clients on connection
- **Layout constraints**: Fixed viewport layout with overflow handling to prevent scrolling issues
- **Logging**: Server events automatically logged to `/logs/server-YYYY-MM-DD.log` in JSON format

### UI Components
- **Top Player UI**: Replaced with Auction Winners display showing completed auction results
- **Avatar movement**: Uses custom cubic-bezier easing for smooth motion without overshooting
- **Chat bubbles**: 5-second display duration with automatic formatting for multi-line messages
- **Admin controls**: Gear icon (⚙️) provides admin panel access for auction management

### Deployment
- Use deploy scripts for automated setup (install deps, build, start)
- Cluster mode recommended for high-concurrency scenarios
- Static files served from /dist after Vite build process
- Modify config.ini to customize server settings without code changes

## Key Files and Their Purposes

### Core Server Files
- **server.js**: Main server handling Express routes, Socket.io events, and auction logic
- **cluster.js**: Basic clustering for multi-core utilization
- **cluster-optimized.js**: Advanced clustering with sticky sessions for WebSocket stability
- **messageStore.js**: Centralized message storage for cluster mode communication
- **dev-server.js**: Development server configuration with Vite integration
- **logger.js**: JSON logging utility for server events (logs stored in /logs directory)

### Core Client Components
- **App.jsx**: Main React app with Socket.io connection management
- **LoginScreen.jsx**: User authentication and server connection UI
- **GameRoom.jsx**: Grid-based game board with avatar movement logic
- **AuctionPanel.jsx**: Auction display, bidding interface, and admin controls
- **ChatPanel.jsx**: Real-time chat with message history
- **AdminPanel.jsx**: Admin-only auction creation and management
- **AnnouncementOverlay.jsx**: Displays admin announcements at top of game board
- **CountdownOverlay.jsx**: Animated countdown before auction starts
- **CelebrationModal.jsx**: Victory animation for auction winners
- **WinnerDialogueModal.jsx**: Post-auction winner dialogue selection with heartbeat-synced animations
- **BidSection.jsx**: Active auction bidding interface at bottom of game board

### Utility Files
- **utils/currency.js**: Currency formatting helpers
- **utils/audioManager.js**: Web Audio API manager for sound effects with synchronization
- **vite.config.js**: Vite build configuration with proxy settings
- **config.ini**: Runtime configuration for server behavior

## Socket.io Event Reference

### Client to Server Events
- **join**: User authentication with username
- **chatMessage**: Send chat message (admin messages starting with `/` trigger announcements)
- **moveUser**: Avatar position update {x, y}
- **bid**: Submit bid for current auction
- **createAuction**: Admin creates new auction
- **startAuction**: Admin starts auction with countdown
- **toggleChat**: Admin toggles chat on/off
- **selectDialogue**: Winner selects dialogue option from post-auction choices

### Server to Client Events
- **joined**: Authentication result and initial state
- **joinError**: Username already taken error
- **userJoined**: New user joined notification
- **userLeft**: User disconnected notification
- **userMoved**: User position update
- **chatMessage**: New chat message
- **announcement**: Admin announcement (displayed at top of game)
- **auctionCreated**: New auction added to pending list
- **auctionCountdown**: 3-2-1 countdown before auction starts
- **auctionStarted**: Auction is now active (includes timestamp for audio sync)
- **priceUpdate**: Current price decreased
- **bidAccepted**: Bid successful, auction won (includes timestamp for audio sync)
- **auctionEnded**: Auction completed
- **chatToggled**: Chat enabled/disabled notification
- **configUpdate**: Movement animation settings
- **winnerDialogueStart**: Post-auction dialogue selection begins (includes dialogue options and timeout)
- **winnerDialogueSelected**: Winner has selected a dialogue option (broadcast to all clients)

## Audio Implementation

### Sound Files Required
Place these MP3 files in `/public/sounds/`:
- **auction-start.mp3**: Played when auction starts (volume: 0.7)
- **auction-won.mp3**: Played when auction is won (volume: 0.8)

### Audio Features
- Preloaded on game join for instant playback
- Synchronized across all clients using server timestamps
- Auction start music automatically stops when someone wins
- Web Audio API for better browser compatibility and control
- **Procedural audio generation**: Heartbeat sounds created dynamically without external files
- **Heartbeat synchronization**: UI elements can subscribe to heartbeat events for synchronized animations
- **Audio fading**: Smooth volume transitions between different game states

## Winner Dialogue System

### Overview
Post-auction interactive dialogue system where winners can select from predefined responses that are broadcast to all players in real-time.

### Configuration
Dialogue options and timing are configurable in `config.ini`:
- **option1-4**: Customizable dialogue text options
- **selection_timeout**: Time limit for dialogue selection (milliseconds)

### System Flow
1. **Auction completion** → Winner dialogue selection UI appears for all users
2. **Winner selection** → Shows dialogue options with countdown timer
3. **Non-winner display** → Shows waiting message with animated dots
4. **Selection made** → Selected dialogue broadcasts to all users immediately
5. **Timeout/completion** → Proceeds to celebration modal

### Audio Integration
- **Heartbeat sound**: Plays during dialogue selection for tension
- **Heartbeat synchronization**: Speech bubbles pulse in sync with heartbeat rhythm
- **Audio transitions**: Auction music fades out when dialogue starts

### Technical Implementation
- **Real-time broadcasting**: Uses Socket.io events for instant dialogue sharing
- **Session management**: Server tracks dialogue sessions with automatic cleanup
- **Animation synchronization**: Client components subscribe to heartbeat events for UI effects
- **Timeout handling**: Server manages automatic progression if no selection is made