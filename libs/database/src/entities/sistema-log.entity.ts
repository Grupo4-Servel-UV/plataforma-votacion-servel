import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum GravedadSistema {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

@Entity('sistema_logs')
export class SistemaLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tipo!: string;

  @Column()
  modulo!: string;

  @Column({ type: 'enum', enum: GravedadSistema })
  gravedad!: GravedadSistema;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'text', nullable: true })
  stack?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
