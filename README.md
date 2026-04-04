# Employee Performance and Leave Management System

A robust, full-stack web application designed to streamline internal HR processes including employee performance tracking, leave management, and organizational hierarchy.

## 🌟 Features

### 👤 Employee Portal
- **Dashboard**: At-a-glance metrics of leave balances and active notifications.
- **Leave Management**: Apply for leaves, attach supporting documents, and track approval status.
- **Performance**: View finalized performance reviews directly from managers.
- **Profile**: Update user profile information.

### 👔 Manager Portal
- **Team Overview**: Access direct reports' analytics and leave schedules.
- **Leave Approvals**: Centralized hub to approve or reject leave requests with a single click.
- **Performance Evaluation**: Create, manage, and submit detailed employee performance reviews based on core competencies.

### 👑 Admin Console
- **System Dashboard**: Complete platform oversight and aggregated statistics.
- **Employee Directory**: Manage users (Create, Read, Update, Delete) and assign roles.
- **Advanced Reports**: Filterable views of company-wide leaves and performance metrics.

## 🛠 Tech Stack

**Frontend:**
- React.js (v19)
- Vite
- React Router (v7)
- Context API (State Management)
- CSS Modules & Lucide React (Icons)
- Recharts (Data Visualization)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (ODM)
- JSON Web Tokens (JWT) for Authentication
- Bcrypt for hashing
- Security: Helmet, Express Rate Limit, CORS

---

## 🏗️ Architecture & Folder Structure

This repository uses a monorepo structure.

```text
root/
 ├── frontend/       # React application (Vite)
 │    ├── public/
 │    └── src/
 │         ├── components/  # Reusable UI components
 │         ├── context/     # React Context for global auth state
 │         ├── pages/       # Route-based page components
 │         └── index.css    # Global styles & theme configuration
 │
 ├── backend/        # Node.js Express API
 │    ├── config/    # Database configuration
 │    ├── controllers/ # Route handlers & business logic
 │    ├── middleware/  # Auth, error handling, security
 │    ├── models/      # MongoDB Schema definitions
 │    └── routes/      # Express API routes
 │
 ├── package.json    # Root scripts for concurrent execution
 └── README.md
```

## 🚀 Setup Instructions

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- MongoDB (Local or Atlas Uri)

### 2. Environment Variables
Navigate to the `backend/` directory and use the `.env.example` file to create your `.env` file:
```bash
cd backend
cp .env.example .env
```
Fill in the details inside the new `.env` file:
- `PORT`: Define the backend port (default: 5000)
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secure string for hashing tokens

### 3. Installation
You can easily install dependencies for both frontend and backend using the root setup script:
```bash
npm run install:all
```
*(Alternatively, navigate to `/backend` and `/frontend` and run `npm install` respectively).*

### 4. Running the Application
From the root directory, start both the frontend and backend servers concurrently:
```bash
npm run dev
```
Alternatively, run them separately:
- **Backend:** `npm run start` (Targeting backend directory)
- **Frontend:** `npm run client` (Targeting frontend directory)

---

## 🔮 Future Enhancements
- Export reports to CSV/PDF
- Real-time Socket.io notifications
- Two-Factor Authentication (2FA) for Admin roles
- Deep integration with Slack/Microsoft Teams for leave alerts.
