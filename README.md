# CentralAuth Express.js Example

This repo contains a small demo showing how to integrate [CentralAuth](https://centralauth.com) with an Express.js application.

## Overview

This example demonstrates a complete OAuth2-based authentication flow using CentralAuth as the identity provider. Users can log in via CentralAuth, view their profile, and log out with minimal code.

**Live Demo**: [https://express-example.centralauth.com](https://express-example.centralauth.com)

## Features

- **OAuth2 Login Flow**: Seamless login redirect to CentralAuth
- **User Profile Display**: Fetch and display authenticated user information (email, avatar)
- **Session Management**: Handle user sessions and logout

## Prerequisites

- Node.js 18+ (or Bun)
- A CentralAuth account with an organization set up
- CentralAuth credentials (Organization ID and Secret)

## Setup

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with your CentralAuth credentials:

```env
# Your CentralAuth Organization ID
AUTH_ORGANIZATION_ID=your_org_id

# Your CentralAuth Secret
AUTH_SECRET=your_secret

# CentralAuth base URL (typically https://centralauth.com or your custom domain)
AUTH_BASE_URL=https://centralauth.com

# Your application's public URL (used for OAuth callbacks)
BASE_URL=http://localhost:3000
```

### 3. Configure Whitelisted Domains

In your CentralAuth dashboard, configure the allowed domains for your application:

- **For localhost**: Enable the **"Allow localhost"** setting during development (no additional configuration needed)
- **For production**: Add your domain to the **whitelist domains** list. You only need to register the base domain (e.g., `example.com`), not the full callback URL path

The SDK will automatically handle the `/api/auth/callback` path for all whitelisted domains.

## Running the Server

```bash
npm start
# or
bun run server.js
```

The server will start on `http://localhost:3000` (or any other base URL you have set in the `BASE_URL` environment variable).

## Usage Flow

1. **Home Page** (`/`): Click "Login with CentralAuth"
2. **Redirect to CentralAuth**: You'll be redirected to the CentralAuth login page
3. **Authenticate**: Enter your credentials or sign up
4. **Callback**: CentralAuth redirects back to `/api/auth/callback`
5. **Profile Page** (`/profile`): View your authenticated user information
6. **Logout**: Click "Logout" to clear your session and return home

## API Endpoints

- `GET /` - Home page with login button
- `GET /api/auth/login` - Initiates the login flow
- `GET /api/auth/callback` - OAuth2 callback endpoint (handled by CentralAuth SDK)
- `GET /api/auth/user` - Returns current user info as JSON
- `GET /api/auth/logout` - Logs out the user
- `GET /profile` - Protected profile page (requires authentication)

## Project Structure

```
.
├── server.js           # Main Express application with auth routes
├── public/
│   └── styles.css      # Styling for the UI
├── package.json        # Dependencies and metadata
├── .env.example        # Environment variable template
└── README.md           # This file
```

## Key Implementation Details

### CentralAuth Client Initialization

Each request creates a new `CentralAuthHTTPClass` instance to avoid state conflicts:

```javascript
const authClient = new CentralAuthHTTPClass({
  clientId: process.env.AUTH_ORGANIZATION_ID,
  secret: process.env.AUTH_SECRET,
  authBaseUrl: process.env.AUTH_BASE_URL,
  callbackUrl: `${baseUrl}/api/auth/callback`
});
```

### User Data Retrieval

Authenticated user information (email, avatar) is retrieved using:

```javascript
const user = await authClient.getUserDataHTTP(req);
```

This works because the CentralAuth SDK automatically manages session tokens using cookies.

## Troubleshooting

- **"Authentication failed" error**: Check your `AUTH_ORGANIZATION_ID` and `AUTH_SECRET`
- **Session not persisting**: Make sure cookies are enabled in your browser
- **Not logged in after callback**: Verify your `AUTH_BASE_URL` is correct

## Environment Variables Reference

| Variable               | Description                      | Example                   |
| ---------------------- | -------------------------------- | ------------------------- |
| `AUTH_ORGANIZATION_ID` | Your CentralAuth Organization ID | `org_123abc`              |
| `AUTH_SECRET`          | Your CentralAuth Secret key      | `secret_xyz789`           |
| `AUTH_BASE_URL`        | CentralAuth server URL           | `https://centralauth.com` |
| `BASE_URL`             | Your application's public URL    | `http://localhost:3000`   |

## Next Steps

- Explore the [CentralAuth documentation](https://docs.centralauth.com)
- Add more protected routes that check for authenticated users
- Customize the styling in `public/styles.css`
- Deploy to production with proper environment configuration

## License

MIT
