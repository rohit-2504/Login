const http = require("http");
const path =require("path");
const mysql = require('mysql2');
const express= require("express");
const { Server } =require("socket.io");
const app=express();
const server = http.createServer(app);
const io= new Server(server);
ip="";
app.use(express.static(path.resolve("./")))
app.get('/', (req, res) => {
   ip = req.ip; // Get client IP address;
   console.log(ip);
  res.send(`Your IP address is: ${ip}`);
});
const connection = mysql.createConnection({
  host: '192.168.181.197',
  user: "rohit",
  password: "2504",
  database: "user",
  port: 3306,
});
connection.connect((err) => {
  if (err) {
      console.error("Error connecting to the database:", err.stack);
      return;
  }
  console.log("Connected to the database with ID:", connection.threadId);
});
io.on("connection", (socket) => {
  console.log("A new user connected", socket.id);
    // Login Event Listener
    socket.on("login", (message) => {
        const [uname, upassword] = message.split(".");
        console.log("Login attempt:", uname);
        const query = `SELECT * FROM users WHERE user_name = ? AND password = ?`;

        connection.execute(query, [uname, upassword], (err, results) => {
            if (err) {
                console.error("Error executing SELECT query for login:", err);
                socket.emit("loginResponse", "Database query error.");
                return;
            }
            if (results.length > 0) {
                console.log("Login successful for user:", uname);
                socket.emit("loginResponse", true); // Login successful
            } else {
                console.log("Invalid login credentials for user:", uname);
                socket.emit("loginResponse", "Invalid username or password.");
            }

            // Close the connection
        });
    });
  socket.on("user", (message) => {
      const [uname, upassword] = message.split(".");
      console.log("Received user data:", uname, upassword);
      const query = `SELECT user_name FROM users WHERE user_name = ?`;
      connection.execute(query, [uname], (err, results) => {
          if (err) {
              console.error("Error executing SELECT query:", err);
              socket.emit("error", "Database query error.");
              return;
          }
          if (results.length < 1) {
              const insertQuery = `INSERT INTO users (user_name, password) VALUES (?, ?)`;
              connection.execute(insertQuery, [uname, upassword], (err, results) => {
                  if (err) {
                      console.error("Error executing INSERT query:", err);
                      socket.emit("error", "Error creating user.");
                      return;
                  }
                  console.log("User created with ID:", results.insertId);
                  socket.emit("error", true); // Success message
              });
          } else {
              const msg = "User Exists";
              console.log(msg);
              socket.emit("error", msg);
          }
          // Close the connection after all queries
      });
  });
});
app.get("/",(req, res)=>{
    return res.sendFile("/index.html")
})
app.get("/home", (req, res) => {
  res.sendFile(path.resolve("./home.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.resolve("./login.html"));
  });
server.listen(8080, () => console.log("Server Started at 8080"))
