import z, { ZodError } from "zod";
import { IConfig } from "./types";

export const configSchema: z.ZodType<IConfig> = z.object({
  port: z.number().min(1),
  propel: z.object({
    clientUrl: z.string().min(1),
    apiUrl: z.string().min(1),
  }),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().min(1),
    secure: z.boolean(),
    auth: z.object({
      user: z.string().min(1),
      pass: z.string().min(1),
    }),
  }),
  email: z.object({
    senderAddress: z.string().min(1),
  }),
  secret: z.object({
    betterAuth: z.string().min(1),
  }),
  redis: z.object({
    host: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1),
    port: z.number().min(1),
  }),
  postgres: z.object({
    connectionString: z.string().min(1),
  }),
  nrel: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().min(1),
  }),
  here: z.object({
    apiKey: z.string().min(1),
    appId: z.string().min(1),
  }),
  mapbox: z.object({
    accessToken: z.string().min(1),
  }),
});

const customErrorMap: z.ZodErrorMap = (issue) => {
  if (issue.code === "invalid_type" && issue.path) {
    if (issue.received === "undefined") {
      if (issue.path[1] !== undefined) {
        const path = issue.path;
        return {
          message: `${String(path[0])}.${String(path[1])} is required.`,
        };
      }
      return { message: `${String(issue.path[0])} required.` };
    }

    if (issue.expected === "string") {
      if (issue.path[1] !== undefined) {
        const path = issue.path;
        return {
          message: `${String(path[0])}.${String(path[1])} should be of type ${issue.expected}`,
        };
      }
      return {
        message: `${String(issue.path[0])} should be of type ${issue.expected}`,
      };
    }
  }

  return undefined;
};

z.config({ customError: customErrorMap });

export function validateConfig(config: IConfig) {
  try {
    configSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.message);
    }
  }
}
