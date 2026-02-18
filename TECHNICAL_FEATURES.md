# Technical Features & Concepts Used

Here is a list of the advanced web development concepts used in your project. You can mention these during your review/viva.

## 1. Core Architecture: **Single Page Application (SPA)**
- **What it is**: The website loads only once (index.html), and subsequent interactions (like changing pages) are handled by JavaScript without refreshing the browser.
- **Library Used**: `react-router-dom` (Version 6).
- **Benefit**: Extremely fast navigation and app-like feel.

## 2. Layout & Styling: **Modern CSS**
- **Flexbox**: Used extensively for aligning elements (Navbar, Sidebar, Cards).
  - Example: `flex justify-between items-center`
- **CSS Grid**: Used for responsive layouts (Manage Books inventory, Dashboard stats).
  - Example: `grid grid-cols-1 md:grid-cols-3 gap-6` (Mobile-First Responsive Design)
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design system.

## 3. State Management: **React Hooks**
- **`useState`**: Used for tracking form inputs, loading states, and toggles (e.g., active tab in Booking Requests).
- **`useEffect`**: Used for side effects like data fetching on component mount (e.g., loading book lists when Manage Books page opens).
- **`useRef`**: Used for direct DOM manipulation (e.g., generating QR codes on canvas).
- **Custom Logic**: Authentication state management (Login/Logout flow).

## 4. Data Persistence: **LocalStorage API**
- **How it works**: Data (Books, Members, Reservations) is saved directly in the user's browser storage. This simulates a real database without needing a backend server for the prototype.
- **Advantage**: Data survives page refreshes.

## 5. Components & Reusability
- **Modular Design**: Code is split into reusable components (Navbar, Sidebar, Layout) to follow DRY (Don't Repeat Yourself) principles.
- **Protected Routes**: Higher-Order Components (HOC) used to secure Admin pages from unauthorized access.

## 6. Advanced JavaScript Features
- **Map/Filter/Reduce**: Used for searching books, calculating fines, and filtering overdue items.
- **Async/Await Simulation**: `setTimeout` used to simulate network delays for realistic loading spinners.
- **Destructuring**: Used for clean props and state access.
