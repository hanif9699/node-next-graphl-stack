import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    database: "lireddit",
    port: 5432,
    username: "postgres",
    password: "postgres",
    entities: [Post, User],
    synchronize: true,
    logging: true,
    migrations: [],
    subscribers: []
})