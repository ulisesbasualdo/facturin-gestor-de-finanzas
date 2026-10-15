import { ArgumentsHost, ConflictException, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

/** Respuesta HTTP de prueba que guarda el status y el cuerpo enviados. */
function createFakeResponse() {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
  };
  return response;
}

/** Contexto de Nest de prueba con un request que tiene el id indicado. */
function createHost(requestId: string, response: ReturnType<typeof createFakeResponse>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ id: requestId }),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  const logger = { error: vi.fn() };
  const filter = new AllExceptionsFilter(logger as unknown as PinoLogger);

  beforeEach(() => logger.error.mockClear());

  it('deja pasar los errores de negocio con su status y su mensaje, sin loguearlos como error', () => {
    const response = createFakeResponse();

    filter.catch(
      new ConflictException('El mes 2026-09 está cerrado.'),
      createHost('req-1', response),
    );

    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(response.body).toMatchObject({ statusCode: 409, message: 'El mes 2026-09 está cerrado.' });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('ante un error inesperado responde 500 con el id del request y sin detalles internos', () => {
    const response = createFakeResponse();
    const error = new Error("Table 'facturin.item' doesn't exist");

    filter.catch(error, createHost('req-2', response));

    expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Ocurrió un error inesperado.',
      errorId: 'req-2',
    });
    expect(JSON.stringify(response.body)).not.toContain('facturin.item');
  });

  it('loguea el error inesperado completo para poder investigarlo', () => {
    const error = new Error("Table 'facturin.item' doesn't exist");

    filter.catch(error, createHost('req-3', createFakeResponse()));

    expect(logger.error).toHaveBeenCalledWith({ err: error }, 'Error inesperado');
  });
});
