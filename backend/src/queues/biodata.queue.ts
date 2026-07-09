export const BIODATA_QUEUE = 'biodata';

export const BIODATA_JOBS = {
  CREATE: 'biodata.create',
  UPDATE: 'biodata.update',
  DELETE: 'biodata.delete',
  ADMIN_UPDATE: 'biodata.admin.update',
  ADMIN_DELETE: 'biodata.admin.delete',
} as const;

export type BiodataJobName = (typeof BIODATA_JOBS)[keyof typeof BIODATA_JOBS];
