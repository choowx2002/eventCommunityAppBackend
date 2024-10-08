
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const eventRoutes = require("./routes/event");
const notificationRoutes = require("./routes/notification");
const categoriesRoutes = require('./routes/category');
const app = express();
require("dotenv").config(); //to take the .env file constant
const port = process.env.PORT || 3000;
const hostname = process.env.Ethernet || "192.168.176.114";
const cors = require('cors');

const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {// for testing purpose
  res.send('<h1>Hello world</h1>');
});
app.use('/user', userRoutes);
app.use("/events", eventRoutes);
app.use("/notification", notificationRoutes);
app.use("/categories", categoriesRoutes);
app.use('/image', uploadRoutes);

server.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
