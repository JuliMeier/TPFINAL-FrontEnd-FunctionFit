export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  planId: number | null;
  role: 'Socio' | 'Administrador' | 'SuperAdministrador';
  name?:string
}

export const PLAN_CONFIG: Record<number, { label: string; class: string }> = {
  0: { label: 'Sin Suscripción', class: 'text-slate-500' },
  1: { label: 'Básico', class: 'text-blue-800' },
  2: { label: 'Premium', class: 'text-pink-800' },
  3: { label: 'Elite', class: 'text-purple-800' }
};

export interface GymClass {
  id: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  imageUrl: string;
  dia: number;
  hora: string;
  isReservedByUser: boolean;
  maxCapacity: number;
  currentEnrollments: number;
}

export interface GymClassTurn {
  id: number;
  dia: number;
  hora: string;
  isReservedByUser: boolean;
  maxCapacity: number;
  currentEnrollments: number;
}

export interface GroupedGymClass {
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  imageUrl: string;
  turnos: GymClassTurn[];
}

export interface CreateGymClassRequest {
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  imageUrl: string;
  dia: number;
  hora: string;
  maxCapacity: number;
}

export interface Historical {
  userId: number;
  gymClassId: number;
  className: string;
  classDate: string;
  actionDate: string;
  status: 'Active' | 'Cancelled' | 'Completed';
}

export interface Payment {
  Id: number;
  UserId: number;
  Monto: number;
  Fecha: string;
  Pagado: boolean;
  InitPoint?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  gymClassId?: number;
  isReserved?: boolean;
  currentEnrollments?: number;
  maxCapacity?: number;
}

export interface CreateUserByAdminRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  contraseña: string;
  planId?: number | null;
  roleId: number;
}

export interface ApiResponse {
  message: string;
}

export interface UpdateUserByAdminRequest {
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  contraseña?: string;
  planId?: number | null;
  roleId: number;
}

export interface Plan {
  id: number;
  tipo: number;
  precio: number;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  plan: string;
}

export interface RegisterResponse {
  message: string;
}

export interface RegisterApiRequest {
  Nombre: string;
  Apellido: string;
  Telefono: string;
  Email: string;
  Contraseña: string;
  PlanId: number;
}

export interface PaymentResponse {
  id: number;
  userId: number;
  monto: number;
  fecha: string;      
  pagado: boolean;
  
  // Campos adicionales necesarios para el Admin
  title?: string;       
  metodoPago?: string;  
  externalReference?: string; 
  planId?: number;      

}

export interface GymClassSummary {
  id: number;
  nombre: string;
  dia: number;
  hora: string;
}

export interface UserProfileResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  planId: number;
  
  isSubscriptionActive: boolean;
  subscriptionEndDate: string | null; 
  planName: string;
  classLimit: number;


  enrolledClassesCount: number;
  enrolledClasses: GymClassSummary[];
}

export enum TypePlan {
  Basic = 1,
  Premium = 2,
  Elite = 3
}

export interface PlanResponse {
  id: number;
  tipo: TypePlan;
  precio: number;
}