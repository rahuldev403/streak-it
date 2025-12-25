import { db } from "@/app/config/db";
import { CourseChapterTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";

// Sample chapter data
const sampleChapters = [
  // =========================================
  // COURSE: HTML & CSS FOUNDATIONS (1-12)
  // =========================================
  {
    courseId: "web-foundations",
    name: "Semantic HTML Structure",
    desc: "Learn the importance of semantic tags like header, main, section, and footer for SEO and accessibility.",
    exercise:
      "Create a standard blog post layout using <article>, <header>, <section> for content, and <footer> tags, without using a single <div>.",
  },
  {
    courseId: "web-foundations",
    name: "Forms and Inputs",
    desc: "Master user input collection using standard HTML5 form elements and attributes.",
    exercise:
      "Build a 'Contact Us' form with required fields for email, a dropdown for 'Reason', and a textarea for the message. Add a submit button.",
  },
  {
    courseId: "web-foundations",
    name: "The CSS Box Model",
    desc: "Understand margins, borders, padding, and content areas. This is the foundation of layout.",
    exercise:
      "Create three colored boxes where one uses 'content-box', one uses 'border-box', and demonstrate the size difference using padding.",
  },
  {
    courseId: "web-foundations",
    name: "Flexbox Navigation",
    desc: "Learn to align items horizontally and vertically using CSS Flexbox.",
    exercise:
      "Build a responsive navbar with a logo on the far left and navigation links on the far right using 'justify-content: space-between'.",
  },
  {
    courseId: "web-foundations",
    name: "CSS Grid: Holy Grail Layout",
    desc: "Use CSS Grid to create complex 2-dimensional layouts with ease.",
    exercise:
      "Create a 'Holy Grail' layout (Header, Left Sidebar, Main Content, Right Sidebar, Footer) using 'display: grid' and named grid areas.",
  },
  {
    courseId: "web-foundations",
    name: "Media Queries & Responsive Design",
    desc: "Make your website adapt to different screen sizes using CSS media queries.",
    exercise:
      "Create a 3-column card layout that stacks into a single column when the screen width is below 768px.",
  },
  {
    courseId: "web-foundations",
    name: "CSS Transitions",
    desc: "Add polish to your UI with smooth state changes.",
    exercise:
      "Create a button that changes background color and scales up by 10% smoothly over 0.3s when hovered.",
  },
  {
    courseId: "web-foundations",
    name: "Pseudo-classes",
    desc: "Style elements based on their state (hover, focus, nth-child).",
    exercise:
      "Create a list of 10 items where every even item has a grey background and the first item has bold text using :nth-child and :first-child.",
  },
  {
    courseId: "web-foundations",
    name: "Positioning",
    desc: "Master relative, absolute, fixed, and sticky positioning.",
    exercise:
      "Create a container with relative positioning and place a 'New' badge in the top-right corner using absolute positioning.",
  },
  {
    courseId: "web-foundations",
    name: "CSS Variables",
    desc: "Learn to use Custom Properties for theming and maintainability.",
    exercise:
      "Define --primary-color and --spacing variables at the :root level and use them to style a card component.",
  },
  {
    courseId: "web-foundations",
    name: "Images and Object Fit",
    desc: "Control how images behave within their containers.",
    exercise:
      "Create a gallery of square divs. Place non-square images inside them and use 'object-fit: cover' to ensure they fill the square without distortion.",
  },
  {
    courseId: "web-foundations",
    name: "Shadows and Gradients",
    desc: "Add depth and texture to your designs.",
    exercise:
      "Create a card with a linear-gradient background and a soft box-shadow that creates a 'floating' effect.",
  },

  // =========================================
  // COURSE: JAVASCRIPT MASTERY (13-27)
  // =========================================
  {
    courseId: "js-mastery",
    name: "Variables and Data Types",
    desc: "Understand let, const, and the difference between primitives and objects.",
    exercise:
      "Create a script that swaps two variables without creating a third temporary variable (using destructuring or math).",
  },
  {
    courseId: "js-mastery",
    name: "Array Manipulation (Map/Filter)",
    desc: "Transform data arrays using modern ES6 array methods.",
    exercise:
      "Given an array of product objects, use .filter() to find items under $50 and .map() to return a list of their names.",
  },
  {
    courseId: "js-mastery",
    name: "DOM Manipulation: Selectors",
    desc: "Learn how to grab HTML elements via JavaScript.",
    exercise:
      "Select all paragraphs on the page and append the text '(Read)' to the end of their content using a loop.",
  },
  {
    courseId: "js-mastery",
    name: "DOM Events: Click Handling",
    desc: "Make your page interactive by listening to user actions.",
    exercise:
      "Create a button that, when clicked, generates a random background color for the document body.",
  },
  {
    courseId: "js-mastery",
    name: "ES6 Arrow Functions",
    desc: "Write cleaner and more concise functions.",
    exercise:
      "Convert three standard named functions into arrow functions, including one that returns an implicit object.",
  },
  {
    courseId: "js-mastery",
    name: "Fetch API & JSON",
    desc: "Get data from external APIs asynchronously.",
    exercise:
      "Fetch user data from 'https://jsonplaceholder.typicode.com/users/1' and display the name and email on the DOM.",
  },
  {
    courseId: "js-mastery",
    name: "Async/Await",
    desc: "Handle asynchronous code in a readable, synchronous-looking manner.",
    exercise:
      "Write an async function that fetches a list of posts, awaits the response, and logs the number of posts received.",
  },
  {
    courseId: "js-mastery",
    name: "Local Storage",
    desc: "Persist data in the user's browser.",
    exercise:
      "Create a text input. Save the value to LocalStorage on change. When the page reloads, pre-fill the input with the saved value.",
  },
  {
    courseId: "js-mastery",
    name: "Array Reduce",
    desc: "The most powerful array method for aggregating data.",
    exercise:
      "Given an array of transactions (positive and negative numbers), use .reduce() to calculate the final account balance.",
  },
  {
    courseId: "js-mastery",
    name: "Object Destructuring",
    desc: "Extract values from objects efficiently.",
    exercise:
      "Create a function that takes a complex nested user object and destructures out the 'city' from inside the 'address' property.",
  },
  {
    courseId: "js-mastery",
    name: "Event Bubbling & Delegation",
    desc: "Understand how events travel through the DOM tree.",
    exercise:
      "Attach a single click listener to a parent <ul> to handle clicks for all dynamic <li> children.",
  },
  {
    courseId: "js-mastery",
    name: "Promises",
    desc: "Understand the underlying logic of async operations.",
    exercise:
      "Create a custom Promise that resolves after 2 seconds with the message 'Success!' and handle it with .then().",
  },
  {
    courseId: "js-mastery",
    name: "Modules (Import/Export)",
    desc: "Organize code into reusable files.",
    exercise:
      "Create a utility math library with named exports (add, subtract) and import them into a main script to calculate a value.",
  },
  {
    courseId: "js-mastery",
    name: "Spread & Rest Operators",
    desc: "Manipulate arrays and objects dynamically.",
    exercise:
      "Merge two arrays of numbers and add a new number at the end using the spread operator [...arr1, ...arr2, 5].",
  },
  {
    courseId: "js-mastery",
    name: "Form Validation Logic",
    desc: "Validate user input before sending it to a server.",
    exercise:
      "Write a script that disables the 'Submit' button unless the password field is at least 8 characters long.",
  },

  // =========================================
  // COURSE: REACT ESSENTIALS (28-42)
  // =========================================
  {
    courseId: "react-essentials",
    name: "Introduction to JSX",
    desc: "Learn how React mixes HTML and JavaScript.",
    exercise:
      "Create a variable 'const title = 'React'' and render it inside an <h1> tag using curly braces.",
  },
  {
    courseId: "react-essentials",
    name: "Components & Props",
    desc: "Building reusable UI blocks.",
    exercise:
      "Create a 'Button' component that accepts 'label' and 'color' as props and applies the color to the style.",
  },
  {
    courseId: "react-essentials",
    name: "useState Hook: Counter",
    desc: "Managing local component state.",
    exercise:
      "Build a counter with 'Increment' and 'Decrement' buttons. Prevent the counter from going below zero.",
  },
  {
    courseId: "react-essentials",
    name: "Conditional Rendering",
    desc: "Showing different UI based on state.",
    exercise:
      "Create a component that shows a 'Login' button if isLoggedIn is false, and a 'Welcome User' message if true.",
  },
  {
    courseId: "react-essentials",
    name: "Rendering Lists",
    desc: "Mapping arrays to UI elements.",
    exercise:
      "Given an array of fruits, render an unordered list (<ul>) where each fruit is an <li> with a unique key.",
  },
  {
    courseId: "react-essentials",
    name: "Handling Forms",
    desc: "Controlled components in React.",
    exercise:
      "Create a controlled input field where the value is stored in state. Display the live character count below the input.",
  },
  {
    courseId: "react-essentials",
    name: "useEffect: Mounting",
    desc: "Running code when a component loads.",
    exercise:
      "Use useEffect with an empty dependency array to log 'Component Mounted' only once when the page loads.",
  },
  {
    courseId: "react-essentials",
    name: "useEffect: Cleanup",
    desc: "Cleaning up listeners or timers.",
    exercise:
      "Set up a setInterval in useEffect that increments a timer every second. Clear the interval in the return function.",
  },
  {
    courseId: "react-essentials",
    name: "Styling: Modules",
    desc: "Scoped CSS for components.",
    exercise:
      "Create a 'Card' component and style it using a standard CSS object variable (inline styles) passed to the style prop.",
  },
  {
    courseId: "react-essentials",
    name: "Lifting State Up",
    desc: "Sharing state between sibling components.",
    exercise:
      "Create two sibling components: an InputField and a DisplayText. Manage the state in the parent so typing in the Input updates the Display.",
  },
  {
    courseId: "react-essentials",
    name: "Fragment",
    desc: "Grouping elements without extra nodes.",
    exercise:
      "Return two adjacent header elements (h1 and h2) from a component using <React.Fragment> or <>.",
  },
  {
    courseId: "react-essentials",
    name: "Children Prop",
    desc: "Creating wrapper components.",
    exercise:
      "Create a 'Layout' component that renders a Navbar, then {children}, then a Footer. Wrap your main content in it.",
  },
  {
    courseId: "react-essentials",
    name: " useRef Hook",
    desc: "Accessing DOM elements directly.",
    exercise:
      "Create a button that, when clicked, automatically focuses on a specific input field using useRef.",
  },
  {
    courseId: "react-essentials",
    name: "Custom Hooks",
    desc: "Reusing logic across components.",
    exercise:
      "Create a simple hook useToggle that returns a boolean state and a function to toggle it. Use it to show/hide a modal.",
  },
  {
    courseId: "react-essentials",
    name: "Context API Basics",
    desc: "Avoiding prop drilling.",
    exercise:
      "Create a ThemeContext with 'light' and 'dark' values. Consume it in a button component to change its background color.",
  },

  // =========================================
  // COURSE: REACT ADVANCED (43-57)
  // =========================================
  {
    courseId: "react-advanced",
    name: "useReducer Hook",
    desc: "Complex state management logic.",
    exercise:
      "Refactor a counter to use useReducer with actions 'INCREMENT', 'DECREMENT', and 'RESET' instead of useState.",
  },
  {
    courseId: "react-advanced",
    name: "useMemo Performance",
    desc: "Memoizing expensive calculations.",
    exercise:
      "Create a component that filters a large list. Wrap the filtering logic in useMemo so it only runs when the query changes.",
  },
  {
    courseId: "react-advanced",
    name: "useCallback",
    desc: "Memoizing functions to prevent re-renders.",
    exercise:
      "Pass a function to a memoized child component. Wrap the function in useCallback to ensure the child doesn't re-render unnecessarily.",
  },
  {
    courseId: "react-advanced",
    name: "React.memo",
    desc: "Optimizing child components.",
    exercise:
      "Create a child component that receives a 'label' prop. Wrap it in React.memo and prove it doesn't re-render when the parent state changes.",
  },
  {
    courseId: "react-advanced",
    name: "Portals",
    desc: "Rendering outside the DOM hierarchy.",
    exercise:
      "Create a Modal component that renders its content into a 'modal-root' div outside the main app root using createPortal.",
  },
  {
    courseId: "react-advanced",
    name: "Error Boundaries",
    desc: "Handling crashes gracefully.",
    exercise:
      "Create an ErrorBoundary class component that displays a 'Something went wrong' UI if a child component throws an error.",
  },
  {
    courseId: "react-advanced",
    name: "Code Splitting (Lazy)",
    desc: "Loading components on demand.",
    exercise:
      "Use React.lazy and Suspense to load a 'HeavyChart' component only when the user clicks a 'Show Chart' button.",
  },
  {
    courseId: "react-advanced",
    name: "Higher Order Components (HOC)",
    desc: "Enhancing components with functions.",
    exercise:
      "Create a withAuth HOC that checks if a user is logged in. If not, render a Login component; otherwise, render the wrapped component.",
  },
  {
    courseId: "react-advanced",
    name: "Compound Components",
    desc: "Advanced component patterns.",
    exercise:
      "Build a Toggle component that works like <Toggle><Toggle.On>On</Toggle.On><Toggle.Off>Off</Toggle.Off><Toggle.Button /></Toggle>.",
  },
  {
    courseId: "react-advanced",
    name: "useLayoutEffect",
    desc: "Synchronous DOM updates.",
    exercise:
      "Use useLayoutEffect to measure the width of a generic div immediately after it renders and display the pixel width inside it.",
  },
  {
    courseId: "react-advanced",
    name: "Custom Hook: useFetch",
    desc: "Abstraction for API calls.",
    exercise:
      "Build a useFetch hook that accepts a URL and returns { data, loading, error }. Use it to load a list of users.",
  },
  {
    courseId: "react-advanced",
    name: "Formik or React Hook Form",
    desc: "Professional form handling.",
    exercise:
      "Implement a form with email and password validation using the 'react-hook-form' library approach (simulate or use basic logic).",
  },
  {
    courseId: "react-advanced",
    name: "Virtualization",
    desc: "Handling massive lists.",
    exercise:
      "Create a list component that renders 10,000 items but only displays the ones currently in the viewport (conceptually).",
  },
  {
    courseId: "react-advanced",
    name: "Forward Ref",
    desc: "Passing refs through components.",
    exercise:
      "Create a custom 'FancyInput' component and use React.forwardRef so the parent can access the underlying input DOM node.",
  },
  {
    courseId: "react-advanced",
    name: "Transition API",
    desc: "Prioritizing UI updates.",
    exercise:
      "Use useTransition to mark a state update (like filtering a large list) as non-urgent to keep the UI responsive.",
  },

  // =========================================
  // COURSE: TAILWIND & STYLING (58-67)
  // =========================================
  {
    courseId: "styling-mastery",
    name: "Tailwind: Utility First",
    desc: "Building without writing CSS files.",
    exercise:
      "Build a card component using only Tailwind classes (e.g., bg-white, p-6, rounded-lg, shadow-md).",
  },
  {
    courseId: "styling-mastery",
    name: "Tailwind: Responsive",
    desc: "Mobile-first modifiers.",
    exercise:
      "Create a grid that is 1 column on mobile (grid-cols-1), 2 on tablet (md:grid-cols-2), and 4 on desktop (lg:grid-cols-4).",
  },
  {
    courseId: "styling-mastery",
    name: "Tailwind: Hover & Focus",
    desc: "State variants.",
    exercise:
      "Style a button that is blue (bg-blue-500), turns dark blue on hover (hover:bg-blue-700), and has a ring on focus.",
  },
  {
    courseId: "styling-mastery",
    name: "Tailwind: Dark Mode",
    desc: "Supporting system themes.",
    exercise:
      "Create a text block that is black on white in light mode, but white on gray (dark:bg-gray-800) in dark mode.",
  },
  {
    courseId: "styling-mastery",
    name: "CSS Modules",
    desc: "Local scoping for vanilla CSS.",
    exercise:
      "Create a button.module.css file, define a .btn class, and import it into a React component to apply the style.",
  },
  {
    courseId: "styling-mastery",
    name: "Styled Components",
    desc: "CSS-in-JS basics.",
    exercise:
      "Create a styled.button component that accepts a 'primary' prop to toggle background color between blue and gray.",
  },
  {
    courseId: "styling-mastery",
    name: "Tailwind: Flex & Grid",
    desc: "Layout utilities.",
    exercise:
      "Create a sidebar layout using 'flex h-screen' where the sidebar is fixed width and the main content takes 'flex-1'.",
  },
  {
    courseId: "styling-mastery",
    name: "Tailwind: Arbitrary Values",
    desc: "Breaking out of the design system.",
    exercise:
      "Use square bracket notation to set a specific width on an element, e.g., w-[345px] and a specific hex color text-[#1da1f2].",
  },
  {
    courseId: "styling-mastery",
    name: "Animation",
    desc: "Keyframe animations.",
    exercise:
      "Use Tailwind's animate-bounce or animate-spin to create a loading spinner component.",
  },
  {
    courseId: "styling-mastery",
    name: "Clsx or Tailwind-Merge",
    desc: "Conditional class merging.",
    exercise:
      "Create a function that conditionally applies 'bg-red-500' if an error prop is true, merging it with base classes.",
  },

  // =========================================
  // COURSE: TYPESCRIPT (68-77)
  // =========================================
  {
    courseId: "typescript-core",
    name: "Basic Types",
    desc: "Typing variables and functions.",
    exercise:
      "Create a function 'add' that accepts two arguments typed as numbers and returns a number. Try passing a string to see the error.",
  },
  {
    courseId: "typescript-core",
    name: "Interfaces vs Types",
    desc: "Defining object shapes.",
    exercise:
      "Define an Interface for a 'User' with name, age, and an optional email. Create an object that adheres to this interface.",
  },
  {
    courseId: "typescript-core",
    name: "Union Types",
    desc: "Allowing multiple types.",
    exercise:
      "Create a function 'printId' that accepts an ID that can be either a number OR a string.",
  },
  {
    courseId: "typescript-core",
    name: "Enums",
    desc: "Named constants.",
    exercise:
      "Create an Enum 'Status' (Pending, Active, Closed). Use it to type a status variable in a simplified task object.",
  },
  {
    courseId: "typescript-core",
    name: "Generics",
    desc: "Reusable type logic.",
    exercise:
      "Create a generic function 'identity<T>' that takes an argument of type T and returns it. Test it with a string and a number.",
  },
  {
    courseId: "typescript-core",
    name: "React Props with TS",
    desc: "Typing components.",
    exercise:
      "Create a React component using 'FC' (Functional Component) generic, defining props for title (string) and count (number).",
  },
  {
    courseId: "typescript-core",
    name: "Event Types",
    desc: "Handling DOM events safely.",
    exercise:
      "Create a form submit handler. Type the event argument as 'React.FormEvent' to access preventDefault() safely.",
  },
  {
    courseId: "typescript-core",
    name: "Utility Types: Partial & Pick",
    desc: "Transforming existing types.",
    exercise:
      "Given a complete User type, create a type 'UserPreview' that uses Pick to only select the name and avatar fields.",
  },
  {
    courseId: "typescript-core",
    name: "Type Narrowing",
    desc: "Working with unions safely.",
    exercise:
      "Write a function that takes 'string | number'. If it's a string, return .toUpperCase(); if a number, return .toFixed(2).",
  },
  {
    courseId: "typescript-core",
    name: "Async Return Types",
    desc: "Typing promises.",
    exercise:
      "Create an async function that returns a Promise<User>. defining what the User structure looks like.",
  },

  // =========================================
  // COURSE: NEXT.JS MASTERY (78-92)
  // =========================================
  {
    courseId: "next-js-mastery",
    name: "File Based Routing",
    desc: "Understanding the App Router.",
    exercise:
      "Create a folder structure for a website with a Home page, an About page, and a Contact page using page.tsx files.",
  },
  {
    courseId: "next-js-mastery",
    name: "Dynamic Routes",
    desc: "Handling variable URLs.",
    exercise:
      "Create a dynamic route folder [id] that captures the product ID from the URL and displays it on the page.",
  },
  {
    courseId: "next-js-mastery",
    name: "Layouts and Templates",
    desc: "Sharing UI across routes.",
    exercise:
      "Create a RootLayout that includes a navbar and footer. Create a specific DashboardLayout that adds a sidebar only for dashboard routes.",
  },
  {
    courseId: "next-js-mastery",
    name: "Link Component",
    desc: "Client-side navigation.",
    exercise:
      "Replace standard <a> tags with the Next.js <Link> component to navigate between the Home and About pages without a hard refresh.",
  },
  {
    courseId: "next-js-mastery",
    name: "Server Components vs Client Components",
    desc: "Optimizing rendering.",
    exercise:
      "Create a server component that fetches data from an API and a client component that uses useState to manage a counter.",
  },
  // =========================================
  // COURSE: BACKEND & DATABASE (93-97)
  // =========================================
  {
    courseId: "fullstack-backend",
    name: "Prisma Schema",
    desc: "Defining data models.",
    exercise:
      "Define a Prisma schema for a 'Post' model with title, content, published boolean, and a relation to a 'User'.",
  },
  {
    courseId: "fullstack-backend",
    name: "Prisma CRUD",
    desc: "Database operations.",
    exercise:
      "Write a script using Prisma Client to create a new user and then fetch all users from the database.",
  },
  {
    courseId: "fullstack-backend",
    name: "JWT Authentication",
    desc: "Securing routes.",
    exercise:
      "Create a function that generates a JSON Web Token (JWT) given a payload (userId) and a secret key.",
  },
  {
    courseId: "fullstack-backend",
    name: "Hashing Passwords",
    desc: "Security best practices.",
    exercise:
      "Use bcrypt (or similar logic) to hash a password string and then compare a plain text password against the hash.",
  },
  {
    courseId: "fullstack-backend",
    name: "REST API Design",
    desc: "Structuring endpoints.",
    exercise:
      "Design the logic for a PUT /users/:id endpoint that updates specific fields of a user profile.",
  },

  // =========================================
  // COURSE: CAPSTONE PROJECTS (98-102)
  // =========================================
  {
    courseId: "capstone-projects",
    name: "To-Do App with Drag & Drop",
    desc: "Complex interaction project.",
    exercise:
      "Build a Kanban-style board where you can drag tasks between 'Todo', 'In Progress', and 'Done' columns.",
  },
  {
    courseId: "capstone-projects",
    name: "Real-time Chat UI",
    desc: "Layout and state challenge.",
    exercise:
      "Create a chat interface. When the user types and hits enter, add the message to the list. Scroll to bottom automatically on new message.",
  },
  {
    courseId: "capstone-projects",
    name: "E-commerce Cart Logic",
    desc: "State management challenge.",
    exercise:
      "Build a cart system where adding a duplicate item increases quantity instead of adding a new row. Calculate total price dynamically.",
  },
  {
    courseId: "capstone-projects",
    name: "Infinite Scroll Gallery",
    desc: "Performance and API challenge.",
    exercise:
      "Build an image gallery that fetches 10 more images automatically when the user scrolls to the bottom of the page.",
  },
  {
    courseId: "capstone-projects",
    name: "Dashboard with Charts",
    desc: "Data visualization.",
    exercise:
      "Create a dashboard layout containing a bar chart (using a library like Recharts or CSS bars) visualizing monthly sales data.",
  },
];

export const GET = async (req: NextRequest) => {
  try {
    
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    const result = await db
      .insert(CourseChapterTable)
      .values(sampleChapters)
      .returning();

    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${result.length} chapters into the database!`,
      chapters: result,
    });
  } catch (error) {
    console.error("Error inserting chapters:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to insert chapters. They might already exist.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
