const express = require("express");
const cors = require("cors");
const aiAgentRoutes = require("./routes/aiAgent");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", aiAgentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
