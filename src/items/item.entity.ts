import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Item {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public title: string;
    @Column()
    public price: number;
    @Column()
    public completed: boolean;
    @Column()
    public yearMonth: string;
    @Column()
    public isGain: boolean;
}