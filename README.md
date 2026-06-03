# Momo Plaza 🥟

Welcome to **Momo Plaza**! This is a full-stack food delivery web application tailored for momo lovers. Built with a modern tech stack to provide seamless ordering, real-time tracking, and a dynamic user interface.

## 🚀 Features

- **Dynamic Hero & UI:** Modern glassmorphism UI with vibrant red and gold themes.
- **AI Genie Assistant:** A smart chat assistant that helps users pick the perfect momo and can automatically add items to their cart.
- **Shopping Cart & Checkout:** Quick and smooth cart management.
- **Real-Time Notifications:** Stay updated with your order status (powered by Firebase).
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **WhatsApp Integration:** Instant support and contact via floating WhatsApp button.

## 🛠 Tech Stack

- **Frontend:** React, Framer Motion, Lucide-React, Axios, React Router.
- **Backend:** Node.js, Express (RESTful APIs).
- **Database:** MongoDB (via Mongoose).
- **Other Tools:** Vite (Bundler), Firebase (Push Notifications & Service Workers).

## 📦 Project Structure

- `frontend/`: Contains all the React front-end code (components, pages, context).
- `backend/`: Contains the Express server, controllers, models, and routes.

## ⚙️ Setup Instructions

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd Momo_Plaza
\`\`\`

### 2. Setup Environment Variables
You need to create `.env` files in both the `frontend` and `backend` directories.

**frontend/.env**
\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`

**backend/.env**
\`\`\`env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
\`\`\`

### 3. Install Dependencies
You need to install packages for both the backend and frontend.
\`\`\`bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### 4. Run the Application
Run both the frontend and backend servers.
\`\`\`bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from frontend directory)
npm run dev
\`\`\`

The application will now be running on \`http://localhost:5173\` (frontend) and \`http://localhost:5000\` (backend).

## 📄 License
This project is proprietary and intended for Momo Plaza. All rights reserved.
