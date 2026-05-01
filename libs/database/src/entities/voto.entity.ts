import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('votos')
export class VotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'votacion_id', type: 'uuid' })
  votacionId!: string;

  // Store ballot payload as JSONB to keep votes anonymous and flexible
  @Column({ name: 'payload', type: 'jsonb' })
  payload!: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
