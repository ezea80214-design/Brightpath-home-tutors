export interface ParentProfile {
  parentUid: string;
  displayName: string;
  email: string;
  childName: string;
  studentClass: string;
  assignedTutor: string;
  assignedTutorUid?: string;
}

export interface StudentRosterItem {
  id: string;
  studentId: string;
  parentUid: string;
  studentName: string;
  studentClass: string;
  parentName: string;
  assignedTutor: string;
  assignedTutorUid?: string;
}

export interface TutorAccount {
  id: string;
  tutorUid: string;
  displayName: string;
  email: string;
  specialty: string;
  active: boolean;
}

export interface ProgressReport {
  id: string;
  parentUid: string;
  tutorUid?: string;
  studentName: string;
  subject: string;
  term: string;
  assessmentScore: number;
  tutorName: string;
  tutorNotes: string;
  nextFocus: string;
  attachmentTitle?: string;
  attachmentUrl?: string;
  reportDate: string;
  status: 'Published' | 'Acknowledged';
  parentReply?: string;
}

export type SessionAttendance = 'Completed' | 'Rescheduled' | 'Missed';

export interface SessionLog {
  id: string;
  parentUid: string;
  tutorUid: string;
  tutorName: string;
  studentName: string;
  subject: string;
  sessionDate: string;
  durationMinutes: number;
  attendance: SessionAttendance;
  topicsCovered: string;
  homeworkAssigned: string;
  sessionNotes: string;
}

export const PORTAL_LIMITS = {
  idMax: 128,
  idRegex: /^[a-zA-Z0-9_-]+$/,
  dateRegex: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  httpsRegex: /^https:\/\/.*$/,
  nameMax: 100,
  emailMax: 150,
  classMax: 60,
  subjectMax: 80,
  termMax: 60,
  specialtyMax: 120,
  tutorNotesMax: 1500,
  nextFocusMax: 400,
  attachmentTitleMax: 120,
  attachmentUrlMin: 8,
  attachmentUrlMax: 300,
  parentReplyMax: 500,
  topicsMax: 800,
  homeworkMax: 500,
  sessionNotesMax: 1000,
  minScore: 0,
  maxScore: 100,
  minDuration: 15,
  maxDuration: 240,
} as const;

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSafeHttpsUrl(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length >= PORTAL_LIMITS.attachmentUrlMin &&
    trimmed.length <= PORTAL_LIMITS.attachmentUrlMax &&
    PORTAL_LIMITS.httpsRegex.test(trimmed)
  );
}
