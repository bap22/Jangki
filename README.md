# 🎮 Jangki - Korean Chess

A modern, real-time multiplayer **Jangki** (Korean Chess) game built with Next.js and hosted on Vercel.

![Jangki](https://img.shields.io/badge/Game-Jangki-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-black?logo=vercel)

## 🌟 Features

- **🎯 Complete Jangki Rules**: All traditional Korean chess piece movements
- **👥 Real-time Multiplayer**: 2-player online gameplay
- **🏠 Room System**: Create or join games with shareable room IDs
- **📱 Responsive Design**: Works on desktop and mobile
- **⚡ Serverless Architecture**: Deployed on Vercel with automatic scaling
- **🎨 Clean UI**: Beautiful board with Korean characters and piece highlighting

## 🎲 How to Play

1. **Create a Game** - Click "Create New Game" to start
2. **Share Room ID** - Send the room ID to your opponent
3. **Join Game** - Your opponent enters the room ID to join
4. **Play!** - Red moves first, capture the opponent's General (將) to win

### Piece Movements

| Piece | Korean | Movement |
|-------|--------|----------|
| General (Janggun) | 將 | One step orthogonally within palace |
| Advisor (Sa) | 士 | One step diagonally within palace |
| Elephant (Sang) | 象 | One orthogonal + two diagonal (blocks if path occupied) |
| Horse (Ma) | 馬 | One orthogonal + one diagonal (blocks if path occupied) |
| Chariot (Cha) | 車 | Any distance orthogonally |
| Cannon (Po) | 包 | Jumps over exactly one piece |
| Soldier (Byeol) | 卒 | One step forward or sideways |

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deploy to Vercel

1. Push to GitHub (already done!)
2. Connect repo to Vercel
3. Deploy automatically on push

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Inline CSS (no dependencies)
- **State**: In-memory game store (serverless-compatible)
- **Real-time**: Polling-based state sync (2s intervals)
- **Hosting**: Vercel Serverless Functions

## 📁 Project Structure

```
Jangki/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Lobby/home page
│   │   ├── game/[roomId]/page.tsx # Game room page
│   │   ├── api/games/route.ts    # Create/list games
│   │   └── api/games/[roomId]/route.ts # Game actions
│   ├── components/
│   │   └── Board.tsx             # Chess board component
│   └── lib/
│       ├── jangki.ts             # Game logic & rules
│       └── gameStore.ts          # In-memory game storage
├── package.json
├── tsconfig.json
├── next.config.js
└── vercel.json
```

## 🎮 API Endpoints

### `GET /api/games`
List all active games

### `POST /api/games`
Create a new game room

### `GET /api/games/[roomId]`
Get game state

### `POST /api/games/[roomId]`
Perform actions:
- `join` - Join a game
- `move` - Make a move (requires `from` and `to` positions)
- `delete` - Delete a game

## 📝 Game Rules

### Winning Conditions
- Capture the opponent's General (Janggun)
- Opponent resigns
- Opponent times out (future feature)

### Special Rules
- **Palace**: Generals and Advisors must stay within the 3x3 palace
- **Cannon**: Cannot capture another cannon, must jump over exactly one piece
- **Blocking**: Horses and Elephants can be blocked if their path is occupied
- **Soldier Movement**: Soldiers can move sideways, not just forward

## 🔧 Future Enhancements

- [ ] WebSocket support for instant updates
- [ ] Move history viewer
- [ ] Game timer with time controls
- [ ] Spectator mode
- [ ] AI opponent
- [ ] Sound effects
- [ ] Game replay export
- [ ] Player ratings

## 📄 License

MIT License - feel free to fork and modify!

## 🙏 Acknowledgments

Jangki is a traditional Korean board game with centuries of history. This implementation aims to preserve and share this beautiful game with modern players worldwide.

---

**Built with ❤️ for Jangki enthusiasts**
