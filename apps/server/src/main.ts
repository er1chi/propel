import { NestFactory } from "@nestjs/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from "@nestjs/swagger";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { AppModule } from "./app.module";
import helmet from "helmet";
import compression from "compression";
import { auth } from "./auth/auth";
import {
  ComponentsObject,
  SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { ConfigService } from "@nestjs/config";
import { Config } from "./common/config/types";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false, // Required for better-auth to handle raw request body
  });

  app.enableShutdownHooks();
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await setUpSwaggerUI(app);

  const configService = app.get(ConfigService);
  const port = configService.get(Config.Port);

  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📚 API docs at http://localhost:${port}/docs`);
}
bootstrap();

async function setUpSwaggerUI(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle("Propel API")
    .setDescription("things that you can can do")
    .setVersion("1.0")
    .addTag("propel")
    .build();

  const nestDocument = SwaggerModule.createDocument(app, config);
  const betterAuthOpenAPI = await auth.api.generateOpenAPISchema();

  const paths = Object.fromEntries(
    Object.entries(betterAuthOpenAPI.paths).map((path) => {
      return [`/api/auth${path[0]}`, path[1]];
    }),
  );

  for (const path in paths) {
    for (const method in paths[path]) {
      //@ts-expect-error mmm
      paths[path][method].tags = ["better auth"];

      if (path.includes("admin")) {
        //@ts-expect-error mmm
        paths[path][method].tags = ["better auth - admin"];
      }
    }
  }

  const document: OpenAPIObject = {
    openapi: nestDocument.openapi,
    paths: {
      ...nestDocument.paths,
      ...(paths as OpenAPIObject["paths"]),
      ...(nestDocument.paths["/api/auth/{path}"] && {}),
    },
    info: nestDocument.info,
    tags: nestDocument.tags,
    servers: nestDocument.servers,
    components: {
      //@ts-ignore
      schemas: {
        ...nestDocument.components?.schemas,
        ...betterAuthOpenAPI.components.schemas,
      },
      securitySchemes: {
        ...(betterAuthOpenAPI.components
          .securitySchemes as ComponentsObject["securitySchemes"]),
      },
    },
    security: betterAuthOpenAPI.security,
  };
  console.log(document);

  delete document.paths["/api/auth/{path}"];

  SwaggerModule.setup("swagger-ui", app, document);
}
