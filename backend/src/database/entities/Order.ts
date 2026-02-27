import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

export enum PaymentMethod {
  PIX = "PIX",
  CARTAO = "CARTAO",
  BOLETO = "BOLETO",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "integer", unique: true })
  @Generated("increment")
  orderNumber!: number;

  @Column({ nullable: true })
  user_id!: string | null;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Column()
  customerName!: string;

  @Column()
  email!: string;

  @Column()
  address!: string;

  @Column({ type: "enum", enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items!: OrderItem[];
}
