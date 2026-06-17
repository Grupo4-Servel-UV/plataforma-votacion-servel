import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoAdminLog {
  ACCION_VOTACION = 'ACCION_VOTACION',
  ACCION_VOTANTE = 'ACCION_VOTANTE',
  ACCION_CANDIDATO = 'ACCION_CANDIDATO',
  SUBIDA_PADRON = 'SUBIDA_PADRON',
}

@Entity('admin_logs')
export class AdminLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TipoAdminLog })
  tipo!: TipoAdminLog;

  @Column()
  accion!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ nullable: true })
  ip?: string;

  @Column({ name: 'votacion_id', nullable: true })
  votacionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  detalles?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
