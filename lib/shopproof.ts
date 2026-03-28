// -----------------------------
// TYPES
// -----------------------------

export type JobStatus =
  | "New"
  | "In Progress"
  | "Waiting Approval"
  | "Ready for Pickup"
  | "Completed";

export type AuthorizationStatus =
  | "pending"
  | "signed_in_person"
  | "signed_remote";

export type ShopJob = {
  id: string;
  createdAt: string;
  updatedAt: string;

  status: JobStatus;

  customer: {
    name: string;
    phone: string;
    email?: string;
  };

  vehicle: {
    vin: string;
    year: string;
    make: string;
    model: string;
    plate?: string;
    color?: string;
    mileageIn: string;
  };

  visit: {
    concern: string;
    notes?: string;
  };

  assignment: {
    advisor: string;
    technician: string;
  };

  authorization: {
    diagnosticsFee: string;
    authorizationStatus: AuthorizationStatus;
    signatureName?: string;
    signatureTimestamp?: string;
    signatureMethod?: "print" | "digital";
    token?: string;
  };
};

// -----------------------------
// STORAGE KEY
// -----------------------------

const STORAGE_KEY = "shopproof_jobs";

// -----------------------------
// CORE STORAGE FUNCTIONS
// -----------------------------

export function getJobs(): ShopJob[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShopJob[];
  } catch {
    return [];
  }
}

export function saveJobs(jobs: ShopJob[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function addJob(job: ShopJob) {
  const jobs = getJobs();
  jobs.unshift(job);
  saveJobs(jobs);
}

export function getJobById(id: string): ShopJob | null {
  const jobs = getJobs();
  return jobs.find((j) => j.id === id) || null;
}

export function updateJob(updated: ShopJob) {
  const jobs = getJobs().map((j) =>
    j.id === updated.id
      ? { ...updated, updatedAt: new Date().toISOString() }
      : j
  );
  saveJobs(jobs);
}

// -----------------------------
// HELPERS
// -----------------------------

export function createJob(
  data: Omit<ShopJob, "id" | "createdAt" | "updatedAt">
): ShopJob {
  const now = new Date().toISOString();

  return {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2, 14);
}

// -----------------------------
// OPTIONAL UTILITIES (FUTURE SAFE)
// -----------------------------

export function findJobByToken(token: string): ShopJob | null {
  const jobs = getJobs();
  return (
    jobs.find((j) => j.authorization?.token === token) || null
  );
}