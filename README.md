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

## Estrategia de Agrupación de Historias de Usuario (Sprint Planning)

El **Product Backlog** se estructura en **7 iteraciones** bajo un enfoque Ágil de *Vertical Slicing*. Priorizamos la entrega temprana de valor (MVP) por sobre las dependencias puramente técnicas, mitigando riesgos y asegurando el núcleo del sistema desde el día uno:

* **Sprint 1 - MVP y Sufragio:** Habilitación rápida de creación, papeleta y emisión del voto (HU-11, HU-02, HU-03) usando validaciones simuladas temporalmente para demostrar flujo.
* **Sprint 2 - Arquitectura de Seguridad:** Implementación de OTP real (HU-01B) y separación de tablas en base de datos para garantizar el anonimato (HU-14).
* **Sprint 3 - Ingesta y Entidades:** Carga masiva del padrón de votantes (HU-07) y gestión oficial de candidatos (HU-13).
* **Sprint 4 - Lógica Operativa:** Automatización de fechas de apertura/cierre (HU-05), voto en blanco (HU-04) y dashboard de monitoreo (HU-10).
* **Sprint 5 - Escrutinio y Trazabilidad:** Despliegue de resultados oficiales (HU-06) y sistema inmutable de auditoría y logs (HU-08).
* **Sprint 6 - Casos Borde y Acceso Público:** Edición de procesos pendientes (HU-12) y portal informativo ciudadano sin login (HU-01A).
* **Sprint 7 - Aseguramiento de Calidad:** Cierre seguro de sesiones (HU-09), resolución de bugs y estabilización final para la entrega.

---

