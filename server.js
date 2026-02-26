import { CentralAuthHTTPClass } from 'centralauth/server';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

//Get the port number from the base URL or default to 3000
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const url = new URL(baseUrl);
const port = url.port || 3000;

const getCentralAuthInstance = () => {
  // Initialize CentralAuth
  // Make sure to get a new instance for each request to avoid state issues!
  return new CentralAuthHTTPClass({
    clientId: process.env.AUTH_ORGANIZATION_ID,
    secret: process.env.AUTH_SECRET,
    authBaseUrl: process.env.AUTH_BASE_URL,
    callbackUrl: `${baseUrl}/api/auth/callback`,
    debug: true
  });
}

const getErrorMessage = (errorCode) => {
  const errors = {
    'not_logged_in': 'You need to be logged in to view the profile.',
    'logout_failed': 'Logout failed. Please try again.',
    'callback_failed': 'Authentication callback failed. Please try logging in again.',
    'login_failed': 'Login failed. Please try again.',
    'user_info_failed': 'Failed to get user information. Please try again.'
  };
  return errors[errorCode] || 'An error occurred.';
};

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CentralAuth Express Example</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <h1>CentralAuth Express.js Example</h1>
        <p>Welcome to the CentralAuth integration example using Express.js!</p>
        
        ${req.query.error ? `<div class="error">${getErrorMessage(req.query.error)}</div>` : ''}
        
        <div id="auth-section">
          <a href="/api/auth/login" class="btn">Login with CentralAuth</a>
          <a href="/profile" class="btn btn-success">View Profile</a>
          <a href="/api/auth/logout" class="btn btn-danger">Logout</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Authentication routes
app.get('/api/auth/login', async (req, res) => {
  try {
    const authClient = getCentralAuthInstance();
    await authClient.loginHTTP(req, res, { returnTo: `${baseUrl}/profile` });
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/?error=login_failed');
  }
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const authClient = getCentralAuthInstance();
    await authClient.callbackHTTP(req, res);
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/?error=callback_failed');
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const authClient = getCentralAuthInstance();
    await authClient.userHTTP(req, res);
  } catch (error) {
    console.error('User info error:', error);
    res.redirect('/?error=user_info_failed');
  }
});

app.get('/api/auth/logout', async (req, res) => {
  try {
    const authClient = getCentralAuthInstance();
    // Handle logout with CentralAuth
    await authClient.logoutHTTP(req, res, { returnTo: baseUrl });
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/?error=logout_failed');
  }
});

// Profile page
app.get('/profile', async (req, res) => {
  let user = null;
  try {
    const authClient = getCentralAuthInstance();
    user = await authClient.getUserDataHTTP(req);
  } catch (error) {
    console.log('Could not fetch fresh user data');
    res.redirect('/?error=not_logged_in');
    return;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile - CentralAuth Express Example</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <h1>User Profile</h1>
        
        ${req.query.success ? '<div class="success">Successfully logged in!</div>' : ''}
        ${req.query.error ? `<div class="error">${getErrorMessage(req.query.error)}</div>` : ''}
        
        ${user ? `
          <div class="user-info">
            <img src="${user.gravatar}" alt="User Avatar">
            <p><strong>Email:</strong> ${user.email}</p>
          </div>
        ` : `
          <p>You are not logged in.</p>
        `}
        
        <div class="button-group">
          <a href="/" class="btn">Back to Home</a>
          <a href="/api/auth/logout" class="btn btn-danger">Logout</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on ${baseUrl}`);
  console.log('Environment variables loaded:');
  console.log('- AUTH_ORGANIZATION_ID:', process.env.AUTH_ORGANIZATION_ID ? '✓' : '✗');
  console.log('- AUTH_SECRET:', process.env.AUTH_SECRET ? '✓' : '✗');
  console.log('- AUTH_BASE_URL:', process.env.AUTH_BASE_URL || 'Not set');
  console.log('- BASE_URL:', process.env.BASE_URL || 'Not set');
});

export default app;