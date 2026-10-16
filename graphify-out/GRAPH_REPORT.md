# Graph Report - Taqueria Orale  (2026-10-16)

## Corpus Check
- Large corpus: 69 files · ~677,579 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 293 nodes · 461 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend App & Assets
- Express Server Setup
- Frontend Package Config
- Auth Controller
- Auth Middleware & Routes
- Backend Package Meta
- Staff Routes
- DB Pool & Scripts
- Frontend Dev Tooling
- Admin Panel UI
- Backend Dependencies
- Root Package
- Vercel Config

## God Nodes (most connected - your core abstractions)
1. `react` - 11 edges
2. `App()` - 10 edges
3. `Navbar()` - 9 edges
4. `Admin()` - 9 edges
5. `express` - 8 edges
6. `API_URL` - 8 edges
7. `authenticate()` - 6 edges
8. `Menu()` - 6 edges
9. `Pago()` - 6 edges
10. `refresh()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `ProtectedAdmin()` --calls--> `Admin()`  [EXTRACTED]
  Fronted/src/App.jsx → Fronted/src/pages/admin.jsx
- `login()` --calls--> `generateAccessToken()`  [EXTRACTED]
  Backend/controllers/authController.js → Backend/utils/token.js
- `login()` --calls--> `generateRefreshToken()`  [EXTRACTED]
  Backend/controllers/authController.js → Backend/utils/token.js
- `refresh()` --calls--> `generateAccessToken()`  [EXTRACTED]
  Backend/controllers/authController.js → Backend/utils/token.js
- `refresh()` --calls--> `generateRefreshToken()`  [EXTRACTED]
  Backend/controllers/authController.js → Backend/utils/token.js

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Frontend App & Assets"
Cohesion: 0.08
Nodes (36): App(), ProtectedAdmin(), LINKS, Navbar(), POSITION_CLASS, API_URL, ALL_EXTRAS, BEBIDAS (+28 more)

### Community 1 - "Express Server Setup"
Cohesion: 0.06
Nodes (34): app, authRoutes, cors, corsOptions, express, helmet, logger, pedidosRoutes (+26 more)

### Community 2 - "Frontend Package Config"
Cohesion: 0.06
Nodes (33): author, dependencies, react, react-dom, react-router-dom, description, react-router-dom, keywords (+25 more)

### Community 3 - "Auth Controller"
Cohesion: 0.09
Nodes (29): bcrypt, {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeAllUserTokens,
}, logger, login(), logout(), pool, refresh(), verify() (+21 more)

### Community 4 - "Auth Middleware & Routes"
Cohesion: 0.13
Nodes (17): authenticate(), logger, requireAdmin(), requireStaff(), { verifyAccessToken }, { authenticate }, { crearSugerencia, listarSugerencias, marcarLeida }, { Router } (+9 more)

### Community 5 - "Backend Package Meta"
Cohesion: 0.11
Nodes (18): author, description, devDependencies, nodemon, keywords, license, main, name (+10 more)

### Community 6 - "Staff Routes"
Cohesion: 0.14
Nodes (15): { authenticate, requireAdmin }, { body, validationResult, matchedData }, createValidation, {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleActivo,
}, { Router }, updateValidation, userValidation, actualizarUsuario() (+7 more)

### Community 7 - "DB Pool & Scripts"
Cohesion: 0.13
Nodes (6): { Pool }, pool, pool, pool, pool, pg

### Community 8 - "Frontend Dev Tooling"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 9 - "Admin Panel UI"
Cohesion: 0.19
Nodes (14): Admin(), BEBIDAS_INV, CAFETERIA_INV, CARBOS_INV, FILTERS, fmt(), fmtDate(), fmtHora() (+6 more)

### Community 10 - "Backend Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, bcrypt, cors, dotenv, express, express-rate-limit, express-validator, helmet (+4 more)

### Community 11 - "Root Package"
Cohesion: 0.50
Nodes (3): dependencies, react-router-dom, react-router-dom

## Knowledge Gaps
- **10 isolated node(s):** `dotenv`, `pino-pretty`, `nodemon`, `react-router-dom`, `@types/react` (+5 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 161 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Frontend App & Assets` to `Admin Panel UI`, `Frontend Package Config`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `dotenv`, `pino-pretty`, `nodemon` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend App & Assets` be split into smaller, more focused modules?**
  _Cohesion score 0.08348457350272233 - nodes in this community are weakly interconnected._
- **Why does `express` connect `Auth Middleware & Routes` to `Express Server Setup`, `Auth Controller`, `Backend Package Meta`, `Staff Routes`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Express Server Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.06463414634146342 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Backend Dependencies` to `Backend Package Meta`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `Frontend Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06116642958748222 - nodes in this community are weakly interconnected._