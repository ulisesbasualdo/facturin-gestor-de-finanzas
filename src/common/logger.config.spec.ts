import { QueryFailedError } from 'typeorm';
import { serializeError } from './logger.config.js';

describe('serializeError', () => {
  it('de un error de base de datos guarda tipo, código y mensaje, pero no la consulta ni sus valores', () => {
    const driverError = Object.assign(new Error("Data too long for column 'title' at row 1"), {
      code: 'ER_DATA_TOO_LONG',
    });
    const error = new QueryFailedError(
      'INSERT INTO `item`(`title`, `price`) VALUES (?, ?)',
      ['Consulta psicológica', 455000.5],
      driverError,
    );

    const serialized = serializeError(error);

    expect(serialized).toMatchObject({
      type: 'QueryFailedError',
      code: 'ER_DATA_TOO_LONG',
      message: "Data too long for column 'title' at row 1",
    });
    const logged = JSON.stringify(serialized);
    expect(logged).not.toContain('Consulta psicológica');
    expect(logged).not.toContain('455000.5');
    expect(logged).not.toContain('INSERT INTO');
  });

  it('de algo que no es un Error solo guarda su tipo', () => {
    expect(serializeError({ title: 'Consulta psicológica' })).toEqual({ type: 'object' });
  });
});
