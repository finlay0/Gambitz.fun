# Gambitz.fun Frontend Page Structure

## Overview
Gambitz.fun is a Solana-based chess platform where players can stake lamports and play with NFT royalties for opening moves. This document outlines a comprehensive frontend page structure that aligns with the platform's features.

## Page Structure

### 1. Landing Page (`/`)
- **Purpose**: Introduce new users to the platform, highlight key features
- **Components**:
  - Hero section with animated chess pieces and "Play Now" CTA
  - Feature highlights (stake-based games, NFT royalties, anti-cheat)
  - Latest games/matches section with live updates
  - "How it works" section with simple step illustrations
  - Footer with links to social media, docs, and other resources
- **User Flow**: Clear path to signup/login and immediate game start

### 2. Game Page (`/board` or `/play`)
- **Purpose**: Core game experience where players match and play chess
- **Components**:
  - Chessboard with react-chessboard
  - Move history panel
  - Player timers and information
  - Game controls (resign, offer draw)
  - Opening recognition display
  - Match settlement and payout information
  - Rematch dialog with countdown
  - Win/loss celebration animations
- **State Management**: 
  - Match status (searching, matched, playing, completed)
  - Game state (move history, current position)
  - Timer management
  - Result submission and settlement

### 3. Leaderboard (`/leaderboard`)
- **Purpose**: Display top players and their statistics
- **Components**:
  - Sortable table with rank, username, wins, losses, draws, stake won/lost
  - Time period filters (daily, weekly, monthly, all-time)
  - Tabs for different game modes or stake tiers
  - Search functionality to find specific players
- **Data Display**: Paginated results with smooth transitions

### 4. Profile Page (`/profile` or `/profile/[username]`)
- **Purpose**: Display player stats and game history
- **Components**:
  - Player summary (username, avatar, join date)
  - Stats overview (wins, losses, draws, win rate, total stake won/lost)
  - Match history with detailed results
  - Opening preferences visualization
  - NFT collection display (owned opening NFTs)
  - Settings section for account preferences
- **Features**: Ability to share profile and review past games

### 5. Openings Marketplace (`/openings`)
- **Purpose**: Browse, buy, sell opening NFTs that earn royalties
- **Components**:
  - Gallery view of available opening NFTs with ECO codes
  - Filters by opening type, popularity, price
  - NFT details view with historical performance
  - Ownership status and royalty earnings for owned NFTs
  - Purchase/sell functionality integrated with Solana wallet
- **Integration**: Connect with Solana wallet for transactions

### 6. Game Analysis (`/analysis` or `/game/[id]`)
- **Purpose**: Review completed games with detailed analysis
- **Components**:
  - Interactive chessboard with move navigation
  - Engine evaluation graph
  - Opening recognition with ECO code
  - Move quality indicators
  - Share game functionality
  - Download PGN option
- **Features**: Integration with chess engines for move analysis

### 7. Settings (`/settings`)
- **Purpose**: Configure account and game preferences
- **Components**:
  - Profile settings (username, avatar, bio)
  - Game preferences (board theme, piece style, sound)
  - Notification settings
  - Privacy and account security
  - Wallet connection management
- **Implementation**: User settings stored in database and local storage

### 8. Documentation (`/docs`)
- **Purpose**: Provide platform information and help
- **Components**:
  - Getting started guide
  - How stake and winnings work
  - NFT royalty system explanation
  - FAQ section
  - Contact/support form
- **Design**: Clear, searchable documentation with examples

## Navigation Structure

### Header
- Logo/Home link
- Play Now button (primary CTA)
- Leaderboard link
- Openings Market link
- Documentation link
- Profile dropdown (when logged in)
- Connect Wallet button (when not connected)

### Footer
- About/Team section
- Social media links
- Terms of Service and Privacy Policy
- Developer documentation links
- Contact information

## Mobile Considerations
- Responsive design for all pages
- Simplified navigation with hamburger menu
- Touch-friendly chessboard interactions
- Optimized game controls for smaller screens

## Technical Implementation

### Next.js App Router Structure
```
app/
├── page.tsx (Landing)
├── board/
│   └── page.tsx (Game Page)
├── leaderboard/
│   └── page.tsx (Leaderboard)
├── profile/
│   ├── page.tsx (Current User Profile)
│   └── [username]/
│       └── page.tsx (Other User Profile)
├── openings/
│   └── page.tsx (Openings Marketplace)
├── analysis/
│   └── page.tsx (Analysis Tool)
├── game/
│   └── [id]/
│       └── page.tsx (Game Review)
├── settings/
│   └── page.tsx (User Settings)
└── docs/
    └── page.tsx (Documentation)
```

### Shared Components
- Layout components (Header, Footer, Sidebar)
- Chessboard component with configurable options
- Game controls and move history components
- Authentication and wallet connection components
- UI components (buttons, cards, modals)

## Development Phases

### Phase 1: Core Experience
- Landing page
- Game page with matchmaking
- Basic profile with stats

### Phase 2: Enhanced Features
- Leaderboard implementation
- Detailed profile pages
- Game analysis tools

### Phase 3: Marketplace and Advanced Features
- Openings marketplace
- Enhanced analysis tools
- Social features and sharing

## Design Guidelines
- Primary color: Solana gradient (purple to teal)
- Secondary colors: Dark background with high contrast UI elements
- Typography: Clean, readable font for game information
- Animations: Subtle animations for state changes
- Spacing: Consistent padding and margins

## Accessibility Considerations
- Keyboard navigation for all features
- Screen reader compatibility
- Color contrast requirements
- Alternative text for images
- Focus indicators for interactive elements 