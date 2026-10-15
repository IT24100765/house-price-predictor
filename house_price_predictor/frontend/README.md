# React + Vite

## Backend connection

Set `VITE_BACKEND_URL` to the deployed Python backend's public HTTPS base URL in Netlify's environment settings, with availability during builds. Vite embeds this setting when it builds the frontend, so changing it requires a new deployment. Do not put credentials or API keys in this variable: Vite configuration is included in browser assets.

The frontend calls `/api/meta` and `/api/predict` on that backend. A trailing slash or `/api` suffix is accepted. Local development uses port 5000 when the variable is absent; production requires an explicitly configured HTTPS backend. Connection and configuration failures appear in the interface instead of producing simulated prices.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
