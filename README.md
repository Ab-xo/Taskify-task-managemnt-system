# 🚀 Taskify - Advanced Task Management System

A modern, full-stack task management application built with React, Node.js, Express, and MongoDB.

## ✨ Features

### 🔐 **Authentication & Security**
- Secure user registration and login
- JWT token-based authentication with refresh tokens
- Password hashing with bcrypt
- Protected routes and API endpoints
- Rate limiting and security headers

### 📋 **Task Management**
- Create, read, update, and delete tasks
- Priority levels: Low, Medium, High, Urgent
- Task status: Pending, In Progress, Completed
- Rich task descriptions
- Real-time status updates

### 🔍 **Advanced Search & Filtering**
- Real-time search by task name and description
- Filter by priority level
- Filter by task status
- Combined filtering capabilities
- Clear filters functionality

### 📊 **Dashboard Features**
- Pending and completed task tabs
- Pagination for large task lists
- Visual priority indicators
- Responsive design

### 🎨 **Modern UI/UX**
- Clean, professional interface
- Color-coded priority system
- Hover effects and micro-interactions
- Mobile-responsive design
- Intuitive navigation

## 🛠 **Tech Stack**

### **Frontend**
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Context API for state management

### **Backend**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS and security middleware

## 📦 **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd taskify
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### **4. MongoDB Setup**
1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace the MONGO_URI in your .env file

### **5. Start the Application**
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
# Backend only
npm run server

# Frontend only  
npm run dev
```

### **6. Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🗄️ **Database Structure**

### **Users Collection**
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Tasks Collection**
```json
{
  "_id": "ObjectId",
  "name": "Task Name",
  "description": "Task Description",
  "status": "pending",
  "priority": "medium",
  "user": "user_ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 🚀 **API Endpoints**

### **Authentication**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### **Tasks**
- `GET /api/tasks` - Get user tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/overview` - Get task statistics

### **Users**
- `GET /api/users/profile` - Get user profile

## 🎯 **Usage Guide**

### **Getting Started**
1. **Sign Up**: Create a new account with name, email, and password
2. **Login**: Access your dashboard with your credentials
3. **Add Tasks**: Click "Add New" to create your first task
4. **Manage Tasks**: Update status, priority, and delete tasks as needed

### **Task Management**
- **Create**: Use the "Add New" button to create tasks with title, description, and priority
- **Update Status**: Use the status dropdown to change between Pending, In Progress, and Completed
- **Set Priority**: Choose from Low, Medium, High, or Urgent priority levels
- **Delete**: Use the trash icon to permanently delete tasks

### **Search & Filter**
- **Search**: Type in the search bar to find tasks by name or description
- **Filter by Priority**: Use the priority dropdown to show specific priority tasks
- **Filter by Status**: On pending tab, filter by pending or in-progress status
- **Clear Filters**: Reset all filters with one click

## 🔧 **Development**

### **Project Structure**
```
taskify/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React Context providers
│   ├── screens/           # Page components
│   ├── services/          # API service layer
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js app
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   └── routes/            # API route handlers
└── package.json           # Dependencies and scripts
```

### **Available Scripts**
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend

## 🛡️ **Security Features**
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet

## 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

## 🚀 **Production Deployment**

### **Frontend (Netlify/Vercel)**
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables for API URL

### **Backend (Railway/Render/Heroku)**
1. Set environment variables
2. Deploy the server code
3. Ensure MongoDB connection

## 🤝 **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**
MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 **Support**
If you encounter any issues:
1. Check the console for error messages
2. Verify your MongoDB connection
3. Ensure all environment variables are set
4. Check that both frontend and backend are running

## 🎉 **Acknowledgments**
Built with modern web technologies and best practices for a professional task management experience.

---

**Happy Task Managing! 🚀✨**