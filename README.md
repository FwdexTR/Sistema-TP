# DroneCore Project

This is a full-stack application consisting of a React frontend dashboard and a Node.js backend server.

## Project Structure

```
DroneCore/
├── dronecore-dashboard-ui/    # Frontend React application
└── server/                    # Backend Node.js server
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Setup Instructions

### Frontend (dronecore-dashboard-ui)

1. Navigate to the frontend directory:
   ```bash
   cd dronecore-dashboard-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend (server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend server will be available at `http://localhost:3000`

## Development

- Frontend is built with React, TypeScript, and Tailwind CSS
- Backend is built with Node.js and Express
- Database uses Prisma ORM

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 