# Endpoints para Pruebas JMeter — Plataforma Votación SERVEL

## Configuración Base

| Parámetro | Valor |
| :--- | :--- |
| **Host** | localhost |
| **Puerto** | 3000 |
| **Base Path** | /api/v1 |
| **Content-Type** | application/json (salvo carga de padrón) |
| **URL completa base** | http://localhost:3000/api/v1 |

---

## Variables de Usuario Recomendadas (JMeter User Defined Variables)

| Variable | Valor de ejemplo | Descripción |
| :--- | :--- | :--- |
| `BASE_URL` | http://localhost:3000/api/v1 | Base de todos los endpoints |
| `RUT_PRUEBA` | 8.888.888-K | Usuario principal con clave conocida |
| `CLAVE_PRUEBA` | 123456 | Clave del usuario principal |
| `VOTACION_ACTIVA_ID` | 0d77f482-809f-45b2-b5ab-a13a3f1943dd | VOT-001 (jueves, sin restricción) |
| `VOTACION_ZONA_ID` | 0f3f0256-96c6-44fb-8857-cd8140f683ef | VOT-002 (holaMundo, Los Lagos/Purranque) |
| `VOTACION_CERRADA_ID` | d2f44ac0-ac93-44cf-842a-f827d662267c | VOT-003 (TestHU05, cerrada) |
| `CANDIDATO_VOT001_ID` | c864c686-482f-40c3-b255-b6cd15ec7231 | CAND-001 asignado a VOT-001 |

---

## Módulo 1: Autenticación (`/auth`)

### 1.1 — Login (POST)
Valida RUT + clave. Si es correcto devuelve datos del votante y estado de habilitación.

```
Método:  POST
URL:     ${BASE_URL}/auth/login
Headers: Content-Type: application/json

Body:
{
  "rut": "${RUT_PRUEBA}",
  "clave": "${CLAVE_PRUEBA}"
}

Respuesta exitosa (200):
{
  "body": {
    "votante": { "id": "...", "rut": "8.888.888-K", "nombres": "Marta", ... },
    "habilitado": false
  }
}

Errores esperados:
- 401: RUT o clave inválidos (credenciales incorrectas o RUT inexistente)
```

**Casos de prueba:**
| Caso | rut | clave | Resultado esperado |
| :--- | :--- | :--- | :--- |
| Credenciales válidas | 8.888.888-K | 123456 | HTTP 200 |
| Clave incorrecta | 8.888.888-K | wrong | HTTP 401 |
| RUT inexistente | 00.000.000-0 | 123456 | HTTP 401 |

---

### 1.2 — Enviar OTP (POST)
Envía el código OTP al email del votante. Opcionalmente valida elegibilidad para una votación.

```
Método:  POST
URL:     ${BASE_URL}/auth/send-otp
Headers: Content-Type: application/json

Body (sin votación):
{
  "rut": "${RUT_PRUEBA}"
}

Body (con validación de elegibilidad):
{
  "rut": "${RUT_PRUEBA}",
  "votacionId": "${VOTACION_ACTIVA_ID}"
}

Respuesta exitosa (201):
{
  "body": { "sent": true }
}

Errores esperados:
- 403: Votante no elegible (con votacionId) — respuesta incluye campo "reasons"
```

---

### 1.3 — Verificar OTP (POST)
Valida el código OTP ingresado. Consume el intento. Bloquea tras 3 fallos.

```
Método:  POST
URL:     ${BASE_URL}/auth/verify-otp
Headers: Content-Type: application/json

Body:
{
  "rut": "${RUT_PRUEBA}",
  "otp": "123456"
}

Respuesta exitosa (201):
{
  "body": { "verified": true }
}

Errores esperados:
- 401: Código OTP inválido
- 403: Cuenta bloqueada por exceso de intentos
- 410: OTP expirado (superados los 5 minutos)
```

**Casos de prueba:**
| Caso | otp | Resultado esperado |
| :--- | :--- | :--- |
| OTP correcto en tiempo | [código real recibido] | HTTP 201, verified: true |
| OTP incorrecto (intento 1) | 000000 | HTTP 401, quedan 2 intentos |
| OTP incorrecto (intento 2) | 000000 | HTTP 401, queda 1 intento |
| OTP incorrecto (intento 3) | 000000 | HTTP 403, cuenta bloqueada |
| OTP expirado | [código real pero vencido] | HTTP 410 / error de expiración |

---

### 1.4 — Reenviar OTP (POST)
Genera y reenvía un nuevo OTP. Reinicia el contador de tiempo pero **no** el contador de intentos.

```
Método:  POST
URL:     ${BASE_URL}/auth/resend-otp
Headers: Content-Type: application/json

Body:
{
  "rut": "${RUT_PRUEBA}"
}

Respuesta exitosa (201):
{
  "body": { "sent": true }
}
```

---

### 1.5 — Cerrar sesión (POST)
Registra el cierre de sesión en los logs de auditoría.

```
Método:  POST
URL:     ${BASE_URL}/auth/logout
Headers: Content-Type: application/json

Body:
{
  "rut": "${RUT_PRUEBA}",
  "motivo": "Cierre de sesión manual"
}

Respuesta exitosa (201):
{
  "ok": true
}
```

---

### 1.6 — Registrar votante (POST)
Crea un nuevo votante con clave conocida (alternativa a importación de padrón).

```
Método:  POST
URL:     ${BASE_URL}/auth/register
Headers: Content-Type: application/json

Body:
{
  "rut": "10.111.222-3",
  "nombres": "Beatriz",
  "apellidos": "Fuentes",
  "email": "beatriz.fuentes@test.com",
  "clave": "TestClave123",
  "region": "Valparaíso",
  "comuna": "Viña del Mar",
  "fechaNacimiento": "19950315"
}

Respuesta exitosa (201):
{
  "body": { "id": "...", "rut": "10.111.222-3", "nombres": "Beatriz", ... }
}

Errores esperados:
- 400: RUT ya registrado / datos inválidos
```

---

### 1.7 — Solicitar reset de clave (POST)
Genera un token de reset enviado al email del votante. Necesario para usuarios con clave aleatoria.

```
Método:  POST
URL:     ${BASE_URL}/auth/request-password-reset
Headers: Content-Type: application/json

Body:
{
  "rut": "12.345.678-5"
}

Respuesta exitosa (201):
{
  "body": { "sent": true }
}
```

---

### 1.8 — Reset de clave (POST)
Establece una nueva clave usando el token recibido por email.

```
Método:  POST
URL:     ${BASE_URL}/auth/reset-password
Headers: Content-Type: application/json

Body:
{
  "rut": "12.345.678-5",
  "token": "[token recibido por email]",
  "newPassword": "NuevaClave123"
}

Respuesta exitosa (201):
{
  "body": { "ok": true }
}
```

---

## Módulo 2: Votaciones (`/votaciones`)

### 2.1 — Listar todas las votaciones (GET)
Devuelve todas las votaciones con su estado actual.

```
Método:  GET
URL:     ${BASE_URL}/votaciones
Headers: (ninguno requerido)

Respuesta exitosa (200):
[
  {
    "id": "0d77f482-809f-45b2-b5ab-a13a3f1943dd",
    "nombre": "jueves",
    "fechaApertura": "2026-06-26T00:01:21.000Z",
    "fechaCierre": "2026-08-26T22:00:00.000Z",
    "estado": "ACTIVA",
    "region": null,
    "comuna": null,
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

---

### 2.2 — Obtener votación por ID (GET)

```
Método:  GET
URL:     ${BASE_URL}/votaciones/${VOTACION_ACTIVA_ID}
Headers: (ninguno requerido)

Respuesta exitosa (200):
{ "id": "...", "nombre": "jueves", "estado": "ACTIVA", ... }

Errores esperados:
- 404: Votación no encontrada
- 400: UUID con formato inválido
```

---

### 2.3 — Verificar elegibilidad de votante (GET)
Comprueba si un votante puede participar en una votación específica (restricciones de zona, comunidad, o si ya votó).

```
Método:  GET
URL:     ${BASE_URL}/votaciones/${VOTACION_ACTIVA_ID}/eligibility?rut=${RUT_PRUEBA}
Headers: (ninguno requerido)

Respuesta — elegible (200):
{
  "eligible": true,
  "reasons": []
}

Respuesta — no elegible (200):
{
  "eligible": false,
  "reasons": ["Región no coincide"]
}
```

**Casos de prueba:**
| Caso | votacionId | rut | Resultado esperado |
| :--- | :--- | :--- | :--- |
| Votante sin restricción, votación sin restricción | VOT-001 | 8.888.888-K | eligible: true |
| Votante fuera de zona | VOT-002 (Los Lagos) | 8.888.888-K (Valparaíso) | eligible: false, reasons: ["Región no coincide", "Comuna no coincide"] |
| RUT inexistente | VOT-001 | 00.000.000-0 | eligible: false, reasons: ["Votante no registrado"] |
| Votante que ya votó | VOT-001 | [RUT que ya votó] | eligible: false, reasons: ["Ya ejerciste tu voto"] |

---

### 2.4 — Obtener resultados de votación (GET)
Solo disponible para votaciones con estado CERRADA.

```
Método:  GET
URL:     ${BASE_URL}/votaciones/${VOTACION_CERRADA_ID}/resultados
Headers: (ninguno requerido)

Respuesta exitosa (200):
{
  "id": "d2f44ac0-...",
  "nombre": "TestHU05",
  "estado": "CERRADA",
  "totalVotos": 5,
  "votosBlancos": 1,
  "candidatos": [
    { "id": "21af20d3-...", "nombres": "TestHU05", "apellidos": "", "votos": 4 }
  ]
}
```

---

### 2.5 — Emitir voto (POST)
Registra el voto de un votante. Requiere que la votación esté ACTIVA y el votante sea elegible.

```
Método:  POST
URL:     ${BASE_URL}/votaciones/${VOTACION_ACTIVA_ID}/votar
Headers: Content-Type: application/json

Body (voto a candidato):
{
  "rut": "${RUT_PRUEBA}",
  "payload": {
    "candidateId": "${CANDIDATO_VOT001_ID}"
  }
}

Body (voto en blanco):
{
  "rut": "${RUT_PRUEBA}",
  "payload": {
    "blank": true
  }
}

Respuesta exitosa (201):
{
  "codigoParticipacion": "abc123xyz..."
}

Errores esperados:
- 403: Votación no activa / plazo expirado
- 409: Votante ya emitió su voto (doble sufragio prevenido)
- 404: Votación no encontrada
```

**Casos de prueba:**
| Caso | payload | Resultado esperado |
| :--- | :--- | :--- |
| Voto a candidato válido | `{ "candidateId": "..." }` | HTTP 201, código de participación |
| Voto en blanco | `{ "blank": true }` | HTTP 201, código de participación |
| Doble voto (mismo RUT) | [cualquier payload] | HTTP 409 o 403 |
| Votación cerrada | [voto a VOT-003] | HTTP 403 |
| Votación fuera de tiempo (after fechaCierre) | [cualquier] | HTTP 403 |

---

### 2.6 — Crear votación (POST)

```
Método:  POST
URL:     ${BASE_URL}/votaciones
Headers: Content-Type: application/json

Body (sin restricción de zona):
{
  "nombre": "Votación Pendiente Test",
  "fechaApertura": "2026-08-15T09:00:00.000Z",
  "fechaCierre": "2026-09-15T18:00:00.000Z"
}

Body (con restricción de zona):
{
  "nombre": "Votación Zona Los Lagos",
  "fechaApertura": "2026-08-15T09:00:00.000Z",
  "fechaCierre": "2026-09-15T18:00:00.000Z",
  "region": "Los Lagos",
  "comuna": "Purranque"
}

Respuesta exitosa (201):
{
  "id": "uuid-generado",
  "nombre": "Votación Pendiente Test",
  "estado": "PENDIENTE",
  ...
}

Errores esperados:
- 400: Fecha de apertura con menos de 14 días de anticipación
- 400: Datos inválidos (campos requeridos faltantes)
```

**Casos de prueba:**
| Caso | fechaApertura | Resultado esperado |
| :--- | :--- | :--- |
| Fecha válida (>14 días) | 2026-08-15 | HTTP 201, estado PENDIENTE |
| Fecha inválida (<14 días) | mañana | HTTP 400 |

---

### 2.7 — Asignar candidatos a votación (POST)

```
Método:  POST
URL:     ${BASE_URL}/votaciones/${VOTACION_ACTIVA_ID}/candidatos
Headers: Content-Type: application/json

Body:
{
  "candidatosIds": ["uuid-candidato-1", "uuid-candidato-2"]
}

Respuesta exitosa (201): votación actualizada con candidatos
```

---

### 2.8 — Editar votación (PATCH)
Solo permitido para votaciones PENDIENTE fuera del período de bloqueo.

```
Método:  PATCH
URL:     ${BASE_URL}/votaciones/${VOTACION_ACTIVA_ID}
Headers: Content-Type: application/json

Body (parcial):
{
  "nombre": "Nombre Actualizado",
  "fechaCierre": "2026-10-01T18:00:00.000Z"
}

Errores esperados:
- 403: Votación en período de bloqueo (dentro de los 14 días previos a apertura)
- 403: Votación no está en estado PENDIENTE
```

---

### 2.9 — Eliminar votación (DELETE)
Solo permitido para votaciones PENDIENTE fuera del período de bloqueo.

```
Método:  DELETE
URL:     ${BASE_URL}/votaciones/${VOTACION_ACTIVA_ID}
Headers: (ninguno requerido)

Respuesta exitosa (200): { "ok": true } o votación eliminada

Errores esperados:
- 403: Votación activa o cerrada no puede eliminarse
```

---

## Módulo 3: Candidatos (`/candidatos`)

### 3.1 — Listar todos los candidatos (GET)

```
Método:  GET
URL:     ${BASE_URL}/candidatos
Headers: (ninguno requerido)

Respuesta exitosa (200):
[
  {
    "id": "c864c686-...",
    "votacionId": "0d77f482-...",
    "nombres": "12",
    "apellidos": "13",
    "estado": "ACTIVO",
    ...
  },
  ...
]
```

---

### 3.2 — Listar candidatos sin asignar (GET)
Devuelve candidatos que no tienen votación asignada.

```
Método:  GET
URL:     ${BASE_URL}/candidatos/disponibles
Headers: (ninguno requerido)

Respuesta exitosa (200):
[ ... ] (vacío si todos están asignados)
```

---

### 3.3 — Crear candidato (POST)

```
Método:  POST
URL:     ${BASE_URL}/candidatos
Headers: Content-Type: application/json

Body (sin asignar a votación):
{
  "nombres": "Candidato",
  "apellidos": "Sin Asignar",
  "rut": "10.000.000-1",
  "partidoPolitico": "Partido Ejemplo",
  "lista": "Lista A",
  "descripcion": "Descripción del candidato"
}

Body (asignado a votación):
{
  "nombres": "Candidato",
  "apellidos": "Con Votación",
  "rut": "10.000.000-2",
  "votacionId": "${VOTACION_ACTIVA_ID}"
}

Respuesta exitosa (201):
{
  "id": "uuid-nuevo",
  "nombres": "Candidato",
  "apellidos": "Sin Asignar",
  "votacionId": null,
  "estado": "ACTIVO",
  ...
}
```

---

### 3.4 — Editar candidato (PUT)

```
Método:  PUT
URL:     ${BASE_URL}/candidatos/{candidatoId}
Headers: Content-Type: application/json

Body (parcial):
{
  "nombres": "Nombre Actualizado",
  "descripcion": "Nueva descripción"
}

Respuesta exitosa (200): candidato actualizado
```

---

### 3.5 — Eliminar candidato (DELETE)

```
Método:  DELETE
URL:     ${BASE_URL}/candidatos/{candidatoId}
Headers: (ninguno requerido)

Respuesta exitosa (200):
{ "ok": true }

Errores esperados:
- 400 / 409: Candidato asignado a votación no puede eliminarse
```

**Casos de prueba:**
| Caso | candidatoId | Resultado esperado |
| :--- | :--- | :--- |
| Candidato sin votación (CAND-SIN) | [ID creado en setup] | HTTP 200, ok: true |
| Candidato asignado a votación | c864c686-... (CAND-001) | HTTP 400/409, error |

---

## Módulo 4: Administración (`/admin`)

### 4.1 — Listar todos los votantes (GET)

```
Método:  GET
URL:     ${BASE_URL}/admin/votantes
Headers: (ninguno requerido)

Respuesta exitosa (200):
{
  "body": [
    { "id": "...", "rut": "8.888.888-K", "nombres": "Marta", "habilitado": false, ... },
    ...
  ]
}
```

---

### 4.2 — Habilitar / inhabilitar votante (PUT)
Alterna el estado de habilitación de un votante. Usar para configurar escenarios de prueba.

```
Método:  PUT
URL:     ${BASE_URL}/admin/votantes/{rut}
Headers: Content-Type: application/json

Body (habilitar):
{
  "habilitado": true
}

Body (inhabilitar):
{
  "habilitado": false
}

Respuesta exitosa (200):
{ "body": { "rut": "8.888.888-K", "habilitado": true, ... } }
```

**Uso en pruebas:**
| Escenario a probar | Acción previa |
| :--- | :--- |
| Login con usuario habilitado | PUT /admin/votantes/8.888.888-K `{"habilitado": true}` |
| Login con usuario inhabilitado | PUT /admin/votantes/8.888.888-K `{"habilitado": false}` |

---

### 4.3 — Actualizar etnia de votante (PUT)

```
Método:  PUT
URL:     ${BASE_URL}/admin/votantes/{rut}/etnia
Headers: Content-Type: application/json

Body:
{
  "etnia": "Mapuche"
}

Respuesta exitosa (200): { "body": { ... } }
```

---

### 4.4 — Eliminar votante (DELETE)

```
Método:  DELETE
URL:     ${BASE_URL}/admin/votantes/{rut}
Headers: (ninguno requerido)

Respuesta exitosa (200): { "body": { ... } }
```

---

### 4.5 — Cargar padrón desde archivo (POST — multipart/form-data)
Importa votantes desde un archivo CSV o JSON. Campo del formulario: `file`.

```
Método:  POST
URL:     ${BASE_URL}/admin/padron/upload
Headers: Content-Type: multipart/form-data

Form Data:
  file: [archivo CSV o JSON]

Respuesta exitosa (201):
{
  "body": {
    "added": 2,
    "updated": 0
  }
}

Errores esperados:
- 400: Archivo no recibido
- 400: RUT vacío o inválido en alguna fila
- 400: Formato de archivo no soportado (ej. .xlsx)
```

**Configuración en JMeter:**
Usar `HTTP Request` con método POST y en la pestaña "Files Upload":
- Field Name: `file`
- File Path: ruta al archivo CSV de prueba
- MIME Type: `text/csv`

**Casos de prueba con archivos de la carpeta `samples/`:**
| Archivo | MIME Type | Resultado esperado |
| :--- | :--- | :--- |
| `padron_valido.csv` | text/csv | HTTP 201, added: 2, updated: 0 |
| `padron_sin_rut.csv` | text/csv | HTTP 400, error de validación |
| `padron_formato_erroneo.xlsx` | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | HTTP 400, formato no soportado |
| `padron_actualizacion.csv` | text/csv | HTTP 201, added: 0, updated: 2 |

---

## Módulo 5: Logs (`/logs`)

> Los endpoints de logs son de **solo lectura**. Verificar que no acepten métodos de escritura (DELETE, PUT, PATCH) — deben retornar HTTP 404 o 405 para garantizar la inmutabilidad (HU-08.3).

### 5.1 — Logs de votantes (GET)

```
Método:  GET
URL:     ${BASE_URL}/logs/votantes
Headers: (ninguno requerido)

Respuesta exitosa (200):
[
  {
    "id": "uuid",
    "tipo": "AUTENTICACION",
    "rutHash": "hash-sha256",
    "ipHash": "hash-sha256",
    "resultado": "EXITOSO",
    "createdAt": "..."
  },
  ...
]

Nota de seguridad: rutHash e ipHash deben ser hashes SHA-256/HMAC — nunca el valor en claro.
```

---

### 5.2 — Logs de administradores (GET)

```
Método:  GET
URL:     ${BASE_URL}/logs/admins
Headers: (ninguno requerido)

Respuesta exitosa (200):
[
  {
    "id": "uuid",
    "tipo": "ACCION_VOTACION",
    "accion": "CREAR",
    "descripcion": "Votación creada: jueves",
    "ip": "127.0.0.1",
    "votacionId": "0d77f482-...",
    "detalles": null,
    "createdAt": "..."
  },
  ...
]
```

---

### 5.3 — Logs del sistema (GET)

```
Método:  GET
URL:     ${BASE_URL}/logs/sistema
Headers: (ninguno requerido)

Respuesta exitosa (200):
[
  {
    "id": "uuid",
    "tipo": "Error",
    "modulo": "logs",
    "gravedad": "ERROR",
    "mensaje": "Error de prueba: verificación del sistema de auditoría",
    "stack": "Error: ...",
    "createdAt": "..."
  },
  ...
]
```

---

### 5.4 — Endpoint de prueba de error (GET) ⚠️ TEMPORAL
Fuerza un error 500 para verificar que el sistema de auditoría lo registre en `sistema_logs`.

```
Método:  GET
URL:     ${BASE_URL}/logs/test-error
Headers: (ninguno requerido)

Respuesta esperada (500):
{ "statusCode": 500, "message": "Internal server error" }

Efecto en BD: Se registra una entrada en sistema_logs con gravedad ERROR.
Verificar con: GET ${BASE_URL}/logs/sistema

NOTA: Eliminar este endpoint antes de entregar el sistema a producción.
```

---

## Resumen de Endpoints por HU

| HU | Endpoints relevantes |
| :--- | :--- |
| **HU-01A** (acceso público) | `GET /votaciones`, `GET /votaciones/:id` |
| **HU-01A.2** (control visual participación) | `GET /votaciones/:id/eligibility?rut=` |
| **HU-01B** (autenticación OTP) | `POST /auth/login`, `POST /auth/send-otp`, `POST /auth/verify-otp` |
| **HU-01B.1** (validación padrón) | `POST /auth/login` |
| **HU-01B.2** (filtro restricciones) | `POST /auth/send-otp` (con votacionId), `GET /votaciones/:id/eligibility?rut=` |
| **HU-01B.3** (OTP básico) | `POST /auth/send-otp`, `POST /auth/verify-otp` |
| **HU-01B.4** (seguridad OTP) | `POST /auth/verify-otp` (múltiples intentos), `POST /auth/resend-otp` |
| **HU-02** (papeleta digital) | `GET /votaciones/:id`, `GET /votaciones/:id/eligibility?rut=` |
| **HU-03** (emisión voto) | `POST /votaciones/:id/votar` |
| **HU-04** (voto en blanco) | `POST /votaciones/:id/votar` con `{ "blank": true }` |
| **HU-05** (apertura/cierre automático) | `GET /votaciones`, `GET /votaciones/:id` |
| **HU-05.3** (expiración en caliente) | `POST /votaciones/:id/votar` (tras fechaCierre) |
| **HU-06** (visualización resultados) | `GET /votaciones/:id/resultados` |
| **HU-07** (gestión padrón) | `POST /admin/padron/upload` |
| **HU-08** (auditoría y logs) | `GET /logs/votantes`, `GET /logs/admins`, `GET /logs/sistema` |
| **HU-08.3** (inmutabilidad logs) | Intentar `DELETE /logs/votantes`, `PUT /logs/votantes` → esperar 404/405 |
| **HU-09** (cierre sesión) | `POST /auth/logout` |
| **HU-10** (dashboard monitoreo) | `GET /votaciones` (clasificar por estado en frontend) |
| **HU-11** (crear votación) | `POST /votaciones` |
| **HU-12** (editar/eliminar pendientes) | `PATCH /votaciones/:id`, `DELETE /votaciones/:id` |
| **HU-13** (gestión candidatos) | `GET /candidatos`, `POST /candidatos`, `PUT /candidatos/:id`, `DELETE /candidatos/:id` |
| **HU-14** (anonimato) | `GET /logs/votantes` (verificar rutHash ≠ RUT en claro), `GET /logs/admins` (verificar sin candidato elegido) |
| **HU-14.1** (cifrado) | Verificar en BD: tabla `participaciones` solo contiene hash, no RUT |
| **HU-14.2** (registro aislado) | Verificar en BD: tabla `participaciones` no tiene FK a candidato |
| **HU-14.3** (escrutinio desvinculado) | `GET /votaciones/:id/resultados` — solo contadores, sin datos de votante |
