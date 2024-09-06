require("dotenv").config();
const database = require("./config/database");
const express = require("express");
const cors = require("cors");
const multer = require("multer"); 

const userRouter = require("./routers/userRouter");
const tenantRouter = require("./routers/tenantRouter");
const propertyRouter = require("./routers/propertyRouter");
const passwordRouter = require("./routers/passwordRouter");
const adminRouter = require("./routers/adminRouter");

const app = express();

// Enable CORS 
app.use(cors("*"));

// Middleware to parse JSON
app.use(express.json());

// Mount routers with a common prefix
app.use("/api/v1", userRouter);
app.use("/api/v1", tenantRouter);
app.use("/api/v1", propertyRouter);
app.use("/api/v1", passwordRouter);
app.use("/api/v1", adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).json({ error: 'Invalid JSON' });
    } else if (err instanceof multer.MulterError) {
        // Handle Multer file upload errors
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // Handle other unknown errors
        return res.status(500).json({ message: err.message });
    }

    next();
});

// Start the server
const port = process.env.PORT || 2024;
app.listen(port, () => {
    console.log(`Server is listening to PORT: ${port}.`);
});
