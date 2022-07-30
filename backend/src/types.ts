import { Request, Response } from 'express';
import { RedisClientType } from 'redis';
import { DataSource } from 'typeorm';

export type MyContext = {
  connection: DataSource;
  req: Request & { session: any };
  res: Response;
  redis: RedisClientType;
};
