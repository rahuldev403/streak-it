import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ChapterContentTable, CourseChapterTable } from "../app/config/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const sampleContents = [
  // ==========================================
  // 1. HTML/CSS/JS - Todo List DOM Manipulation
  // ==========================================
  {
    title: "Interactive Todo List",
    questionType: "html-css-js",
    problemStatement: `Create an interactive todo list where users can add, complete, and delete tasks. The UI should be responsive and visually appealing with smooth interactions.`,
    instructions: `**Requirements:**
- Add an input field and "Add" button to create new todos
- Display todos in a list format
- Each todo should have a checkbox to mark as complete
- Each todo should have a delete button
- Completed todos should have a strikethrough style
- Empty input should not create a todo
- Press Enter to add a todo`,
    expectedOutput: `A functional todo list application with:
✅ Input field to add new todos
✅ List of todos with checkboxes
✅ Delete buttons for each todo
✅ Visual feedback for completed todos
✅ Smooth user interactions`,
    hints: `💡 Hints:
- Use addEventListener() for button clicks and keypress events
- Use document.createElement() to create new DOM elements dynamically
- Toggle CSS classes for completed state using classList.toggle()
- Use .trim() to check for empty strings
- Consider using event.key === 'Enter' for keyboard support`,
    boilerplateFiles: [
      {
        name: "index.html",
        language: "html",
        readonly: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>✨ My Todo List</h1>
        <div class="input-section">
            <input type="text" id="todoInput" placeholder="Enter a task...">
            <button id="addBtn">Add Task</button>
        </div>
        <ul id="todoList"></ul>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: "style.css",
        language: "css",
        readonly: true,
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    min-width: 400px;
    max-width: 600px;
    width: 100%;
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
}

.input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 1.5rem;
}

#todoInput {
    flex: 1;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

#todoInput:focus {
    outline: none;
    border-color: #667eea;
}

#addBtn {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
}

#addBtn:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

#todoList {
    list-style: none;
}

.todo-item {
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.todo-item:hover {
    background: #e9ecef;
    transform: translateX(5px);
}

.todo-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.todo-item.completed .todo-text {
    text-decoration: line-through;
    color: #999;
}

.todo-text {
    flex: 1;
    margin-left: 12px;
    font-size: 16px;
    color: #333;
}

.delete-btn {
    padding: 6px 12px;
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
}

.delete-btn:hover {
    background: #ee5a6f;
    transform: scale(1.05);
}`,
      },
      {
        name: "script.js",
        language: "javascript",
        readonly: false,
        content: `// Get DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// Write your code here...
// Hint: Create an addTodo function that:
// 1. Gets the input value
// 2. Creates a new list item (li) with todo-item class
// 3. Adds a checkbox, text span, and delete button
// 4. Appends it to the todoList

`,
      },
    ],
    testCases: [
      {
        id: "1",
        description:
          "Should add a new todo when Add button is clicked with valid input",
        expectedOutput:
          "New todo appears in the list with checkbox and delete button",
      },
      {
        id: "2",
        description: "Should not add todo with empty input",
        expectedOutput: "Nothing happens when input is empty",
      },
      {
        id: "3",
        description: "Should toggle completed state when checkbox is clicked",
        expectedOutput: "Todo text gets line-through style and gray color",
      },
      {
        id: "4",
        description: "Should delete todo when delete button is clicked",
        expectedOutput: "Todo is removed from the list with animation",
      },
      {
        id: "5",
        description: "Should add todo when Enter key is pressed",
        expectedOutput: "New todo is added without clicking the button",
      },
    ],
    solutionCode: `// Get DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

function addTodo() {
    const todoText = todoInput.value.trim();
    
    // Don't add empty todos
    if (!todoText) return;
    
    // Create list item
    const li = document.createElement('li');
    li.className = 'todo-item';
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function() {
        li.classList.toggle('completed');
    });
    
    // Create text span
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todoText;
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
        li.remove();
    });
    
    // Append all elements
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
    
    // Clear input
    todoInput.value = '';
}

// Add event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});`,
  },

  // ==========================================
  // 2. React - Counter Component
  // ==========================================
  {
    title: "React Counter with Multiple Operations",
    questionType: "react",
    problemStatement: `Build a React counter component with increment, decrement, reset, and custom increment functionality. The counter should have a clean, modern UI with smooth animations.`,
    instructions: `**Requirements:**
- Use React useState hook for state management
- Create four buttons: Increment (+1), Decrement (-1), Increment by 5 (+5), and Reset
- Display the current count prominently
- Prevent count from going below 0
- Add visual feedback for button interactions
- Style the component to match the provided CSS`,
    expectedOutput: `A functional counter that:
✅ Shows current count with large display
✅ Increments by 1
✅ Decrements by 1 (minimum 0)
✅ Increments by 5
✅ Resets to 0
✅ Has smooth animations and hover effects`,
    hints: `💡 Hints:
- Use useState(0) to initialize counter state
- Use Math.max(0, count - 1) to prevent negative values
- Create separate handler functions for each operation
- Use onClick prop to attach handlers to buttons
- Consider using functional state updates: setCount(prev => prev + 1)`,
    boilerplateFiles: [
      {
        name: "Counter.jsx",
        language: "javascript",
        readonly: false,
        content: `import React, { useState } from 'react';
import './Counter.css';

const Counter = () => {
  // Initialize state here
  
  // Create handler functions here
  
  return (
    <div className="counter-container">
      <h1 className="title">🎯 Counter App</h1>
      
      <div className="counter-display">
        {/* Display count here */}
      </div>
      
      <div className="button-group">
        {/* Add your buttons here */}
      </div>
    </div>
  );
};

export default Counter;`,
      },
      {
        name: "Counter.css",
        language: "css",
        readonly: true,
        content: `.counter-container {
  text-align: center;
  padding: 3rem;
  max-width: 500px;
  margin: 50px auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.title {
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.counter-display {
  font-size: 6rem;
  font-weight: bold;
  color: white;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: inset 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.counter-display:hover {
  transform: scale(1.05);
}

.button-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 2rem;
}

button {
  padding: 15px 25px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

button:active {
  transform: translateY(-1px);
}

.increment {
  background: #4ade80;
  color: white;
}

.increment:hover {
  background: #22c55e;
}

.decrement {
  background: #f87171;
  color: white;
}

.decrement:hover {
  background: #ef4444;
}

.increment-five {
  background: #fbbf24;
  color: white;
}

.increment-five:hover {
  background: #f59e0b;
}

.reset {
  background: #94a3b8;
  color: white;
}

.reset:hover {
  background: #64748b;
}`,
      },
    ],
    testCases: [
      {
        id: "1",
        description: "Counter should start at 0",
        expectedOutput: "Initial count displays 0",
      },
      {
        id: "2",
        description: "Increment button increases count by 1",
        expectedOutput: "Count increases from 0 to 1",
      },
      {
        id: "3",
        description: "Increment by 5 button increases count by 5",
        expectedOutput: "Count increases by 5 in one click",
      },
      {
        id: "4",
        description: "Decrement doesn't go below 0",
        expectedOutput: "Count stays at 0 when decrementing from 0",
      },
      {
        id: "5",
        description: "Reset button sets count back to 0",
        expectedOutput: "Count becomes 0 regardless of current value",
      },
    ],
    solutionCode: `import React, { useState } from 'react';
import './Counter.css';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(Math.max(0, count - 1));
  const incrementByFive = () => setCount(count + 5);
  const reset = () => setCount(0);
  
  return (
    <div className="counter-container">
      <h1 className="title">🎯 Counter App</h1>
      
      <div className="counter-display">
        {count}
      </div>
      
      <div className="button-group">
        <button className="increment" onClick={increment}>
          + Increment
        </button>
        <button className="decrement" onClick={decrement}>
          - Decrement
        </button>
        <button className="increment-five" onClick={incrementByFive}>
          +5 Increment
        </button>
        <button className="reset" onClick={reset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default Counter;`,
  },

  // ==========================================
  // 3. TypeScript - Type-safe API Fetch
  // ==========================================
  {
    title: "TypeScript API Data Fetching with Types",
    questionType: "typescript",
    problemStatement: `Create a type-safe function that fetches user data from an API and displays it. Use TypeScript interfaces to ensure type safety throughout the application.`,
    instructions: `**Requirements:**
- Define a User interface with proper types (id, name, email, phone)
- Create an async function to fetch user data
- Handle loading and error states
- Display user data in a formatted card layout
- Use proper TypeScript types for all variables and function parameters
- Add error handling with try-catch`,
    expectedOutput: `A type-safe application that:
✅ Fetches user data from JSONPlaceholder API
✅ Displays users in card format
✅ Shows loading state while fetching
✅ Handles errors gracefully
✅ Has full TypeScript type coverage`,
    hints: `💡 Hints:
- Use interface to define User type structure
- Use Promise<User[]> as return type for async functions
- Use Array.map() to render multiple user cards
- Consider using optional chaining (?.) for safety
- Use type annotations for state variables`,
    boilerplateFiles: [
      {
        name: "types.ts",
        language: "typescript",
        readonly: false,
        content: `// Define your User interface here
// Properties: id (number), name (string), email (string), phone (string)

export interface User {
  // Add your properties here
}
`,
      },
      {
        name: "api.ts",
        language: "typescript",
        readonly: false,
        content: `import { User } from './types';

// Create an async function to fetch users
// API endpoint: https://jsonplaceholder.typicode.com/users
// Return type should be Promise<User[]>

export async function fetchUsers(): Promise<User[]> {
  // Implement fetch logic here
  
}
`,
      },
      {
        name: "main.ts",
        language: "typescript",
        readonly: false,
        content: `import { fetchUsers } from './api';
import { User } from './types';

// Main function to load and display users
async function main() {
  try {
    // 1. Show loading message
    
    // 2. Fetch users
    
    // 3. Display users
    
  } catch (error) {
    // Handle errors
  }
}

// Function to display a single user
function displayUser(user: User): string {
  // Return formatted HTML string for user card
  
}

// Run the main function
main();
`,
      },
      {
        name: "index.html",
        language: "html",
        readonly: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript API Fetch</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f2f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .user-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .loading {
            text-align: center;
            font-size: 1.5rem;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>👥 User Directory</h1>
        <div id="app"></div>
    </div>
</body>
</html>`,
      },
    ],
    testCases: [
      {
        id: "1",
        description:
          "User interface should have all required properties with correct types",
        expectedOutput:
          "Interface defines id, name, email, phone with proper types",
      },
      {
        id: "2",
        description: "fetchUsers should return Promise<User[]>",
        expectedOutput: "Function properly types the return value",
      },
      {
        id: "3",
        description: "Should fetch data from API successfully",
        expectedOutput: "Users array is populated with data",
      },
      {
        id: "4",
        description: "Should handle errors gracefully",
        expectedOutput: "Try-catch block catches and handles errors",
      },
    ],
    solutionCode: `// types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

// api.ts
import { User } from './types';

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  const data: User[] = await response.json();
  return data;
}

// main.ts
import { fetchUsers } from './api';
import { User } from './types';

async function main() {
  const appDiv = document.getElementById('app');
  
  if (!appDiv) return;
  
  try {
    appDiv.innerHTML = '<div class="loading">Loading users...</div>';
    
    const users: User[] = await fetchUsers();
    
    const usersHTML = users
      .map(user => displayUser(user))
      .join('');
    
    appDiv.innerHTML = \`<div class="users-grid">\${usersHTML}</div>\`;
    
  } catch (error) {
    appDiv.innerHTML = \`<div class="error">Error: \${error.message}</div>\`;
  }
}

function displayUser(user: User): string {
  return \`
    <div class="user-card">
      <h3>\${user.name}</h3>
      <p><strong>Email:</strong> \${user.email}</p>
      <p><strong>Phone:</strong> \${user.phone}</p>
    </div>
  \`;
}

main();`,
  },

  // ==========================================
  // 4. Node.js - REST API CRUD
  // ==========================================
  {
    title: "Build a REST API with Express",
    questionType: "nodejs",
    problemStatement: `Create a RESTful API for managing a todo list using Express.js. Implement CRUD operations (Create, Read, Update, Delete) with proper HTTP methods and status codes.`,
    instructions: `**Requirements:**
- Set up Express server on port 3000
- Implement GET /todos - Get all todos
- Implement POST /todos - Create a new todo
- Implement PUT /todos/:id - Update a todo
- Implement DELETE /todos/:id - Delete a todo
- Use in-memory array to store todos (no database needed)
- Return proper HTTP status codes
- Add JSON middleware`,
    expectedOutput: `A working REST API with:
✅ Express server running on port 3000
✅ All CRUD endpoints working
✅ Proper status codes (200, 201, 404, etc.)
✅ JSON request/response handling
✅ Console logging for requests`,
    hints: `💡 Hints:
- Use express.json() middleware to parse JSON bodies
- Use array methods: push(), find(), findIndex(), filter()
- Use req.params.id to get URL parameters
- Return 404 when todo is not found
- Use res.status().json() to send responses`,
    boilerplateFiles: [
      {
        name: "server.js",
        language: "javascript",
        readonly: false,
        content: `const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// In-memory todo storage
let todos = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build an API', completed: false }
];

let nextId = 3;

// GET /todos - Get all todos
app.get('/todos', (req, res) => {
  // Implement: Return all todos
});

// POST /todos - Create a new todo
app.post('/todos', (req, res) => {
  // Implement: Create a new todo from req.body
  // Generate id using nextId++
  // Add to todos array
  // Return 201 status with created todo
});

// PUT /todos/:id - Update a todo
app.put('/todos/:id', (req, res) => {
  // Implement: Find todo by id
  // Update properties from req.body
  // Return updated todo or 404 if not found
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  // Implement: Find and remove todo
  // Return 204 status or 404 if not found
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`,
      },
      {
        name: "package.json",
        language: "json",
        readonly: true,
        content: `{
  "name": "todo-api",
  "version": "1.0.0",
  "description": "Simple Todo REST API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`,
      },
      {
        name: "test-requests.md",
        language: "markdown",
        readonly: true,
        content: `# API Testing Guide

## Get all todos
\`\`\`bash
curl http://localhost:3000/todos
\`\`\`

## Create a new todo
\`\`\`bash
curl -X POST http://localhost:3000/todos \\
  -H "Content-Type: application/json" \\
  -d '{"title": "New Task", "completed": false}'
\`\`\`

## Update a todo
\`\`\`bash
curl -X PUT http://localhost:3000/todos/1 \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Updated Task", "completed": true}'
\`\`\`

## Delete a todo
\`\`\`bash
curl -X DELETE http://localhost:3000/todos/1
\`\`\`
`,
      },
    ],
    testCases: [
      {
        id: "1",
        description: "GET /todos should return all todos",
        expectedOutput: "Array of todos with status 200",
      },
      {
        id: "2",
        description: "POST /todos should create new todo with generated ID",
        expectedOutput: "Created todo with status 201",
      },
      {
        id: "3",
        description: "PUT /todos/:id should update existing todo",
        expectedOutput: "Updated todo with status 200",
      },
      {
        id: "4",
        description: "DELETE /todos/:id should remove todo",
        expectedOutput: "Status 204 on success",
      },
      {
        id: "5",
        description: "Should return 404 for non-existent todo",
        expectedOutput: "Status 404 when todo not found",
      },
    ],
    solutionCode: `const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let todos = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build an API', completed: false }
];

let nextId = 3;

// GET all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// POST create todo
app.post('/todos', (req, res) => {
  const newTodo = {
    id: nextId++,
    title: req.body.title,
    completed: req.body.completed || false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT update todo
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todo.title = req.body.title || todo.title;
  todo.completed = req.body.completed !== undefined ? req.body.completed : todo.completed;
  
  res.json(todo);
});

// DELETE todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
  },
];

async function seedChapterContent() {
  try {
    console.log("🌱 Starting to seed chapter content...");

    // Get the first chapter from web-foundations course
    const chapter = await db
      .select()
      .from(CourseChapterTable)
      .where(eq(CourseChapterTable.courseId, "web-foundations"))
      .limit(1);

    if (chapter.length === 0) {
      console.log("❌ No chapters found. Please create chapters first.");
      return;
    }

    const chapterId = chapter[0].id;
    console.log(`✅ Found chapter with ID: ${chapterId}`);

    for (let i = 0; i < sampleContents.length; i++) {
      const content = sampleContents[i];

      await db.insert(ChapterContentTable).values({
        chapterId,
        title: content.title,
        problemStatement: content.problemStatement,
        instructions: content.instructions,
        expectedOutput: content.expectedOutput,
        hints: content.hints,
        questionType: content.questionType,
        boilerplateFiles: JSON.stringify(content.boilerplateFiles),
        testCases: JSON.stringify(content.testCases),
        solutionCode: content.solutionCode,
        order: i,
      });

      console.log(`✅ Created: ${content.title}`);
    }

    console.log(
      `\n🎉 Successfully seeded ${sampleContents.length} chapter contents!`
    );
  } catch (error) {
    console.error("❌ Error seeding chapter content:", error);
  }
}

seedChapterContent();
