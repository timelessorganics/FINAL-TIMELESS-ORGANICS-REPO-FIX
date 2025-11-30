import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Construct database URL with proper SSL settings
// Remove pgbouncer parameter if present and add sslmode
let dbUrl = process.env.DATABASE_URL;
dbUrl = dbUrl.replace("?pgbouncer=true", ""); // Remove pgbouncer param
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
