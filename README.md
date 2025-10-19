# ChatFlow - Real-time Messaging App

A modern Telegram-inspired messaging application built with React, TypeScript, and SignalR for real-time communication.

## Features

✨ **Authentication** - Secure login and registration with JWT tokens
💬 **Real-time Messaging** - Instant message delivery using SignalR
👥 **Chat Management** - Create and manage private and group chats
🎨 **Beautiful UI** - Clean, Telegram-inspired design with smooth animations
📱 **Responsive Design** - Works seamlessly on desktop and mobile
🔒 **Secure** - Token-based authentication with automatic refresh

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Real-time**: SignalR (@microsoft/signalr)
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A backend API server (see API documentation below)

### Installation

1. Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://your-api-url.com
VITE_SIGNALR_HUB_URL=https://your-api-url.com/chatHub
```

4. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## API Configuration

This app uses the APIs defined in `public/swagger.json`. Make sure your backend server implements these endpoints:

### Authentication Endpoints
- `POST /user/register` - Register a new user
- `POST /user/log-in` - Login and get JWT tokens
- `POST /user/refresh-token` - Refresh access token

### Chat Endpoints
- `GET /chat/get-all` - Get all chats for the user
- `GET /chat/get-by-id` - Get chat details
- `POST /chat/add` - Create a new chat
- `PUT /chat/update` - Update chat information
- `DELETE /chat/remove` - Delete a chat

### Message Endpoints
- `GET /message/get-all` - Get all messages
- `GET /message/get-by-id` - Get message details
- `POST /message/add` - Send a new message
- `PUT /message/update` - Edit a message
- `DELETE /message/remove` - Delete a message

### User Endpoints
- `GET /user/get-all` - Get all users
- `GET /user/get-by-id/{id}` - Get user by ID
- `PUT /user/update/{id}` - Update user profile

## SignalR Configuration

The app uses SignalR for real-time messaging. Your backend should implement a SignalR hub with these methods:

### Client → Server Methods
- `JoinChat(chatId)` - Join a chat room
- `LeaveChat(chatId)` - Leave a chat room
- `SendMessage(chatId, content)` - Send a message to a chat

### Server → Client Methods
- `ReceiveMessage(message)` - Receive new messages in real-time

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatSidebar.tsx # Chat list sidebar
│   ├── ChatWindow.tsx  # Chat message window
│   └── ProtectedRoute.tsx # Auth guard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utilities and services
│   ├── api.ts         # API client
│   └── signalr.ts     # SignalR service
├── pages/             # Page components
│   ├── Chat.tsx       # Main chat page
│   ├── Login.tsx      # Login page
│   └── Register.tsx   # Registration page
├── types/             # TypeScript types
│   └── api.ts         # API type definitions
└── App.tsx            # Main app component
```

## Design System

The app uses a custom design system inspired by Telegram:

- **Primary Color**: Telegram Blue (HSL: 199, 100%, 40%)
- **Clean Typography**: System fonts with clear hierarchy
- **Smooth Animations**: Subtle transitions for better UX
- **Semantic Tokens**: All colors defined in CSS variables

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Semantic HTML and accessibility
- Tailwind CSS for styling (using design system tokens)

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

Or simply use Lovable's one-click deployment:
- Click the "Publish" button in the top right of the Lovable editor

## API Reference

For complete API documentation, see the Swagger specification in `public/swagger.json`

## License

This project is built with Lovable.

## Support

For issues or questions, please open an issue in the repository.
