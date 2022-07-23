import { Request, Response } from "express";
import { DataSource } from "typeorm";

export type MyContext = {
    connection: DataSource;
    req: Request & { session: any },
    res: Response
}