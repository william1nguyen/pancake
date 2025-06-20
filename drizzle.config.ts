import { defineConfig } from "drizzle-kit";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
