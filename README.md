# Complete Full-Stack Expense Tracker System

A premium, modern full-stack application designed to manage personal finances. It features a React SPA powered by a high-performance Node.js REST API and a MySQL database.

## System Architecture
* **Frontend:** React.js (Vite), React Router v7, Axios, Bootstrap 5, Chart.js, Framer Motion.
* **Backend:** Node.js, Express.js, JWT Authentication, Multer for uploads, PDFKit & json2csv for reporting.
* **Database:** MySQL.
* **UI/UX:** Luxury Glassmorphism UI with Dark/Light mode, smooth animations, and multilingual support (English, Hindi, Russian).

## Step-by-Step Setup Instructions

### 1. Database Setup
1. Make sure your MySQL server is running.
2. Open phpMyAdmin or your preferred SQL client.
3. Import the `database/schema.sql` file. This will automatically execute and:
   - Create the `expense_tracker2_0` database.
   - Create tables: `users`, `categories`, `transactions`, `budgets`.
   - Insert default category seed data.

### 2. Node.js Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Copy the system `.env.example` to `backend/.env` (if not already done). Change DB credentials and `JWT_SECRET` for production.
4. Start the Node.js server:
   ```bash
   npm run dev
   ```
   *The Express server should now be running on http://localhost:5000*

### 3. React Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Vite should start on http://localhost:5173. The browser will open the frontend SPA.*

## Usage
- Open your browser to `http://localhost:5173`.
- Click **Register** to create a test account or use an existing one.
- **Login** with your credentials.
- Add categories and transaction records.
- Check out the **Reports** page to visualize your data and export it as **CSV** or **PDF**.
- Switch between **Light/Dark** mode and different **Languages** from the top-right navbar.

## Features
- **Modern Dashboard**: Real-time stats with animated counters and charts.
- **Reporting Suite**: Secure download of financial records via Node.js stream.
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop.
- **Premium Aesthetics**: Glassmorphic UI with floating background elements.
- **Multi-language**: High-quality translations for English, Hindi, and Russian.
