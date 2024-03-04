require("dotenv").config();
const express = require("express");
const { testConnection } = require("./utils/database");
const rateLimiter = require("express-rate-limit")

const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const port = 3000;

testConnection();

// Rate Limit
const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 Minute
  max: 10, // 10 Request
  message: "Too many requests, please try again later.",
})
app.use("/", limiter)

// Handling json parse error
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({
      code: 400,
      message: "Invalid JSON payload"
    });
  }
  next(err);
});

// Handling multer error
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    return res.status(400).send({
      code: 400,
      message: 'File parsing Error'
    });
  }
  next();
});

app.get("/", (req, res) => res.send("We need more diet coke!"));

app.use("/", userRoutes);
app.use("/", documentRoutes);
app.use("/", transactionRoutes);

// Handling any other uncaught error
app.use((err, req, res, next) => {
  // TODO
  // proper logging
  // console.log(err)
  res.status(500).json({
    code: 500,
    message: "An unexpected error occurred. Please try again later."
  });
});


app.listen(port, () => console.log(`Server running on port ${port}`));
