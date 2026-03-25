export type Status = "Analyzed" | "Pending";

export interface Resume {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  status: Status;
  uploadedAt: string;
  skills?: { name: string; category?: string; level?: string }[];
  education?: any[];
  experience?: any[];
  projects?: any[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  postedOn: string;
}
