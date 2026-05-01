import 'dotenv/config';
import { AppDataSource } from '@servel/database';
import { VotanteEntity } from '@servel/database';
import * as bcrypt from 'bcryptjs';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a DB');

    const repo = AppDataSource.getRepository(VotanteEntity);

    const seeds = [
      {
        nombres: 'María Fernanda',
        apellidos: 'González Pérez',
        rut: '11111111-1',
        fechaNacimiento: '19850101',
        region: 'RM',
        comuna: 'Santiago',
        clave: 'Password1!',
        etnia: 'Mapuche',
        habilitado: true,
      },
      {
        nombres: 'Juan Carlos',
        apellidos: 'Soto Muñoz',
        rut: '22222222-2',
        fechaNacimiento: '19900202',
        region: 'V',
        comuna: 'Valparaíso',
        clave: 'Password2!',
        etnia: 'Ninguna',
        habilitado: false,
      },
      {
        nombres: 'Ana María',
        apellidos: 'Rojas Díaz',
        rut: '33333333-3',
        fechaNacimiento: '19751212',
        region: 'X',
        comuna: 'Puerto Montt',
        clave: 'Password3!',
        etnia: 'Aimara',
        habilitado: false,
      },
    ];

    for (const s of seeds) {
      const exists = await repo.findOneBy({ rut: s.rut });
      if (exists) {
        console.log('Ya existe', s.rut);
        continue;
      }

      const hash = await bcrypt.hash(s.clave, 10);
      const entity = repo.create({
        nombres: s.nombres,
        apellidos: s.apellidos,
        rut: s.rut,
        fechaNacimiento: s.fechaNacimiento,
        comunidadIndigena: null,
        region: s.region,
        comuna: s.comuna,
        etnia: s.etnia ?? null,
        claveHash: hash,
        habilitado: s.habilitado,
      });

      await repo.save(entity);
      console.log('Creado', s.rut);
    }

    await AppDataSource.destroy();
    console.log('Seeder finalizado');
  } catch (err) {
    console.error('Error seed', err);
    process.exit(1);
  }
}

run();
