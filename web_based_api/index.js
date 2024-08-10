
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/image', uploadRoutes);

server.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on http://${process.env.IPV4}:${port}`);
});
