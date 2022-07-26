import "reflect-metadata";
import { AppDataSource } from "./datasoure";
import { Post } from "./entities/Post";
import express from 'express'
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { cookie_name, PORT, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from 'cors';
import https from 'https';
import path from 'path';
import fs from 'fs';
import http from 'http'

declare global {
    var __basedir:string;
}

global.__basedir = __dirname;

let RedisStore = connectRedis(session)

// redis@v4
import { createClient } from "redis";
import morganMiddleware from "./middleware/morganMiddleware";
import logger from "./utils/logger";
// fshkfjhj fjkdhsj

const main = () => {
    AppDataSource.initialize().then(async () => {
        console.log('--- Insert post into db ---')
        const posts = await AppDataSource.manager.find(Post)
        console.log(posts)
        const app = express()
        let redisClient = createClient({ legacyMode: true })
        redisClient.connect().then(() => {
            logger.debug('Connected to redis')
        }).catch(console.error)
        app.use(cors({
            origin: true,
            credentials: true,
        }))
        app.use(morganMiddleware)
        app.use(
            session({
                name: cookie_name,
                store: new RedisStore({
                    client: redisClient as any,
                    disableTouch: true,
                }),
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                },
                saveUninitialized: false,
                secret: "hfdsieriadsklkdgk",
                resave: true,
            })
        )
        app.set('trust proxy', 1);
        const apolloServer = new ApolloServer({
            schema: await buildSchema({
                resolvers: [HelloResolver, PostResolver, UserResolver],
                validate: false
            }),
            context: ({ req, res }) => ({
                connection: AppDataSource,
                req,
                res
            })
        })

        await apolloServer.start()
        apolloServer.applyMiddleware({
            app,
            cors: false
        })
        const sslServer = https.createServer({
            key: fs.readFileSync(path.join(__dirname, '../cert', 'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../cert', 'cert.pem'))
        }, app)
        sslServer.listen(PORT, () => {
            logger.debug(`Server Started at Port ${PORT}`)
        })

        const httpServer = http.createServer(app)
        httpServer.listen(7000, () => {
            logger.debug('Server running on 7000 port')
        })

    }).catch(error => {
        console.log(error)
    })
}

main()