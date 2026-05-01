import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('votantes')
export class VotanteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  nombres!: string;

  @Column({ length: 255 })
  apellidos!: string;

  @Index({ unique: true })
  @Column({ length: 255, nullable: true })
  email!: string | null;

  @Index({ unique: true })
  @Column({ length: 12 })
  rut!: string;

  // Stored in YYYYMMDD format as text
  @Column({ name: 'fecha_nacimiento', length: 8, nullable: true })
  fechaNacimiento!: string | null;

  @Column({ name: 'comunidad_indigena', type: 'text', nullable: true })
  comunidadIndigena!: string | null;

  @Column({ type: 'text', nullable: true })
  region!: string | null;

  @Column({ type: 'text', nullable: true })
  comuna!: string | null;

  @Column({ name: 'etnia', type: 'text', nullable: true })
  etnia!: string | null;

  // Hashed clave (simulación de ClaveÚnica)
  @Column({ name: 'clave_hash', length: 255 })
  claveHash!: string;

  @Column({ name: 'habilitado', type: 'boolean', default: false })
  habilitado!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
