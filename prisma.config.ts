import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

//dotenv.config({ path: ".env.local", override: true });
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
