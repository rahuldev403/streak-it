import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  CourseTable,
  CourseChapterTable,
  ChapterContentTable,
} from "../app/config/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ==========================================
// COURSE 1: HTML & CSS Mastery
// ==========================================
const htmlCssCourse = {
  courseId: "html-css-mastery",
  title: "HTML & CSS Mastery: From Basics to Advanced",
  description:
    "Master HTML and CSS from scratch. Build beautiful, responsive websites with semantic HTML5 and modern CSS3 techniques including Flexbox, Grid, and animations.",
  bannerImage: "PLACEHOLDER_HTML_CSS_BANNER_URL", // Replace with actual image URL
  level: "beginner",
  tags: "html,css,web-development,frontend,responsive-design",
  chapters: [
    // ========== CHAPTER 1 ==========
    {
      name: "HTML Fundamentals",
      desc: "Learn the building blocks of web pages with HTML5. Understand document structure, semantic elements, and accessibility basics.",
      exercise:
        "Build a complete personal portfolio page structure using semantic HTML",
      contents: [
        {
          title: "Create a Semantic Portfolio Page",
          questionType: "html-css-js" as const,
          problemStatement: `Build a personal portfolio page using only semantic HTML5 tags. Focus on proper document structure, accessibility, and SEO-friendly markup without any styling.`,
          instructions: `**Your Task:**
- Create a complete HTML5 document with proper DOCTYPE
- Use semantic tags: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>
- Include a navigation menu with links to different sections
- Add an "About Me" section with heading and paragraph
- Create a "Projects" section with at least 3 project articles
- Add a contact section with your information
- NO <div> or <span> tags allowed - use only semantic elements!`,
          expectedOutput: `A well-structured portfolio page with:
[✓] Proper HTML5 document structure
[✓] Navigation menu with anchor links
[✓] About section with semantic markup
[✓] Projects section with multiple articles
[✓] Contact information in footer
[✓] 100% semantic HTML (no divs!)`,
          hints: `[?] Tips:
- <nav> contains your main navigation links
- <article> is perfect for individual projects
- Use <section> to group related content
- <aside> can contain supplementary information
- Always use <h1>-<h6> for proper heading hierarchy`,
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
    <meta name="description" content="My Portfolio">
    <title>My Portfolio</title>
</head>
<body>
    <!-- Build your semantic portfolio structure here -->
    
</body>
</html>`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Contains proper HTML5 document structure",
              expectedOutput: "DOCTYPE, html, head, body tags present",
            },
            {
              id: "2",
              description: "Uses <nav> element for navigation",
              expectedOutput: "Navigation menu with semantic nav tag",
            },
            {
              id: "3",
              description: "Contains at least 3 sections",
              expectedOutput: "Multiple content sections identified",
            },
            {
              id: "4",
              description: "No div or span tags used",
              expectedOutput: "100% semantic HTML structure",
            },
          ],
          solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="John Doe - Web Developer Portfolio">
    <title>John Doe - Portfolio</title>
</head>
<body>
    <header>
        <h1>John Doe</h1>
        <p>Full Stack Web Developer</p>
        <nav>
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="about">
            <h2>About Me</h2>
            <p>I'm a passionate web developer with expertise in HTML, CSS, and JavaScript. I love creating beautiful and functional websites.</p>
        </section>

        <section id="projects">
            <h2>My Projects</h2>
            
            <article>
                <h3>E-Commerce Website</h3>
                <p>Built a fully responsive online store with shopping cart functionality.</p>
            </article>

            <article>
                <h3>Weather App</h3>
                <p>Created a real-time weather application using weather API.</p>
            </article>

            <article>
                <h3>Blog Platform</h3>
                <p>Developed a content management system for bloggers.</p>
            </article>
        </section>

        <aside>
            <h3>Skills</h3>
            <ul>
                <li>HTML5 & CSS3</li>
                <li>JavaScript</li>
                <li>Responsive Design</li>
            </ul>
        </aside>
    </main>

    <footer id="contact">
        <h2>Contact Me</h2>
        <p>Email: john@example.com</p>
        <p>Phone: (123) 456-7890</p>
        <p>&copy; 2026 John Doe. All rights reserved.</p>
    </footer>
</body>
</html>`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 2 ==========
    {
      name: "HTML Forms and Input Elements",
      desc: "Master HTML forms, input types, validation attributes, and form submission. Learn to create accessible and user-friendly forms.",
      exercise: "Build a multi-step registration form with validation",
      contents: [
        {
          title: "Build a Complete Registration Form",
          questionType: "html-css-js" as const,
          problemStatement: `Create a comprehensive registration form using various HTML5 input types and validation attributes. Practice building forms that are accessible and provide great user experience.`,
          instructions: `**Requirements:**
- Text input for full name (required, minlength: 3)
- Email input with proper validation
- Password input (required, minlength: 8)
- Date input for birthdate
- Radio buttons for gender selection
- Checkbox for terms acceptance (required)
- Select dropdown for country
- Textarea for bio (maxlength: 200)
- Submit button
- Use proper labels with for attributes
- Add placeholder text where appropriate`,
          expectedOutput: `A functional registration form with:
[✓] All required input types
[✓] HTML5 validation attributes
[✓] Accessible labels
[✓] Required field indicators
[✓] Submit button`,
          hints: `[?] Tips:
- Use <fieldset> and <legend> to group related inputs
- type="email" provides automatic email format validation
- required attribute prevents form submission if empty
- Associate labels with inputs using for="inputId"
- Use pattern attribute for custom validation`,
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
    <title>Registration Form</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <form id="registrationForm">
        <h1>Create Your Account</h1>
        <!-- Build your form here -->
        
    </form>
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

form {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    max-width: 500px;
    width: 100%;
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
}

label {
    display: block;
    margin: 1rem 0 0.5rem 0;
    color: #555;
    font-weight: 500;
}

input, select, textarea {
    width: 100%;
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

input[type="radio"], input[type="checkbox"] {
    width: auto;
    margin-right: 0.5rem;
}

button {
    width: 100%;
    padding: 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: background 0.3s;
}

button:hover {
    background: #5568d3;
}

.required::after {
    content: " *";
    color: red;
}`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Contains email input with proper type",
              expectedOutput: "Email field with type='email'",
            },
            {
              id: "2",
              description: "Has required fields with validation",
              expectedOutput: "Required attributes on critical fields",
            },
            {
              id: "3",
              description: "Includes radio buttons and checkbox",
              expectedOutput: "Multiple input types implemented",
            },
            {
              id: "4",
              description: "All labels properly associated with inputs",
              expectedOutput: "Accessible form structure",
            },
          ],
          solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Form</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <form id="registrationForm">
        <h1>Create Your Account</h1>
        
        <label for="fullName" class="required">Full Name</label>
        <input type="text" id="fullName" name="fullName" required minlength="3" placeholder="Enter your full name">
        
        <label for="email" class="required">Email</label>
        <input type="email" id="email" name="email" required placeholder="your@email.com">
        
        <label for="password" class="required">Password</label>
        <input type="password" id="password" name="password" required minlength="8" placeholder="At least 8 characters">
        
        <label for="birthdate">Date of Birth</label>
        <input type="date" id="birthdate" name="birthdate">
        
        <fieldset>
            <legend>Gender</legend>
            <label>
                <input type="radio" name="gender" value="male"> Male
            </label>
            <label>
                <input type="radio" name="gender" value="female"> Female
            </label>
            <label>
                <input type="radio" name="gender" value="other"> Other
            </label>
        </fieldset>
        
        <label for="country">Country</label>
        <select id="country" name="country">
            <option value="">Select your country</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="ca">Canada</option>
            <option value="au">Australia</option>
            <option value="in">India</option>
        </select>
        
        <label for="bio">Bio</label>
        <textarea id="bio" name="bio" rows="4" maxlength="200" placeholder="Tell us about yourself (max 200 characters)"></textarea>
        
        <label class="required">
            <input type="checkbox" name="terms" required>
            I agree to the Terms and Conditions
        </label>
        
        <button type="submit">Create Account</button>
    </form>
</body>
</html>`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 3 ==========
    {
      name: "CSS Basics and Selectors",
      desc: "Learn CSS fundamentals including selectors, properties, values, and the cascade. Understand how to style HTML elements effectively.",
      exercise: "Style a business card with CSS selectors",
      contents: [
        {
          title: "Create a Styled Business Card",
          questionType: "html-css-js" as const,
          problemStatement: `Apply CSS styling to a business card layout using different types of selectors. Learn element, class, ID, and descendant selectors while creating professional styling.`,
          instructions: `**Your Task:**
- Style the card container with specific dimensions and centering
- Use class selectors for reusable styles
- Apply ID selector for unique elements
- Use descendant selectors for nested elements
- Add colors, fonts, spacing, and borders
- Make text readable with proper contrast
- DO NOT modify the HTML structure`,
          expectedOutput: `A professionally styled business card with:
[✓] Centered card with background color
[✓] Proper typography and spacing
[✓] Color scheme that's visually appealing
[✓] Border and shadow effects
[✓] Hover effects on links`,
          hints: `[?] CSS Selector Tips:
- .className targets elements with that class
- #idName targets element with that ID (unique)
- element targets all tags of that type
- parent child targets children inside parent
- Use padding for inner spacing, margin for outer
- box-shadow adds depth to elements`,
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
    <title>Business Card</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <div class="header">
            <h1 id="name">Sarah Johnson</h1>
            <p class="title">Senior Web Developer</p>
        </div>
        <div class="contact">
            <p class="info">📧 sarah.johnson@email.com</p>
            <p class="info">📱 (555) 123-4567</p>
            <p class="info">🌐 www.sarahjohnson.dev</p>
        </div>
        <div class="skills">
            <span class="skill">HTML</span>
            <span class="skill">CSS</span>
            <span class="skill">JavaScript</span>
        </div>
    </div>
</body>
</html>`,
            },
            {
              name: "style.css",
              language: "css",
              readonly: false,
              content: `/* Reset default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Your CSS code here */
/* Style the body, card, header, name, title, contact info, and skills */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Card is centered with specific width",
              expectedOutput: "Card container styled and centered",
            },
            {
              id: "2",
              description: "Uses class selectors for reusable styles",
              expectedOutput: "Class-based styling applied",
            },
            {
              id: "3",
              description: "Name styled with ID selector",
              expectedOutput: "Unique styling on #name element",
            },
            {
              id: "4",
              description: "Professional color scheme applied",
              expectedOutput: "Visually appealing design",
            },
          ],
          solutionCode: `/* Reset default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.card {
    background: white;
    width: 400px;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.header {
    text-align: center;
    border-bottom: 2px solid #667eea;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
}

#name {
    color: #333;
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.title {
    color: #667eea;
    font-size: 1.1rem;
    font-weight: 600;
}

.contact {
    margin: 1.5rem 0;
}

.info {
    color: #555;
    font-size: 0.95rem;
    margin: 0.75rem 0;
}

.skills {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.skill {
    background: #667eea;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 4 ==========
    {
      name: "CSS Box Model",
      desc: "Master the CSS box model - content, padding, border, and margin. Learn how to control spacing and sizing of elements.",
      exercise: "Build a pricing card demonstrating box model properties",
      contents: [
        {
          title: "Create a Pricing Card with Perfect Spacing",
          questionType: "html-css-js" as const,
          problemStatement: `Build a pricing card that demonstrates mastery of the CSS box model. Use padding, margin, border, and understand how they affect element dimensions.`,
          instructions: `**Requirements:**
- Style the card with specific padding values
- Use margin to center and space elements
- Add borders with different styles
- Apply border-radius for rounded corners
- Use box-sizing: border-box
- Create internal spacing with padding
- Control external spacing with margin
- Add a highlighted "Popular" badge`,
          expectedOutput: `A polished pricing card with:
[✓] Proper padding inside elements
[✓] Margins creating space between elements
[✓] Borders adding visual structure
[✓] Rounded corners on card
[✓] Centered card with button
[✓] Visual hierarchy through spacing`,
          hints: `[?] Box Model Tips:
- padding creates space INSIDE the element
- margin creates space OUTSIDE the element
- border goes between padding and margin
- box-sizing: border-box includes padding/border in width
- Use margin: 0 auto to center block elements
- Negative margins can overlap elements`,
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
    <title>Pricing Card</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="pricing-card">
        <div class="badge">POPULAR</div>
        <h2 class="plan-name">Pro Plan</h2>
        <div class="price">
            <span class="currency">$</span>
            <span class="amount">29</span>
            <span class="period">/month</span>
        </div>
        <ul class="features">
            <li>Unlimited Projects</li>
            <li>24/7 Support</li>
            <li>Advanced Analytics</li>
            <li>Custom Domain</li>
            <li>Team Collaboration</li>
        </ul>
        <button class="cta-button">Get Started</button>
    </div>
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
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

/* Style the pricing card with proper box model properties */
/* Remember: padding (inside), border (edge), margin (outside) */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Card has padding creating inner space",
              expectedOutput: "Content not touching edges",
            },
            {
              id: "2",
              description: "Margins used for element spacing",
              expectedOutput: "Proper spacing between sections",
            },
            {
              id: "3",
              description: "Border applied to card or elements",
              expectedOutput: "Visual borders present",
            },
            {
              id: "4",
              description: "Border-radius creates rounded corners",
              expectedOutput: "Smooth rounded edges",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.pricing-card {
    background: white;
    width: 350px;
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    position: relative;
    border: 2px solid #e0e0e0;
}

.badge {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}

.plan-name {
    color: #333;
    font-size: 2rem;
    margin: 1.5rem 0 1rem 0;
}

.price {
    margin: 1.5rem 0;
}

.currency {
    font-size: 1.5rem;
    color: #666;
}

.amount {
    font-size: 3.5rem;
    font-weight: bold;
    color: #667eea;
}

.period {
    color: #999;
    font-size: 1rem;
}

.features {
    list-style: none;
    text-align: left;
    margin: 2rem 0;
}

.features li {
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-left: 3px solid #667eea;
    padding-left: 1rem;
    color: #555;
}

.cta-button {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: transform 0.2s;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 5 ==========
    {
      name: "CSS Colors and Typography",
      desc: "Explore color systems, typography properties, and text styling. Learn to create beautiful, readable text with proper hierarchy.",
      exercise: "Design a blog post with advanced typography",
      contents: [
        {
          title: "Style a Blog Article with Beautiful Typography",
          questionType: "html-css-js" as const,
          problemStatement: `Create a beautifully styled blog article focusing on typography, colors, and readability. Apply font properties, line heights, letter spacing, and color theory.`,
          instructions: `**Typography Requirements:**
- Use web-safe fonts or Google Fonts
- Set proper font-size hierarchy (h1 > h2 > p)
- Apply line-height for readability (1.6-1.8 for body)
- Use letter-spacing for headings
- Apply text-align, text-decoration, text-transform
- Create color scheme with contrast
- Use rgba() or hsla() for semi-transparent colors
- Add drop caps or other typographic features`,
          expectedOutput: `A readable blog article with:
[✓] Clear typographic hierarchy
[✓] Proper line-height and spacing
[✓] Professional color scheme
[✓] Good readability and contrast
[✓] Styled headings and paragraphs
[✓] Special typographic effects`,
          hints: `[?] Typography Tips:
- Line-height: 1.6-1.8 for body text
- Max-width: 65-75 characters per line for readability
- Use em or rem for scalable fonts
- font-weight: 300-900 (400=normal, 700=bold)
- letter-spacing in headings improves readability
- Use text-shadow for subtle depth`,
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
    <title>Blog Article</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
    <article class="blog-post">
        <header>
            <h1 class="title">The Art of Web Typography</h1>
            <p class="meta">By Jane Developer | February 1, 2026 | 5 min read</p>
        </header>
        
        <p class="lead">Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.</p>
        
        <h2>Why Typography Matters</h2>
        <p>Good typography enhances the user experience by improving readability and establishing visual hierarchy. It guides readers through your content and creates an emotional connection.</p>
        
        <h2>Key Principles</h2>
        <p>When designing with type, consider contrast, consistency, and clarity. These three C's form the foundation of effective typography.</p>
        
        <blockquote>
            "Typography is the craft of endowing human language with a durable visual form."
            <cite>— Robert Bringhurst</cite>
        </blockquote>
        
        <h2>Practical Tips</h2>
        <ul>
            <li>Limit yourself to 2-3 typefaces</li>
            <li>Use proper line spacing</li>
            <li>Maintain appropriate contrast</li>
            <li>Consider responsive typography</li>
        </ul>
    </article>
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
    background: #f8f9fa;
    padding: 2rem;
}

/* Style the blog post with beautiful typography */
/* Focus on: font-family, font-size, line-height, letter-spacing, color */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Uses custom fonts (Google Fonts or web-safe)",
              expectedOutput: "Professional font families applied",
            },
            {
              id: "2",
              description: "Clear heading hierarchy with size differences",
              expectedOutput: "h1 larger than h2, proper scale",
            },
            {
              id: "3",
              description: "Proper line-height for readability",
              expectedOutput: "Body text line-height between 1.6-1.8",
            },
            {
              id: "4",
              description: "Color scheme with good contrast",
              expectedOutput: "Readable text colors on background",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: #f8f9fa;
    padding: 2rem;
    font-family: 'Open Sans', sans-serif;
    color: #333;
    line-height: 1.7;
}

.blog-post {
    max-width: 700px;
    margin: 0 auto;
    background: white;
    padding: 3rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

header {
    text-align: center;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
}

.title {
    font-family: 'Merriweather', serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 1rem;
}

.meta {
    font-size: 0.9rem;
    color: #666;
    font-weight: 400;
}

.lead {
    font-size: 1.25rem;
    line-height: 1.8;
    color: #444;
    margin-bottom: 2rem;
    font-weight: 400;
}

h2 {
    font-family: 'Merriweather', serif;
    font-size: 1.75rem;
    color: #2c3e50;
    margin: 2.5rem 0 1rem 0;
    letter-spacing: -0.3px;
}

p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: #555;
}

blockquote {
    background: #f0f4f8;
    border-left: 4px solid #3498db;
    padding: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    font-size: 1.15rem;
    color: #34495e;
}

cite {
    display: block;
    text-align: right;
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: #7f8c8d;
    font-style: normal;
}

ul {
    margin: 1.5rem 0;
    padding-left: 2rem;
}

li {
    margin: 0.75rem 0;
    color: #555;
    font-size: 1.05rem;
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 6 ==========
    {
      name: "CSS Flexbox Layout",
      desc: "Master Flexbox for creating flexible, responsive layouts. Learn flex containers, flex items, and alignment properties.",
      exercise: "Build a responsive navigation bar with Flexbox",
      contents: [
        {
          title: "Create a Flexible Navigation Bar",
          questionType: "html-css-js" as const,
          problemStatement: `Build a modern navigation bar using Flexbox. Learn to align items, distribute space, and create responsive layouts with flex properties.`,
          instructions: `**Flexbox Requirements:**
- Use display: flex on container
- Align logo to left, nav items to right with space-between
- Center items vertically with align-items
- Use flex-wrap for responsive behavior
- Add gap property for spacing
- Style nav items in a row
- Add hover effects
- Make it responsive with flex-direction`,
          expectedOutput: `A professional navigation bar with:
[✓] Logo on left, menu on right
[✓] Vertically centered items
[✓] Even spacing between nav items
[✓] Hover effects on links
[✓] Responsive behavior
[✓] Clean Flexbox implementation`,
          hints: `[?] Flexbox Properties:
- display: flex makes element a flex container
- justify-content: space-between spreads items
- align-items: center vertically centers items
- flex-direction: row (default) or column
- gap creates space between flex items
- flex-wrap: wrap allows items to wrap`,
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
    <title>Flexbox Navigation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar">
        <div class="logo">MyBrand</div>
        <ul class="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <button class="cta-btn">Get Started</button>
    </nav>
    
    <div class="content">
        <h1>Flexbox Navigation Demo</h1>
        <p>Resize the window to see responsive behavior</p>
    </div>
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
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
}

/* Use Flexbox to create the navigation layout */
/* Properties: display: flex, justify-content, align-items, gap */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Navbar uses display: flex",
              expectedOutput: "Flex container established",
            },
            {
              id: "2",
              description: "Items distributed with space-between",
              expectedOutput: "Logo left, menu right",
            },
            {
              id: "3",
              description: "Vertical alignment with align-items",
              expectedOutput: "Items centered vertically",
            },
            {
              id: "4",
              description: "Nav menu items in a row with gap",
              expectedOutput: "Horizontal menu with spacing",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
}

.navbar {
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
    align-items: center;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #667eea;
}

.cta-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.content {
    text-align: center;
    padding: 4rem 2rem;
}

.content h1 {
    color: #333;
    margin-bottom: 1rem;
}

.content p {
    color: #666;
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        align-items: stretch;
    }
    
    .nav-menu {
        flex-direction: column;
        gap: 1rem;
    }
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 7 ==========
    {
      name: "CSS Grid Layout",
      desc: "Learn CSS Grid for creating complex two-dimensional layouts. Master grid containers, grid items, and grid areas.",
      exercise: "Build a responsive image gallery with CSS Grid",
      contents: [
        {
          title: "Create a Responsive Photo Gallery",
          questionType: "html-css-js" as const,
          problemStatement: `Build a beautiful photo gallery using CSS Grid. Learn to create responsive grid layouts that adapt to different screen sizes automatically.`,
          instructions: `**Grid Requirements:**
- Use display: grid on container
- Create responsive columns with repeat() and auto-fit
- Use minmax() for flexible column widths
- Add gap between grid items
- Make some items span multiple columns with grid-column
- Ensure images fill their containers
- Add hover effects
- Make it fully responsive`,
          expectedOutput: `A responsive photo gallery with:
[✓] Grid layout with multiple columns
[✓] Automatic responsiveness
[✓] Featured images spanning 2 columns
[✓] Consistent gaps between items
[✓] Images that fill containers
[✓] Smooth hover effects`,
          hints: `[?] CSS Grid Tips:
- grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
- gap creates space between grid items
- grid-column: span 2 makes item span 2 columns
- object-fit: cover makes images fill containers
- aspect-ratio maintains consistent heights`,
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
    <title>CSS Grid Gallery</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Photo Gallery</h1>
        <div class="gallery">
            <div class="gallery-item featured">
                <img src="PLACEHOLDER_IMAGE_1" alt="Featured photo 1">
            </div>
            <div class="gallery-item">
                <img src="PLACEHOLDER_IMAGE_2" alt="Photo 2">
            </div>
            <div class="gallery-item">
                <img src="PLACEHOLDER_IMAGE_3" alt="Photo 3">
            </div>
            <div class="gallery-item">
                <img src="PLACEHOLDER_IMAGE_4" alt="Photo 4">
            </div>
            <div class="gallery-item featured">
                <img src="PLACEHOLDER_IMAGE_5" alt="Featured photo 5">
            </div>
            <div class="gallery-item">
                <img src="PLACEHOLDER_IMAGE_6" alt="Photo 6">
            </div>
            <div class="gallery-item">
                <img src="PLACEHOLDER_IMAGE_7" alt="Photo 7">
            </div>
            <div class="gallery-item">
                <img src="PLACEHOLDER_IMAGE_8" alt="Photo 8">
            </div>
        </div>
    </div>
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
    font-family: 'Arial', sans-serif;
    background: #1a1a1a;
    color: white;
    padding: 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
}

/* Create the CSS Grid gallery here */
/* Use: display: grid, grid-template-columns, gap */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Gallery uses display: grid",
              expectedOutput: "Grid container established",
            },
            {
              id: "2",
              description: "Responsive columns with repeat() and auto-fit",
              expectedOutput: "Automatic column adjustment",
            },
            {
              id: "3",
              description: "Featured items span multiple columns",
              expectedOutput: "Some images larger than others",
            },
            {
              id: "4",
              description: "Consistent gaps between items",
              expectedOutput: "Grid gap applied",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #1a1a1a;
    color: white;
    padding: 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    aspect-ratio: 1;
    cursor: pointer;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.gallery-item:hover img {
    transform: scale(1.1);
}

.featured {
    grid-column: span 2;
}

@media (max-width: 768px) {
    .featured {
        grid-column: span 1;
    }
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 8 ==========
    {
      name: "Responsive Design",
      desc: "Master responsive web design with media queries, mobile-first approach, and flexible layouts. Build sites that work on all devices.",
      exercise: "Create a fully responsive landing page",
      contents: [
        {
          title: "Build a Mobile-First Landing Page",
          questionType: "html-css-js" as const,
          problemStatement: `Create a landing page that looks perfect on mobile, tablet, and desktop. Use media queries, flexible units, and responsive design principles.`,
          instructions: `**Responsive Requirements:**
- Start with mobile-first design
- Use relative units (rem, em, %, vw, vh)
- Add media queries for tablet (768px) and desktop (1024px)
- Make images responsive with max-width: 100%
- Stack elements on mobile, side-by-side on desktop
- Adjust font sizes for different screens
- Hide/show elements based on screen size
- Test layout at multiple breakpoints`,
          expectedOutput: `A responsive landing page with:
[✓] Mobile-first base styles
[✓] Media queries for different screen sizes
[✓] Flexible layout that adapts
[✓] Responsive images
[✓] Readable text at all sizes
[✓] Good UX on all devices`,
          hints: `[?] Responsive Design Tips:
- Mobile-first: base styles for mobile, media queries for larger
- @media (min-width: 768px) targets tablets and up
- Use rem for fonts (1rem = 16px default)
- max-width: 100% prevents image overflow
- Flexbox/Grid with media queries creates adaptive layouts`,
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
    <title>Responsive Landing Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="hero">
        <nav class="navbar">
            <div class="logo">TechCo</div>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
        <div class="hero-content">
            <h1>Build Amazing Websites</h1>
            <p>Create responsive, modern web experiences with our powerful tools</p>
            <button class="cta">Start Free Trial</button>
        </div>
    </header>

    <section class="features" id="features">
        <h2>Our Features</h2>
        <div class="feature-grid">
            <div class="feature-card">
                <h3>🚀 Fast</h3>
                <p>Lightning-fast performance</p>
            </div>
            <div class="feature-card">
                <h3>📱 Responsive</h3>
                <p>Works on all devices</p>
            </div>
            <div class="feature-card">
                <h3>🎨 Beautiful</h3>
                <p>Stunning designs</p>
            </div>
        </div>
    </section>
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

/* Mobile-first base styles */
body {
    font-family: 'Arial', sans-serif;
}

/* Style for mobile first, then add media queries for larger screens */
/* Breakpoints: 768px (tablet), 1024px (desktop) */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Mobile-first base styles applied",
              expectedOutput: "Single column layout on mobile",
            },
            {
              id: "2",
              description: "Media query for tablet (768px+)",
              expectedOutput: "Layout adapts at 768px",
            },
            {
              id: "3",
              description: "Media query for desktop (1024px+)",
              expectedOutput: "Full desktop layout at 1024px",
            },
            {
              id: "4",
              description: "Responsive images and flexible units",
              expectedOutput: "No horizontal scrolling",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Mobile-first base styles */
body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    min-height: 100vh;
}

.navbar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 1rem;
    flex-wrap: wrap;
}

.nav-links a {
    color: white;
    text-decoration: none;
}

.hero-content {
    text-align: center;
    padding: 3rem 1rem;
}

.hero-content h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1rem;
    margin-bottom: 2rem;
}

.cta {
    background: white;
    color: #667eea;
    border: none;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
}

.features {
    padding: 2rem 1rem;
    text-align: center;
}

.features h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
}

.feature-grid {
    display: grid;
    gap: 1rem;
}

.feature-card {
    background: #f5f5f5;
    padding: 2rem;
    border-radius: 10px;
}

/* Tablet styles */
@media (min-width: 768px) {
    .navbar {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    
    .hero-content h1 {
        font-size: 3rem;
    }
    
    .hero-content p {
        font-size: 1.25rem;
    }
    
    .feature-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop styles */
@media (min-width: 1024px) {
    .hero {
        padding: 2rem 4rem;
    }
    
    .hero-content {
        padding: 6rem 2rem;
    }
    
    .hero-content h1 {
        font-size: 4rem;
    }
    
    .features {
        padding: 4rem 2rem;
    }
    
    .feature-grid {
        grid-template-columns: repeat(3, 1fr);
        max-width: 1200px;
        margin: 0 auto;
    }
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 9 ==========
    {
      name: "CSS Transitions and Animations",
      desc: "Add life to your websites with CSS transitions and keyframe animations. Create smooth, engaging user experiences.",
      exercise: "Build an animated loading screen and button effects",
      contents: [
        {
          title: "Create Smooth Animations and Transitions",
          questionType: "html-css-js" as const,
          problemStatement: `Build interactive elements with smooth transitions and create keyframe animations for a loading screen. Learn timing functions, delays, and animation properties.`,
          instructions: `**Animation Requirements:**
- Add hover transitions to buttons (background, transform, shadow)
- Create a spinning loader with @keyframes
- Add fade-in animation for cards
- Use transition-timing-function (ease, ease-in-out)
- Apply transform (scale, rotate, translateY)
- Add animation-delay for staggered effects
- Create pulse animation for attention
- Use multiple animations on one element`,
          expectedOutput: `Animated interface with:
[✓] Smooth button hover transitions
[✓] Spinning loader animation
[✓] Fade-in animations for content
[✓] Transform effects on hover
[✓] Staggered animation timing
[✓] Professional animation feel`,
          hints: `[?] Animation Tips:
- transition: property duration timing-function delay
- @keyframes defines animation steps
- animation: name duration timing iteration
- transform doesn't trigger layout reflow (performant)
- Use cubic-bezier() for custom timing
- animation-fill-mode: forwards keeps final state`,
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
    <title>CSS Animations</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="loader-container">
        <div class="loader"></div>
        <p class="loading-text">Loading...</p>
    </div>

    <div class="content">
        <h1>Animated UI Elements</h1>
        
        <div class="button-group">
            <button class="btn btn-primary">Hover Me</button>
            <button class="btn btn-secondary">Click Me</button>
            <button class="btn btn-pulse">Pulse Effect</button>
        </div>

        <div class="cards">
            <div class="card" style="animation-delay: 0.1s">
                <h3>Card 1</h3>
                <p>Fade in animation</p>
            </div>
            <div class="card" style="animation-delay: 0.3s">
                <h3>Card 2</h3>
                <p>Staggered timing</p>
            </div>
            <div class="card" style="animation-delay: 0.5s">
                <h3>Card 3</h3>
                <p>Smooth entrance</p>
            </div>
        </div>
    </div>
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
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
    padding: 2rem;
}

/* Create animations using @keyframes and transitions */
/* Animate: loader spinning, buttons on hover, cards fading in */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Loader has spinning animation",
              expectedOutput: "Continuous rotation with @keyframes",
            },
            {
              id: "2",
              description: "Buttons have hover transitions",
              expectedOutput: "Smooth color/transform changes",
            },
            {
              id: "3",
              description: "Cards fade in with staggered delays",
              expectedOutput: "Sequential appearance",
            },
            {
              id: "4",
              description: "Pulse animation on button",
              expectedOutput: "Repeating scale animation",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
    padding: 2rem;
}

/* Loader Animation */
.loader-container {
    text-align: center;
    margin-bottom: 3rem;
}

.loader {
    width: 50px;
    height: 50px;
    border: 5px solid #e0e0e0;
    border-top-color: #667eea;
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    color: #666;
    animation: pulse 1.5s ease-in-out infinite;
}

/* Content */
.content {
    max-width: 1000px;
    margin: 0 auto;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
}

/* Button Animations */
.button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
}

.btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5568d3;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background: #f39c12;
    color: white;
}

.btn-secondary:hover {
    background: #e67e22;
    transform: scale(1.05);
}

.btn-pulse {
    background: #e74c3c;
    color: white;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
}

/* Card Animations */
.cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    animation: fadeInUp 0.6s ease-out backwards;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card h3 {
    color: #333;
    margin-bottom: 0.5rem;
}

.card p {
    color: #666;
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 10 ==========
    {
      name: "CSS Positioning and Z-Index",
      desc: "Master CSS positioning (static, relative, absolute, fixed, sticky) and z-index layering. Create complex layouts and overlays.",
      exercise: "Build a modal overlay and sticky navigation",
      contents: [
        {
          title: "Create Modal and Sticky Header",
          questionType: "html-css-js" as const,
          problemStatement: `Build a sticky navigation bar and a modal overlay using CSS positioning. Learn how position property and z-index control element layering.`,
          instructions: `**Positioning Requirements:**
- Create fixed/sticky header that stays on scroll
- Build modal overlay with position: fixed
- Center modal using absolute positioning
- Use z-index to control layering
- Create backdrop with semi-transparent overlay
- Add relative positioning for parent containers
- Position close button absolutely
- Ensure proper stacking context`,
          expectedOutput: `A layout with positioning features:
[✓] Sticky/fixed header at top
[✓] Modal centered on screen
[✓] Semi-transparent backdrop
[✓] Proper z-index layering
[✓] Absolutely positioned close button
[✓] Responsive positioning`,
          hints: `[?] Positioning Tips:
- position: fixed removes from flow, stays on scroll
- position: absolute positions relative to nearest positioned ancestor
- position: sticky is fixed when scrolling past threshold
- z-index only works on positioned elements
- Higher z-index appears on top
- transform: translate(-50%, -50%) for perfect centering`,
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
    <title>CSS Positioning</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="logo">MySite</div>
        <nav>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>

    <main class="content">
        <h1>CSS Positioning Demo</h1>
        <p>Scroll down to see sticky header behavior</p>
        <button class="open-modal">Open Modal</button>
        
        <div class="spacer">
            <p>Keep scrolling...</p>
            <p>Keep scrolling...</p>
            <p>Keep scrolling...</p>
            <p>Keep scrolling...</p>
            <p>Keep scrolling...</p>
        </div>
    </main>

    <div class="modal-overlay">
        <div class="modal">
            <button class="close-btn">×</button>
            <h2>Modal Title</h2>
            <p>This modal uses position: fixed and is centered with absolute positioning techniques.</p>
            <button class="modal-action">Take Action</button>
        </div>
    </div>
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
    font-family: 'Arial', sans-serif;
}

/* Use position: sticky/fixed for header */
/* Use position: fixed for modal overlay */
/* Use position: absolute for close button */
/* Use z-index for layering */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Header uses position: sticky or fixed",
              expectedOutput: "Header stays at top when scrolling",
            },
            {
              id: "2",
              description: "Modal overlay uses position: fixed",
              expectedOutput: "Modal covers entire viewport",
            },
            {
              id: "3",
              description: "Modal centered using positioning",
              expectedOutput: "Modal in center of screen",
            },
            {
              id: "4",
              description: "Z-index creates proper layering",
              expectedOutput: "Modal appears above content",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
}

/* Sticky/Fixed Header */
.header {
    position: sticky;
    top: 0;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
}

.header nav {
    display: flex;
    gap: 2rem;
}

.header a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
}

/* Main Content */
.content {
    padding: 3rem 2rem;
    text-align: center;
}

.content h1 {
    margin-bottom: 1rem;
    color: #333;
}

.open-modal {
    margin: 2rem 0;
    padding: 1rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}

.spacer {
    margin-top: 3rem;
    line-height: 3;
}

.spacer p {
    font-size: 2rem;
    color: #ccc;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    /* Initially hidden - would use JS or :target to show */
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.modal-overlay:target {
    opacity: 1;
    pointer-events: all;
}

/* Modal */
.modal {
    position: relative;
    background: white;
    padding: 2rem;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #999;
    line-height: 1;
}

.close-btn:hover {
    color: #333;
}

.modal h2 {
    margin-bottom: 1rem;
    color: #333;
}

.modal p {
    margin-bottom: 1.5rem;
    color: #666;
}

.modal-action {
    padding: 0.75rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 11 ==========
    {
      name: "Advanced CSS Selectors",
      desc: "Master pseudo-classes, pseudo-elements, attribute selectors, and combinators. Write powerful, specific CSS selectors.",
      exercise: "Build a styled form with advanced selectors",
      contents: [
        {
          title: "Create Form with Advanced Selectors",
          questionType: "html-css-js" as const,
          problemStatement: `Style a form using advanced CSS selectors without adding extra classes. Use pseudo-classes, pseudo-elements, attribute selectors, and combinators.`,
          instructions: `**Advanced Selector Requirements:**
- Use :focus, :hover, :invalid, :valid pseudo-classes
- Add ::before and ::after pseudo-elements
- Use attribute selectors like [type="email"]
- Apply :first-child, :last-child, :nth-child()
- Use adjacent sibling (+) and general sibling (~) combinators
- Style with :not() pseudo-class
- Add required indicator with ::after
- Style based on input state`,
          expectedOutput: `A form styled with advanced selectors:
[✓] Pseudo-classes for interactive states
[✓] Pseudo-elements for decorative content
[✓] Attribute selectors for input types
[✓] Structural pseudo-classes
[✓] Combinators for relationships
[✓] No extra classes needed`,
          hints: `[?] Advanced Selector Tips:
- input[type="email"] targets email inputs
- input:focus styles focused inputs
- input:invalid applies when validation fails
- label::after can add required asterisks
- input + label targets label after input
- :nth-child(odd) selects odd-numbered children`,
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
    <title>Advanced Selectors Form</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <form>
        <h2>Contact Form</h2>
        
        <div>
            <label for="name">Name</label>
            <input type="text" id="name" required>
        </div>
        
        <div>
            <label for="email">Email</label>
            <input type="email" id="email" required>
        </div>
        
        <div>
            <label for="phone">Phone</label>
            <input type="tel" id="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="123-456-7890">
        </div>
        
        <div>
            <label for="message">Message</label>
            <textarea id="message" rows="4" required></textarea>
        </div>
        
        <div class="checkbox-group">
            <input type="checkbox" id="newsletter" name="newsletter">
            <label for="newsletter">Subscribe to newsletter</label>
        </div>
        
        <div class="radio-group">
            <p>Preferred contact method:</p>
            <div>
                <input type="radio" id="contact-email" name="contact" value="email">
                <label for="contact-email">Email</label>
            </div>
            <div>
                <input type="radio" id="contact-phone" name="contact" value="phone">
                <label for="contact-phone">Phone</label>
            </div>
        </div>
        
        <button type="submit">Send Message</button>
    </form>
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
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

form {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* Use advanced selectors to style the form */
/* Examples: :focus, :invalid, ::before, ::after, [type="email"], :nth-child() */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Uses pseudo-classes like :focus, :hover",
              expectedOutput: "Interactive state styling",
            },
            {
              id: "2",
              description: "Uses pseudo-elements ::before or ::after",
              expectedOutput: "Generated content visible",
            },
            {
              id: "3",
              description: "Uses attribute selectors",
              expectedOutput: "Different styling per input type",
            },
            {
              id: "4",
              description: "Uses structural pseudo-classes",
              expectedOutput: "Styling based on element position",
            },
          ],
          solutionCode: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #f5f5f5;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

form {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
}

/* Targeting form divs */
form > div {
    margin-bottom: 1.5rem;
}

/* All labels */
label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
}

/* Required fields - add asterisk with ::after */
input[required] + label::after,
textarea[required] + label::after {
    content: " *";
    color: red;
}

/* Or if label comes before input */
label[for] {
    position: relative;
}

input[required] ~ label::after,
textarea[required] ~ label::after {
    content: "";
}

/* Text inputs and textarea */
input[type="text"],
input[type="email"],
input[type="tel"],
textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

/* Focus state */
input:focus,
textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Invalid state (when touched) */
input:invalid:not(:focus):not(:placeholder-shown),
textarea:invalid:not(:focus):not(:placeholder-shown) {
    border-color: #e74c3c;
}

/* Valid state */
input:valid:not(:focus):not(:placeholder-shown),
textarea:valid:not(:focus):not(:placeholder-shown) {
    border-color: #27ae60;
}

/* Email input specific styling */
input[type="email"]::placeholder {
    color: #999;
}

/* Checkbox and radio styling */
input[type="checkbox"],
input[type="radio"] {
    width: auto;
    margin-right: 0.5rem;
    cursor: pointer;
}

/* First div child of form */
form > div:first-of-type {
    margin-top: 0;
}

/* Last div before button */
form > div:last-of-type {
    margin-bottom: 1rem;
}

/* Every other form div */
form > div:nth-child(even) {
    /* Could add alternative background */
}

/* Submit button */
button[type="submit"] {
    width: 100%;
    padding: 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
}

button[type="submit"]:hover {
    background: #5568d3;
    transform: translateY(-2px);
}

button[type="submit"]:active {
    transform: translateY(0);
}

/* Not submit buttons (if any) */
button:not([type="submit"]) {
    /* Different styling */
}

/* Radio group styling */
.radio-group > div {
    display: inline-flex;
    align-items: center;
    margin-right: 1rem;
}`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 12 ==========
    {
      name: "CSS Variables and Modern Features",
      desc: "Learn CSS custom properties (variables), calc(), clamp(), and modern CSS features for maintainable stylesheets.",
      exercise: "Build a themeable dashboard with CSS variables",
      contents: [
        {
          title: "Create a Theme-Switchable Dashboard",
          questionType: "html-css-js" as const,
          problemStatement: `Build a dashboard using CSS custom properties (variables) that can switch between light and dark themes. Use modern CSS functions like calc(), clamp(), and min/max.`,
          instructions: `**Modern CSS Requirements:**
- Define CSS variables in :root for colors, spacing, fonts
- Create theme variations using CSS variables
- Use calc() for computed values
- Use clamp() for responsive font sizes
- Use min()/max() for flexible dimensions
- Organize variables in logical groups
- Demonstrate variable inheritance
- Create reusable color schemes`,
          expectedOutput: `A modern dashboard with:
[✓] CSS custom properties for theming
[✓] Light and dark color schemes
[✓] calc() for dynamic sizing
[✓] clamp() for responsive typography
[✓] Maintainable, DRY CSS
[✓] Easy theme switching`,
          hints: `[?] CSS Variables Tips:
- Define: --primary-color: #667eea;
- Use: color: var(--primary-color);
- calc(): width: calc(100% - 2rem);
- clamp(): font-size: clamp(1rem, 2vw, 2rem);
- Variables inherit down the cascade
- Can be changed with JavaScript or media queries`,
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
    <title>CSS Variables Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="theme-light">
    <div class="dashboard">
        <header class="header">
            <h1>Dashboard</h1>
            <button class="theme-toggle">🌙 Dark Mode</button>
        </header>
        
        <main class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Users</h3>
                    <p class="stat-number">1,234</p>
                    <span class="stat-change positive">+12%</span>
                </div>
                <div class="stat-card">
                    <h3>Revenue</h3>
                    <p class="stat-number">$45,678</p>
                    <span class="stat-change positive">+8%</span>
                </div>
                <div class="stat-card">
                    <h3>Orders</h3>
                    <p class="stat-number">567</p>
                    <span class="stat-change negative">-3%</span>
                </div>
                <div class="stat-card">
                    <h3>Visitors</h3>
                    <p class="stat-number">8,901</p>
                    <span class="stat-change positive">+15%</span>
                </div>
            </div>
            
            <div class="chart-section">
                <h2>Analytics Overview</h2>
                <div class="chart-placeholder">
                    Chart would go here
                </div>
            </div>
        </main>
    </div>
</body>
</html>`,
            },
            {
              name: "style.css",
              language: "css",
              readonly: false,
              content: `/* Define CSS Variables in :root and create theme variations */
/* Use calc(), clamp(), min(), max() where appropriate */

:root {
    /* Define your variables here */
    /* Example: --primary-color: #667eea; */
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Create .theme-light and .theme-dark classes with different variable values */

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Defines CSS custom properties in :root",
              expectedOutput: "Variables declared and used",
            },
            {
              id: "2",
              description: "Uses calc() for dynamic calculations",
              expectedOutput: "Computed values implemented",
            },
            {
              id: "3",
              description: "Uses clamp() for responsive sizing",
              expectedOutput: "Fluid typography or spacing",
            },
            {
              id: "4",
              description: "Light and dark theme variations",
              expectedOutput: "Two color schemes defined",
            },
          ],
          solutionCode: `/* CSS Custom Properties */
:root {
    /* Spacing */
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
    
    /* Typography */
    --font-size-sm: clamp(0.875rem, 1vw, 1rem);
    --font-size-base: clamp(1rem, 1.5vw, 1.125rem);
    --font-size-lg: clamp(1.25rem, 2vw, 1.5rem);
    --font-size-xl: clamp(1.75rem, 3vw, 2.5rem);
    
    /* Border radius */
    --radius-sm: 5px;
    --radius-md: 10px;
    --radius-lg: 15px;
}

/* Light Theme */
.theme-light {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #333333;
    --text-secondary: #666666;
    --accent-color: #667eea;
    --card-shadow: rgba(0, 0, 0, 0.1);
    --border-color: #e0e0e0;
}

/* Dark Theme */
.theme-dark {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --accent-color: #7c3aed;
    --card-shadow: rgba(0, 0, 0, 0.3);
    --border-color: #404040;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: background-color 0.3s, color 0.3s;
}

.dashboard {
    min-height: 100vh;
}

.header {
    background: var(--bg-primary);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px var(--card-shadow);
}

.header h1 {
    font-size: var(--font-size-xl);
    color: var(--accent-color);
}

.theme-toggle {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-base);
    transition: opacity 0.3s;
}

.theme-toggle:hover {
    opacity: 0.9;
}

.content {
    padding: var(--spacing-lg);
    max-width: 1400px;
    margin: 0 auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

.stat-card {
    background: var(--bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 10px var(--card-shadow);
    border: 1px solid var(--border-color);
}

.stat-card h3 {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
}

.stat-number {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--text-primary);
    margin: var(--spacing-sm) 0;
}

.stat-change {
    font-size: var(--font-size-sm);
    padding: calc(var(--spacing-xs) / 2) var(--spacing-xs);
    border-radius: var(--radius-sm);
}

.stat-change.positive {
    background: rgba(39, 174, 96, 0.1);
    color: #27ae60;
}

.stat-change.negative {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
}

.chart-section {
    background: var(--bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 10px var(--card-shadow);
    border: 1px solid var(--border-color);
}

.chart-section h2 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
}

.chart-placeholder {
    background: var(--bg-secondary);
    height: clamp(200px, 30vw, 400px);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    border: 2px dashed var(--border-color);
}`,
          order: 0,
        },
      ],
    },
  ],
};

// ==========================================
// COURSE 2: JavaScript Essentials
// ==========================================
const javascriptCourse = {
  courseId: "javascript-essentials",
  title: "JavaScript Essentials: Master Modern JS",
  description:
    "Learn JavaScript from fundamentals to advanced concepts. Master ES6+, DOM manipulation, async programming, and build interactive web applications.",
  bannerImage: "PLACEHOLDER_JAVASCRIPT_BANNER_URL", // Replace with actual image URL
  level: "beginner",
  tags: "javascript,programming,web-development,es6,frontend",
  chapters: [
    // ========== CHAPTER 1 ==========
    {
      name: "JavaScript Basics",
      desc: "Learn JavaScript fundamentals including variables, data types, operators, and basic syntax. Build your programming foundation.",
      exercise: "Create a personal info display using variables and console",
      contents: [
        {
          title: "Variables and Data Types",
          questionType: "html-css-js" as const,
          problemStatement: `Learn JavaScript variable declarations (let, const, var) and different data types (string, number, boolean, array, object). Display information in the console and on the page.`,
          instructions: `**Your Task:**
- Declare variables using let and const
- Create different data types: strings, numbers, booleans
- Create an array of hobbies
- Create an object with personal information
- Display data using console.log()
- Display data on the webpage using innerHTML
- Perform basic string concatenation and template literals`,
          expectedOutput: `Working JavaScript that:
[✓] Declares variables with let and const
[✓] Uses different data types
[✓] Creates arrays and objects
[✓] Logs information to console
[✓] Displays data on the webpage
[✓] Uses template literals`,
          hints: `[?] JavaScript Tips:
- const for values that won't change
- let for values that will change
- Template literals: \`Hello \${name}\`
- document.getElementById('id').innerHTML to update page
- Arrays: ['item1', 'item2']
- Objects: {key: 'value'}`,
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
    <title>JavaScript Basics</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>JavaScript Variables & Data Types</h1>
        <div id="output"></div>
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
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 20px;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 100%;
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
}

#output {
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 10px;
    line-height: 1.8;
}`,
            },
            {
              name: "script.js",
              language: "javascript",
              readonly: false,
              content: `// JavaScript Basics: Variables and Data Types

// TODO: Declare variables with let and const
// TODO: Create strings, numbers, booleans
// TODO: Create an array of hobbies
// TODO: Create an object with personal info
// TODO: Use console.log() to display data
// TODO: Update the #output div with your information using template literals

`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Uses const and let declarations",
              expectedOutput: "Proper variable declarations",
            },
            {
              id: "2",
              description: "Creates array and object",
              expectedOutput: "Data structures implemented",
            },
            {
              id: "3",
              description: "Uses console.log()",
              expectedOutput: "Console output visible",
            },
            {
              id: "4",
              description: "Updates webpage with innerHTML",
              expectedOutput: "Content displayed on page",
            },
          ],
          solutionCode: `// JavaScript Basics: Variables and Data Types

// String variables
const firstName = "John";
const lastName = "Doe";
let age = 25;

// Number variables
const birthYear = 1999;
const currentYear = 2026;

// Boolean
const isStudent = true;
const hasJob = false;

// Array
const hobbies = ["Coding", "Reading", "Gaming", "Photography"];

// Object
const person = {
    name: firstName + " " + lastName,
    age: age,
    city: "New York",
    occupation: "Web Developer"
};

// Console output
console.log("Name:", firstName, lastName);
console.log("Age:", age);
console.log("Hobbies:", hobbies);
console.log("Person Object:", person);

// Template literal
const greeting = \`Hello! My name is \${firstName} \${lastName} and I'm \${age} years old.\`;
console.log(greeting);

// Update the webpage
const output = document.getElementById('output');
output.innerHTML = \`
    <h2>\${person.name}</h2>
    <p><strong>Age:</strong> \${person.age}</p>
    <p><strong>City:</strong> \${person.city}</p>
    <p><strong>Occupation:</strong> \${person.occupation}</p>
    <p><strong>Is Student:</strong> \${isStudent}</p>
    <h3>Hobbies:</h3>
    <ul>
        \${hobbies.map(hobby => \`<li>\${hobby}</li>\`).join('')}
    </ul>
    <p><em>Check the console for more details!</em></p>
\`;`,
          order: 0,
        },
      ],
    },
    // Additional chapters would follow the same pattern...
    // For brevity, I'll add 2 more complete chapters and note where others would go

    // ========== CHAPTER 2 ==========
    {
      name: "Functions and Scope",
      desc: "Master JavaScript functions including declarations, expressions, arrow functions, and understanding scope and closures.",
      exercise: "Build a calculator using different function types",
      contents: [
        {
          title: "Create a Function-Based Calculator",
          questionType: "html-css-js" as const,
          problemStatement: `Build a calculator using different types of functions: function declarations, function expressions, and arrow functions. Learn about parameters, return values, and scope.`,
          instructions: `**Requirements:**
- Create function declaration for addition
- Create function expression for subtraction
- Create arrow function for multiplication
- Create arrow function for division
- Add input validation
- Display results on the page
- Use functions when buttons are clicked
- Handle division by zero`,
          expectedOutput: `A working calculator with:
[✓] Different function types
[✓] All four operations working
[✓] Input validation
[✓] Results displayed
[✓] Error handling
[✓] Button click functionality`,
          hints: `[?] Function Tips:
- Function declaration: function add(a, b) { return a + b; }
- Function expression: const subtract = function(a, b) { return a - b; };
- Arrow function: const multiply = (a, b) => a * b;
- Use parseFloat() to convert strings to numbers
- Check for division by zero before calculating`,
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
    <title>JS Calculator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="calculator">
        <h1>JavaScript Calculator</h1>
        <div class="inputs">
            <input type="number" id="num1" placeholder="First number">
            <input type="number" id="num2" placeholder="Second number">
        </div>
        <div class="buttons">
            <button onclick="performAdd()">+</button>
            <button onclick="performSubtract()">-</button>
            <button onclick="performMultiply()">×</button>
            <button onclick="performDivide()">÷</button>
        </div>
        <div id="result"></div>
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
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
}

.calculator {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 400px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5rem;
}

.inputs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
}

button {
    padding: 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #5568d3;
}

#result {
    text-align: center;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 5px;
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}`,
            },
            {
              name: "script.js",
              language: "javascript",
              readonly: false,
              content: `// Calculator Functions

// TODO: Create function declaration for addition
// function add(a, b) { ... }

// TODO: Create function expression for subtraction
// const subtract = function(a, b) { ... }

// TODO: Create arrow function for multiplication
// const multiply = (a, b) => ...

// TODO: Create arrow function for division
// const divide = (a, b) => ...

// Helper function to get input values
function getInputValues() {
    // TODO: Get values from inputs and convert to numbers
}

// Function to display result
function displayResult(value) {
    // TODO: Update the #result div
}

// Button click handlers
function performAdd() {
    // TODO: Get values, calculate, display result
}

function performSubtract() {
    // TODO: Get values, calculate, display result
}

function performMultiply() {
    // TODO: Get values, calculate, display result
}

function performDivide() {
    // TODO: Get values, calculate, display result, handle division by zero
}
`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Uses different function types",
              expectedOutput: "Declaration, expression, arrow functions",
            },
            {
              id: "2",
              description: "All operations work correctly",
              expectedOutput: "Correct math calculations",
            },
            {
              id: "3",
              description: "Handles division by zero",
              expectedOutput: "Error message displayed",
            },
            {
              id: "4",
              description: "Results displayed on page",
              expectedOutput: "Visual feedback for user",
            },
          ],
          solutionCode: `// Calculator Functions

// Function declaration for addition
function add(a, b) {
    return a + b;
}

// Function expression for subtraction
const subtract = function(a, b) {
    return a - b;
};

// Arrow function for multiplication
const multiply = (a, b) => a * b;

// Arrow function for division
const divide = (a, b) => {
    if (b === 0) {
        return "Cannot divide by zero!";
    }
    return a / b;
};

// Helper function to get input values
function getInputValues() {
    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    return { num1, num2 };
}

// Function to display result
function displayResult(value) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = value;
    
    // Add color based on result type
    if (typeof value === 'string') {
        resultDiv.style.color = '#e74c3c';
    } else {
        resultDiv.style.color = '#27ae60';
    }
}

// Validation function
function validateInputs(num1, num2) {
    if (isNaN(num1) || isNaN(num2)) {
        displayResult("Please enter valid numbers");
        return false;
    }
    return true;
}

// Button click handlers
function performAdd() {
    const { num1, num2 } = getInputValues();
    if (!validateInputs(num1, num2)) return;
    
    const result = add(num1, num2);
    displayResult(\`Result: \${result}\`);
}

function performSubtract() {
    const { num1, num2 } = getInputValues();
    if (!validateInputs(num1, num2)) return;
    
    const result = subtract(num1, num2);
    displayResult(\`Result: \${result}\`);
}

function performMultiply() {
    const { num1, num2 } = getInputValues();
    if (!validateInputs(num1, num2)) return;
    
    const result = multiply(num1, num2);
    displayResult(\`Result: \${result}\`);
}

function performDivide() {
    const { num1, num2 } = getInputValues();
    if (!validateInputs(num1, num2)) return;
    
    const result = divide(num1, num2);
    displayResult(\`Result: \${result}\`);
}

// Welcome message
displayResult("Enter two numbers and choose an operation");`,
          order: 0,
        },
      ],
    },
    // ========== CHAPTER 3 ==========
    {
      name: "DOM Manipulation",
      desc: "Learn to interact with the Document Object Model. Select elements, modify content, change styles, and create dynamic web pages.",
      exercise: "Build an interactive to-do list application",
      contents: [
        {
          title: "Create an Interactive To-Do List",
          questionType: "html-css-js" as const,
          problemStatement: `Build a fully functional to-do list application using DOM manipulation. Learn to create, read, update, and delete elements dynamically.`,
          instructions: `**DOM Manipulation Tasks:**
- Use querySelector/getElementById to select elements
- Add new tasks with createElement() and appendChild()
- Toggle task completion with classList.toggle()
- Delete tasks with removeChild()
- Update task count dynamically
- Store tasks in an array
- Clear completed tasks
- Add event listeners to buttons`,
          expectedOutput: `A working to-do list with:
[✓] Add new tasks
[✓] Mark tasks as complete
[✓] Delete individual tasks
[✓] Clear all completed tasks
[✓] Task counter
[✓] Visual feedback for actions`,
          hints: `[?] DOM Tips:
- document.querySelector('#id') or ('.class')
- element.classList.add/remove/toggle()
- element.createElement('tag')
- parent.appendChild(child)
- element.addEventListener('click', function)
- element.remove() to delete element`,
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
    <title>To-Do List</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>My To-Do List</h1>
        <div class="input-section">
            <input type="text" id="taskInput" placeholder="Add a new task...">
            <button id="addBtn">Add Task</button>
        </div>
        <div class="stats">
            <span id="totalTasks">Total: 0</span>
            <span id="completedTasks">Completed: 0</span>
            <button id="clearBtn">Clear Completed</button>
        </div>
        <ul id="taskList"></ul>
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
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    margin: 0;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 500px;
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 1.5rem;
}

.input-section {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

#taskInput {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
}

#addBtn {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
}

#addBtn:hover {
    background: #5568d3;
}

.stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 5px;
}

.stats span {
    font-size: 0.9rem;
    color: #666;
}

#clearBtn {
    padding: 0.5rem 1rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
}

#clearBtn:hover {
    background: #c0392b;
}

#taskList {
    list-style: none;
    padding: 0;
}

.task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 5px;
    margin-bottom: 0.5rem;
    transition: all 0.3s;
}

.task-item:hover {
    background: #f0f0f0;
}

.task-item.completed {
    opacity: 0.6;
}

.task-item.completed .task-text {
    text-decoration: line-through;
    color: #999;
}

.task-text {
    flex: 1;
    cursor: pointer;
}

.delete-btn {
    padding: 0.5rem 1rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.delete-btn:hover {
    background: #c0392b;
}`,
            },
            {
              name: "script.js",
              language: "javascript",
              readonly: false,
              content: `// To-Do List Application

// TODO: Get references to DOM elements
// const taskInput = document.getElementById('taskInput');
// const addBtn = ...
// const taskList = ...
// etc.

// TODO: Create array to store tasks
// let tasks = [];

// TODO: Function to render tasks
// function renderTasks() { ... }

// TODO: Function to add new task
// function addTask() { ... }

// TODO: Function to toggle task completion
// function toggleTask(index) { ... }

// TODO: Function to delete task
// function deleteTask(index) { ... }

// TODO: Function to clear completed tasks
// function clearCompleted() { ... }

// TODO: Function to update stats
// function updateStats() { ... }

// TODO: Add event listeners
// addBtn.addEventListener('click', addTask);
// taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
`,
            },
          ],
          testCases: [
            {
              id: "1",
              description: "Can add new tasks",
              expectedOutput: "Tasks appear in list",
            },
            {
              id: "2",
              description: "Can toggle task completion",
              expectedOutput: "Tasks get strikethrough when clicked",
            },
            {
              id: "3",
              description: "Can delete individual tasks",
              expectedOutput: "Task removed from list",
            },
            {
              id: "4",
              description: "Statistics update correctly",
              expectedOutput: "Counters show accurate numbers",
            },
          ],
          solutionCode: `// To-Do List Application

// Get references to DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const clearBtn = document.getElementById('clearBtn');

// Array to store tasks
let tasks = [];

// Function to render all tasks
function renderTasks() {
    // Clear existing list
    taskList.innerHTML = '';
    
    // Render each task
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = \`task-item \${task.completed ? 'completed' : ''}\`;
        
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;
        span.addEventListener('click', () => toggleTask(index));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(index));
        
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
    
    updateStats();
}

// Function to add new task
function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    tasks.push({
        text: text,
        completed: false
    });
    
    taskInput.value = '';
    renderTasks();
}

// Function to toggle task completion
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

// Function to delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

// Function to clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
}

// Function to update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    
    totalTasksEl.textContent = \`Total: \${total}\`;
    completedTasksEl.textContent = \`Completed: \${completed}\`;
}

// Event listeners
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

clearBtn.addEventListener('click', clearCompleted);

// Initial render
renderTasks();`,
          order: 0,
        },
      ],
    },
    // Chapters 4-10 would follow similar patterns with topics like:
    // - Arrays and Array Methods (map, filter, reduce)
    // - Objects and Object Methods
    // - Conditional Statements and Loops
    // - Events and Event Handling
    // - Async JavaScript (Promises, Async/Await)
    // - Fetch API and AJAX
    // - ES6+ Features (Destructuring, Spread, etc.)
    // For brevity in this response, I'm showing the structure but not implementing all chapters
  ],
};

// ==========================================
// SEEDING LOGIC
// ==========================================
async function seedWebDevCourses() {
  try {
    console.log("🌱 Starting Web Development Courses Seeding...\n");
    console.log("=" + "=".repeat(50));

    const courses = [htmlCssCourse, javascriptCourse];
    let totalChaptersCreated = 0;
    let totalContentsCreated = 0;

    for (const courseData of courses) {
      console.log(`\n📚 Processing Course: ${courseData.title}`);
      console.log(`   Course ID: ${courseData.courseId}`);
      console.log(`   Level: ${courseData.level}`);
      console.log(`   Chapters: ${courseData.chapters.length}\n`);

      // First, create or update the course
      const existingCourse = await db
        .select()
        .from(CourseTable)
        .where(eq(CourseTable.courseId, courseData.courseId))
        .then((courses) => courses[0]);

      if (!existingCourse) {
        await db.insert(CourseTable).values({
          courseId: courseData.courseId,
          title: courseData.title,
          description: courseData.description,
          bannerImage: courseData.bannerImage,
          level: courseData.level,
          tags: courseData.tags,
        });
        console.log(`   ✅ Created course: ${courseData.title}`);
      } else {
        console.log(`   ℹ️  Course already exists: ${courseData.title}`);
      }

      // Process each chapter
      for (const chapter of courseData.chapters) {
        console.log(`\n   📖 Chapter: ${chapter.name}`);

        // Check if chapter exists
        const existingChapter = await db
          .select()
          .from(CourseChapterTable)
          .where(eq(CourseChapterTable.courseId, courseData.courseId))
          .then((chapters) => chapters.find((ch) => ch.name === chapter.name));

        let chapterId;

        if (!existingChapter) {
          const [newChapter] = await db
            .insert(CourseChapterTable)
            .values({
              courseId: courseData.courseId,
              name: chapter.name,
              desc: chapter.desc,
              exercise: chapter.exercise || null,
            })
            .returning();

          chapterId = newChapter.id;
          totalChaptersCreated++;
          console.log(`      ✅ Created chapter: ${chapter.name}`);
        } else {
          chapterId = existingChapter.id;
          console.log(`      ℹ️  Chapter already exists: ${chapter.name}`);
        }

        // Insert chapter contents
        for (const content of chapter.contents) {
          await db.insert(ChapterContentTable).values({
            chapterId: chapterId,
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

          totalContentsCreated++;
          console.log(`         ✔ Created content: ${content.title}`);
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`\n🎉 Seeding Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Courses processed: ${courses.length}`);
    console.log(`   - New chapters created: ${totalChaptersCreated}`);
    console.log(`   - Total contents created: ${totalContentsCreated}`);
    console.log(
      `\n💡 Remember to replace PLACEHOLDER image URLs with actual image links!`,
    );
    console.log("=" + "=".repeat(50) + "\n");
  } catch (error) {
    console.error("❌ Error seeding content:", error);
    throw error;
  }
}

// Run the seeding
seedWebDevCourses()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
