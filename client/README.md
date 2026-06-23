# 💻 Next.js 15 Web Client

This is the Next.js frontend web application for the Premium MERN Stack E-Commerce system. It features a modern dark design theme built around glassmorphic components, high-fidelity custom CSS skeleton loaders, and responsive layouts.

---

## 🚀 Key Technologies
* **Framework:** [Next.js 15.5](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (`react-redux` integration for centralized user authentication, cart persistence, and checkout states)
* **Styling:** [TailwindCSS v4](https://tailwindcss.com/) using variables mapping to premium midnight dark and vibrant indigo values.
* **Notifications:** [React Hot Toast](https://react-hot-toast.com/) for fluid, non-blocking toast notifications.

---

## 🎨 UI & Design Principles
* **Glassmorphism:** Elegant semi-transparent cards using `backdrop-blur` and custom borders to stand out against a dark-slate gradient background.
* **Premium Shimmer Skeletons:** High-fidelity custom CSS loading skeletons (using pure CSS `@keyframes shimmer` animations) mapped directly to product details, tables, and card lists to deliver an industry-standard load experience.
* **Password Toggles:** Forms (Login/Register) feature absolute-positioned eye/eye-off toggle icons to securely inspect and verify typed password parameters before submission.
* **Fully Responsive:** Multi-column grid architectures scaling fluidly across mobile, tablet, and desktop monitors.

---

## 📂 Project Structure
```
├── src/
│   ├── app/                 # Next.js App Router Pages
│   │   ├── admin/           # Admin Dashboard & Entity Management
│   │   ├── cart/            # Cart Summary Page
│   │   ├── checkout/        # Stripe/Mock Checkout & Order Placement
│   │   ├── login/           # User Authentication Sign-In
│   │   ├── register/        # User Account Sign-Up
│   │   ├── products/        # Product Catalog & Detail View
│   │   ├── profile/         # User Profile & Orders History
│   │   ├── globals.css      # Core styles & Tailwind directives
│   │   └── layout.tsx       # Global layout definition
│   ├── components/          # Reusable UI Elements (Header, Footer, Shimmers, Modals)
│   ├── store/               # Redux Slices & Store Configurations
│   └── utils/               # Axios instances & Toast handlers
├── next.config.js           # Next.js configuration (Standalone output targets)
└── package.json             # Build commands & dependencies
```

---

## ⚡ Development & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Production Build & Compilation
The application uses the `standalone` build configuration in Next.js. This optimizes the distribution package size by tracing dependencies and compiling only the runtime-required modules, greatly reducing the Docker container footprint.
```bash
npm run build
```

### 4. Running the Built Production App
```bash
npm start
```
