// backend/src/index.ts
import "dotenv/config";
import { getApp } from "./app";

const port = Number(process.env.PORT) || 4000;

getApp().then((app) => {
  app.listen(port, () => {
    console.log(`🚀 GraphQL server running at http://localhost:${port}/graphql`);
  });
});
