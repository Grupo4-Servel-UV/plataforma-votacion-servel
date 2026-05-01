import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('participaciones')
export class ParticipacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_participaciones_votacion_id')
  @Column({ name: 'votacion_id', type: 'uuid' })
  votacionId!: string;

  @Index('idx_participaciones_votante_hash')
  @Column({ name: 'votante_hash', length: 255 })
  votanteHash!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
