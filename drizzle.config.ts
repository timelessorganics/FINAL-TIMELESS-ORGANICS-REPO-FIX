import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Construct database URL with proper SSL settings
const dbUrl = process.env.DATABASE_URL;
const urlWithSsl = dbUrl.includes("?") 
  ? `${dbUrl}&sslmode=require` 
  : `${dbUrl}?sslmode=require`;

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: urlWithSsl,
  },
});
