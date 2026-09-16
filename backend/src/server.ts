// Must precede ./app: CommonJS hoists requires, so .env has to load before
// app.ts reads MONGO_URI at module scope.
import "dotenv/config";

import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
