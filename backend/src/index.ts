import { connect } from "./config/database";
import { app } from "./app";

export const PORT = process.env.PORT || 8000;

const start = () => {
  // Database connection
  connect().then(() => {

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

start()