import { EstadoVotacion } from '@servel/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CandidatoEntity } from './candidato.entity';
import { ComunidadVotacionEntity } from './comunidad-votacion.entity';

@Entity('votaciones')
export class VotacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ name: 'fecha_apertura', type: 'timestamptz' })
  fechaApertura!: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz' })
  fechaCierre!: Date;

  @Index('idx_votaciones_estado')
  @Column({
    type: 'enum',
    enum: EstadoVotacion,
    default: EstadoVotacion.PENDIENTE,
  })
  estado!: EstadoVotacion;

  @Column({ name: 'region', type: 'text', nullable: true })
  region!: string | null;

  @Column({ name: 'comuna', type: 'text', nullable: true })
  comuna!: string | null;

  @OneToMany(() => ComunidadVotacionEntity, (comunidad) => comunidad.votacion, {
    cascade: true,
  })
  comunidades!: ComunidadVotacionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => CandidatoEntity, (candidato) => candidato.votacion)
  candidatos!: CandidatoEntity[];
}
