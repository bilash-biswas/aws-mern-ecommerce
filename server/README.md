# ⚙️ Express.js & TypeScript Backend Server

This directory contains the production-grade, secure REST API server powering the MERN Stack E-Commerce ecosystem.

---

## 🔒 Security & Request Handling Pipeline
The backend is structured around a strict middleware hierarchy ensuring secure execution and minimal vulnerability surface area:
1. **Helmet Security Headers:** Restricts script execution contexts, prevents clickjacking, and enforces transport security configurations.
2. **Rate Limiting:** Protects `/api/users/login` and `/api/users/register` routes from automated brute-force scripts (100 requests per 15-minute window).
3. **Zod Validator:** Intercepts and parses requests before controllers execute. Invalid formats fail fast at the boundary and return clean, standardized structured JSON responses detailing parameter failures.
4. **JWT Authentication:** Securely extracts and verifies client tokens for protected routes.

---

## 📂 Core Structure
```
├── src/
│   ├── config/          # Database connection details & environment parsers
│   ├── controllers/     # Business logic & DB query orchestrators
│   ├── middleware/      # Authentication, Helmet, Rate Limiter, and Zod validator
│   ├── models/          # Mongoose ODM schemas (User, Product, Order)
│   ├── routes/          # API route definitions
│   ├── scripts/         # Data seeding & setup scripts
│   ├── validation/      # Zod validation schemas
│   └── index.ts         # Server bootstrapper & global config application
├── tsconfig.json        # TypeScript compile properties
└── package.json         # Scripts, compiler steps, and dependencies
```

---

## ⚡ Setup & Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server (ts-node-dev)
```bash
npm run dev
```

### 3. Build & Compile to Javascript
```bash
npm run build
```
This compiles the TypeScript codebase into clean, optimized JS assets inside the `/dist` directory.

### 4. Database Seeding Script
The backend features a robust seed script designed to populate MongoDB with a clean set of mock products, categories, reviews, and admin/customer accounts.

To seed a customized count of products:
```bash
# Compile the typescript scripts first
npm run build

# Run the compiled script passing the target product count as an argument (e.g. 1000)
node dist/scripts/seedData.js 1000
```
This command will:
1. Purge existing collections (products, users, orders).
2. Generate the specified count of realistic products complete with prices, stock levels, and descriptive metadata using Faker.
3. Automatically append realistic user reviews to 70% of the generated products.
4. Seed default access accounts (customer and administrator roles).
5. Build index keys on MongoDB to ensure fast search capabilities.
