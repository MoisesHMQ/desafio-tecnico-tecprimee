import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isSqlite = process.env.DB_TYPE === "sqlite";

export const AppDataSource = new DataSource(
  isSqlite
    ? {
        type: "sqlite",
        database:
          process.env.DB_SQLITE_PATH ?? path.resolve(process.cwd(), "tmp", "test.sqlite"),
        entities: [path.join(__dirname, "entities", "*.{ts,js}")],
        synchronize: true,
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [path.join(__dirname, "entities", "*.{ts,js}")],
        synchronize: true,
      }
);
