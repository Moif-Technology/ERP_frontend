# ERP Frontend

Minimal React + Vite frontend for the ERP desktop project.

## Stack

- React 19
- Vite 7
- React Router 7
- MUI
- Tailwind CSS 4

## Getting Started

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the app for production.

```bash
npm run preview
```

Previews the production build locally.

## Main Routes

- `/` - Dashboard
- `/products` - Product / Item Management

## Project Structure

```text
src/
  assets/                  Static icons and images
  components/layouts/      Header, sidebar, app shell
  constants/               Theme and shared constants
  pages/                   Route-level screens
  App.jsx                  App composition
  Routes.jsx               Route definitions
  main.jsx                 Vite entry point
```

## Notes

- This project now runs on Vite, not Create React App.
- Tailwind is available through the Vite setup.
- The main app shell lives in `src/components/layouts`.

## Development Goal

Keep the UI clean, simple, and easy to extend for ERP modules like:

- Dashboard
- Products
- Inventory
- Sales
- Procurement
- Reports
