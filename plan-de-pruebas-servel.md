# Plan de Pruebas

## INFORMACIÓN DEL DOCUMENTO

### HISTORIA DEL DOCUMENTO
| **Documento** | Plan de Pruebas - Plataforma de Votación SERVEL |
| :--- | :--- |
| **Preparado por** | Equipo Grupo 4 — ICI-513 Gestión de Proyectos Informáticos |
| **Aprobado por** | Lorena Uribe |
| **Fecha de Creación** | 25/06/2026 |

---

### CONTROL DE VERSIONES
| Versión | Fecha | Preparado por | Descripción |
| :---: | :---: | :---: | :--- |
| 1.0 | 25/06/2026 | Grupo 4 | Creación inicial del documento de Plan de Pruebas. |
| | | | |
| | | | |

---

## Contenido
1. Antecedentes Generales
2. Introducción
    - Propósito
3. Estrategia de Pruebas
    - Alcance
    - En Alcance
    - Fuera de Alcance
    - Data de Prueba
    - Herramientas
    - Técnicas
    - Estrategia de Ejecución
        - Criterios de Entrada
        - Criterios de Salida
4. Gestión de Defectos
    - Roles y Responsabilidades de QA
    - Roles y Responsabilidades de Desarrollo
    - Categorización de Defectos
    - Seguimiento de Defectos
5. Riesgos y Problemas

---

## Antecedentes Generales

Dentro del proceso de pruebas de software, la fase de planificación constituye una actividad fundamental, ya que permite asegurar que las necesidades y expectativas de los interesados sean adecuadamente consideradas y abordadas durante el ciclo de pruebas. En esta etapa resulta indispensable definir de manera estructurada el alcance del esfuerzo de pruebas, identificando los requisitos que serán evaluados, los riesgos asociados, los casos de prueba, los entornos de ejecución, los objetivos perseguidos, la estrategia de pruebas, los criterios de aceptación y demás elementos necesarios para su correcta gestión.

El presente Plan de Pruebas corresponde al MVP de la Plataforma de Votación Electrónica desarrollada para el SERVEL, en el marco del curso ICI-513 Gestión de Proyectos Informáticos. El sistema fue desarrollado durante 7 sprints bajo metodología Scrum, abarcando funcionalidades de autenticación con OTP, emisión de voto anónimo, gestión del padrón electoral, auditoría inmutable y administración de procesos electorales.

El principal artefacto utilizado para documentar esta información es el Plan de Pruebas. Este documento establece las directrices que orientarán la ejecución, seguimiento y control de las actividades de prueba, proporcionando una base común para todos los participantes del proceso.

---

## Introducción

### Propósito

El propósito de este documento es establecer el enfoque de pruebas y el marco de referencia general para la validación del sistema **Plataforma de Votación SERVEL**. Asimismo, se describen los principales elementos que sustentan el proceso de verificación y validación, con el fin de evaluar aspectos relacionados con la funcionalidad, seguridad, rendimiento y usabilidad del sistema.

El sistema tiene como característica crítica la garantía de **anonimato del voto** y la **prevención del doble sufragio**, por lo que el plan de pruebas pone especial énfasis en la verificación de los mecanismos de seguridad implementados a nivel de base de datos, autenticación y auditoría.

El documento contempla los siguientes componentes:

- **Estrategia de Pruebas:** Define los principios, lineamientos y criterios que regirán la ejecución de las actividades de prueba. Incluye la descripción de los objetivos de pruebas, alcance, restricciones y especificación de datos de prueba, herramientas, técnicas y criterios de entrada y salida.
- **Estrategia de Ejecución:** Describe el procedimiento mediante el cual se llevarán a cabo las pruebas, estableciendo los mecanismos de seguimiento y control, así como el proceso de identificación, registro, clasificación y reporte de defectos.
- **Gestión de Pruebas:** Establece las actividades necesarias para la planificación, coordinación y control de los recursos involucrados en el proceso de pruebas, incluyendo la gestión de riesgos, asignación de responsabilidades y mecanismos de monitoreo.

---

## Estrategia de Pruebas

### Alcance

El alcance del desarrollo de las pruebas se encuentra definido por el tipo de prueba a realizar y las funcionalidades implementadas durante los 7 sprints del proyecto.

**Tabla 1: Alcance Plan de Pruebas**

| Tipo de Prueba | Definición | En Alcance | Fuera de Alcance |
| :--- | :--- | :---: | :---: |
| **SIT (System Integration Testing)** | Verifica que los componentes integrados del sistema interactúen correctamente y cumplan los requisitos especificados. | ✓ | |
| **Funcional** | Valida que el sistema entregue los resultados esperados de acuerdo con los requisitos funcionales definidos. | ✓ | |
| **No Funcional** | Evalúa atributos de calidad del sistema, tales como rendimiento, confiabilidad, seguridad y usabilidad. | ✓ | |
| **Aseguramiento de Producción (PVT)** | Verifica que el sistema opere correctamente en el entorno productivo y satisfaga las necesidades del negocio. | | ✓ |

> **Nota:** Las pruebas de Aseguramiento de Producción (PVT) quedan fuera de alcance dado que el sistema corresponde a un MVP académico sin despliegue en entorno productivo real.

---

#### En Alcance

El alcance para el desarrollo de las pruebas cubre las historias de usuario definidas en los Sprints 1 al 7 del proyecto. A continuación se detallan las funcionalidades a certificar y el tipo de prueba utilizado.

**Tabla 2: Alcance de Funcionalidades**

| Funcionalidad | Tipo de Prueba | Condiciones para testear |
| :--- | :--- | :--- |
| HU-11 — Crear nueva votación | Funcional | Validar que el administrador puede crear una votación con candidatos, fechas válidas (mínimo 2 semanas de anticipación) y restricciones opcionales. Verificar que el sistema rechaza fechas que no cumplan el margen mínimo. |
| HU-02 — Visualizar papeleta digital | Funcional | Validar que la papeleta muestre todos los candidatos de la votación activa. Verificar que las restricciones de zona filtren correctamente los candidatos visibles y que se use imagen por defecto cuando no hay imagen registrada. |
| HU-03 — Emisión del voto y código de participación | Funcional / SIT | Validar que el voto se registre correctamente y se entregue un código de participación único. Verificar que el rechazo en el emergente no registre ningún voto. |
| HU-01B — Autenticación con Clave Única y OTP | Funcional / No Funcional | Validar el flujo completo de autenticación: RUT + Clave Única → verificación en padrón → restricciones → envío de OTP → ingreso de código. Verificar bloqueo tras 3 intentos fallidos y expiración del código. |
| HU-01B.1 — Autenticación Base y Validación de Padrón | Funcional | Verificar que solo usuarios habilitados en el padrón puedan autenticarse. Validar mensaje de error para RUT no registrado o clave incorrecta. Verificar bloqueo a quien ya votó. |
| HU-01B.2 — Filtro de Restricciones Electorales | Funcional | Verificar que usuarios fuera de zona o comunidad indígena requerida sean bloqueados antes del OTP. |
| HU-01B.3 — Emisión y Validación Básica de OTP | Funcional | Verificar que el OTP llegue al correo registrado y que su ingreso correcto permita el acceso a la papeleta. |
| HU-01B.4 — Seguridad y Manejo de Errores OTP | No Funcional | Verificar límite de 3 intentos, bloqueo al superarlo y que el reenvío del OTP mantenga el contador de intentos activo. |
| HU-14 — Garantía de anonimato del voto | Funcional / SIT | Verificar a nivel de base de datos que la tabla `Resultados` no contenga FK ni datos del votante. Verificar que la tabla `Participaciones` solo almacene RUT cifrado y código de participación. |
| HU-14.1 — Cifrado y Generación de Código | No Funcional | Verificar que el RUT sea sometido a hash criptográfico (SHA-256/bcrypt) antes de almacenarse. Verificar unicidad del código de participación. |
| HU-14.2 — Registro Aislado de Participación | Funcional / SIT | Verificar que la tabla `Participaciones` registre únicamente código de participación y RUT cifrado, sin datos de la elección realizada. |
| HU-14.3 — Escrutinio y Sumatoria Desvinculada | Funcional / SIT | Verificar que la tabla `Resultados` solo incremente el contador (+1) sin almacenar datos personales ni tokens del votante. |
| HU-07 — Gestión del padrón de usuarios | Funcional | Verificar carga de archivo CSV/JSON válido, rechazo de archivos con formato incorrecto o campos obligatorios faltantes (RUT, región, comuna, estado), actualización sin duplicación de RUT y resumen de carga. |
| HU-13 — Gestión de candidatos | Funcional | Verificar creación, edición y eliminación de candidatos. Verificar que candidatos asignados a votaciones no puedan ser eliminados. |
| HU-05 — Apertura y cierre automático de votación | Funcional / No Funcional | Verificar cambio automático de estado en fecha de apertura y cierre. Verificar que la papeleta sea inaccesible para votaciones cerradas o pendientes, incluso forzando la URL. |
| HU-05.3 — Control de expiración de tiempo en caliente | Funcional | Verificar que un voto enviado tras el cierre sea rechazado a nivel de servidor (no solo frontend). |
| HU-04 — Voto en blanco | Funcional | Verificar que el voto en blanco se registre en la tabla `Resultados` como categoría separada y entregue código de participación. |
| HU-10 — Panel de monitoreo del dashboard | Funcional | Verificar que el dashboard clasifique correctamente las votaciones por estado (activas, pendientes, cerradas) y muestre resultados solo para votaciones cerradas. |
| HU-06 — Visualización de resultados | Funcional | Verificar que los resultados (votos válidos, votos en blanco, total de participación) sean visibles solo para votaciones cerradas. Verificar que votaciones activas o pendientes no expongan el conteo. |
| HU-08 — Auditoría y logs del sistema | Funcional / No Funcional | Verificar que los tres tipos de logs (votantes, administradores, sistema) registren correctamente los eventos. Verificar que el RUT e IP en logs de votantes estén cifrados y que nunca se registre el candidato elegido. |
| HU-08.3 — Inmutabilidad de logs | No Funcional | Verificar que los registros de logs no puedan ser modificados ni eliminados mediante la interfaz ni mediante llamadas directas a la API. |
| HU-12 — Editar y eliminar votaciones pendientes | Funcional | Verificar que la edición y eliminación solo estén disponibles para votaciones pendientes fuera del periodo de bloqueo. Verificar validación del margen mínimo al editar fechas. |
| HU-01A — Acceso público a información electoral | Funcional | Verificar que cualquier usuario sin sesión pueda ver las votaciones disponibles, contador regresivo y restricciones. Verificar redirección correcta según estado de la votación. |
| HU-01A.2 — Control visual de participación | Funcional | Verificar que las votaciones ya participadas se muestren visualmente diferenciadas y bloqueen el acceso al votante autenticado. |
| HU-09 — Cierre de sesión | Funcional | Verificar cierre manual con confirmación y generación de log. Verificar expiración por inactividad tanto para votante como para administrador. |

---

#### Fuera de Alcance

No se deben considerar para el desarrollo de las pruebas lo señalado a continuación:

**Tabla 3: Funcionalidades Fuera de Alcance**

| Funcionalidad | Argumento |
| :--- | :--- |
| Integración real con Clave Única del Registro Civil | El sistema MVP simula la autenticación con Clave Única. La integración real con el servicio del Registro Civil de Chile no fue parte del alcance del proyecto académico. |
| Envío real de OTP por correo electrónico en producción | El sistema utiliza un servicio de correo simulado o de desarrollo (SMTP de prueba). El comportamiento en servidores de correo productivos reales queda fuera del alcance. |
| Pruebas de Aseguramiento de Producción (PVT) | El proyecto corresponde a un MVP académico sin despliegue en infraestructura productiva del SERVEL. |
| Pruebas de accesibilidad (WCAG) | Las pautas de accesibilidad web no fueron definidas como requisito del proyecto en las historias de usuario. |
| Pruebas en dispositivos móviles nativos | El sistema es una aplicación web responsiva. Las pruebas en apps nativas iOS/Android quedan fuera de alcance al no haberse desarrollado aplicaciones móviles. |
| Sprint 7 — Corrección de bugs post-demo | Las correcciones de estabilización realizadas en el Sprint 7 se validarán únicamente a través de re-tests de los casos de prueba afectados, sin generar nuevos casos. |

---

### Data de Prueba

La data de prueba corresponde al conjunto de datos que será utilizado para ejecutar y validar los casos de prueba definidos. Estos datos representan situaciones reales y simuladas que permiten comprobar el correcto funcionamiento de la solución.

> **Nota de setup:** Los usuarios marcados con *clave aleatoria* fueron ingresados al sistema mediante importación de padrón y su contraseña no es recuperable. Para usarlos en pruebas de autenticación, ejecutar previamente el flujo `POST /api/v1/auth/request-password-reset` + `POST /api/v1/auth/reset-password`. El usuario **8.888.888-K** es el único con clave conocida y es el **usuario recomendado** como usuario principal de pruebas.

**Tabla de Usuarios de Prueba — Padrón Electoral**

| RUT | Nombre | Estado | Región / Comunidad | Email registrado | Clave | Escenario |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| 12.345.678-5 | Juan Pérez | Habilitado | Metropolitana / Santiago | juan.perez@example.com | aleatoria | Votante habilitado sin restricciones |
| 8.888.888-K | Marta Gómez | Inhabilitado* | Valparaíso / ComunidadX | lester.gonzalez@estudiantes.uv.cl | **123456** | Usuario principal de pruebas con clave conocida |
| 8.765.432-K | María Gómez | Inhabilitado | Valparaíso / ComunidadX | maria.gomez@example.com | aleatoria | Votante inhabilitado con comunidad indígena |
| 21.008.968-3 | test indigena | Habilitado | Valparaíso / etnia: Mapuche | giovanni.vasquezcolab@gmail.com | aleatoria | Votante con etnia indígena (Mapuche) |
| 00.000.000-0 | — | — | — | — | — | RUT inexistente en el padrón |

> *El estado de habilitación de **8.888.888-K** puede alternarse en cada prueba vía `PUT /api/v1/admin/votantes/8.888.888-K` con body `{"habilitado": true}` o `{"habilitado": false}`, cubriendo tanto el flujo de usuario habilitado como el de inhabilitado.

> Para el escenario de **doble voto** (votante que ya emitió sufragio): emitir un voto con el usuario 8.888.888-K durante el setup de pruebas para activar ese estado. El endpoint de elegibilidad `GET /api/v1/votaciones/:id/eligibility?rut=8.888.888-K` retornará `{ "eligible": false, "reasons": ["Ya ejerciste tu voto"] }` una vez emitido.

**Tabla de Votaciones de Prueba**

| Ref. | UUID Real | Nombre en BD | Estado | Restricción | Apertura | Cierre |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| VOT-001 | 0d77f482-809f-45b2-b5ab-a13a3f1943dd | jueves | ACTIVA | Ninguna | 26/06/2026 | 26/08/2026 |
| VOT-002 | 0f3f0256-96c6-44fb-8857-cd8140f683ef | holaMundo | ACTIVA | Los Lagos / Purranque | 25/06/2026 | 26/11/2026 |
| VOT-003 | d2f44ac0-ac93-44cf-842a-f827d662267c | TestHU05 | CERRADA | Ninguna | 13/06/2026 | 13/06/2026 |
| VOT-004 | 4cc0ac4a-7b51-4be2-ab42-bd19cba3d60a | test indigena sprint | CERRADA | Ninguna | 30/04/2026 | 10/06/2026 |
| VOT-005 | *(crear en setup previo)* | [A crear antes de pruebas] | PENDIENTE | Ninguna | ≥14 días desde ejecución | A definir |
| VOT-006 | *(crear en setup previo)* | [A crear antes de pruebas] | ACTIVA | Comunidad Indígena | A definir | A definir |

> **VOT-005 (PENDIENTE):** Crear vía `POST /api/v1/votaciones` con `fechaApertura` al menos 14 días en el futuro. El sistema asignará estado PENDIENTE automáticamente.
>
> **VOT-006 (Comunidad Indígena):** Crear vía `POST /api/v1/votaciones` e incluir comunidades al momento de la creación para habilitar el filtro de restricción indígena. Necesario para probar HU-01B.2.

**Tabla de Candidatos de Prueba**

| Ref. | UUID Real | Nombres | Apellidos | Votación Asignada | Imagen |
| :--- | :--- | :--- | :--- | :--- | :---: |
| CAND-001 | c864c686-482f-40c3-b255-b6cd15ec7231 | 12 | 13 | VOT-001 (jueves) | No |
| CAND-002 | f7f03622-7b5a-4c27-966b-77a1f0b1f64c | hola | mundo | VOT-002 (holaMundo) | No |
| CAND-003 | 21af20d3-2f62-4247-a2ef-ba8d8e7ea543 | TestHU05 | — | VOT-003 (TestHU05) | No |
| CAND-004 | 4d9ff6f3-57e5-48c2-af81-242cee2b473d | test sprint | indigena | VOT-004 (test indigena sprint) | No |
| CAND-005 | f92e709d-59f9-43fb-b201-bf8a5fb1d377 | zona | zona | test zona (CERRADA) | No |
| CAND-006 | e53a4cde-3f4b-4a40-9b83-9eaccb71ea70 | test | test | Test indigena (CERRADA) | No |
| CAND-SIN | *(crear en setup previo)* | [A crear sin votación asignada] | — | Ninguna | — |

> **CAND-SIN:** Crear vía `POST /api/v1/candidatos` omitiendo el campo `votacionId`. Necesario para probar el escenario de eliminación de candidato sin votación asignada (HU-13).

**Tabla de Archivos de Padrón para Pruebas (HU-07)**

| Archivo | Descripción | Resultado Esperado |
| :--- | :--- | :--- |
| `padron_valido.csv` | CSV con 2 usuarios nuevos con RUT, nombres, región, comuna y estado válidos | Carga exitosa: `{ "added": 2, "updated": 0 }` |
| `padron_sin_rut.csv` | CSV con 2 filas: primera fila sin campo RUT | Rechazo con error de validación (fila 1 inválida) |
| `padron_formato_erroneo.xlsx` | Archivo con extensión `.xlsx` (binario no CSV/JSON) | Rechazo: formato de archivo no soportado |
| `padron_actualizacion.csv` | CSV con RUTs `12.345.678-5` y `9.876.543-2` ya existentes con datos modificados | Actualización sin duplicación: `{ "added": 0, "updated": 2 }` |

**Datos de OTP para pruebas**

| Escenario | Código OTP | Resultado Esperado |
| :--- | :--- | :--- |
| OTP válido ingresado en tiempo | Código correcto dentro del tiempo de expiración (5 minutos) | Acceso concedido — respuesta con token de sesión |
| OTP inválido — intento 1 | Código incorrecto | Error HTTP 401, quedan 2 intentos |
| OTP inválido — intento 2 | Código incorrecto | Error HTTP 401, queda 1 intento |
| OTP inválido — intento 3 | Código incorrecto | Bloqueo HTTP 403 — cuenta bloqueada |
| OTP expirado | Código correcto pero fuera de tiempo (>5 min) | Error — solicitud de reenvío |

---

### Herramientas

Con el propósito de apoyar la planificación, ejecución y seguimiento de las pruebas, el equipo ha seleccionado las siguientes herramientas del listado revisado durante el curso.

**Tabla 4: Herramientas Plan de Pruebas**

| Nombre | Versión | Función |
| :--- | :---: | :--- |
| **JMeter** | 5.6.3 | Herramienta de pruebas de rendimiento y carga. Se utiliza para simular múltiples usuarios concurrentes accediendo a los endpoints de la API (NestJS), validando que el sistema mantenga la consistencia de los votos bajo alta concurrencia y que las transacciones atómicas prevengan condiciones de carrera. También se usará para pruebas funcionales de los endpoints REST de la API. |
| **TestRail** | Cloud | Herramienta de gestión de casos de prueba. Se utiliza para documentar, organizar y hacer seguimiento de todos los casos de prueba definidos en este plan, registrar los resultados de ejecución (Aprobado/Fallido) y generar reportes de avance del ciclo de pruebas. |
| **Mantis Bug Tracker** | 2.26 | Herramienta de seguimiento de defectos. Se utiliza para registrar, clasificar por severidad, asignar y hacer seguimiento de todos los defectos encontrados durante la ejecución de las pruebas, siguiendo el flujo definido en la sección de Gestión de Defectos. |

---

### Técnicas

Las pruebas se ejecutarán utilizando las siguientes técnicas, seleccionadas en función de las características del sistema y los riesgos identificados:

- **Caja Negra (Black Box Testing):** Se verificará el comportamiento del sistema desde la perspectiva del usuario final, validando que las entradas produzcan las salidas esperadas según los criterios de aceptación de cada historia de usuario, sin considerar la implementación interna.

- **Pruebas Funcionales:** Se ejecutarán casos de prueba que validen cada criterio de aceptación definido en las historias de usuario. Se cubrirán flujos positivos (camino feliz) y flujos negativos (manejo de errores, validaciones).

- **Pruebas de Integración (SIT):** Se verificará la interacción correcta entre el frontend (Next.js), la API (NestJS) y la base de datos (PostgreSQL/Supabase), especialmente en los flujos críticos de emisión de voto y registro de participación.

- **Pruebas de Seguridad (básicas):** Se verificará que los mecanismos de anonimato, cifrado de RUT e IP, inmutabilidad de logs y control de acceso por estado funcionen correctamente. Se intentará acceder a recursos protegidos forzando URLs y manipulando peticiones a la API.

- **Pruebas de Rendimiento / Carga:** Mediante JMeter se simulará la concurrencia de múltiples votantes simultáneos para validar que las transacciones atómicas prevengan condiciones de carrera en el registro de votos.

La ejecución será **mixta**: manual para flujos funcionales de interfaz de usuario, y automatizada mediante JMeter para pruebas de API y carga.

---

### Estrategia de Ejecución

#### Criterios de Entrada

Para iniciar la ejecución de las pruebas, deben cumplirse las siguientes condiciones:

- El ambiente de pruebas está correctamente configurado y el sistema responde en `http://localhost:3000/api/v1`.
- La base de datos de prueba está inicializada con la data de prueba definida en este documento.
- Los archivos de padrón de prueba están disponibles para las pruebas de carga del padrón.
- Los casos de prueba han sido revisados y aprobados por el equipo.
- Las herramientas JMeter, TestRail y Mantis están configuradas y accesibles.

#### Criterios de Salida

Para dar por finalizado el proceso de certificación, se deben cumplir las siguientes condiciones:

*Este documento se completará una vez finalizadas las 3 iteraciones de pruebas.*

**Tabla 5: Criterios de Salida**

| Criterio de Salida | Cumple (Sí/No) | Observaciones |
| :--- | :---: | :--- |
| El 100% de los casos de prueba definidos fueron ejecutados. | | |
| Al menos el 90% de los casos de prueba se encuentran en estado "Aprobado". | | |
| Los defectos identificados fueron registrados y documentados. | | |
| Todos los casos de prueba cuentan con evidencia de ejecución (capturas de pantalla, videos o registros). | | |
| Los resultados de las pruebas fueron consolidados en un informe final. | | |
| Los requisitos funcionales definidos para el proyecto fueron validados mediante casos de prueba. | | |
| Los defectos pendientes fueron descritos junto con su impacto y posible solución. | | |

---

## Gestión de Defectos

### Roles y Responsabilidades de QA

- **Test Manager (Lorena Uribe):** Responsable de la planificación, estimación, monitoreo y control del proceso de pruebas. Elabora reportes de avance y gestiona la administración de defectos en Mantis. Coordina la mitigación de riesgos y genera informes de desempeño del proceso.

- **Test Leader (Giovanni Vásquez):** Participa en la asignación de recursos y distribución de tareas entre los testers. Revisa y valida la entrega de los casos de prueba, provee insumos para el plan y supervisa la creación de scripts de prueba en JMeter.

- **Testers (Andrés González, Angel López, Lester González):** Responsables de la revisión de la documentación del proyecto, el diseño y desarrollo de casos de prueba, la ejecución de pruebas, la identificación y reporte de defectos en Mantis, y la participación en re-tests de correcciones.

### Roles y Responsabilidades de Desarrollo

- **Rol: Líder de Proyecto**
  - **Descripción:** Proporciona los requisitos al equipo y aprueba documentos como el Plan de Pruebas e informes de cierre de ciclo.

- **Rol: Líder Técnico**
  - **Descripción:** Capacita a los miembros del equipo en los nuevos requisitos técnicos y aprueba el Plan de Pruebas e informes asociados.

- **Rol: Desarrollador**
  - **Descripción:** Responsable de corregir los defectos reportados y proporcionar información técnica sobre el proyecto. Una vez solucionado el defecto, debe actualizar su estado en **Mantis** a "Listo para Re-test".

### Categorización de Defectos

Los defectos reportados durante la ejecución se clasificarán de acuerdo a la siguiente severidad:

**Tabla 8: Categorización de Defectos**

| Severidad | Definición | Ejemplos en el contexto SERVEL |
| :--- | :--- | :--- |
| **Invalidante** | Defecto que impide la operación del sistema o la ejecución de funcionalidades críticas, imposibilitando la continuidad de las pruebas. | El sistema permite votar dos veces. La tabla `Resultados` almacena el RUT del votante. El sistema no registra votos en absoluto. |
| **Alta** | Defecto que afecta significativamente una funcionalidad principal del sistema, impactando el cumplimiento de los requisitos definidos. | El OTP no expira o el límite de 3 intentos no se aplica. Los logs de auditoría pueden modificarse. Una votación cerrada permite el acceso a la papeleta forzando la URL. |
| **Media** | Defecto que afecta parcialmente una funcionalidad, permitiendo continuar con la operación del sistema mediante restricciones o soluciones alternativas. | El resumen de carga del padrón muestra conteos incorrectos. El contador regresivo de tiempo no se actualiza en tiempo real. La imagen por defecto de candidato no se muestra. |
| **Baja** | Defecto de impacto menor que no afecta el funcionamiento principal del sistema, generalmente asociado a aspectos visuales, de formato o usabilidad. | Error ortográfico en mensajes de pantalla. Alineación incorrecta de elementos en el dashboard. Botón de confirmación con color diferente al diseño esperado. |

### Seguimiento de Defectos

El seguimiento de defectos se realizará mediante **Mantis Bug Tracker**. El flujo de estados es el siguiente:

1. **Área QA** detecta y reporta un defecto → Estado: **Nuevo** → **Abierto**
2. **Área Desarrollo** toma el defecto → Estado: **En desarrollo**
   - Si se necesita más información → Estado: **Se necesita más información** → vuelve a **En desarrollo**
3. Al corregir el código → Estado: **Corregido** → **Listo para Re-Test**
4. **Área QA** ejecuta el Re-Test:
   - Si el defecto persiste → Estado: **Re-Abierto** → vuelve a Desarrollo
   - Si la prueba es exitosa → Estado: **Cerrado**

**Tabla de Estados del Flujo**

| Estado | Descripción |
| :--- | :--- |
| **Nuevo** | El error ha sido detectado por el tester y está pendiente de asignación. |
| **Abierto** | El error ha sido levantado por el tester y asignado al desarrollador correspondiente. |
| **En desarrollo** | El desarrollador está revisando el error y trabajando en la corrección del defecto. |
| **Se necesita más información** | El desarrollador solicita información adicional al tester para poder reproducir el defecto. |
| **Corregido** | El código ha sido modificado para corregir el defecto reportado. |
| **Listo para Re-Test** | El defecto está corregido y listo para ser nuevamente testeado por QA en el ambiente de pruebas. |
| **Re-Test** | El cambio en el código ha sido promovido al entorno de prueba y QA está ejecutando la validación. |
| **Re-Abierto** | El defecto no ha sido resuelto satisfactoriamente tras el Re-Test. |
| **Cerrado** | El defecto ha sido corregido y validado satisfactoriamente por el equipo de QA. |

---

## Riesgos y Problemas

**Tabla de Riesgos**

| ID | Riesgo | Probabilidad | Impacto | Plan de Mitigación |
| :---: | :--- | :---: | :---: | :--- |
| R-01 | El ambiente local de pruebas no puede levantarse correctamente (problemas con Supabase, variables de entorno o dependencias de PNPM). | Media | Alto | Documentar el proceso de levantamiento del ambiente en las evidencias. Contar con al menos 2 miembros del equipo capaces de levantar el sistema. Utilizar la instancia demo del Sprint 7 como respaldo. |
| R-02 | Los mecanismos de anonimato (tablas separadas, cifrado) no pueden verificarse directamente desde la interfaz de usuario. | Alta | Alto | Complementar las pruebas funcionales con consultas directas a la base de datos de desarrollo vía Supabase Dashboard para verificar la estructura de las tablas `Participaciones` y `Resultados`. |
| R-03 | Las pruebas de OTP requieren acceso real a correos electrónicos, lo que puede ser lento o no disponible en el ambiente de pruebas. | Media | Medio | Configurar un buzón de prueba accesible por el equipo o verificar en los logs del servidor que el OTP fue generado, aunque el correo no llegue. |
| R-04 | El tiempo disponible para ejecutar todas las pruebas es reducido dado que la entrega es el 26/06/2026. | Alta | Alto | Priorizar las pruebas de los casos críticos (doble voto, anonimato, OTP, cierre en caliente) sobre los casos de menor impacto. Distribuir los casos de prueba entre los 5 integrantes del equipo. |
| R-05 | La automatización con JMeter puede requerir configuración adicional para los endpoints autenticados (manejo de sesiones y OTP). | Media | Medio | Para los flujos que requieran OTP real, ejecutar las pruebas de forma manual y reservar JMeter para los endpoints públicos y de carga sin autenticación compleja. |
| R-06 | Defectos encontrados en las pruebas pueden no ser corregibles antes de la fecha de entrega. | Media | Medio | Documentar todos los defectos encontrados con su severidad, impacto y posible solución, independientemente de si son corregidos o no. El registro completo cuenta como evidencia del proceso de QA. |
