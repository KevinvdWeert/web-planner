const { useState, useEffect } = React;

// API Configuration
const API_BASE = window.location.origin + '/web/prive%20projecten/web%20planner/api';

// Authentication Context
const AuthContext = React.createContext();

// Main App Component
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('Checking auth at:', `${API_BASE}/auth/?action=check`);
            const response = await fetch(`${API_BASE}/auth/?action=check`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('Auth check response:', data);
            
            if (data.success && data.authenticated && data.user) {
                setIsAuthenticated(true);
                setUser(data.user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            console.log('Attempting login to:', `${API_BASE}/auth/?action=login`);
            const response = await fetch(`${API_BASE}/auth/?action=login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (data.success && data.user) {
                setIsAuthenticated(true);
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error: ' + error.message };
        }
    };

    const register = async (username, password, email) => {
        try {
            const response = await fetch(`${API_BASE}/auth/?action=register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password, email })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/auth/?action=logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center text-white">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading Web Planner...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
            {isAuthenticated ? <MainApp /> : <AuthPage />}
        </AuthContext.Provider>
    );
};

// Authentication Page Component
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, register } = React.useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            const result = await login(formData.username, formData.password);
            if (!result.success) {
                setError(result.message);
            }
        } else {
            const result = await register(formData.username, formData.password, formData.email);
            if (result.success) {
                setIsLogin(true);
                setFormData({ username: '', password: '', email: '' });
                setError('');
                alert('Account created successfully! Please login.');
            } else {
                setError(result.message);
            }
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>
                    <i className="bi bi-calendar-check me-2"></i>
                    Web Planner
                </h1>
                
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="Email (optional)"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : null}
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>
                
                <div className="text-center">
                    <button
                        className="btn btn-link text-decoration-none"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({ username: '', password: '', email: '' });
                        }}
                        style={{ color: 'var(--accent)' }}
                    >
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <small className="text-muted">
                        Demo: username "demo", password "demo123"
                    </small>
                </div>
            </div>
        </div>
    );
};

// Main Application Component
const MainApp = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const { user, logout } = React.useContext(AuthContext);

    useEffect(() => {
        fetchTasks();
        fetchEvents();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE}/tasks/`, {
                credentials: 'include'
            });
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Tasks API returned non-JSON response:', response.status, response.statusText);
                const text = await response.text();
                console.error('Response body:', text);
                return;
            }
            
            const data = await response.json();
            if (data.success) {
                setTasks(data.data);
            } else {
                console.error('Tasks API error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_BASE}/events/`, {
                credentials: 'include'
            });
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Events API returned non-JSON response:', response.status, response.statusText);
                const text = await response.text();
                console.error('Response body:', text);
                return;
            }
            
            const data = await response.json();
            if (data.success) {
                setEvents(data.data);
            } else {
                console.error('Events API error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const navigation = [
        { id: 'dashboard', label: 'Dashboard', icon: 'house' },
        { id: 'tasks', label: 'Tasks', icon: 'check-square' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar' }
    ];

    return (
        <div className="main-app">
            <div className="app">
                <nav className="sidebar">
                    <div className="nav-header p-4">
                        <h2 className="text-white mb-1">Web Planner</h2>
                        <small className="text-muted">Welcome, {user?.username || 'User'}</small>
                    </div>
                    
                    <ul className="nav-menu list-unstyled px-3">
                        {navigation.map(item => (
                            <li key={item.id} className="mb-2">
                                <button
                                    className={`nav-item btn w-100 text-start d-flex align-items-center ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <i className={`bi bi-${item.icon} me-3`}></i>
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto p-3">
                        <button 
                            className="btn btn-outline-danger w-100"
                            onClick={logout}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Logout
                        </button>
                    </div>
                </nav>

                <main className="main-content flex-grow-1 p-4">
                    {activeTab === 'dashboard' && (
                        <Dashboard 
                            tasks={tasks} 
                            events={events} 
                            onRefresh={() => {
                                fetchTasks();
                                fetchEvents();
                            }}
                        />
                    )}
                    {activeTab === 'tasks' && (
                        <TaskManager 
                            tasks={tasks} 
                            onTasksChange={(updatedTasks) => {
                                setTasks(updatedTasks);
                                fetchTasks();
                            }}
                        />
                    )}
                    {activeTab === 'calendar' && (
                        <Calendar 
                            events={events} 
                            onEventsChange={(updatedEvents) => {
                                setEvents(updatedEvents);
                                fetchEvents();
                            }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

// Dashboard Component
const Dashboard = ({ tasks, events, onRefresh }) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayTasks = tasks.filter(task => task.due_date === today);
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;

    return (
        <div className="dashboard">
            <div className="row mb-4">
                <div className="col">
                    <h1 className="text-white mb-2">Dashboard</h1>
                    <p className="text-muted">Welcome back! Here's your overview for today.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="stat-card card h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <i className="bi bi-check-square fs-2 text-primary"></i>
                            </div>
                            <div>
                                <h3 className="mb-0">{tasks.length}</h3>
                                <p className="text-muted mb-0">Total Tasks</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="stat-card card h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <i className="bi bi-check-circle fs-2 text-success"></i>
                            </div>
                            <div>
                                <h3 className="mb-0">{completedTasks}</h3>
                                <p className="text-muted mb-0">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="stat-card card h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <i className="bi bi-clock fs-2 text-warning"></i>
                            </div>
                            <div>
                                <h3 className="mb-0">{pendingTasks}</h3>
                                <p className="text-muted mb-0">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="stat-card card h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <i className="bi bi-calendar-event fs-2 text-info"></i>
                            </div>
                            <div>
                                <h3 className="mb-0">{events.length}</h3>
                                <p className="text-muted mb-0">Events</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0">Today's Tasks</h5>
                        </div>
                        <div className="card-body">
                            {todayTasks.length > 0 ? (
                                todayTasks.map(task => (
                                    <div key={task.id} className="task-item border-start border-3 ps-3 mb-3">
                                        <h6 className="mb-1">{task.title}</h6>
                                        <p className="text-muted mb-1">{task.description || 'No description'}</p>
                                        <small className="badge bg-primary">{task.priority}</small>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No tasks for today</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0">Recent Events</h5>
                        </div>
                        <div className="card-body">
                            {events.slice(0, 5).map(event => (
                                <div key={event.id} className="event-item border-start border-3 ps-3 mb-3">
                                    <h6 className="mb-1">{event.title}</h6>
                                    <p className="text-muted mb-1">{event.description || 'No description'}</p>
                                    <small className="text-muted">
                                        {new Date(event.start_datetime).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Task Manager Component
const TaskManager = ({ tasks, onTasksChange }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('dueDate');
    const [searchTerm, setSearchTerm] = useState('');

    const priorities = [
        { value: 'low', label: 'Low', color: '#10b981' },
        { value: 'medium', label: 'Medium', color: '#f59e0b' },
        { value: 'high', label: 'High', color: '#ef4444' }
    ];

    const statuses = [
        { value: 'todo', label: 'To Do' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
    ];

    const categories = [
        { value: 'work', label: 'Work' },
        { value: 'personal', label: 'Personal' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'health', label: 'Health' },
        { value: 'other', label: 'Other' }
    ];

    const filteredTasks = tasks
        .filter(task => {
            if (filter === 'all') return true;
            return task.status === filter;
        })
        .filter(task => 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return new Date(a.due_date) - new Date(b.due_date);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

    const handleAddTask = () => {
        console.log('Add task button clicked');
        setEditingTask(null);
        setShowModal(true);
        console.log('Modal should be showing:', true);
    };

    const handleEditTask = (task) => {
        console.log('Edit task clicked:', task);
        setEditingTask(task);
        setShowModal(true);
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        try {
            const response = await fetch(`${API_BASE}/tasks/?action=delete&id=${taskId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                onTasksChange(tasks.filter(task => task.id !== taskId));
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            const updatedTask = { ...task, status: newStatus };
            
            const response = await fetch(`${API_BASE}/tasks/?action=update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedTask)
            });
            
            if (response.ok) {
                const updatedTasks = tasks.map(task => 
                    task.id === taskId ? { ...task, status: newStatus } : task
                );
                onTasksChange(updatedTasks);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const getPriorityColor = (priority) => {
        const priorityObj = priorities.find(p => p.value === priority);
        return priorityObj ? priorityObj.color : '#64748b';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    return (
        <div className="fade-in">
            <div className="task-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-gradient mb-2">Task Manager</h1>
                    <p className="text-muted mb-0">Organize your work and stay productive</p>
                </div>
                <button 
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleAddTask}
                >
                    <i className="bi bi-plus-circle"></i>
                    Add Task
                </button>
            </div>

            {/* Filters and Search */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 bg-transparent"
                                    placeholder="Search tasks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select bg-transparent"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Tasks</option>
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select bg-transparent"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="dueDate">Sort by Due Date</option>
                                <option value="priority">Sort by Priority</option>
                                <option value="title">Sort by Title</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <div className="text-muted small">
                                {filteredTasks.length} of {tasks.length} tasks
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Stats */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'}}>
                            <i className="bi bi-check-circle text-success fs-4"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{tasks.filter(t => t.status === 'completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'}}>
                            <i className="bi bi-clock text-warning fs-4"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{tasks.filter(t => t.status === 'in-progress').length}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))'}}>
                            <i className="bi bi-list-task text-primary fs-4"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{tasks.filter(t => t.status === 'todo').length}</h3>
                            <p>To Do</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'}}>
                            <i className="bi bi-exclamation-triangle text-danger fs-4"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{tasks.filter(t => isOverdue(t.due_date) && t.status !== 'completed').length}</h3>
                            <p>Overdue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                            <h4 className="text-muted">No tasks found</h4>
                            <p className="text-muted">
                                {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredTasks.map((task, index) => (
                        <div 
                            key={task.id} 
                            className={`task-item slide-in ${task.status === 'completed' ? 'opacity-75' : ''}`}
                            style={{animationDelay: `${index * 0.1}s`}}
                            data-priority={task.priority}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <div 
                                    className="task-priority-bar"
                                    style={{
                                        width: '4px',
                                        height: '60px',
                                        background: getPriorityColor(task.priority),
                                        borderRadius: '2px'
                                    }}
                                ></div>
                                
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h5 className={`mb-1 ${task.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}`}>
                                                {task.title}
                                            </h5>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className={`badge ${task.priority === 'high' ? 'text-bg-danger' : task.priority === 'medium' ? 'text-bg-warning' : 'text-bg-success'}`}>
                                                    {priorities.find(p => p.value === task.priority)?.label}
                                                </span>
                                                <span className="badge bg-secondary">
                                                    {categories.find(c => c.value === task.category)?.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <button 
                                                className="btn btn-sm btn-outline-primary border-0"
                                                onClick={() => handleEditTask(task)}
                                                title="Edit task"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger border-0"
                                                onClick={() => handleDeleteTask(task.id)}
                                                title="Delete task"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {task.description && (
                                        <p className="text-muted mb-2">{task.description}</p>
                                    )}
                                    
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center gap-1 text-muted small">
                                                <i className="bi bi-calendar"></i>
                                                <span className={isOverdue(task.due_date) && task.status !== 'completed' ? 'text-danger' : ''}>
                                                    {formatDate(task.due_date)}
                                                </span>
                                            </div>
                                            {task.due_time && (
                                                <div className="d-flex align-items-center gap-1 text-muted small">
                                                    <i className="bi bi-clock"></i>
                                                    <span>{task.due_time}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <select 
                                            className="form-select form-select-sm w-auto"
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        >
                                            {statuses.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Task Modal - Add debugging */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
                    <TaskModal
                        task={editingTask}
                        priorities={priorities}
                        categories={categories}
                        onClose={() => {
                            console.log('Closing task modal');
                            setShowModal(false);
                        }}
                        onSave={(taskData) => {
                            console.log('Saving task:', taskData);
                            onTasksChange([]);
                            setShowModal(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// Task Modal Component - Add debugging
const TaskModal = ({ task, priorities, categories, onClose, onSave }) => {
    console.log('TaskModal rendered with:', { task, priorities, categories });
    
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        due_date: task?.due_date || '',
        due_time: task?.due_time || '',
        priority: task?.priority || 'medium',
        category: task?.category || 'work',
        status: task?.status || 'todo'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.title.trim()) {
            alert('Task title is required');
            return;
        }

        if (!formData.due_date) {
            alert('Due date is required');
            return;
        }
        
        try {
            const url = task 
                ? `${API_BASE}/tasks/?action=update`
                : `${API_BASE}/tasks/`;
                
            const method = task ? 'PUT' : 'POST';
            const data = task ? { ...formData, id: task.id } : formData;
            
            console.log('Submitting task:', { url, method, data });
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('Task response:', result);
            
            if (response.ok && result.success) {
                onSave(result.task || formData);
                onClose();
            } else {
                console.error('Failed to save task:', result.message || 'Unknown error');
                alert('Failed to save task: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task: ' + error.message);
        }
    };

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 99999 }}>
            <div className="app-modal glass-effect" onClick={e => e.stopPropagation()} style={{ zIndex: 100000 }}>
                <div className="modal-header">
                    <h3 className="text-gradient mb-0">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    <button className="btn-close" onClick={onClose} type="button">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Task Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    placeholder="Enter task title..."
                                />
                            </div>
                            
                            <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Task description (optional)..."
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Due Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Due Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.due_time}
                                    onChange={(e) => setFormData({...formData, due_time: e.target.value})}
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    {priorities.map(priority => (
                                        <option key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {task ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Enhanced Calendar Component
const Calendar = ({ events, onEventsChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const eventTypes = [
        { value: 'meeting', label: 'Meeting', color: '#3b82f6', icon: 'bi-people' },
        { value: 'deadline', label: 'Deadline', color: '#ef4444', icon: 'bi-exclamation-triangle' },
        { value: 'reminder', label: 'Reminder', color: '#f59e0b', icon: 'bi-bell' },
        { value: 'appointment', label: 'Appointment', color: '#10b981', icon: 'bi-calendar-check' },
        { value: 'personal', label: 'Personal', color: '#8b5cf6', icon: 'bi-person' }
    ];

    // Get days in month with proper grid
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayWeekday = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();
        
        const days = [];
        
        // Previous month's days
        const prevMonth = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonth.getDate();
        
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false,
                isPrevMonth: true
            });
        }
        
        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                date: new Date(year, month, day),
                isCurrentMonth: true,
                isPrevMonth: false
            });
        }
        
        // Next month's days to complete the grid
        const totalCells = 42; // 6 weeks × 7 days
        const remainingCells = totalCells - days.length;
        
        for (let day = 1; day <= remainingCells; day++) {
            days.push({
                day,
                date: new Date(year, month + 1, day),
                isCurrentMonth: false,
                isPrevMonth: false
            });
        }
        
        return days;
    };

    // Get events for a specific date
    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => event.date === dateStr);
    };

    // Navigation functions
    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes));
        return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const handleAddEvent = (date = null) => {
        console.log('Add event button clicked');
        setEditingEvent(null);
        setSelectedDate(date);
        setShowEventModal(true);
        console.log('Event modal should be showing:', true);
    };

    const handleEditEvent = (event) => {
        console.log('Edit event clicked:', event);
        setEditingEvent(event);
        setShowEventModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
            const response = await fetch(`${API_BASE}/events/?action=delete&id=${eventId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                onEventsChange(events.filter(event => event.id !== eventId));
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
        }
    };

    const getEventTypeInfo = (type) => {
        return eventTypes.find(t => t.value === type) || eventTypes[0];
    };

    return (
        <div className="fade-in">
            <div className="calendar-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-gradient mb-2">Calendar</h1>
                    <p className="text-muted mb-0">Schedule and manage your events</p>
                </div>
                <button 
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => handleAddEvent()}
                >
                    <i className="bi bi-plus-circle"></i>
                    Add Event
                </button>
            </div>

            {/* Calendar Navigation */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <h3 className="text-gradient mb-0">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                            <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={goToToday}
                            >
                                Today
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => navigateMonth(-1)}
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => navigateMonth(1)}
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-xl-8">
                    {/* Calendar Grid */}
                    <div className="card mb-4">
                        <div className="card-body p-0">
                            {/* Weekday Headers */}
                            <div className="calendar-weekdays">
                                {weekDaysShort.map(day => (
                                    <div key={day} className="weekday">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Calendar Days */}
                            <div className="calendar-days">
                                {getDaysInMonth().map((dayInfo, index) => {
                                    const dayEvents = getEventsForDate(dayInfo.date);
                                    const isCurrentDay = isToday(dayInfo.date);
                                    
                                    return (
                                        <div 
                                            key={index}
                                            className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''}`}
                                            onClick={() => handleDateClick(dayInfo.date)}
                                        >
                                            <span className="day-number">{dayInfo.day}</span>
                                            
                                            <div className="day-events">
                                                {dayEvents.slice(0, 3).map(event => {
                                                    const eventType = getEventTypeInfo(event.type);
                                                    return (
                                                        <div 
                                                            key={event.id}
                                                            className="day-event"
                                                            style={{ backgroundColor: eventType.color }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditEvent(event);
                                                            }}
                                                            title={`${event.title} - ${formatTime(event.time)}`}
                                                        >
                                                            <span className="event-title">{event.title}</span>
                                                            {event.time && (
                                                                <span className="event-time">{formatTime(event.time)}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="more-events">
                                                        +{dayEvents.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-xl-4">
                    {/* Quick Add */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Quick Add</h5>
                        </div>
                        <div className="card-body">
                            <button 
                                className="btn btn-outline-primary w-100 mb-2"
                                onClick={() => handleAddEvent(selectedDate)}
                            >
                                <i className="bi bi-plus me-2"></i>
                                Add Event {selectedDate && `for ${selectedDate.toLocaleDateString()}`}
                            </button>
                        </div>
                    </div>
                    
                    {/* Event Types Legend */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Event Types</h5>
                        </div>
                        <div className="card-body">
                            {eventTypes.map(type => (
                                <div key={type.value} className="d-flex align-items-center gap-2 mb-2">
                                    <div 
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: type.color,
                                            borderRadius: '2px'
                                        }}
                                    ></div>
                                    <i className={`${type.icon} text-muted me-1`}></i>
                                    <span className="small">{type.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Upcoming Events */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Upcoming Events</h5>
                        </div>
                        <div className="card-body">
                            {events
                                .filter(event => new Date(event.date) >= new Date())
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .slice(0, 5)
                                .map(event => {
                                    const eventType = getEventTypeInfo(event.type);
                                    return (
                                        <div 
                                            key={event.id} 
                                            className="event-item hover-lift mb-3"
                                            onClick={() => handleEditEvent(event)}
                                        >
                                            <div 
                                                className="event-color-bar"
                                                style={{ backgroundColor: eventType.color }}
                                            ></div>
                                            <div className="event-content">
                                                <h6 className="mb-1">{event.title}</h6>
                                                <div className="event-datetime">
                                                    <i className="bi bi-calendar me-1"></i>
                                                    {new Date(event.date).toLocaleDateString()}
                                                    {event.time && (
                                                        <>
                                                            <i className="bi bi-clock ms-2 me-1"></i>
                                                            {formatTime(event.time)}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            
                            {events.filter(event => new Date(event.date) >= new Date()).length === 0 && (
                                <div className="text-center text-muted">
                                    <i className="bi bi-calendar-x display-6 mb-2"></i>
                                    <p className="small">No upcoming events</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modal - Add debugging */}
            {showEventModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
                    <EventModal
                        event={editingEvent}
                        selectedDate={selectedDate}
                        eventTypes={eventTypes}
                        onClose={() => {
                            console.log('Closing event modal');
                            setShowEventModal(false);
                            setSelectedDate(null);
                        }}
                        onSave={(eventData) => {
                            console.log('Saving event:', eventData);
                            onEventsChange([]);
                            setShowEventModal(false);
                            setSelectedDate(null);
                        }}
                        onDelete={editingEvent ? () => {
                            handleDeleteEvent(editingEvent.id);
                            setShowEventModal(false);
                        } : null}
                    />
                </div>
            )}
        </div>
    );
};

// Event Modal Component - Add debugging
const EventModal = ({ event, selectedDate, eventTypes, onClose, onSave, onDelete }) => {
    console.log('EventModal rendered with:', { event, selectedDate, eventTypes });
    
    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        date: event?.date || (selectedDate ? selectedDate.toISOString().split('T')[0] : ''),
        time: event?.time || '',
        type: event?.type || 'meeting',
        location: event?.location || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.title.trim()) {
            alert('Event title is required');
            return;
        }

        if (!formData.date) {
            alert('Event date is required');
            return;
        }
        
        try {
            const url = event 
                ? `${API_BASE}/events/?action=update`
                : `${API_BASE}/events/`;
                
            const method = event ? 'PUT' : 'POST';
            const data = event ? { ...formData, id: event.id } : formData;
            
            console.log('Submitting event:', { url, method, data });
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('Event response:', result);
            
            if (response.ok && result.success) {
                onSave(result.event || formData);
                onClose();
            } else {
                console.error('Failed to save event:', result.message || 'Unknown error');
                alert('Failed to save event: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to save event:', error);
            alert('Failed to save event: ' + error.message);
        }
    };

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 99999 }}>
            <div className="app-modal glass-effect" onClick={e => e.stopPropagation()} style={{ zIndex: 100000 }}>
                <div className="modal-header">
                    <h3 className="text-gradient mb-0">
                        {event ? 'Edit Event' : 'Create New Event'}
                    </h3>
                    <button className="btn-close" onClick={onClose} type="button">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Event Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    placeholder="Enter event title..."
                                />
                            </div>
                            
                            <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Event description (optional)..."
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.time}
                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Event Type</label>
                                <select
                                    className="form-select"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    {eventTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    placeholder="Event location (optional)..."
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <div className="d-flex justify-content-between w-100">
                            <div>
                                {onDelete && (
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-danger"
                                        onClick={onDelete}
                                    >
                                        <i className="bi bi-trash me-2"></i>
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {event ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <div className="text-center text-white">
                        <h2>Something went wrong</h2>
                        <p>Error: {this.state.error?.message}</p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Render the App with Error Boundary - Updated for React 18
const container = document.getElementById('root');
const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : ReactDOM.render;

if (ReactDOM.createRoot) {
    // React 18
    root.render(
        React.createElement(ErrorBoundary, null, React.createElement(App))
    );
} else {
    // React 17 fallback
    root(
        React.createElement(ErrorBoundary, null, React.createElement(App)),
        container
    );
}