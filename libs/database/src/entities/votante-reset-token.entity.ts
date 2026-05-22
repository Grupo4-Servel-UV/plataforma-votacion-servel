import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VotanteEntity } from './votante.entity';

@Entity('votante_reset_tokens')
export class VotanteResetTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'votante_id', type: 'uuid' })
  votanteId!: string;

  @ManyToOne(() => VotanteEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'votante_id' })
  votante?: VotanteEntity;

  @Column({ name: 'token_hash', length: 255 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
