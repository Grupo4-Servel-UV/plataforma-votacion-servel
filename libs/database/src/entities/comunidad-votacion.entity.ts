import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { VotacionEntity } from './votacion.entity';

@Entity('comunidades_votacion')
export class ComunidadVotacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'votacion_id', type: 'uuid' })
  votacionId!: string;

  @Column({ type: 'text' })
  comunidad!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => VotacionEntity, (votacion) => votacion.comunidades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'votacion_id' })
  votacion!: VotacionEntity;
}
