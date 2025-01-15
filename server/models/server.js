const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require('http');
const https = require("https");
const fs = require("fs");

require("dotenv").config();

console.log(process.env.APP_NAME);
console.log(process.env.API_URL);
console.log(process.env.PORT);
console.log(process.env.HTTPS_PORT);

class Server {
  constructor() {
    if (process.env.NODE_ENV == "development") {
      this.key = "server.key";
      this.cert = "server.crt";
    } else if (process.env.NODE_ENV == "production") {
      this.key = "/etc/ssl/server.key";
      this.cert = "/etc/ssl/server.crt";
    }

    // Load SSL Certificates
    const sslOptions = {
      key: fs.readFileSync(this.key), // Replace with your SSL key file path
      cert: fs.readFileSync(this.cert), // Replace with your SSL certificate file path
    };

    this.app = express();
    this.port = process.env.PORT || 8080; // HTTP port
    this.httpsPort = process.env.HTTPS_PORT || 8081; // HTTPS port
    this.sslOptions = sslOptions;

    this.paths = {
      auth: "/api/auth",
      homepage: "/api/homepage",
    };

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());

    // Pick up React index.html file
    this.app.use(express.static(path.join(__dirname, "../../client/build")));
  }

  // Bind controllers to routes
  routes() {
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.homepage, require("../routes/homepage"));
    // Catch all requests that don't match any route

    /*   
    this.app.get("*", (req, res) => {
      res.sendFile(
        path.join(__dirname, "../../client/build/index.html")
      );
    });
    */
  }

   listen() {
    /*
    // Start HTTP server
    http.createServer(this.app).listen(this.port, () => {
      console.log(`HTTP Server running on port: ${this.port}`);
    });
   */
    // Start HTTPS server
    https.createServer(this.sslOptions, this.app).listen(this.httpsPort, () => {
      console.log(`HTTPS Server running on port: ${this.httpsPort}`);
    });

  }
}

module.exports = Server;