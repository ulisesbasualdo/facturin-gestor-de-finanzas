import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { decimalTransformer } from "../common/decimal.transformer.js";

@Entity()
@Index("IDX_item_month", ["yearMonth", "completed", "isGain", "price"])
export class Item {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public title: string;
    @Column('decimal', { precision: 12, scale: 2, transformer: decimalTransformer })
    public price: number;
    @Column()
    public completed: boolean;
    @Column()
    public yearMonth: string;
    @Column()
    public isGain: boolean;
}