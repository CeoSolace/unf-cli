# UnfilteredUK

Welcome to **UnfilteredUK**, a privacy‑first, real‑time communication platform inspired by the likes of Discord and Slack but built from the ground up to prioritise encryption, compression efficiency and extensibility. This repository contains the complete source code, documentation and deployment configuration for running UnfilteredUK yourself on services such as Render.

## Features

- **End‑to‑End Encryption (E2EE)** – Messages are encrypted on the client using X25519 key exchange and XChaCha20‑Poly1305 symmetric encryption, then compressed with Brotli for bandwidth efficiency. No plaintext message content is ever stored on the server.
- **Real‑Time Chat** – Servers, channels, direct messages and threads powered by Socket.IO provide low‑latency communication. Typing indicators and reactions enhance the interactive experience.
- **Server Management** – Create and join servers with granular roles and permissions. Moderation logs and audit trails keep communities safe and accountable.
- **Bot Platform** – Build your own bots using the provided SDK. Bots can moderate, run polls or provide custom functionality in a sandboxed environment.
- **Admin Dashboard** – A separate admin area allows privileged users to manage servers, ban users and review reports without access to message content.
- **Scalable & Deployable** – UnfilteredUK uses Express.js and MongoDB on the backend, Next.js with Tailwind CSS on the frontend and includes a Dockerfile and `render.yaml` for one‑click deployment to Render.

## Repository Structure

| Path | Purpose |
|---|---|
| **`app/`** | Contains the frontend (Next.js) and backend (Express.js) applications. |
| **`core/`** | Shared code for encryption, database models, API types, SDK and security utilities. |
| **`admin/`** | Separate Next.js app for administrative pages. |
| **`docs/`** | This documentation as well as API reference, developer guides and legal policies. |
| **`scripts/`** | Build, test, seed and security verification scripts run via `pnpm`. |
| **`tests/`** | Automated unit and integration tests. |
| **`public/`** | Static assets such as icons, themes and robots.txt. |

## Getting Started

### Prerequisites

- **Node.js v18 or later**
- **pnpm** package manager (`npm install -g pnpm`)
- A **MongoDB** instance (local or MongoDB Atlas)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-org/unfiltereduk.git
   cd unfiltereduk
   ```
2. Copy the example environment and populate it:
   ```bash
   cp .env.example .env
   # Edit .env to provide your secrets and database connection
   ```
3. Install dependencies and build the project:
   ```bash
   pnpm install
   ```
4. (Optional) Seed the database with a root admin account and system server:
   ```bash
   pnpm exec ts-node scripts/seed.ts
   ```
5. Start the backend and frontend:
   ```bash
   pnpm start
   ```

By default the backend listens on port **10000**. The Next.js frontend is served by the same process under `/` and API routes under `/api`.

## Deployment

UnfilteredUK is ready to be deployed on [Render](https://render.com/) or any other platform that can run a Node.js server. The provided `render.yaml` and `dockerfile` configure a free Render service:

- **render.yaml** instructs Render to install dependencies with `pnpm` and start the server using `pnpm start`.
- **dockerfile** defines a minimal Node.js container that installs dependencies with pnpm and runs the application.

Ensure your environment variables are set in the Render dashboard. Sensitive secrets should never be committed to version control.

## Contributing

We welcome contributions! Please open issues or pull requests on GitHub. When submitting changes, be sure to run `pnpm run build && pnpm run test` before pushing to ensure that your code compiles and all tests pass.

## License

This project is licensed under the MIT license. See `LICENSE` for details.