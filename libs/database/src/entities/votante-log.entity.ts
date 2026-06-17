import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoVotanteLog {
  AUTENTICACION = 'AUTENTICACION',
  VOTO = 'VOTO',
  INTENTO_FALLIDO = 'INTENTO_FALLIDO',
  CIERRE_SESION = 'CIERRE_SESION',
}

@Entity('votante_logs')
export class VotanteLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TipoVotanteLog })
  tipo!: TipoVotanteLog;

  @Column({ name: 'rut_hash' })
  rutHash!: string;

  @Column({ name: 'ip_hash', nullable: true })
  ipHash?: string;

  @Column({ nullable: true })
  resultado?: string;

  @Column({ nullable: true })
  zona?: string;

  @Column({ name: 'votacion_id', nullable: true })
  votacionId?: string;

  @Column({ nullable: true, type: 'int' })
  cantidad?: number;

  @Column({ nullable: true })
  bloqueado?: boolean;

  @Column({ type: 'text', nullable: true })
  motivo?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
