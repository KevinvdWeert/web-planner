# 🗓️ Web Planner

A modern, full-featured task and event management web application built with React and PHP. Web Planner helps you organize your work, manage tasks, and schedule events with a beautiful, intuitive interface.

![Web Planner](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)

## ✨ Features

### 🎯 Task Management
- **Create, Edit, and Delete Tasks** - Full CRUD operations for task management
- **Priority Levels** - Categorize tasks as Low, Medium, or High priority
- **Categories** - Organize tasks into Work, Personal, Shopping, Health, and Other
- **Status Tracking** - Track tasks through To Do, In Progress, and Completed states
- **Due Dates & Times** - Set deadlines with optional time specifications
- **Search & Filter** - Quickly find tasks with real-time search and filtering
- **Sort Options** - Sort by due date, priority, or title
- **Overdue Detection** - Automatic highlighting of overdue tasks

### 📅 Calendar & Events
- **Interactive Monthly Calendar** - Visual calendar grid with event display
- **Event Types** - Meeting, Deadline, Reminder, Appointment, and Personal events
- **Color-Coded Events** - Each event type has a distinct color for easy identification
- **Event Details** - Add title, description, location, date, time, and reminders
- **Quick Navigation** - Jump to today or navigate months easily
- **Upcoming Events List** - See all upcoming events at a glance

### 📊 Dashboard
- **Overview Statistics** - Total tasks, completed, pending, and events counts
- **Today's Tasks** - Quick view of tasks due today
- **Recent Events** - Latest events and appointments
- **Visual Stats** - Beautiful stat cards with icons and animations

### 🔐 User Authentication
- **Secure Login** - User authentication with session management
- **Registration** - Create new accounts with email (optional)
- **Session Persistence** - Stay logged in across browser sessions
- **Logout** - Secure logout functionality

### 🎨 Modern UI/UX
- **Dark Theme** - Beautiful gradient dark theme with glass-morphism effects
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations** - Elegant transitions and hover effects
- **Glassmorphism** - Modern frosted glass effect throughout the interface
- **Custom Scrollbars** - Styled scrollbars matching the theme
- **Loading States** - Professional loading indicators

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with Hooks
- **Bootstrap 5.3** - Responsive grid and components
- **Bootstrap Icons** - Icon library
- **Custom CSS** - Advanced styling with CSS variables and animations
- **Babel** - JSX transformation in the browser

### Backend
- **PHP 8.0+** - Server-side logic
- **MySQL 8.0** - Database management
- **PDO** - Secure database connections
- **RESTful API** - Clean API architecture

### Development Environment
- **Laragon** - Local development server
- **Apache** - Web server
- **phpMyAdmin** - Database management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Laragon](https://laragon.org/) (includes Apache, PHP, MySQL)
- PHP 8.0 or higher
- MySQL 8.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/web-planner.git
cd web-planner
```

### 2. Database Setup

**Option A: Using the SQL file**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database named `web_planner`
3. Import the `database/web_planner.sql` file

**Option B: Manual Setup**
```sql
CREATE DATABASE web_planner;
USE web_planner;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    category ENUM('work', 'personal', 'shopping', 'health', 'other') DEFAULT 'work',
    status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create demo user (password: demo123)
INSERT INTO users (username, password, email) VALUES 
('demo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'demo@example.com');
```

### 3. Configure Database Connection

Edit `api/config/auth.php` if needed:
```php
private $host = 'localhost';
private $dbname = 'web_planner';
private $username = 'root';
private $password = '';  // Default Laragon password is empty
```

### 4. Start Laragon

1. Open Laragon
2. Click "Start All"
3. Navigate to `http://localhost/web/prive%20projecten/web%20planner/`

## 📁 Project Structure

```
web-planner/
├── api/                          # Backend API
│   ├── auth/                     # Authentication endpoints
│   │   └── index.php
│   ├── tasks/                    # Task management endpoints
│   │   └── index.php
│   ├── events/                   # Event management endpoints
│   │   └── index.php
│   └── config/                   # Configuration files
│       ├── auth.php              # Auth & Database classes
│       └── database.php
├── assets/                       # Frontend assets
│   ├── css/
│   │   └── style.css            # Main stylesheet with custom theme
│   └── js/
│       └── app.js               # React application
├── database/                     # Database files
│   └── web_planner.sql          # Database schema
├── index.html                    # Entry point
└── README.md                     # This file
```

## 🎮 Usage

### Demo Account
```
Username: demo
Password: demo123
```

### Creating a New Account
1. Click "Need an account? Sign up"
2. Enter username and password
3. Email is optional
4. Click "Create Account"

### Managing Tasks
1. Navigate to **Tasks** from the sidebar
2. Click **Add Task** button
3. Fill in task details:
   - Title (required)
   - Description (optional)
   - Due date (required)
   - Due time (optional)
   - Priority (Low/Medium/High)
   - Category (Work/Personal/Shopping/Health/Other)
4. Click **Create Task**

### Managing Events
1. Navigate to **Calendar** from the sidebar
2. Click **Add Event** button or click on a date
3. Fill in event details:
   - Title (required)
   - Description (optional)
   - Date (required)
   - Time (optional)
   - Event type (Meeting/Deadline/Reminder/Appointment/Personal)
   - Location (optional)
4. Click **Create Event**

### Dashboard
- View statistics at a glance
- See today's tasks
- Check recent events
- Monitor completed vs pending tasks

## 🎨 Customization

### Changing Colors
Edit CSS variables in `assets/css/style.css`:
```css
:root {
  --bg: #0a0f1c;
  --accent: #34d399;
  --primary: #6366f1;
  /* ... more variables */
}
```

### Modifying the API
All API endpoints are in the `api/` directory:
- `api/auth/` - Authentication
- `api/tasks/` - Task operations
- `api/events/` - Event operations

## 🔒 Security Features

- **Password Hashing** - BCrypt password hashing
- **SQL Injection Protection** - Prepared statements with PDO
- **XSS Protection** - Input sanitization
- **CSRF Protection** - Session-based authentication
- **Session Management** - Secure session handling with expiration

## 🐛 Troubleshooting

### Modal Not Showing
If modals don't appear when clicking "Add Task" or "Add Event":
1. Check browser console for JavaScript errors
2. Ensure all scripts are loaded (React, ReactDOM, Babel)
3. Clear browser cache and refresh

### Database Connection Error
```
Error: Database connection failed
```
**Solution:**
1. Verify MySQL is running in Laragon
2. Check database credentials in `api/config/auth.php`
3. Ensure `web_planner` database exists

### Tasks/Events Not Loading
```
Tasks API returned non-JSON response
```
**Solution:**
1. Check PHP error logs in `C:\laragon\www\logs\`
2. Verify database tables exist
3. Ensure user is logged in

### Authentication Issues
```
Authentication required
```
**Solution:**
1. Clear browser cookies
2. Log out and log back in
3. Check session table in database

## 🚦 API Endpoints

### Authentication
```
POST   /api/auth/?action=login       - User login
POST   /api/auth/?action=register    - User registration
POST   /api/auth/?action=logout      - User logout
GET    /api/auth/?action=check       - Check authentication status
```

### Tasks
```
GET    /api/tasks/                   - Get all user tasks
GET    /api/tasks/?id={id}           - Get specific task
POST   /api/tasks/                   - Create new task
PUT    /api/tasks/                   - Update task
DELETE /api/tasks/?id={id}           - Delete task
```

### Events
```
GET    /api/events/                  - Get all user events
POST   /api/events/                  - Create new event
PUT    /api/events/                  - Update event
DELETE /api/events/?id={id}          - Delete event
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Internet Explorer (not supported)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon library
- [Laragon](https://laragon.org/) - Development environment

## 📈 Roadmap

- [ ] Email notifications for reminders
- [ ] Task recurring options
- [ ] Calendar week/day views
- [ ] Task/event sharing between users
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle
- [ ] Export tasks/events to CSV
- [ ] Task attachments
- [ ] Comments on tasks
- [ ] Team collaboration features

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/web-planner/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact me via email

---

⭐ If you find this project helpful, please give it a star!

Made with ❤️ and ☕
