export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

export type Gender = 'MALE' | 'FEMALE';
export type Religion = 'ISLAM' | 'CHRISTIAN' | 'CATHOLIC' | 'HINDU' | 'BUDDHA' | 'KONGHUCU';
export type BloodType = 'A' | 'B' | 'AB' | 'O';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type Degree = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'D1' | 'D2' | 'D3' | 'D4' | 'S1' | 'S2' | 'S3';

export interface EducationHistory {
  id?: string;
  institution: string;
  major: string;
  degree: Degree;
  startYear: number;
  endYear?: number;
  gpa?: number;
}

export interface TrainingHistory {
  id?: string;
  name: string;
  organizer: string;
  year: number;
  duration?: string;
  certificate?: string;
}

export interface EmploymentHistory {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  description?: string;
}

export interface Biodata {
  id: string;
  userId: string;
  appliedPosition: string;
  fullName: string;
  nationalIdNumber: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  religion: Religion;
  bloodType?: BloodType;
  maritalStatus: MaritalStatus;
  ktpAddress: string;
  currentAddress: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  skills?: string;
  willingToBePlaced: boolean;
  expectedSalary: number;
  educationHistories: EducationHistory[];
  trainingHistories: TrainingHistory[];
  employmentHistories: EmploymentHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
