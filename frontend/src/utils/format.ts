/**
 * Format number as Indonesian Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string to Indonesian locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date to input[type="date"] format (YYYY-MM-DD)
 */
export function toInputDate(dateString: string): string {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Map enum values to Indonesian labels
 */
export const genderLabels: Record<string, string> = {
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan',
};

export const religionLabels: Record<string, string> = {
  ISLAM: 'Islam',
  CHRISTIAN: 'Kristen Protestan',
  CATHOLIC: 'Katolik',
  HINDU: 'Hindu',
  BUDDHA: 'Buddha',
  KONGHUCU: 'Konghucu',
};

export const maritalStatusLabels: Record<string, string> = {
  SINGLE: 'Belum Menikah',
  MARRIED: 'Menikah',
  DIVORCED: 'Cerai Hidup',
  WIDOWED: 'Cerai Mati',
};

export const degreeLabels: Record<string, string> = {
  SD: 'SD',
  SMP: 'SMP',
  SMA: 'SMA / MA',
  SMK: 'SMK',
  D1: 'D1',
  D2: 'D2',
  D3: 'D3',
  D4: 'D4',
  S1: 'S1 / Sarjana',
  S2: 'S2 / Magister',
  S3: 'S3 / Doktor',
};

/**
 * Extract error message from axios error
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
    const data = axiosError.response?.data;
    if (data?.errors?.length) return data.errors.join(', ');
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
