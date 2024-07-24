const handler = require('serve-handler');
const http = require('http');
const path = require('path');

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  return handler(request, response, {
    public: path.join(__dirname, 'dist'),
    cleanUrls: true
  });
});


server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});