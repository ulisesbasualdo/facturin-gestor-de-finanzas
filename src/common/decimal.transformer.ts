import { ValueTransformer } from "typeorm";

/** Convierte columnas DECIMAL, que MySQL devuelve como string, a number. */
export const decimalTransformer: ValueTransformer = {
    to: (value: number | null) => value,
    from: (value: string | null) => (value === null ? null : Number(value)),
};
