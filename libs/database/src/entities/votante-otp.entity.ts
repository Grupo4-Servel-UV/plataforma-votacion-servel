import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VotanteEntity } from './votante.entity';

@Entity('votante_otps')
export class VotanteOtpEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'votante_id', type: 'uuid' })
  votanteId!: string;

  @ManyToOne(() => VotanteEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'votante_id' })
  votante?: VotanteEntity;

  @Column({ name: 'otp_hash', length: 255 })
  otpHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'attempts', type: 'integer', default: 0 })
  attempts!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
