/**
 * Tipos de datos para el sistema de tracking de honorarios
 */

export type MonthKey =
  | 'january' | 'february' | 'march' | 'april' | 'may' | 'june'
  | 'july' | 'august' | 'september' | 'october' | 'november' | 'december';

export type MonthlyRecord = {
  amount: number;
  paid: boolean;
};

export type MonthlyRecords = {
  [year: number]: {
    [month in MonthKey]?: MonthlyRecord;
  };
};

export type Employee = {
  id: string;
  name: string;
  cuit: string;
  arcaPassword: string;
  monthlyRecords: MonthlyRecords;
  createdAt: string;
  updatedAt: string;
  tasks?: string;
};

export type TaxCategory = 'Monotributista' | 'Resp. inscripto' | 'Otro';

export type Client = {
  id: string;
  name: string;
  cuit: string;
  arcaPassword: string;
  categoriaFiscal?: TaxCategory;
  monthlyRecords: MonthlyRecords;
  employees: Employee[];
  createdAt: string;
  updatedAt: string;
  tasks?: string;
};

export type Database = {
  clients: Client[];
  lastUpdated: string;
};

export const MONTHS: MonthKey[] = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export const MONTH_NAMES_ES: Record<MonthKey, string> = {
  january: 'Ene',
  february: 'Feb',
  march: 'Mar',
  april: 'Abr',
  may: 'May',
  june: 'Jun',
  july: 'Jul',
  august: 'Ago',
  september: 'Sep',
  october: 'Oct',
  november: 'Nov',
  december: 'Dic'
};
