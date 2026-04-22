import { EstadoCandidato } from '@servel/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VotacionEntity } from './votacion.entity';

@Entity('candidatos')
export class CandidatoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'votacion_id', type: 'uuid', nullable: true })
  votacionId!: string | null;

  @ManyToOne(() => VotacionEntity, (votacion) => votacion.candidatos, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'votacion_id' })
  votacion!: VotacionEntity | null;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidos!: string;

  @Column({ length: 12 })
  @Index({ unique: false })
  rut!: string;

  @Column({ name: 'partido_politico', length: 100, nullable: true })
  partidoPolitico!: string;

  @Column({ length: 50, nullable: true })
  lista!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({
    type: 'enum',
    enum: EstadoCandidato,
    default: EstadoCandidato.ACTIVO,
  })
  estado!: EstadoCandidato;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}
