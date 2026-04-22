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

  @Column({ name: 'zona_restriccion_id', type: 'int', nullable: true })
  zonaRestriccionId!: number | null;

  @Column({ name: 'comunidad_indigena', type: 'boolean', default: false })
  comunidadIndigenaReq!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => CandidatoEntity, (candidato) => candidato.votacion)
  candidatos!: CandidatoEntity[];
}
