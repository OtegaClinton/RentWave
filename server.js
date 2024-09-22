require("dotenv").config();
const database = require("./config/database");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("./controllers/scheduler");
const keepServerAlive = require("./keepServerAlive");


const userRouter = require("./routers/userRouter");
const tenantRouter = require("./routers/tenantRouter");
const propertyRouter = require("./routers/propertyRouter");
const passwordRouter = require("./routers/passwordRouter");
const adminRouter = require("./routers/adminRouter");
const rentDueRouter = require("./routers/dueRentRouter");
const feedBackRouter = require("./routers/feedBackRouter");


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
app.use("/api/v1", rentDueRouter);
app.use("/api/v1", feedBackRouter);



// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).json({ error: 'Invalid JSON' });
    } else if (err instanceof multer.MulterError) {
        // Handle specific Multer file upload errors
        switch (err.code) {
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ message: 'You can only upload a maximum of 3 files.' });
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ message: 'File size exceeds the 5MB limit.' });
            default:
                return res.status(400).json({ message: err.message });
        }
    } else if (err) {
        // Handle other unknown errors
        return res.status(500).json({ message: err.message });
    }

    next();
});

// Call keepServerAlive to keep the server active
keepServerAlive();


// Test route to check server status
app.get('/1', (req, res) => {
    res.send('Server is alive!');
});

// Start the server
const port = process.env.PORT || 2024;
app.listen(port, () => {
    console.log(`Server is listening to PORT: ${port}.`);
});
