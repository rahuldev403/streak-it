import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ChapterContentTable, CourseChapterTable } from "../app/config/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const allCourseContents = [
  // ==========================================
  // WEB-FOUNDATIONS (First 4 Chapters)
  // ==========================================
  {
    courseId: "web-foundations",
    chapterName: "Semantic HTML Structure",
    contents: [
      {
        title: "Build a Blog Article with Semantic HTML",
        questionType: "html-css-js" as const,
        problemStatement: `Create a complete blog article layout using only semantic HTML5 tags. No divs allowed! Learn how proper semantic structure improves SEO and accessibility.`,
        instructions: `**Your Task:**
- Use <article> as the main container
- Add <header> with the article title and author info
- Use <section> tags for different content sections
- Include a <footer> with publication date
- Add <aside> for related links
- NO <div> tags allowed in this exercise!`,
        expectedOutput: `A properly structured blog article with:
[✓] Semantic tags only (article, header, section, footer, aside)
[✓] Clear content hierarchy
[✓] Accessible structure
[✓] SEO-friendly markup`,
        hints: `[?] Remember:
- <article> is for self-contained content
- <section> groups related content with a heading
- <aside> is for tangentially related content
- <header> and <footer> can be used inside <article>`,
        boilerplateFiles: [
          {
            name: "index.html",
            language: "html",
            readonly: false,
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Blog Article</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Build your semantic structure here -->
    <!-- Use: article, header, section, footer, aside -->
    
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: true,
            content: `body {
    font-family: Georgia, serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #f5f5f5;
    line-height: 1.6;
}

article {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

header {
    border-bottom: 2px solid #333;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
}

header h1 {
    margin: 0 0 0.5rem 0;
    color: #333;
}

header p {
    color: #666;
    font-style: italic;
}

section {
    margin: 2rem 0;
}

section h2 {
    color: #444;
    margin-bottom: 1rem;
}

aside {
    background: #f0f0f0;
    padding: 1rem;
    margin: 2rem 0;
    border-left: 4px solid #333;
}

aside h3 {
    margin-top: 0;
}

footer {
    border-top: 1px solid #ddd;
    padding-top: 1rem;
    margin-top: 2rem;
    color: #666;
    font-size: 0.9rem;
}`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Uses <article> as main container",
            expectedOutput: "Document contains <article> tag",
          },
          {
            id: "2",
            description: "Contains <header> with title",
            expectedOutput: "Header with h1 inside article",
          },
          {
            id: "3",
            description: "Uses at least 2 <section> tags",
            expectedOutput: "Multiple content sections",
          },
          {
            id: "4",
            description: "No <div> tags used",
            expectedOutput: "100% semantic structure",
          },
        ],
        solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Blog Article</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <article>
        <header>
            <h1>The Power of Semantic HTML</h1>
            <p>By Jane Developer | Web Development</p>
        </header>

        <section>
            <h2>Introduction</h2>
            <p>Semantic HTML provides meaning to web content, making it easier for search engines and assistive technologies to understand your page structure.</p>
        </section>

        <section>
            <h2>Why It Matters</h2>
            <p>Using proper semantic tags improves SEO, accessibility, and code maintainability. Screen readers can navigate content more effectively when structure is clear.</p>
        </section>

        <aside>
            <h3>Related Resources</h3>
            <ul>
                <li><a href="#">HTML5 Semantic Elements Guide</a></li>
                <li><a href="#">Accessibility Best Practices</a></li>
            </ul>
        </aside>

        <footer>
            <p>Published on December 25, 2025</p>
        </footer>
    </article>
</body>
</html>`,
        order: 0,
      },
    ],
  },
  {
    courseId: "web-foundations",
    chapterName: "Forms and Inputs",
    contents: [
      {
        title: "Build a Contact Form with Validation",
        questionType: "html-css-js" as const,
        problemStatement: `Create a professional contact form using HTML5 form elements and attributes. Learn about input types, required fields, and basic form validation.`,
        instructions: `**Requirements:**
- Email input with type="email"
- Select dropdown for "Reason for Contact"
- Textarea for message (required)
- Submit button
- Use HTML5 validation attributes (required, minlength, etc.)`,
        expectedOutput: `A functional contact form with:
[✓] Proper input types
[✓] Required field validation
[✓] Dropdown selection
[✓] Text area for messages
[✓] Submit button`,
        hints: `[?] Tips:
- Use <label> with for attribute for accessibility
- type="email" provides automatic email validation
- required attribute prevents empty submissions
- Use <option> inside <select> for dropdown choices`,
        boilerplateFiles: [
          {
            name: "index.html",
            language: "html",
            readonly: false,
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Contact Us</h1>
        <form id="contactForm">
            <!-- Build your form here -->
            <!-- Include: email input, select dropdown, textarea, submit button -->
            
        </form>
    </div>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: true,
            content: `body {
    font-family: Arial, sans-serif;
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
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    max-width: 500px;
    width: 100%;
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

label {
    font-weight: 600;
    color: #555;
    margin-bottom: 0.25rem;
}

input, select, textarea {
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #667eea;
}

textarea {
    min-height: 120px;
    resize: vertical;
    font-family: Arial, sans-serif;
}

button {
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #5568d3;
}

.form-group {
    display: flex;
    flex-direction: column;
}`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Email input with proper type",
            expectedOutput: "input type='email' present",
          },
          {
            id: "2",
            description: "Select dropdown with options",
            expectedOutput: "select element with multiple options",
          },
          {
            id: "3",
            description: "Required fields validation",
            expectedOutput: "Cannot submit with empty fields",
          },
        ],
        solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Contact Us</h1>
        <form id="contactForm">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="your@email.com">
            </div>

            <div class="form-group">
                <label for="reason">Reason for Contact</label>
                <select id="reason" name="reason" required>
                    <option value="">-- Select a reason --</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" required minlength="10" placeholder="Type your message here..."></textarea>
            </div>

            <button type="submit">Send Message</button>
        </form>
    </div>
</body>
</html>`,
        order: 0,
      },
    ],
  },
  {
    courseId: "web-foundations",
    chapterName: "The CSS Box Model",
    contents: [
      {
        title: "Understanding box-sizing: content-box vs border-box",
        questionType: "html-css-js" as const,
        problemStatement: `Master the CSS box model by creating three boxes that demonstrate the difference between content-box and border-box sizing. Understanding this is crucial for layout control.`,
        instructions: `**Create Three Boxes:**
1. First box: default box-sizing (content-box)
2. Second box: box-sizing: border-box
3. Third box: same as second but with more padding to show the difference

All boxes should have:
- width: 200px
- padding: 20px
- border: 5px solid
- Different background colors`,
        expectedOutput: `Three colored boxes demonstrating:
[✓] content-box adds padding/border to width
[✓] border-box includes padding/border in width
[✓] Visual size difference is clear
[✓] Labels explaining each box`,
        hints: `[?] Key Concepts:
- content-box: width = content only (padding/border added outside)
- border-box: width = content + padding + border (stays fixed)
- Use box-sizing property in CSS
- Measure total width = width + padding*2 + border*2 for content-box`,
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
    <title>Box Model Demo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>CSS Box Model Comparison</h1>
        
        <div class="box-wrapper">
            <h3>Box 1: content-box (default)</h3>
            <div class="box box-content">
                Content Area
            </div>
            <p class="info">Width: 200px + padding + border = 250px total</p>
        </div>

        <div class="box-wrapper">
            <h3>Box 2: border-box</h3>
            <div class="box box-border">
                Content Area
            </div>
            <p class="info">Width: 200px total (includes padding + border)</p>
        </div>

        <div class="box-wrapper">
            <h3>Box 3: border-box with more padding</h3>
            <div class="box box-border-large">
                Content Area
            </div>
            <p class="info">Width: Still 200px! (padding eats into content)</p>
        </div>
    </div>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: false,
            content: `body {
    font-family: Arial, sans-serif;
    background: #f0f0f0;
    padding: 2rem;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

h1 {
    text-align: center;
    color: #333;
}

.box-wrapper {
    margin: 2rem 0;
    padding: 1rem;
    background: white;
    border-radius: 8px;
}

h3 {
    color: #555;
    margin-top: 0;
}

.box {
    width: 200px;
    margin: 1rem 0;
    text-align: center;
    padding: 20px;
    border: 5px solid;
    font-weight: bold;
}

/* YOUR CODE HERE: Set box-sizing properties */
.box-content {
    /* Default: content-box */
    background: #ffcccb;
    border-color: #ff0000;
}

.box-border {
    /* Set to border-box */
    background: #add8e6;
    border-color: #0000ff;
}

.box-border-large {
    /* Set to border-box with 40px padding */
    background: #90ee90;
    border-color: #008000;
}

.info {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
}`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "content-box is visually larger",
            expectedOutput: "First box extends beyond 200px",
          },
          {
            id: "2",
            description: "border-box stays at 200px",
            expectedOutput: "Second and third boxes are exactly 200px",
          },
          {
            id: "3",
            description: "Padding difference is visible",
            expectedOutput: "Third box has less content space",
          },
        ],
        solutionCode: `.box-content {
    box-sizing: content-box; /* explicit, but this is default */
    background: #ffcccb;
    border-color: #ff0000;
}

.box-border {
    box-sizing: border-box;
    background: #add8e6;
    border-color: #0000ff;
}

.box-border-large {
    box-sizing: border-box;
    padding: 40px;
    background: #90ee90;
    border-color: #008000;
}`,
        order: 0,
      },
    ],
  },
  {
    courseId: "web-foundations",
    chapterName: "Flexbox Navigation",
    contents: [
      {
        title: "Build a Responsive Navigation Bar with Flexbox",
        questionType: "html-css-js" as const,
        problemStatement: `Create a professional navigation bar using CSS Flexbox. Learn how to align items horizontally, space them properly, and create a responsive header layout.`,
        instructions: `**Build a navbar with:**
- Logo on the far left
- Navigation links on the far right
- Use display: flex on the nav container
- Use justify-content: space-between
- Align items vertically centered
- Add hover effects on links`,
        expectedOutput: `A responsive navbar with:
[✓] Logo aligned left
[✓] Nav links aligned right
[✓] Vertical centering
[✓] Even spacing
[✓] Hover effects`,
        hints: `[?] Flexbox Properties to Use:
- display: flex (on container)
- justify-content: space-between (horizontal spacing)
- align-items: center (vertical alignment)
- gap property for spacing between flex items
- Use <nav> as semantic container`,
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
    <title>Flexbox Navbar</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar">
        <div class="logo">
            [LOGO]
        </div>
        <ul class="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>

    <main>
        <h1>Flexbox Navigation Example</h1>
        <p>The navigation bar above uses Flexbox for layout.</p>
    </main>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: false,
            content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
}

/* Navbar Flexbox Styling */
.navbar {
    background: #333;
    padding: 1rem 2rem;
    /* Add flex properties here */
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
    letter-spacing: 2px;
}

.nav-links {
    list-style: none;
    /* Add flex properties here */
}

.nav-links li {
    margin-left: 2rem;
}

.nav-links a {
    color: #fff;
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #ffd700;
}

/* Main Content */
main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Logo is on the left side",
            expectedOutput: "Logo aligned to start of navbar",
          },
          {
            id: "2",
            description: "Links are on the right side",
            expectedOutput: "Nav links aligned to end of navbar",
          },
          {
            id: "3",
            description: "Items are vertically centered",
            expectedOutput: "Logo and links on same baseline",
          },
        ],
        solutionCode: `.navbar {
    background: #333;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 2rem;
}`,
        order: 0,
      },
    ],
  },

  // ==========================================
  // JS-MASTERY (First 4 Chapters)
  // ==========================================
  {
    courseId: "js-mastery",
    chapterName: "Variables and Data Types",
    contents: [
      {
        title: "Variable Swapping Without Temporary Variable",
        questionType: "html-css-js" as const,
        problemStatement: `Learn about JavaScript variables and data types by implementing a variable swap using modern ES6 destructuring. No third variable allowed!`,
        instructions: `**Your Task:**
- Create two variables: a = 5, b = 10
- Swap their values using array destructuring
- Log the values before and after
- Demonstrate you understand let vs const
- Show the swap in the browser`,
        expectedOutput: `Output showing:
[✓] Initial values: a=5, b=10
[✓] Swapped values: a=10, b=5
[✓] No temporary variable used
[✓] Uses destructuring syntax`,
        hints: `[?] ES6 Destructuring:
- Syntax: [a, b] = [b, a]
- Works with arrays on both sides
- Simultaneous assignment
- Alternative: arithmetic method (a = a + b; b = a - b; a = a - b)`,
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
    <title>Variable Swap</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Variable Swap Challenge</h1>
        <div id="output"></div>
        <button id="swapBtn">Swap Variables</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: true,
            content: `body {
    font-family: 'Courier New', monospace;
    background: #1e1e1e;
    color: #d4d4d4;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.container {
    background: #252526;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    text-align: center;
    min-width: 400px;
}

h1 {
    color: #4ec9b0;
    margin-bottom: 2rem;
}

#output {
    background: #1e1e1e;
    padding: 1.5rem;
    border-radius: 5px;
    border-left: 4px solid #4ec9b0;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    line-height: 1.8;
}

button {
    padding: 0.75rem 2rem;
    background: #0e639c;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #1177bb;
}

.value {
    color: #ce9178;
    font-weight: bold;
}`,
          },
          {
            name: "script.js",
            language: "javascript",
            readonly: false,
            content: `// Initialize variables
let a = 5;
let b = 10;

const output = document.getElementById('output');
const swapBtn = document.getElementById('swapBtn');

function displayValues() {
    output.innerHTML = \`
        <div>Variable a: <span class="value">\${a}</span></div>
        <div>Variable b: <span class="value">\${b}</span></div>
    \`;
}

function swapVariables() {
    // YOUR CODE HERE: Swap a and b using destructuring
    // Hint: [a, b] = [?, ?]
    
    displayValues();
}

// Initial display
displayValues();

// Add event listener
swapBtn.addEventListener('click', swapVariables);`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Variables swap correctly",
            expectedOutput: "a becomes 10, b becomes 5",
          },
          {
            id: "2",
            description: "Uses destructuring syntax",
            expectedOutput: "No temporary variable in code",
          },
          {
            id: "3",
            description: "Button click triggers swap",
            expectedOutput: "Display updates on click",
          },
        ],
        solutionCode: `let a = 5;
let b = 10;

const output = document.getElementById('output');
const swapBtn = document.getElementById('swapBtn');

function displayValues() {
    output.innerHTML = \`
        <div>Variable a: <span class="value">\${a}</span></div>
        <div>Variable b: <span class="value">\${b}</span></div>
    \`;
}

function swapVariables() {
    [a, b] = [b, a];
    displayValues();
}

displayValues();
swapBtn.addEventListener('click', swapVariables);`,
        order: 0,
      },
    ],
  },
  {
    courseId: "js-mastery",
    chapterName: "Array Manipulation (Map/Filter)",
    contents: [
      {
        title: "Filter and Map Products Array",
        questionType: "html-css-js" as const,
        problemStatement: `Master array methods by filtering products under $50 and mapping them to extract names. Learn how .filter() and .map() are the backbone of modern JavaScript data transformation.`,
        instructions: `**Given Array:**
\`\`\`javascript
const products = [
  { name: "Laptop", price: 999 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 45 },
  { name: "Monitor", price: 299 },
  { name: "USB Cable", price: 10 }
];
\`\`\`

**Tasks:**
1. Filter products where price < 50
2. Map the filtered result to get only names
3. Display the names as a list on the page`,
        expectedOutput: `A list showing:
[✓] Mouse
[✓] Keyboard  
[✓] USB Cable
(only items under $50)`,
        hints: `[?] Array Method Chain:
- First: products.filter(item => item.price < 50)
- Then: .map(item => item.name)
- Can chain: products.filter(...).map(...)
- Remember: filter() and map() don't mutate original array`,
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
    <title>Array Methods</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Products Under $50</h1>
        <ul id="productList"></ul>
        <button id="filterBtn">Show Affordable Products</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: true,
            content: `body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    min-width: 400px;
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 1.5rem;
}

#productList {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
}

#productList li {
    background: #f0f0f0;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 5px;
    border-left: 4px solid #667eea;
}

button {
    width: 100%;
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #5568d3;
}`,
          },
          {
            name: "script.js",
            language: "javascript",
            readonly: false,
            content: `const products = [
  { name: "Laptop", price: 999 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 45 },
  { name: "Monitor", price: 299 },
  { name: "USB Cable", price: 10 }
];

const productList = document.getElementById('productList');
const filterBtn = document.getElementById('filterBtn');

function showAffordableProducts() {
    // YOUR CODE HERE:
    // 1. Filter products where price < 50
    // 2. Map to get only the names
    // 3. Display in the list
    
    const affordableNames = []; // Replace with filter and map
    
    productList.innerHTML = '';
    affordableNames.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        productList.appendChild(li);
    });
}

filterBtn.addEventListener('click', showAffordableProducts);`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Filters products under $50",
            expectedOutput: "Only 3 products shown",
          },
          {
            id: "2",
            description: "Maps to names only",
            expectedOutput: "List shows only product names",
          },
          {
            id: "3",
            description: "Uses .filter() and .map()",
            expectedOutput: "Code uses modern array methods",
          },
        ],
        solutionCode: `const products = [
  { name: "Laptop", price: 999 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 45 },
  { name: "Monitor", price: 299 },
  { name: "USB Cable", price: 10 }
];

const productList = document.getElementById('productList');
const filterBtn = document.getElementById('filterBtn');

function showAffordableProducts() {
    const affordableNames = products
        .filter(product => product.price < 50)
        .map(product => product.name);
    
    productList.innerHTML = '';
    affordableNames.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        productList.appendChild(li);
    });
}

filterBtn.addEventListener('click', showAffordableProducts);`,
        order: 0,
      },
    ],
  },
  {
    courseId: "js-mastery",
    chapterName: "DOM Manipulation: Selectors",
    contents: [
      {
        title: "Select and Modify All Paragraphs",
        questionType: "html-css-js" as const,
        problemStatement: `Learn DOM selection by grabbing all paragraph elements and appending text to them. Master querySelector, querySelectorAll, and NodeList iteration.`,
        instructions: `**Your Task:**
- Use querySelectorAll to select all <p> tags
- Loop through the NodeList
- Append the text " (Read)" to each paragraph
- Add a click listener to toggle a 'highlight' class`,
        expectedOutput: `All paragraphs should:
[✓] Have " (Read)" appended to their text
[✓] Be selectable with querySelectorAll
[✓] Highlight on click
[✓] Use forEach or for loop`,
        hints: `[?] DOM Selection Tips:
- querySelectorAll returns NodeList (array-like)
- Use .forEach() or convert to array with [...nodeList]
- textContent to get/set text
- classList.toggle() for class management
- Can select by tag: 'p', by class: '.class', by id: '#id'`,
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
    <title>DOM Selectors</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>DOM Manipulation Exercise</h1>
        <p>This is the first paragraph.</p>
        <p>This is the second paragraph.</p>
        <p>This is the third paragraph.</p>
        <p>This is the fourth paragraph.</p>
        <button id="modifyBtn">Append Text to Paragraphs</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: true,
            content: `body {
    font-family: Arial, sans-serif;
    background: #f5f5f5;
    padding: 2rem;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
}

p {
    line-height: 1.6;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-left: 3px solid #667eea;
    background: #f9f9f9;
    cursor: pointer;
    transition: background 0.3s;
}

p:hover {
    background: #f0f0f0;
}

p.highlight {
    background: #fffacd;
    border-left-color: #ffd700;
}

button {
    width: 100%;
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
}

button:hover {
    background: #5568d3;
}`,
          },
          {
            name: "script.js",
            language: "javascript",
            readonly: false,
            content: `const modifyBtn = document.getElementById('modifyBtn');

function appendReadText() {
    // YOUR CODE HERE:
    // 1. Select all <p> elements using querySelectorAll
    // 2. Loop through them
    // 3. Append ' (Read)' to textContent if not already added
    
}

function addClickListeners() {
    // YOUR CODE HERE:
    // Add click listeners to each paragraph to toggle 'highlight' class
    
}

modifyBtn.addEventListener('click', () => {
    appendReadText();
    addClickListeners();
});`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Selects all paragraphs",
            expectedOutput: "querySelectorAll('p') used",
          },
          {
            id: "2",
            description: "Appends '(Read)' to each",
            expectedOutput: "All paragraphs end with (Read)",
          },
          {
            id: "3",
            description: "Click highlights paragraph",
            expectedOutput: "Highlight class toggles",
          },
        ],
        solutionCode: `const modifyBtn = document.getElementById('modifyBtn');

function appendReadText() {
    const paragraphs = document.querySelectorAll('p');
    
    paragraphs.forEach(p => {
        if (!p.textContent.includes('(Read)')) {
            p.textContent += ' (Read)';
        }
    });
}

function addClickListeners() {
    const paragraphs = document.querySelectorAll('p');
    
    paragraphs.forEach(p => {
        p.addEventListener('click', function() {
            this.classList.toggle('highlight');
        });
    });
}

modifyBtn.addEventListener('click', () => {
    appendReadText();
    addClickListeners();
});`,
        order: 0,
      },
    ],
  },
  {
    courseId: "js-mastery",
    chapterName: "DOM Events: Click Handling",
    contents: [
      {
        title: "Random Background Color Generator",
        questionType: "html-css-js" as const,
        problemStatement: `Master event handling by creating a button that changes the document background to a random color on each click. Learn about event listeners and dynamic styling.`,
        instructions: `**Requirements:**
- Create a button that changes body background color
- Generate random RGB values (0-255 for each channel)
- Display the current color code on screen
- Use addEventListener for click events
- Update background style dynamically`,
        expectedOutput: `Interactive color changer with:
[✓] Random color on each click
[✓] RGB value displayed
[✓] Smooth color transition
[✓] Proper event handling`,
        hints: `[?] Random Color Generation:
- RGB format: rgb(r, g, b)
- Random: Math.floor(Math.random() * 256)
- Generate 3 numbers for r, g, b
- Use template literals: \`rgb(\${r}, \${g}, \${b})\`
- Apply to document.body.style.background`,
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
    <title>Random Color Generator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Random Color Generator</h1>
        <div id="colorDisplay">Click the button to generate!</div>
        <button id="colorBtn">Change Color</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            readonly: true,
            content: `body {
    font-family: Arial, sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    transition: background 0.5s ease;
    background: #667eea;
}

.container {
    background: rgba(255, 255, 255, 0.95);
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    text-align: center;
    backdrop-filter: blur(10px);
}

h1 {
    color: #333;
    margin-bottom: 2rem;
}

#colorDisplay {
    font-size: 1.5rem;
    font-weight: bold;
    padding: 1.5rem;
    background: #f0f0f0;
    border-radius: 10px;
    margin-bottom: 2rem;
    font-family: 'Courier New', monospace;
    color: #333;
}

button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
}

button:hover {
    background: #555;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

button:active {
    transform: translateY(0);
}`,
          },
          {
            name: "script.js",
            language: "javascript",
            readonly: false,
            content: `const colorBtn = document.getElementById('colorBtn');
const colorDisplay = document.getElementById('colorDisplay');

function getRandomColor() {
    // YOUR CODE HERE:
    // Generate random RGB values
    // Return string like: rgb(123, 45, 200)
    
    const r = 0; // Replace with random number 0-255
    const g = 0; // Replace with random number 0-255
    const b = 0; // Replace with random number 0-255
    
    return \`rgb(\${r}, \${g}, \${b})\`;
}

function changeBackgroundColor() {
    // YOUR CODE HERE:
    // 1. Get random color
    // 2. Apply to document.body.style.background
    // 3. Display color code in colorDisplay
    
}

// Add event listener here`,
          },
        ],
        testCases: [
          {
            id: "1",
            description: "Button click changes background",
            expectedOutput: "Body background color changes",
          },
          {
            id: "2",
            description: "Color code is displayed",
            expectedOutput: "RGB value shown on screen",
          },
          {
            id: "3",
            description: "Each click produces different color",
            expectedOutput: "Random values generated",
          },
        ],
        solutionCode: `const colorBtn = document.getElementById('colorBtn');
const colorDisplay = document.getElementById('colorDisplay');

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    return \`rgb(\${r}, \${g}, \${b})\`;
}

function changeBackgroundColor() {
    const color = getRandomColor();
    document.body.style.background = color;
    colorDisplay.textContent = color;
}

colorBtn.addEventListener('click', changeBackgroundColor);`,
        order: 0,
      },
    ],
  },
];

async function seedAllContent() {
  try {
    console.log("🌱 Starting comprehensive content seeding...\n");
    let totalCreated = 0;

    for (const courseData of allCourseContents) {
      console.log(`\n📚 Processing course: ${courseData.courseId}`);
      console.log(`📖 Chapter: ${courseData.chapterName}`);

      // Find the chapter by courseId and name
      const chapter = await db
        .select()
        .from(CourseChapterTable)
        .where(eq(CourseChapterTable.courseId, courseData.courseId))
        .then((chapters) =>
          chapters.find((ch) => ch.name === courseData.chapterName)
        );

      if (!chapter) {
        console.log(
          `⚠️  Chapter "${courseData.chapterName}" not found for course "${courseData.courseId}". Skipping...`
        );
        continue;
      }

      // Insert each content for this chapter
      for (const content of courseData.contents) {
        await db.insert(ChapterContentTable).values({
          chapterId: chapter.id,
          title: content.title,
          problemStatement: content.problemStatement,
          instructions: content.instructions,
          expectedOutput: content.expectedOutput,
          hints: content.hints || null,
          questionType: content.questionType,
          boilerplateFiles: JSON.stringify(content.boilerplateFiles),
          testCases: JSON.stringify(content.testCases),
          solutionCode: content.solutionCode,
          order: content.order,
        });

        totalCreated++;
        console.log(`   ✅ Created: ${content.title}`);
      }
    }

    console.log(`\n\n🎉 Successfully seeded ${totalCreated} chapter contents!`);
    console.log(
      `📊 Processed ${allCourseContents.length} chapters across multiple courses`
    );
  } catch (error) {
    console.error("❌ Error seeding content:", error);
  }
}

seedAllContent();
