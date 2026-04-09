export interface IConfig {
  propel: Propel;
  email: Email;
  smtp: Smtp;
  postgres: Postgres;
  redis: Redis;
  secret: Secret;
  port: number;
}

export interface Propel {
  clientUrl: string;
  apiUrl: string;
}

export interface Smtp {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface Email {
  senderAddress: string;
}

export interface Postgres {
  connectionString: string;
}

export interface Redis {
  host: string;
  password: string;
  username: string;
  port: number;
}

export interface Secret {
  betterAuth: string;
}

export enum ENV {
  PORT = "PORT",
  KOSHI_PG_URL = "KOSHI_PG_URL",
}

export enum Config {
  Port = "port",
}
