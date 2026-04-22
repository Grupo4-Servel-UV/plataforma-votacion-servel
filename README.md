# Plataforma de Votación SERVEL

[![Monorepo](https://img.shields.io/badge/Monorepo-PNPM-F69220?style=flat-square&logo=pnpm&logoColor=white)](#)
[![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](#)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](#)
[![ORM](https://img.shields.io/badge/ORM-TypeORM-262627?style=flat-square)](#)

MVP de Sistema de Votación Electrónica acotado para SERVEL. Proyecto desarrollado bajo el marco de trabajo Scrum para el curso ICI-513 Gestión de Proyectos Informáticos.

## Descripción General

Este repositorio contiene la planificación y el desarrollo del sistema de votaciones digitales para el SERVEL, diseñado bajo principios de seguridad, anonimato y trazabilidad.

## Integrantes

- Lorena Uribe
- Angel López
- Andrés González
- Lester González
- Giovanni Vásquez

---

## Estrategia de Agrupación de Historias de Usuario (Sprint Planning)

El **Product Backlog** se estructura en **7 iteraciones** bajo un enfoque Ágil de _Vertical Slicing_. Priorizamos la entrega temprana de valor (MVP) por sobre las dependencias puramente técnicas, mitigando riesgos y asegurando el núcleo del sistema desde el día uno:

- **Sprint 1 - MVP y Sufragio:** Habilitación rápida de creación, papeleta y emisión del voto (HU-11, HU-02, HU-03) usando validaciones simuladas temporalmente para demostrar flujo.
- **Sprint 2 - Arquitectura de Seguridad:** Implementación de OTP real (HU-01B) y separación de tablas en base de datos para garantizar el anonimato (HU-14).
- **Sprint 3 - Ingesta y Entidades:** Carga masiva del padrón de votantes (HU-07) y gestión oficial de candidatos (HU-13).
- **Sprint 4 - Lógica Operativa:** Automatización de fechas de apertura/cierre (HU-05), voto en blanco (HU-04) y dashboard de monitoreo (HU-10).
- **Sprint 5 - Escrutinio y Trazabilidad:** Despliegue de resultados oficiales (HU-06) y sistema inmutable de auditoría y logs (HU-08).
- **Sprint 6 - Casos Borde y Acceso Público:** Edición de procesos pendientes (HU-12) y portal informativo ciudadano sin login (HU-01A).
- **Sprint 7 - Aseguramiento de Calidad:** Cierre seguro de sesiones (HU-09), resolución de bugs y estabilización final para la entrega.

---

El feedback es sumamente preciso, analítico y tiene toda la razón. Las "costuras" que detectaron son el resultado directo de haber mezclado nuestra conversación iterativa con el código final del documento.

He aplicado una reescritura completa estandarizando el tono hacia un perfil técnico-profesional (mid/senior), eliminando el estilo de tutorial básico y enfocando el contenido en la arquitectura real.

**Secciones eliminadas o modificadas:**

- **Eliminado:** Todo texto "meta", conversacional o de relleno ("Aquí tienes el bloque...", explicaciones de cómo funciona "Ctrl + S").
- **Eliminado:** Instrucciones ultra-básicas de instalación de herramientas (ej. tutorial de Corepack). Se asume competencia del desarrollador para instalar requerimientos.
- **Modificado (Lenguaje e Inconsistencias):** Se eliminó el tono de "venta" comercial. Se unificó la estructura de directorios (`libs/contracts` -> `@servel/contracts`).
- **Agregado (Base de Datos y TypeORM):** Se integró la configuración mediante **Supabase** (URL) y se añadió la advertencia estricta sobre el uso de migraciones versus `synchronize: true`.
- **Agregado (Dominio):** Se añadió la sección **"Modelo de Dominio y Endpoints Principales"** para equilibrar la documentación funcional con la de infraestructura.

Aquí tienes el documento unificado, consistente y con el tono adecuado para un sistema crítico:

---

## 1. Arquitectura y Dominio Funcional

El sistema se divide en dos dominios principales gestionados mediante Workspaces de PNPM. Se aplica un flujo de dependencias unidireccional: las aplicaciones (`apps/`) consumen a las librerías (`libs/`), pero no viceversa.

### Estructura del Monorepo

```text
plataforma-votacion-servel/
├── apps/
│   ├── api/                 # Backend Core (NestJS)
│   └── web/                 # Plataforma Ciudadana/Admin (Next.js)
├── libs/
│   ├── database/            # Capa de Datos (TypeORM, Entidades, Migraciones)
│   └── contracts/           # Fuente de verdad compartida (Zod, Types, Enums)
└── pnpm-workspace.yaml      # Definición de enlaces
```

### Modelo de Dominio y Flujo Core

La lógica de negocio se centra en el aislamiento y seguridad del proceso de sufragio.

- **Contratos Compartidos (`@servel/contracts`):** Todo payload entre cliente y servidor se tipa y valida obligatoriamente con Zod. No existen interfaces huérfanas en las aplicaciones.
- **Flujo de Votación:** La asignación de candidatos y el registro de votos operan bajo el servicio `VotacionesModule`. Los votos se registran utilizando transacciones atómicas a nivel de base de datos para prevenir condiciones de carrera bajo alta concurrencia.

## 2. Requisitos Previos

- **Node.js**: v20.x LTS o superior.
- **PNPM**: v9.x o superior. _El uso de `npm` o `yarn` está estrictamente prohibido ya que rompe los enlaces del workspace (`phantom dependencies`)._
- **Base de Datos**: Instancia de desarrollo en Supabase activa.

## 3. Configuración Inicial y Levantamiento Local

### 3.1. Instalación de Dependencias

```bash
git clone https://github.com/Grupo4-Servel-UV/plataforma-votacion-servel.git
cd plataforma-votacion-servel
pnpm install
```

### 3.2. Variables de Entorno (Supabase)

El desarrollo local se conecta directamente a instancias de Supabase. Copia las plantillas de entorno y configura la cadena de conexión (Connection Pooling).

```bash
cp apps/api/.env.example apps/api/.env.development
```

**Ejemplo de configuración en `apps/api/.env.development`:**

```env
PORT=3000
NODE_ENV=development
# Transaction pooler URL de Supabase (puerto 6543)
DATABASE_URL="postgresql://postgres.[TU-PROYECTO]:[PASSWORD]@aws-0-[REGION][.pooler.supabase.com:6543/postgres](https://.pooler.supabase.com:6543/postgres)"
```

### 3.3. Base de Datos y TypeORM

> [!WARNING]
> **Sobre la sincronización de esquemas:** En el entorno local (`NODE_ENV=development`), TypeORM opera con `synchronize: true` para agilizar la iteración. **Esto no se utiliza en staging ni en producción.** Cualquier alteración estructural permanente debe generar su respectiva migración en `libs/database/src/migrations/`.

### 3.4. Ejecución de Servicios

Ejecuta los comandos desde la raíz del monorepo utilizando filtros de workspace:

- **Levantar ecosistema completo:** `pnpm dev`
- **Levantar solo API:** `pnpm start:api:dev`
- **Levantar solo Frontend:** `pnpm start:web:dev`

## 4. Estándares de Código y Entorno de Desarrollo (DX)

Se requiere el uso de **ESLint** (análisis estático y reglas de arquitectura) y **Prettier** (formateo de estilo). Los pipelines de CI rechazarán automáticamente cualquier código que no cumpla con ambos estándares.

Para automatizar el formateo local, se recomienda VS Code con la siguiente configuración en `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

**Comandos de validación manual:**

```bash
pnpm lint       # Evalúa reglas estáticas
pnpm lint:fix   # Repara errores de ESLint automáticamente
pnpm format     # Aplica reglas de Prettier a todo el repositorio
```

## 5. Guía de Contribución (Workflow)

El repositorio opera bajo una estrategia estricta de _Feature Branches_ y _Semantic Pull Requests_. El paso directo a `main` está bloqueado.

### 5.1. Nomenclatura de Ramas

Formato requerido: `<tipo>/<id-issue>-<descripcion>`
_Ejemplos:_ `feat/11-asignacion-candidatos`, `fix/42-pool-conexion`

### 5.2. Conventional Commits y Pull Requests

El título del Pull Request y los commits asociados son validados por GitHub Actions (`commit.lint.yml`).
Formato requerido: `tipo(ámbito): [#ID] descripción corta`

**Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

_Ejemplo válido:_ `feat(api): #11 implementar endpoint de registro de votos`

### 5.3. Aprobación de Pull Requests

El botón de Merge requerirá obligatoriamente:

1. Checklist del `PULL_REQUEST_TEMPLATE.md` completado.
2. Aprobación del validador semántico del PR.
3. Pipelines de CI (Lint, Build, Tests) en estado exitoso.
4. Un _Approve_ formal en el Code Review.

## 6. Referencia de Scripts Globales

Comandos disponibles en el directorio raíz:

| Comando         | Descripción                                                   |
| :-------------- | :------------------------------------------------------------ |
| `pnpm install`  | Resuelve dependencias y enlaces simbólicos de los workspaces. |
| `pnpm dev`      | Inicializa API y Web en paralelo.                             |
| `pnpm lint:fix` | Corrección estática en apps y librerías.                      |
| `pnpm format`   | Formateo visual estandarizado.                                |
| `pnpm build`    | Transpila y construye los artefactos para producción.         |
