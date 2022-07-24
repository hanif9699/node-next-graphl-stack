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
let RedisStore = connectRedis(session)

// redis@v4
import { createClient } from "redis";


const main = () => {
    AppDataSource.initialize().then(async () => {
        console.log('--- Insert post into db ---')
        // const post = new Post()
        // post.title = 'First Post !!!'
        // await AppDataSource.manager.save(post)
        // console.log(`Saved Post Id : ${post.id}`)
        const posts = await AppDataSource.manager.find(Post)
        console.log(posts)
        const app = express()
        // app.get('/', (_, res) => {
        //     res.send('Hello world')
        // })
        let redisClient = createClient({ legacyMode: true })
        redisClient.connect().then(() => {
            console.log('Connected to redis')
        }).catch(console.error)
        app.use(cors({
            origin: true,
            credentials: true,
        }))
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
            console.log(`Server Started at Port ${PORT}`)
        })

        const httpServer = http.createServer(app)
        httpServer.listen(8081, () => {
            console.log('Server running on 8081 port')
        })

    }).catch(error => {
        console.log(error)
    })
}

main()