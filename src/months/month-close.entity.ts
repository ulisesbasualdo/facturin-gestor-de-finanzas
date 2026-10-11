import { Column, Entity, PrimaryColumn } from "typeorm";
import { decimalTransformer } from "../common/decimal.transformer.js";

/** Neto guardado de un mes pasado y, si corresponde, la marca de reabierto. */
@Entity("month_close")
export class MonthClose {
    @PrimaryColumn({ type: "varchar", length: 7 })
    public yearMonth: string;
    @Column("decimal", { precision: 12, scale: 2, transformer: decimalTransformer })
    public net: number;
    @Column({ type: "datetime", nullable: true })
    public closedAt: Date | null;
    @Column({ type: "datetime", nullable: true })
    public reopenedAt: Date | null;
}
