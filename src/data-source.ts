import 'dotenv/config';
import { DataSource } from "typeorm";
import { Item } from "./items/item.entity.js";
import { MonthClose } from "./months/month-close.entity.js";

export default new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Item, MonthClose],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
  });
