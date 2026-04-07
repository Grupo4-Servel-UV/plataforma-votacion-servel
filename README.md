# plataforma-votacion-servel
MVP de Sistema de Votación Electrónica acotado para SERVEL. Proyecto desarrollado bajo el marco de trabajo Scrum para el curso ICI-513 Gestión de Proyectos Informáticos.
# Sistema de Votaciones Digitales - Proyecto SERVEL

Este repositorio contiene la planificación y el desarrollo del sistema de votaciones digitales para el SERVEL, diseñado bajo principios de seguridad, anonimato y trazabilidad.

## Integrantes
* Lorena Uribe 
* Angel López
* Andrós González
* Lester González
* Giovanni Vázquez 
---

## Estrategia de Agrupación de Historias de Usuario

El **Product Backlog** se ha estructurado en **7 iteraciones** estratégicas, agrupando las Historias de Usuario bajo criterios de **dependencias funcionales** y lógica de procesos electorales:

1. **Arquitectura de Seguridad y Portal:** Priorización del anonimato del voto (**HU-14**) como requisito no funcional crítico y habilitación del punto de acceso público (**HU-01A**).
2. **Registro e Identidad Ciudadana:** Consolidación de la **Gestión de Padrón (HU-07)** y el flujo de **Autenticación (HU-01B)**, vinculando la carga masiva de datos con la validación de identidad mediante OTP.
3. **Gestión Administrativa de Procesos:** Centralización de las capacidades de configuración de nuevas votaciones (**HU-11**) y el mantenimiento del registro oficial de candidatos (**HU-13**).
4. **Control Operativo y Papeleta Digital:** Implementación de la lógica de automatización de aperturas/cierres (**HU-05**) y la generación dinámica de la interfaz de sufragio (**HU-02**) según el perfil del votante.
5. **Ejecución de Sufragio y Monitoreo:** Desarrollo del núcleo funcional del sistema para el registro de votos nominados y en blanco (**HU-03, HU-04**) junto al panel de control de la jornada en tiempo real (**HU-10**).
6. **Auditoría e Integridad de Sistema:** Focalización exclusiva en la fiscalización técnica mediante un sistema de logs inmutables y trazabilidad cronológica de acciones (**HU-08**).
7. **Escrutinio Final y Cierre de Sesiones:** Fase de finalización para el despliegue de resultados oficiales (**HU-06**), gestión de ediciones permitidas (**HU-12**) y protocolos de salida segura (**HU-09**).

---

