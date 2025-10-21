# UMessenger Frontend

This is the frontend for UMessenger, a real-time messaging application inspired by Telegram. It is built with React, TypeScript, and Vite, featuring a modern UI using shadcn/ui and Tailwind CSS.

## Features

-   **Authentication:** Secure user registration and login with JWT.
-   **Real-time Chat:** Instant messaging using SignalR.
-   **Chat Management:** Create, view, and manage chats.
-   **Responsive Design:** A clean and responsive user interface that works on both desktop and mobile.

## Tech Stack

-   **Framework:** React 18, Vite
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS, shadcn/ui
-   **Real-time Communication:** @microsoft/signalr
-   **API Communication:** Axios, @tanstack/react-query
-   **Routing:** React Router DOM
-   **State Management:** React Context API
-   **Forms:** React Hook Form, Zod
-   **Linting:** ESLint

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   bun (or npm/yarn)
-   A running instance of the UMessenger backend.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd UMessenger-Frontend
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure environment variables:**

    Create a `.env` file in the root of the project and add the following variables:

    ```
    VITE_API_BASE_URL=http://localhost:5000
    ```

4.  **Run the development server:**
    ```bash
    bun run dev
    ```

    The application will be available at `http://localhost:8080`.

## Available Scripts

-   `bun run dev`: Starts the development server.
-   `bun run build`: Builds the application for production.
-   `bun run lint`: Lints the codebase using ESLint.
-   `bun run preview`: Serves the production build locally for preview.

## Project Structure

```
UMessenger-Frontend/
├── public/
│   └── swagger.json        # OpenAPI specification for the backend API
├── src/
│   ├── assets/             # Static assets
│   ├── components/         # Shared React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/           # React contexts (e.g., AuthContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Helper functions and libraries (api.ts, utils.ts)
│   ├── pages/              # Application pages (Login, Register, Chat)
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component with routing
│   └── main.tsx            # Application entry point
├── .env                    # Environment variables
├── package.json            # Project metadata and dependencies
└── vite.config.ts          # Vite configuration
```

## API Reference

The frontend communicates with a backend API for user authentication, chat management, and messaging. The complete API specification is defined in the `public/swagger.json` file.
