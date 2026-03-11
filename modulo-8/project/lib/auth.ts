import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

const db = new Database("./better-auth.sqlite");

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: new Database("./better-auth.sqlite"),
  appName: "Better Auth Demo",
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: [baseURL],
});
