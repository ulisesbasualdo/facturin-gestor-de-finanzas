import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';

/** Header de la respuesta con el identificador del request, para buscarlo en los logs. */
export const REQUEST_ID_HEADER = 'X-Request-Id';

/** Campos que nunca se escriben en los logs porque contienen credenciales. */
const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

/** Configuración de pino: un id por request, nivel según el status y salida JSON o legible según el entorno. */
export function loggerParams(config: ConfigService): Params {
  const pretty = config.get<string>('LOG_FORMAT') === 'pretty';
  return {
    pinoHttp: {
      level: config.get<string>('LOG_LEVEL') ?? 'info',
      genReqId: (_request, response) => {
        const id = randomUUID();
        response.setHeader(REQUEST_ID_HEADER, id);
        return id;
      },
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) return 'error';
        if (response.statusCode >= 400) return 'warn';
        return 'info';
      },
      serializers: {
        req: (request: { id: unknown; method: string; url: string }) => ({
          id: request.id,
          method: request.method,
          url: request.url,
        }),
        res: (response: { statusCode: number }) => ({ statusCode: response.statusCode }),
      },
      redact: REDACTED_PATHS,
      transport: pretty
        ? { target: 'pino-pretty', options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' } }
        : undefined,
    },
  };
}
