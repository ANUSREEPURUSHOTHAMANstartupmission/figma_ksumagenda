// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy requests to the API
app.use('/api', createProxyMiddleware({ target: 'https://events.startupmission.in', changeOrigin: true }));

// Serve static files from the 'dist' directory
app.use(express.static('dist')); // Assuming your Figma plugin assets are in the dist directory

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
