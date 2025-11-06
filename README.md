# UMessenger Frontend

A modern dark-themed messenger frontend built with React, TypeScript, and Vite.

## Features

- Dark theme with purple accents
- Real-time messaging via SignalR
- JWT authentication with token refresh
- Chat list with search functionality
- Message bubbles with YouTube link previews
- File attachment support
- Responsive design

## Tech Stack

- **React 18+** with TypeScript
- **Vite** for build tooling
- **Axios** for HTTP requests
- **SignalR** for real-time messaging
- **React Router** for routing
- **React Icons** for icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=https://localhost:7047
VITE_SIGNALR_HUB_URL=/hubs/message
```

3. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:8080` (configured to match backend CORS settings).

## Project Structure

```
src/
├── components/
│   ├── Auth/          # Login and Register components
│   ├── ChatList/      # Chat list panel components
│   ├── Conversation/  # Message view components
│   └── Layout/        # Main layout and protected routes
├── contexts/          # React contexts (Auth, Chat)
├── services/          # API and SignalR services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # Global styles
```

## API Integration

The frontend integrates with the UMessenger backend API:

- **Authentication**: `/user/register`, `/user/log-in`, `/user/refresh-token`
- **Chats**: `/chat/get-all`, `/chat/get-by-id`, `/chat/global-search`
- **Messages**: `/message/get-by-chat/{chatId}`, `/message/add`
- **Users**: `/user/get-all`, `/user/search`, `/user/get-by-id/{id}`

## SignalR Hub

Real-time messaging is handled via SignalR hub at `/hubs/message`:
- `ReceiveMessage` - New message received
- `OnMessageEdited` - Message edited
- `OnMessageDeleted` - Message deleted

## Build

```bash
npm run build
```

## License

MIT
