import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// .env.local = DB de dev, gana si existe (tu máquina).
// .env = DB de prod, fallback cuando no hay .env.local (Vercel usa la env var
// real de la plataforma, ninguno de los dos archivos existe ahí).
// dotenv.config() sin override no pisa una var que ya esté seteada, por eso
// el orden importa: el primero en cargar gana.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
