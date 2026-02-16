const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const morgan = require("morgan");

const { connectDB } = require("./app/config/connectDB/connectDB");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
connectDB();

const corsOptions = {
    origin: "*", // Allow all origins (for development; restrict in production!)
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

const routesPath = path.join(__dirname, "app/routes");

if (fs.existsSync(routesPath)) {
    fs.readdirSync(routesPath)
        .filter((f) => f !== "index.js" && f.endsWith(".js"))
        .forEach((f) => {
            const routeModule = require(path.join(routesPath, f));
            if (typeof routeModule === "function") routeModule(router);
        });
}

app.use(morgan("dev"));

// Mount shared router under /api
app.use("/api", router);

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server running and healthy" });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
