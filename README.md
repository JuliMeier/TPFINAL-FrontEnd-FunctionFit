# FunctionFit — Frontend

> Aplicación web para la gestión integral de un gimnasio, desarrollada como Trabajo Práctico Final.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Tecnologías y dependencias](#tecnologías-y-dependencias)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Roles y permisos](#roles-y-permisos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)

---

## Descripción

**FunctionFit** es una plataforma de gestión de gimnasio que permite a socios reservar clases, gestionar suscripciones y realizar pagos a través de Mercado Pago. Los administradores cuentan con un panel de control para gestionar usuarios, clases, planes y cobros. El Super Administrador accede a un dashboard de métricas con estadísticas globales del gimnasio.

El frontend está construido con **Angular 20** utilizando componentes standalone, lazy loading, Angular Material, Tailwind CSS y Chart.js.

---

## Funcionalidades

### Públicas (sin autenticación)
- Página de inicio con presentación del gimnasio, características y planes de precios.
- Registro de nuevos socios con selección de plan.
- Inicio de sesión con JWT.
- Recuperación y restablecimiento de contraseña.

### Socio
| Sección | Descripción |
|---|---|
| **Dashboard** | Vista de bienvenida personalizada con acceso rápido a las secciones. |
| **Mi Suscripción** | Estado de la suscripción activa, fecha de vencimiento y clases incluidas en el plan. |
| **Clases** | Listado de clases grupales disponibles agrupadas por nombre y turno. Permite reservar o cancelar inscripción en tiempo real con control de capacidad máxima. |
| **Historial** | Registro completo de clases reservadas, canceladas y completadas. |
| **Pagos** | Historial de pagos y acceso al flujo de pago mediante Mercado Pago (Checkout Pro). |

### Administrador
| Sección | Descripción |
|---|---|
| **Gestión de Usuarios** | Listado, creación, edición y eliminación de socios y administradores. |
| **Gestión de Clases** | Alta, modificación y baja de clases grupales con turnos y capacidad. |
| **Gestión de Planes** | Administración de los planes disponibles (Básico, Premium, Elite) con precios. |
| **Gestión de Pagos** | Seguimiento de pagos realizados y pendientes de todos los socios. |

### Super Administrador
| Sección | Descripción |
|---|---|
| **Métricas** | Dashboard con KPIs globales: total de usuarios, socios activos, administradores, clases, tasa de ocupación, ingresos totales y estado de suscripciones. |

---

## Tecnologías y dependencias

| Tecnología | Versión | Uso |
|---|---|---|
| [Angular](https://angular.dev) | 20.x | Framework principal (standalone components, signals, lazy loading) |
| [Angular Material](https://material.angular.io) | 20.x | Componentes UI (diálogos, iconos, tablas, formularios) |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Estilos utilitarios y diseño responsivo |
| [Chart.js](https://www.chartjs.org) | 4.x | Visualización de métricas y estadísticas |
| [ngx-toastr](https://github.com/scttcper/ngx-toastr) | 19.x | Notificaciones toast |
| [RxJS](https://rxjs.dev) | 7.8.x | Programación reactiva y manejo de observables |
| [Mercado Pago SDK](https://www.mercadopago.com.ar/developers) | — | Integración de pagos (Checkout Pro) |

---

## Arquitectura del proyecto

```
src/
├── app/
│   ├── core/                        # Interceptores y guards
│   │   ├── auth.interceptor.ts      # Adjunta el JWT Bearer token en cada request
│   │   ├── loading.interceptor.ts   # Maneja el estado de carga global
│   │   ├── loading.service.ts       # Servicio de loading compartido
│   │   └── role.guard.ts            # Guard de autorización por rol
│   ├── pages/                       # Vistas de la aplicación (lazy loading)
│   │   ├── home/                    # Landing page pública
│   │   ├── login/                   # Inicio de sesión
│   │   ├── register/                # Registro de socios
│   │   ├── forgot-password/         # Recuperación de contraseña
│   │   ├── reset-password/          # Restablecimiento de contraseña
│   │   ├── home-socio/              # Dashboard del socio
│   │   ├── home-admin/              # Dashboard del administrador
│   │   ├── home-super-admin/        # Dashboard del super administrador
│   │   ├── clases/                  # Reserva de clases (socio)
│   │   ├── subscription-status/     # Estado de suscripción (socio)
│   │   ├── historical/              # Historial de clases (socio)
│   │   ├── pagos/                   # Gestión de pagos (socio)
│   │   ├── role-home-redirect/      # Redirección automática por rol
│   │   └── admin/
│   │       ├── user-list/           # Gestión de usuarios
│   │       ├── gym-class-management/# Gestión de clases
│   │       ├── plan-management/     # Gestión de planes
│   │       ├── payment-management/  # Gestión de pagos
│   │       └── metricas/            # Dashboard de métricas (super admin)
│   ├── services/                    # Servicios HTTP
│   │   ├── services.service.ts      # Autenticación, clases y pagos
│   │   ├── auth.service.ts          # Flujo de forgot/reset password
│   │   ├── adminUser.service.ts     # Operaciones de administración
│   │   ├── gym-class.service.ts     # Gestión avanzada de clases
│   │   ├── payment.service.ts       # Servicio de pagos
│   │   ├── plan.service.ts          # Gestión de planes
│   │   ├── register.service.ts      # Registro de nuevos usuarios
│   │   └── user.service.ts          # Perfil de usuario
│   └── shared/
│       ├── interfaces.ts            # Modelos e interfaces TypeScript
│       └── components/
│           ├── layout/              # Layout principal autenticado
│           ├── header/              # Barra de navegación superior
│           ├── sidebar/             # Menú lateral
│           ├── footer/              # Pie de página
│           ├── loading-bar/         # Barra de carga global
│           └── confirmation-dialog/ # Diálogo de confirmación reutilizable
├── environments/
│   └── environment.development.ts  # Configuración de entorno de desarrollo
└── styles.scss                      # Estilos globales
```

---

## Roles y permisos

La aplicación implementa un sistema de control de acceso basado en roles (RBAC) protegido mediante `roleGuard` y `authGuard`:

| Rol | Descripción |
|---|---|
| **Socio** | Accede a su dashboard, clases, historial, suscripción y pagos. |
| **Administrador** | Gestiona usuarios, clases, planes y pagos del gimnasio. |
| **SuperAdministrador** | Accede al dashboard de métricas con estadísticas globales. |

Las rutas públicas (`/home`, `/login`, `/register`, `/forgot-password`, `/reset-password`) redirigen automáticamente al dashboard si el usuario ya está autenticado.

---

## Instalación y ejecución

### Prerrequisitos

- [Node.js](https://nodejs.org) v18 o superior
- [Angular CLI](https://angular.dev/tools/cli) v20

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd TPFINAL-FrontEnd-FunctionFit

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

> **Nota:** El backend debe estar corriendo en `https://localhost:7150` para que la aplicación funcione correctamente.

---

## Variables de entorno

La configuración del entorno de desarrollo se encuentra en `src/environments/environment.development.ts`:

| Variable | Descripción |
|---|---|
| `apiUrl` | URL base de la API del backend |
| `mercadoPagoPublicKey` | Clave pública de Mercado Pago para el SDK |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Compila la aplicación para producción en `dist/` |
| `npm run watch` | Compila en modo desarrollo con recarga automática |
| `npm test` | Ejecuta los tests unitarios con Karma y Jasmine |
