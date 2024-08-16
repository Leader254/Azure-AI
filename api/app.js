const express = require("express");
const pdfRoutes = require("./routes/pdfRoutes");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the PDF API!");
});

app.use("/api/pdf", pdfRoutes);

// app.use((err, req, res, next) => {
//   res.status(500).json({ message: err.message });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
