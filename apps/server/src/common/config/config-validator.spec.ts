import { validateConfig } from "./config-validator";
import { IConfig } from "./types";

describe("ConfigValidator", () => {
  it("should fail for an invalid config", async () => {
    const invalidConfig: IConfig = {
      propel: {
        // @ts-expect-error forcing invalid config
        apiUrl: undefined,
        clientUrl: "b",
      },
      port: 1234,
      secret: { betterAuth: "secret" },
      email: {
        senderAddress: "an-address",
      },
      postgres: {
        connectionString: "connection",
      },
      redis: {
        host: "host",
        username: "user",
        password: "pass",
        port: 6379,
      },
      smtp: {
        host: "host",
        secure: true,
        port: 1234,
        auth: {
          user: "a",
          pass: "b",
        },
      },
    };

    let validationError = undefined;

    try {
      validateConfig(invalidConfig);
    } catch (error) {
      validationError = error;
    }

    expect(validationError).not.toEqual(undefined);
  });

  it("should succeed for a valid config", async () => {
    const validConfig: IConfig = {
      propel: {
        apiUrl: "a",
        clientUrl: "b",
      },
      port: 1234,
      secret: { betterAuth: "secret" },
      email: {
        senderAddress: "an-address",
      },
      postgres: {
        connectionString: "connection",
      },
      redis: {
        host: "host",
        username: "user",
        password: "pass",
        port: 6379,
      },
      smtp: {
        host: "host",
        secure: true,
        port: 1234,
        auth: {
          user: "a",
          pass: "b",
        },
      },
    };

    let validationError = undefined;

    try {
      validateConfig(validConfig);
    } catch (error) {
      validationError = error;
    }

    expect(validationError).toEqual(undefined);
  });
});
