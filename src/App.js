import React, { useState, useEffect } from 'react';
import './App.css';

function AuthContext({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username, password) => {
    // Simple mock authentication
    if (username && password) {
      const userDetails = { 
        username, 
        lastLogin: new Date().toLocaleString() 
      };
      
      localStorage.setItem('user', JSON.stringify(userDetails));
      setUser(userDetails);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthProvider.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthProvider.Provider>
  );
}

// Create context for authentication
const AuthProvider = React.createContext(null);

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = React.useContext(AuthProvider);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    // Attempt login
    const success = login(username, password);
    if (!success) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login to Todo App</h2>
        {error && <div className="error-message">{error}</div>}
        <input 
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
}

function TodoApp() {
  // State Management
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('All');
  
  // Weather State
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  // Authentication Context
  const { isAuthenticated, user, logout } = React.useContext(AuthProvider);

  // API Key (Note: In a real application, store this securely)
  const API_KEY = '283e0b9d6cc6293f6ba0ab8b4a454ef8';

  // Fetch Weather Data
  const fetchWeatherData = async (city) => {
    if (!city) return;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${'283e0b9d6cc6293f6ba0ab8b4a454ef8'}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Weather data could not be fetched');
      }

      const data = await response.json();
      setWeather({
        temperature: data.main.temp,
        description: data.weather[0].description,
        icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      });
      setError(null);
    } catch (err) {
      setError('Unable to fetch weather data');
      setWeather(null);
    }
  };

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    setTodos(savedTodos);
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Add Todo Function
  const addTodo = () => {
    if (!title.trim()) return;

    const newTodo = {
      id: Date.now(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date().toLocaleString(),
      weatherInfo: weather ? {
        temperature: weather.temperature,
        description: weather.description
      } : null
    };

    setTodos([...todos, newTodo]);
    
    // Reset input fields
    setTitle('');
    setDescription('');
    setPriority('Medium');
  };

  // Delete Todo Function
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Toggle Todo Completion
  const toggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Filter Todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'Completed') return todo.completed;
    if (filter === 'Pending') return !todo.completed;
    return true;
  });

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="todo-container">
      {/* User Info and Logout */}
      <div className="user-header">
        <span>Welcome, {user.username}</span>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <h1>Enhanced Todo Application</h1>
      
      {/* Weather Location Input */}
      <div className="weather-input-section">
        <input 
          type="text"
          placeholder="Enter City for Weather"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="weather-input"
        />
        <button 
          onClick={() => fetchWeatherData(location)}
          className="weather-fetch-button"
        >
          Get Weather
        </button>
      </div>

      {/* Weather Display */}
      {error && <div className="weather-error">{error}</div>}
      {weather && (
        <div className="weather-display">
          <img 
            src={weather.icon} 
            alt="Weather Icon" 
            className="weather-icon"
          />
          <div>
            <p>Temperature: {weather.temperature}°C</p>
            <p>Conditions: {weather.description}</p>
          </div>
        </div>
      )}
      
      {/* Input Section */}
      <div className="todo-input-section">
        <input 
          type="text"
          placeholder="Todo Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="todo-input"
        />
        <input 
          type="text"
          placeholder="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="todo-input"
        />
        
        {/* Priority Select */}
        <select 
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="todo-select"
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
        
        <button onClick={addTodo} className="todo-add-button">
          Add Todo
        </button>
      </div>
      
      {/* Filter Buttons */}
      <div className="todo-filter-section">
        <button 
          onClick={() => setFilter('All')}
          className={`filter-button ${filter === 'All' ? 'active' : ''}`}
        >
          All Todos
        </button>
        <button 
          onClick={() => setFilter('Pending')}
          className={`filter-button ${filter === 'Pending' ? 'active' : ''}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('Completed')}
          className={`filter-button ${filter === 'Completed' ? 'active' : ''}`}
        >
          Completed
        </button>
      </div>
      
      {/* Todo List */}
      <div className="todo-list">
        {filteredTodos.map(todo => (
          <div 
            key={todo.id} 
            className={`todo-item 
              ${todo.priority.toLowerCase()}-priority 
              ${todo.completed ? 'completed' : ''}`}
          >
            <div className="todo-content">
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
              <span className="todo-date">{todo.createdAt}</span>
              <span className="todo-priority">{todo.priority} Priority</span>
              
              {/* Weather Info for Todo */}
              {todo.weatherInfo && (
                <div className="todo-weather-info">
                  <p>Weather: {todo.weatherInfo.temperature}°C, {todo.weatherInfo.description}</p>
                </div>
              )}
            </div>
            <div className="todo-actions">
              <button 
                onClick={() => toggleComplete(todo.id)}
                className="toggle-button"
              >
                {todo.completed ? 'Undo' : 'Complete'}
              </button>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="todo-summary">
        <p>
          Total Todos: {todos.length} | 
          Completed: {todos.filter(todo => todo.completed).length} | 
          Pending: {todos.filter(todo => !todo.completed).length}
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthContext>
      <TodoApp />
    </AuthContext>
  );
}

export default App;