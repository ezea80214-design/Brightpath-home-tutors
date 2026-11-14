import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  query,
  writeBatch,
  type FieldValue,
} from 'firebase/firestore';
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Copy,
  Edit3,
  ExternalLink,
  FilePlus2,
  Paperclip,
  Plus,
  Search,
  UserCog,
  Users,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { siteConfig } from '../data/siteConfig';
import {
  PORTAL_LIMITS,
  getTodayIsoDate,
  isSafeHttpsUrl,
  type ParentProfile,
  type ProgressReport,
  type SessionAttendance,
  type SessionLog,
  type StudentRosterItem,
  type TutorAccount,
} from '../types/portal';

interface TutorDashboardProps {
  user: User;
  isAdmin: boolean;
  tutorAccount: TutorAccount | null;
}

type WorkspaceSection = 'students' | 'staff';
type StudentTab = 'sessions' | 'reports';

const COMMON_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Basic Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Quantitative Reasoning',
  'Verbal Reasoning',
  'Study Habits & Homework',
];

const ATTENDANCE_OPTIONS: SessionAttendance[] = ['Completed', 'Rescheduled', 'Missed'];

function makeDocId(prefix: string): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'item';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${cleanPrefix}_${Date.now()}_${rand}`;
}

export function TutorDashboard({ user, isAdmin, tutorAccount }: TutorDashboardProps) {
  const [workspaceSection, setWorkspaceSection] = useState<WorkspaceSection>('students');
  const [studentTab, setStudentTab] = useState<StudentTab>('sessions');

  // Roster & staff state
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [parentProfiles, setParentProfiles] = useState<ParentProfile[]>([]);
  const [tutorsList, setTutorsList] = useState<TutorAccount[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Selected student's logs and reports
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Feedback banners
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  // Session Log Form State (Create or Update)
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logSubject, setLogSubject] = useState('Mathematics');
  const [logDate, setLogDate] = useState(getTodayIsoDate());
  const [logDuration, setLogDuration] = useState(60);
  const [logAttendance, setLogAttendance] = useState<SessionAttendance>('Completed');
  const [logTopics, setLogTopics] = useState('');
  const [logHomework, setLogHomework] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Progress Report Form State (Attach / Edit)
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [reportSubject, setReportSubject] = useState('Mathematics');
  const [reportTerm, setReportTerm] = useState('First Term · Weekly Review');
  const [reportScore, setReportScore] = useState(85);
  const [reportDate, setReportDate] = useState(getTodayIsoDate());
  const [reportTutorNotes, setReportTutorNotes] = useState('');
  const [reportNextFocus, setReportNextFocus] = useState('');
  const [reportAttachmentTitle, setReportAttachmentTitle] = useState('');
  const [reportAttachmentUrl, setReportAttachmentUrl] = useState('');
  const [savingReport, setSavingReport] = useState(false);

  // Coordinator Staff Management Form State (isAdmin only)
  const [newTutorUid, setNewTutorUid] = useState('');
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorEmail, setNewTutorEmail] = useState('');
  const [newTutorSpecialty, setNewTutorSpecialty] = useState('Mathematics & Sciences');
  const [savingTutor, setSavingTutor] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);
  const [syncingRoster, setSyncingRoster] = useState(false);

  const activeTutorName = (
    tutorAccount?.displayName ||
    user.displayName ||
    'BrightPath Coordinator'
  )
    .trim()
    .slice(0, PORTAL_LIMITS.nameMax);

  // Load Student Roster (Admin sees all; verified tutor sees assigned students)
  useEffect(() => {
    setStudentsLoading(true);
    setDashboardError(null);

    const studentsPath = 'students';
    const studentsQuery = isAdmin
      ? collection(db, 'students')
      : query(collection(db, 'students'), where('assignedTutorUid', '==', user.uid));

    const unsubscribe = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const loaded: StudentRosterItem[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<StudentRosterItem, 'id'>),
          }))
          .sort((a, b) => a.studentName.localeCompare(b.studentName));
        setStudents(loaded);
        setStudentsLoading(false);
      },
      (error) => {
        setStudentsLoading(false);
        setDashboardError('Unable to load the student roster right now.');
        try {
          handleFirestoreError(error, OperationType.LIST, studentsPath);
        } catch {
          // Error logged in handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [isAdmin, user.uid]);

  // Admin-only listeners for registered parents (for roster sync) and approved tutors
  useEffect(() => {
    if (!isAdmin) {
      setParentProfiles([]);
      setTutorsList([]);
      return;
    }

    const unsubParents = onSnapshot(
      collection(db, 'parents'),
      (snapshot) => {
        const loaded = snapshot.docs.map((docSnap) => docSnap.data() as ParentProfile);
        setParentProfiles(loaded);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'parents');
        } catch {
          // Error logged in handleFirestoreError
        }
      }
    );

    const unsubTutors = onSnapshot(
      collection(db, 'tutors'),
      (snapshot) => {
        const loaded: TutorAccount[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<TutorAccount, 'id'>),
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        setTutorsList(loaded);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'tutors');
        } catch {
          // Error logged in handleFirestoreError
        }
      }
    );

    return () => {
      unsubParents();
      unsubTutors();
    };
  }, [isAdmin]);

  // Keep selected student valid as roster updates
  useEffect(() => {
    if (students.length === 0) {
      setSelectedStudentId('');
      return;
    }
    const exists = students.some((s) => s.studentId === selectedStudentId);
    if (!exists) {
      setSelectedStudentId(students[0].studentId);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.studentId === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  // Load Session Logs & Progress Reports for the selected student
  useEffect(() => {
    if (!selectedStudent) {
      setSessionLogs([]);
      setReports([]);
      return;
    }

    const parentUid = selectedStudent.parentUid;
    setLogsLoading(true);
    setReportsLoading(true);

    const logsPath = `parents/${parentUid}/sessionLogs`;
    const logsQuery = isAdmin
      ? collection(db, 'parents', parentUid, 'sessionLogs')
      : query(collection(db, 'parents', parentUid, 'sessionLogs'), where('tutorUid', '==', user.uid));

    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const loaded: SessionLog[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<SessionLog, 'id'>),
          }))
          .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
        setSessionLogs(loaded);
        setLogsLoading(false);
      },
      (error) => {
        setLogsLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, logsPath);
        } catch {
          // Logged in handleFirestoreError
        }
      }
    );

    const reportsPath = `parents/${parentUid}/progressReports`;
    const reportsQuery = isAdmin
      ? collection(db, 'parents', parentUid, 'progressReports')
      : query(
          collection(db, 'parents', parentUid, 'progressReports'),
          where('tutorUid', '==', user.uid)
        );

    const unsubReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const loaded: ProgressReport[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProgressReport, 'id'>),
          }))
          .sort((a, b) => b.reportDate.localeCompare(a.reportDate));
        setReports(loaded);
        setReportsLoading(false);
      },
      (error) => {
        setReportsLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, reportsPath);
        } catch {
          // Logged in handleFirestoreError
        }
      }
    );

    return () => {
      unsubLogs();
      unsubReports();
    };
  }, [selectedStudent, isAdmin, user.uid]);

  // Reset edit forms when switching selected student
  useEffect(() => {
    setEditingLogId(null);
    setEditingReportId(null);
    setLogTopics('');
    setLogHomework('');
    setLogNotes('');
    setReportTutorNotes('');
    setReportNextFocus('');
    setReportAttachmentTitle('');
    setReportAttachmentUrl('');
  }, [selectedStudentId]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentClass.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.assignedTutor.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const missingRosterParents = useMemo(() => {
    if (!isAdmin) return [];
    const rosterIds = new Set(students.map((s) => s.studentId));
    return parentProfiles.filter((p) => !rosterIds.has(p.parentUid));
  }, [isAdmin, parentProfiles, students]);

  const completedHours = useMemo(() => {
    const mins = sessionLogs
      .filter((log) => log.attendance === 'Completed')
      .reduce((sum, log) => sum + log.durationMinutes, 0);
    return (mins / 60).toFixed(1);
  }, [sessionLogs]);

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      // Clipboard blocked in some browser contexts
    }
  };

  const resetLogForm = () => {
    setEditingLogId(null);
    setLogSubject('Mathematics');
    setLogDate(getTodayIsoDate());
    setLogDuration(60);
    setLogAttendance('Completed');
    setLogTopics('');
    setLogHomework('');
    setLogNotes('');
  };

  const handleStartEditLog = (log: SessionLog) => {
    setEditingLogId(log.id);
    setLogSubject(log.subject);
    setLogDate(log.sessionDate);
    setLogDuration(log.durationMinutes);
    setLogAttendance(log.attendance);
    setLogTopics(log.topicsCovered);
    setLogHomework(log.homeworkAssigned);
    setLogNotes(log.sessionNotes);
    setDashboardError(null);
    setDashboardNotice(null);
  };

  const handleSaveSessionLog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;
    setDashboardError(null);
    setDashboardNotice(null);

    const cleanSubject = logSubject.trim().slice(0, PORTAL_LIMITS.subjectMax);
    const cleanDate = logDate.trim();
    const cleanTopics = logTopics.trim().slice(0, PORTAL_LIMITS.topicsMax);
    const cleanHomework = logHomework.trim().slice(0, PORTAL_LIMITS.homeworkMax);
    const cleanNotes = logNotes.trim().slice(0, PORTAL_LIMITS.sessionNotesMax);
    const clampedDuration = Math.min(
      PORTAL_LIMITS.maxDuration,
      Math.max(PORTAL_LIMITS.minDuration, Math.round(Number(logDuration) || 60))
    );

    if (!cleanSubject || !cleanTopics || !cleanHomework || !cleanNotes) {
      setDashboardError('Please fill in subject, topics covered, homework assigned, and session notes.');
      return;
    }

    if (!PORTAL_LIMITS.dateRegex.test(cleanDate)) {
      setDashboardError('Please select a valid session date (YYYY-MM-DD).');
      return;
    }

    setSavingLog(true);
    const parentUid = selectedStudent.parentUid;
    const logId = editingLogId || makeDocId('log');
    const logPath = `parents/${parentUid}/sessionLogs/${logId}`;

    try {
      const logRef = doc(db, 'parents', parentUid, 'sessionLogs', logId);
      if (editingLogId) {
        await updateDoc(logRef, {
          tutorName: activeTutorName,
          studentName: selectedStudent.studentName.slice(0, PORTAL_LIMITS.nameMax),
          subject: cleanSubject,
          sessionDate: cleanDate,
          durationMinutes: clampedDuration,
          attendance: logAttendance,
          topicsCovered: cleanTopics,
          homeworkAssigned: cleanHomework,
          sessionNotes: cleanNotes,
          updatedAt: serverTimestamp(),
        });
        setDashboardNotice(`Session log for ${selectedStudent.studentName} (${cleanDate}) updated.`);
      } else {
        await setDoc(logRef, {
          parentUid,
          tutorUid: user.uid,
          tutorName: activeTutorName,
          studentName: selectedStudent.studentName.slice(0, PORTAL_LIMITS.nameMax),
          subject: cleanSubject,
          sessionDate: cleanDate,
          durationMinutes: clampedDuration,
          attendance: logAttendance,
          topicsCovered: cleanTopics,
          homeworkAssigned: cleanHomework,
          sessionNotes: cleanNotes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setDashboardNotice(`New session log saved for ${selectedStudent.studentName}.`);
      }
      resetLogForm();
    } catch (error) {
      setDashboardError('Could not save session log. Confirm you are assigned to this student.');
      handleFirestoreError(
        error,
        editingLogId ? OperationType.UPDATE : OperationType.CREATE,
        logPath
      );
    } finally {
      setSavingLog(false);
    }
  };

  const resetReportForm = () => {
    setEditingReportId(null);
    setReportSubject('Mathematics');
    setReportTerm('First Term · Weekly Review');
    setReportScore(85);
    setReportDate(getTodayIsoDate());
    setReportTutorNotes('');
    setReportNextFocus('');
    setReportAttachmentTitle('');
    setReportAttachmentUrl('');
  };

  const handleStartEditReport = (report: ProgressReport) => {
    setEditingReportId(report.id);
    setReportSubject(report.subject);
    setReportTerm(report.term);
    setReportScore(report.assessmentScore);
    setReportDate(report.reportDate);
    setReportTutorNotes(report.tutorNotes);
    setReportNextFocus(report.nextFocus);
    setReportAttachmentTitle(report.attachmentTitle || '');
    setReportAttachmentUrl(report.attachmentUrl || '');
    setDashboardError(null);
    setDashboardNotice(null);
  };

  const handleSaveProgressReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;
    setDashboardError(null);
    setDashboardNotice(null);

    const cleanSubject = reportSubject.trim().slice(0, PORTAL_LIMITS.subjectMax);
    const cleanTerm = reportTerm.trim().slice(0, PORTAL_LIMITS.termMax);
    const cleanDate = reportDate.trim();
    const cleanNotes = reportTutorNotes.trim().slice(0, PORTAL_LIMITS.tutorNotesMax);
    const cleanFocus = reportNextFocus.trim().slice(0, PORTAL_LIMITS.nextFocusMax);
    const cleanAttachTitle = reportAttachmentTitle.trim().slice(0, PORTAL_LIMITS.attachmentTitleMax);
    const cleanAttachUrl = reportAttachmentUrl.trim().slice(0, PORTAL_LIMITS.attachmentUrlMax);
    const clampedScore = Math.min(
      PORTAL_LIMITS.maxScore,
      Math.max(PORTAL_LIMITS.minScore, Math.round(Number(reportScore) || 0))
    );

    if (!cleanSubject || !cleanTerm || !cleanNotes || !cleanFocus) {
      setDashboardError('Please complete subject, term, tutor notes, and next learning focus.');
      return;
    }

    if (!PORTAL_LIMITS.dateRegex.test(cleanDate)) {
      setDashboardError('Please select a valid report date (YYYY-MM-DD).');
      return;
    }

    if (cleanAttachUrl && !isSafeHttpsUrl(cleanAttachUrl)) {
      setDashboardError('Attachment link must start with https:// (at least 8 characters).');
      return;
    }

    setSavingReport(true);
    const parentUid = selectedStudent.parentUid;
    const reportId = editingReportId || makeDocId('report');
    const reportPath = `parents/${parentUid}/progressReports/${reportId}`;

    try {
      const reportRef = doc(db, 'parents', parentUid, 'progressReports', reportId);

      if (editingReportId) {
        const updatePayload: Record<string, string | number | FieldValue> = {
          studentName: selectedStudent.studentName.slice(0, PORTAL_LIMITS.nameMax),
          subject: cleanSubject,
          term: cleanTerm,
          assessmentScore: clampedScore,
          tutorName: activeTutorName,
          tutorNotes: cleanNotes,
          nextFocus: cleanFocus,
          reportDate: cleanDate,
          updatedAt: serverTimestamp(),
        };

        if (cleanAttachTitle) {
          updatePayload.attachmentTitle = cleanAttachTitle;
        } else {
          updatePayload.attachmentTitle = deleteField();
        }

        if (cleanAttachUrl) {
          updatePayload.attachmentUrl = cleanAttachUrl;
        } else {
          updatePayload.attachmentUrl = deleteField();
        }

        await updateDoc(reportRef, updatePayload);
        setDashboardNotice(
          `Progress report for ${selectedStudent.studentName} (${cleanSubject}) updated.`
        );
      } else {
        const createPayload: Record<string, string | number | FieldValue> = {
          parentUid,
          tutorUid: user.uid,
          studentName: selectedStudent.studentName.slice(0, PORTAL_LIMITS.nameMax),
          subject: cleanSubject,
          term: cleanTerm,
          assessmentScore: clampedScore,
          tutorName: activeTutorName,
          tutorNotes: cleanNotes,
          nextFocus: cleanFocus,
          reportDate: cleanDate,
          status: 'Published',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (cleanAttachTitle) {
          createPayload.attachmentTitle = cleanAttachTitle;
        }
        if (cleanAttachUrl) {
          createPayload.attachmentUrl = cleanAttachUrl;
        }

        await setDoc(reportRef, createPayload);
        setDashboardNotice(
          `Progress report attached and published to ${selectedStudent.parentName}’s portal.`
        );
      }

      resetReportForm();
    } catch (error) {
      setDashboardError('Could not attach progress report. Verify student assignment and fields.');
      handleFirestoreError(
        error,
        editingReportId ? OperationType.UPDATE : OperationType.CREATE,
        reportPath
      );
    } finally {
      setSavingReport(false);
    }
  };

  // Coordinator action: Sync missing /students docs from /parents
  const handleSyncMissingRoster = async () => {
    if (!isAdmin || missingRosterParents.length === 0) return;
    setSyncingRoster(true);
    setDashboardError(null);
    setDashboardNotice(null);

    try {
      const batch = writeBatch(db);
      missingRosterParents.forEach((p) => {
        const studentRef = doc(db, 'students', p.parentUid);
        const payload: Record<string, string | FieldValue> = {
          studentId: p.parentUid,
          parentUid: p.parentUid,
          studentName: p.childName.slice(0, PORTAL_LIMITS.nameMax),
          studentClass: p.studentClass.slice(0, PORTAL_LIMITS.classMax),
          parentName: p.displayName.slice(0, PORTAL_LIMITS.nameMax),
          assignedTutor: p.assignedTutor.slice(0, PORTAL_LIMITS.nameMax),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (p.assignedTutorUid && PORTAL_LIMITS.idRegex.test(p.assignedTutorUid)) {
          payload.assignedTutorUid = p.assignedTutorUid;
        }
        batch.set(studentRef, payload);
      });
      await batch.commit();
      setDashboardNotice(`Synced ${missingRosterParents.length} student record(s) into the roster.`);
    } catch (error) {
      setDashboardError('Could not sync student roster records.');
      handleFirestoreError(error, OperationType.WRITE, 'students');
    } finally {
      setSyncingRoster(false);
    }
  };

  // Coordinator action: Authorize a tutor UID in /tutors/{tutorUid}
  const handleAddOrUpdateTutor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;
    setDashboardError(null);
    setDashboardNotice(null);

    const cleanUid = newTutorUid.trim().slice(0, PORTAL_LIMITS.idMax);
    const cleanName = newTutorName.trim().slice(0, PORTAL_LIMITS.nameMax);
    const cleanEmail = newTutorEmail.trim().slice(0, PORTAL_LIMITS.emailMax);
    const cleanSpecialty = newTutorSpecialty.trim().slice(0, PORTAL_LIMITS.specialtyMax);

    if (!cleanUid || !PORTAL_LIMITS.idRegex.test(cleanUid)) {
      setDashboardError('Tutor Firebase UID may only contain letters, numbers, underscores, and hyphens.');
      return;
    }

    if (!cleanName || cleanEmail.length < 3 || !cleanSpecialty) {
      setDashboardError('Please provide the tutor’s full name, Google email, and specialty.');
      return;
    }

    setSavingTutor(true);
    const tutorPath = `tutors/${cleanUid}`;
    const existingTutor = tutorsList.find((t) => t.tutorUid === cleanUid);

    try {
      const tutorRef = doc(db, 'tutors', cleanUid);
      if (existingTutor) {
        await updateDoc(tutorRef, {
          displayName: cleanName,
          email: cleanEmail,
          specialty: cleanSpecialty,
          active: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(tutorRef, {
          tutorUid: cleanUid,
          displayName: cleanName,
          email: cleanEmail,
          specialty: cleanSpecialty,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setNewTutorUid('');
      setNewTutorName('');
      setNewTutorEmail('');
      setDashboardNotice(`Tutor access granted for ${cleanName}.`);
    } catch (error) {
      setDashboardError('Unable to save tutor account.');
      handleFirestoreError(
        error,
        existingTutor ? OperationType.UPDATE : OperationType.CREATE,
        tutorPath
      );
    } finally {
      setSavingTutor(false);
    }
  };

  const handleToggleTutorActive = async (tutor: TutorAccount) => {
    if (!isAdmin) return;
    setDashboardError(null);
    const tutorPath = `tutors/${tutor.tutorUid}`;
    try {
      await updateDoc(doc(db, 'tutors', tutor.tutorUid), {
        active: !tutor.active,
        updatedAt: serverTimestamp(),
      });
      setDashboardNotice(
        `${tutor.displayName} is now ${!tutor.active ? 'active' : 'paused'} in the Tutor Dashboard.`
      );
    } catch (error) {
      setDashboardError('Could not update tutor status.');
      handleFirestoreError(error, OperationType.UPDATE, tutorPath);
    }
  };

  // Coordinator action: Assign an authorized tutor UID to a specific student
  const handleAssignTutorToStudent = async (
    student: StudentRosterItem,
    selectedTutorUid: string
  ) => {
    if (!isAdmin) return;
    setAssigningStudentId(student.studentId);
    setDashboardError(null);
    setDashboardNotice(null);

    const matchedTutor = tutorsList.find((t) => t.tutorUid === selectedTutorUid);
    const nextTutorName = matchedTutor
      ? matchedTutor.displayName.slice(0, PORTAL_LIMITS.nameMax)
      : student.assignedTutor;

    try {
      const batch = writeBatch(db);
      const studentRef = doc(db, 'students', student.studentId);
      const parentRef = doc(db, 'parents', student.parentUid);

      if (selectedTutorUid && PORTAL_LIMITS.idRegex.test(selectedTutorUid)) {
        batch.update(studentRef, {
          assignedTutor: nextTutorName,
          assignedTutorUid: selectedTutorUid,
          updatedAt: serverTimestamp(),
        });
        batch.update(parentRef, {
          assignedTutor: nextTutorName,
          assignedTutorUid: selectedTutorUid,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.update(studentRef, {
          assignedTutorUid: deleteField(),
          updatedAt: serverTimestamp(),
        });
        batch.update(parentRef, {
          assignedTutorUid: deleteField(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
      setDashboardNotice(
        matchedTutor
          ? `Assigned ${matchedTutor.displayName} to ${student.studentName}.`
          : `Cleared direct tutor UID assignment for ${student.studentName}.`
      );
    } catch (error) {
      setDashboardError('Could not update tutor assignment for this student.');
      handleFirestoreError(error, OperationType.WRITE, `students/${student.studentId}`);
    } finally {
      setAssigningStudentId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tutor / Coordinator Header */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#0B1F3A] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#D8B45A]">
            {isAdmin ? 'Coordinator & Lead Tutor Workspace' : 'Authorized BrightPath Tutor'}
            <span aria-hidden="true"> · </span>
            <span>{user.email}</span>
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Tutor Session &amp; Progress Dashboard
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span>Signed in as {activeTutorName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">UID: {user.uid.slice(0, 12)}...</span>
            <button
              type="button"
              onClick={() => void handleCopyUid()}
              className="inline-flex items-center gap-1 text-[#D8B45A] hover:text-white underline transition-colors whitespace-nowrap shrink-0"
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copiedUid ? 'Copied UID' : 'Copy UID'}</span>
            </button>
          </div>
        </div>

        {isAdmin && (
          <div
            role="group"
            aria-label="Tutor dashboard sections"
            className="inline-flex items-center gap-1 p-1 bg-[#132E53] border border-white/15 rounded-lg self-start lg:self-auto"
          >
            <button
              type="button"
              onClick={() => setWorkspaceSection('students')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                workspaceSection === 'students'
                  ? 'bg-white text-[#0B1F3A]'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" aria-hidden="true" />
              <span>Student Logs &amp; Reports</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceSection('staff')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                workspaceSection === 'staff'
                  ? 'bg-white text-[#0B1F3A]'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <UserCog className="w-4 h-4" aria-hidden="true" />
              <span>Tutors &amp; Assignments</span>
            </button>
          </div>
        )}
      </div>

      {dashboardError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-sm text-red-800"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{dashboardError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDashboardError(null)}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {dashboardNotice && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 text-sm text-emerald-900"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{dashboardNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDashboardNotice(null)}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {isAdmin && missingRosterParents.length > 0 && (
        <div className="p-5 rounded-xl border border-[#C59B38]/40 bg-[#FCF9F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {missingRosterParents.length} registered family account(s) ready to sync into the student roster
            </p>
            <p className="text-xs text-slate-600">
              Syncing makes previously registered students selectable for session logs and progress reports.
            </p>
          </div>
          <button
            type="button"
            disabled={syncingRoster}
            onClick={() => void handleSyncMissingRoster()}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            {syncingRoster ? 'Syncing Roster...' : 'Sync Student Roster'}
          </button>
        </div>
      )}

      {/* SECTION 1: STUDENT LOGS & PROGRESS REPORTS */}
      {workspaceSection === 'students' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Student Selector Sidebar */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                  {isAdmin ? 'All Students' : 'Assigned Students'}
                </h3>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {students.length} total
                </span>
              </div>

              <div className="relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Filter by student or class..."
                  aria-label="Filter assigned students"
                  className="w-full h-10 pl-9 pr-3 text-sm text-slate-900 bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B1F3A]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-200 max-h-[540px] overflow-y-auto">
              {studentsLoading ? (
                <div className="p-6 text-sm text-slate-500 text-center">Loading student roster...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <Users className="w-5 h-5 text-[#8C6A1B] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[#0B1F3A]">No students assigned yet</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAdmin
                      ? 'Once a parent completes portal setup—or after syncing existing parents—students will appear here.'
                      : 'Ask the BrightPath coordinator to assign a student to your Tutor UID.'}
                  </p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const selected = student.studentId === selectedStudentId;
                  return (
                    <button
                      key={student.studentId}
                      type="button"
                      onClick={() => setSelectedStudentId(student.studentId)}
                      className={`w-full text-left p-4 transition-colors ${
                        selected
                          ? 'bg-[#FCF9F0] text-[#0B1F3A]'
                          : 'bg-white hover:bg-[#F8FAFC] text-slate-800'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-semibold text-sm text-[#0B1F3A] truncate">
                          {student.studentName}
                        </p>
                        {selected && (
                          <span className="text-xs font-semibold text-[#8C6A1B] shrink-0">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {student.studentClass}
                        <span aria-hidden="true"> · </span>
                        Parent: {student.parentName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Lead Tutor: {student.assignedTutor}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Main Student Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedStudent ? (
              <div className="p-10 rounded-xl border border-slate-200 bg-white text-center space-y-2">
                <BookOpen className="w-6 h-6 text-[#8C6A1B] mx-auto" aria-hidden="true" />
                <p className="font-display text-xl font-bold text-[#0B1F3A]">
                  Select a Student to Begin
                </p>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Choose a student from the roster to record tutoring session logs or attach a new progress report for their parents.
                </p>
              </div>
            ) : (
              <>
                {/* Selected Student Summary & Tabs */}
                <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#8C6A1B]">
                        Active Student Record · {selectedStudent.studentClass}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-[#0B1F3A]">
                        {selectedStudent.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Parent: {selectedStudent.parentName}
                        <span aria-hidden="true"> · </span>
                        Assigned Tutor: {selectedStudent.assignedTutor}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div>
                        <p className="text-xs text-slate-500">Sessions</p>
                        <p className="font-display text-xl font-bold text-[#0B1F3A] tabular-nums">
                          {sessionLogs.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Completed Hrs</p>
                        <p className="font-display text-xl font-bold text-[#0B1F3A] tabular-nums">
                          {completedHours}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Reports</p>
                        <p className="font-display text-xl font-bold text-[#0B1F3A] tabular-nums">
                          {reports.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    role="group"
                    aria-label="Student workspace views"
                    className="inline-flex items-center gap-1 p-1 bg-[#F8FAFC] border border-slate-200 rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => setStudentTab('sessions')}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        studentTab === 'sessions'
                          ? 'bg-[#0B1F3A] text-white'
                          : 'text-slate-600 hover:text-[#0B1F3A]'
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                      <span>Session Logs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentTab('reports')}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        studentTab === 'reports'
                          ? 'bg-[#0B1F3A] text-white'
                          : 'text-slate-600 hover:text-[#0B1F3A]'
                      }`}
                    >
                      <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                      <span>Attach Progress Report</span>
                    </button>
                  </div>
                </div>

                {/* TAB A: SESSION LOGS */}
                {studentTab === 'sessions' ? (
                  <div className="space-y-6">
                    <form
                      onSubmit={handleSaveSessionLog}
                      className="p-6 rounded-xl border border-slate-200 bg-white space-y-5"
                    >
                      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="font-display text-xl font-bold text-[#0B1F3A]">
                            {editingLogId ? 'Edit Session Log' : 'Log Tutoring Session'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Updates appear immediately in {selectedStudent.parentName}’s Parent Portal.
                          </p>
                        </div>
                        {editingLogId && (
                          <button
                            type="button"
                            onClick={resetLogForm}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                          <label
                            htmlFor="tutor-log-subject"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Subject Covered
                          </label>
                          <select
                            id="tutor-log-subject"
                            value={logSubject}
                            onChange={(e) => setLogSubject(e.target.value)}
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          >
                            {COMMON_SUBJECTS.map((subj) => (
                              <option key={subj} value={subj}>
                                {subj}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-log-date"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Session Date
                          </label>
                          <input
                            id="tutor-log-date"
                            type="date"
                            required
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-log-duration"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Duration (Minutes)
                          </label>
                          <input
                            id="tutor-log-duration"
                            type="number"
                            min={PORTAL_LIMITS.minDuration}
                            max={PORTAL_LIMITS.maxDuration}
                            required
                            value={logDuration}
                            onChange={(e) => setLogDuration(Number(e.target.value))}
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="block text-xs font-semibold text-[#0B1F3A]">
                          Attendance Status
                        </span>
                        <div className="inline-flex items-center gap-1 p-1 bg-[#F8FAFC] border border-slate-200 rounded-lg">
                          {ATTENDANCE_OPTIONS.map((statusOption) => (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => setLogAttendance(statusOption)}
                              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                                logAttendance === statusOption
                                  ? 'bg-[#0B1F3A] text-white'
                                  : 'text-slate-600 hover:text-[#0B1F3A]'
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="tutor-log-topics"
                          className="block text-xs font-semibold text-[#0B1F3A]"
                        >
                          Topics Covered
                        </label>
                        <textarea
                          id="tutor-log-topics"
                          required
                          rows={2}
                          maxLength={PORTAL_LIMITS.topicsMax}
                          value={logTopics}
                          onChange={(e) => setLogTopics(e.target.value)}
                          placeholder="e.g. Equivalent fractions, simplifying mixed numbers, and 12 timed arithmetic exercises."
                          className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-log-homework"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Homework Assigned
                          </label>
                          <textarea
                            id="tutor-log-homework"
                            required
                            rows={2}
                            maxLength={PORTAL_LIMITS.homeworkMax}
                            value={logHomework}
                            onChange={(e) => setLogHomework(e.target.value)}
                            placeholder="e.g. Complete Exercise 4B questions 1–10 before Friday's visit."
                            className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-log-notes"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Tutor Session Notes
                          </label>
                          <textarea
                            id="tutor-log-notes"
                            required
                            rows={2}
                            maxLength={PORTAL_LIMITS.sessionNotesMax}
                            value={logNotes}
                            onChange={(e) => setLogNotes(e.target.value)}
                            placeholder="e.g. Focused well throughout the hour and asked clear follow-up questions."
                            className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingLog}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
                        <span>
                          {savingLog
                            ? 'Saving Log...'
                            : editingLogId
                              ? 'Update Session Log'
                              : 'Save Session Log'}
                        </span>
                      </button>
                    </form>

                    {/* Recorded Session Logs */}
                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
                      <div className="p-5 flex items-center justify-between">
                        <h4 className="font-display text-lg font-bold text-[#0B1F3A]">
                          Session History
                        </h4>
                        <span className="text-xs text-slate-500 tabular-nums">
                          {sessionLogs.length} logged visit(s)
                        </span>
                      </div>

                      {logsLoading ? (
                        <div className="p-6 text-sm text-slate-500 text-center">
                          Loading session logs...
                        </div>
                      ) : sessionLogs.length === 0 ? (
                        <div className="p-8 text-center space-y-1">
                          <p className="text-sm font-semibold text-[#0B1F3A]">
                            No session logs recorded for {selectedStudent.studentName} yet
                          </p>
                          <p className="text-xs text-slate-500">
                            Use the form above to record the first home tutoring session.
                          </p>
                        </div>
                      ) : (
                        sessionLogs.map((log) => {
                          const canEdit = isAdmin || log.tutorUid === user.uid;
                          return (
                            <article key={log.id} className="p-5 sm:p-6 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium text-slate-500">
                                    <span className="tabular-nums font-semibold text-[#8C6A1B]">
                                      {log.sessionDate}
                                    </span>
                                    <span aria-hidden="true"> · </span>
                                    <span className="tabular-nums">{log.durationMinutes} min</span>
                                    <span aria-hidden="true"> · </span>
                                    <span>{log.attendance}</span>
                                    <span aria-hidden="true"> · </span>
                                    <span>Tutor: {log.tutorName}</span>
                                  </p>
                                  <h5 className="font-display text-lg font-bold text-[#0B1F3A]">
                                    {log.subject}
                                  </h5>
                                </div>

                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditLog(log)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0 self-start sm:self-auto"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Edit Log</span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-slate-500">Topics Covered</p>
                                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                                    {log.topicsCovered}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-500">
                                    Homework Assigned
                                  </p>
                                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                                    {log.homeworkAssigned}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                                <span className="font-semibold text-[#0B1F3A]">Notes: </span>
                                {log.sessionNotes}
                              </p>
                            </article>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  /* TAB B: ATTACH PROGRESS REPORTS */
                  <div className="space-y-6">
                    <form
                      onSubmit={handleSaveProgressReport}
                      className="p-6 rounded-xl border border-slate-200 bg-white space-y-5"
                    >
                      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="font-display text-xl font-bold text-[#0B1F3A]">
                            {editingReportId
                              ? 'Update Progress Report'
                              : 'Attach New Progress Report'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Publishes assessment scores, tutor feedback, and optional study sheet links directly to {selectedStudent.parentName}’s portal.
                          </p>
                        </div>
                        {editingReportId && (
                          <button
                            type="button"
                            onClick={resetReportForm}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-report-subject"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Subject
                          </label>
                          <select
                            id="tutor-report-subject"
                            value={reportSubject}
                            onChange={(e) => setReportSubject(e.target.value)}
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          >
                            {COMMON_SUBJECTS.map((subj) => (
                              <option key={subj} value={subj}>
                                {subj}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-report-term"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Term / Period
                          </label>
                          <input
                            id="tutor-report-term"
                            type="text"
                            required
                            maxLength={PORTAL_LIMITS.termMax}
                            value={reportTerm}
                            onChange={(e) => setReportTerm(e.target.value)}
                            placeholder="e.g. First Term · Month 2"
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-report-score"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Score (0–100%)
                          </label>
                          <input
                            id="tutor-report-score"
                            type="number"
                            min={PORTAL_LIMITS.minScore}
                            max={PORTAL_LIMITS.maxScore}
                            required
                            value={reportScore}
                            onChange={(e) => setReportScore(Number(e.target.value))}
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="tutor-report-date"
                            className="block text-xs font-semibold text-[#0B1F3A]"
                          >
                            Report Date
                          </label>
                          <input
                            id="tutor-report-date"
                            type="date"
                            required
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="tutor-report-notes"
                          className="block text-xs font-semibold text-[#0B1F3A]"
                        >
                          Detailed Tutor Notes
                        </label>
                        <textarea
                          id="tutor-report-notes"
                          required
                          rows={3}
                          maxLength={PORTAL_LIMITS.tutorNotesMax}
                          value={reportTutorNotes}
                          onChange={(e) => setReportTutorNotes(e.target.value)}
                          placeholder="Summarize strengths, diagnostic quiz performance, accuracy, and classroom confidence..."
                          className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="tutor-report-focus"
                          className="block text-xs font-semibold text-[#0B1F3A]"
                        >
                          Next Learning Focus
                        </label>
                        <input
                          id="tutor-report-focus"
                          type="text"
                          required
                          maxLength={PORTAL_LIMITS.nextFocusMax}
                          value={reportNextFocus}
                          onChange={(e) => setReportNextFocus(e.target.value)}
                          placeholder="e.g. Timed fraction word problems and 15-minute evening mental drills."
                          className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                        />
                      </div>

                      <div className="p-4 rounded-lg bg-[#FCF9F0] border border-[#C59B38]/30 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6A1B]">
                          <Paperclip className="w-4 h-4" aria-hidden="true" />
                          <span>Optional Report Attachment (PDF / Study Sheet Link)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            type="text"
                            maxLength={PORTAL_LIMITS.attachmentTitleMax}
                            value={reportAttachmentTitle}
                            onChange={(e) => setReportAttachmentTitle(e.target.value)}
                            placeholder="Attachment label (e.g. November Assessment Sheet)"
                            aria-label="Attachment label"
                            className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          />
                          <input
                            type="url"
                            maxLength={PORTAL_LIMITS.attachmentUrlMax}
                            value={reportAttachmentUrl}
                            onChange={(e) => setReportAttachmentUrl(e.target.value)}
                            placeholder="https://... (optional secure document link)"
                            aria-label="Attachment HTTPS URL"
                            className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingReport}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                      >
                        <FilePlus2 className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
                        <span>
                          {savingReport
                            ? 'Publishing Report...'
                            : editingReportId
                              ? 'Update Progress Report'
                              : 'Attach & Publish Report'}
                        </span>
                      </button>
                    </form>

                    {/* Existing Progress Reports for Selected Student */}
                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
                      <div className="p-5 flex items-center justify-between">
                        <h4 className="font-display text-lg font-bold text-[#0B1F3A]">
                          Published Reports for {selectedStudent.studentName}
                        </h4>
                        <span className="text-xs text-slate-500 tabular-nums">
                          {reports.length} report(s)
                        </span>
                      </div>

                      {reportsLoading ? (
                        <div className="p-6 text-sm text-slate-500 text-center">
                          Loading reports...
                        </div>
                      ) : reports.length === 0 ? (
                        <div className="p-8 text-center space-y-1">
                          <p className="text-sm font-semibold text-[#0B1F3A]">
                            No tutor-attached reports yet
                          </p>
                          <p className="text-xs text-slate-500">
                            Attach a report above to share termly scores and notes with the parent.
                          </p>
                        </div>
                      ) : (
                        reports.map((report) => {
                          const canEdit =
                            isAdmin ||
                            (report.tutorUid === user.uid && report.status !== 'Acknowledged');

                          return (
                            <article key={report.id} className="p-5 sm:p-6 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium text-slate-500">
                                    <span className="text-[#8C6A1B] font-semibold">
                                      {report.term}
                                    </span>
                                    <span aria-hidden="true"> · </span>
                                    <span className="tabular-nums">{report.reportDate}</span>
                                    <span aria-hidden="true"> · </span>
                                    <span>{report.status}</span>
                                    <span aria-hidden="true"> · </span>
                                    <span>Tutor: {report.tutorName}</span>
                                  </p>
                                  <h5 className="font-display text-lg font-bold text-[#0B1F3A]">
                                    {report.subject}
                                  </h5>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  <span className="font-display text-xl font-bold text-[#0B1F3A] tabular-nums">
                                    {report.assessmentScore}%
                                  </span>
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditReport(report)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span>Edit</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-slate-700 leading-relaxed">
                                {report.tutorNotes}
                              </p>

                              <p className="text-xs text-slate-600">
                                <span className="font-semibold text-[#0B1F3A]">Next Focus: </span>
                                {report.nextFocus}
                              </p>

                              {(report.attachmentTitle || report.attachmentUrl) && (
                                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-[#8C6A1B]">
                                  <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>{report.attachmentTitle || 'Attached Progress Sheet'}</span>
                                  {report.attachmentUrl && (
                                    <a
                                      href={report.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-semibold underline hover:text-[#0B1F3A]"
                                    >
                                      <span>Open Document</span>
                                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                    </a>
                                  )}
                                </div>
                              )}

                              {report.status === 'Acknowledged' && report.parentReply && (
                                <p className="text-xs text-emerald-800 pt-2 border-t border-slate-100">
                                  <span className="font-semibold">Parent Note: </span>“
                                  {report.parentReply}”
                                </p>
                              )}
                            </article>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* SECTION 2: COORDINATOR TUTOR ROSTER & STUDENT ASSIGNMENTS (isAdmin only) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Authorize / Update Tutor Account */}
          <form
            onSubmit={handleAddOrUpdateTutor}
            className="lg:col-span-5 p-6 rounded-xl border border-slate-200 bg-white space-y-4"
          >
            <div className="pb-3 border-b border-slate-200">
              <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                Authorize a BrightPath Tutor
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Grant Tutor Dashboard access by entering a verified teacher’s Firebase User UID (visible when they sign in to the Parent Portal section on the Home page).
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-tutor-uid" className="block text-xs font-semibold text-[#0B1F3A]">
                Tutor Firebase UID
              </label>
              <input
                id="admin-tutor-uid"
                type="text"
                required
                maxLength={PORTAL_LIMITS.idMax}
                value={newTutorUid}
                onChange={(e) => setNewTutorUid(e.target.value)}
                placeholder="Paste tutor UID..."
                className="w-full h-10 px-3 text-sm font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-tutor-name" className="block text-xs font-semibold text-[#0B1F3A]">
                Tutor Full Name
              </label>
              <input
                id="admin-tutor-name"
                type="text"
                required
                maxLength={PORTAL_LIMITS.nameMax}
                value={newTutorName}
                onChange={(e) => setNewTutorName(e.target.value)}
                placeholder="e.g. Tunde Bakare"
                className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-tutor-email" className="block text-xs font-semibold text-[#0B1F3A]">
                Google Email
              </label>
              <input
                id="admin-tutor-email"
                type="email"
                required
                maxLength={PORTAL_LIMITS.emailMax}
                value={newTutorEmail}
                onChange={(e) => setNewTutorEmail(e.target.value)}
                placeholder="tutor@gmail.com"
                className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-tutor-specialty"
                className="block text-xs font-semibold text-[#0B1F3A]"
              >
                Subject Specialty
              </label>
              <input
                id="admin-tutor-specialty"
                type="text"
                required
                maxLength={PORTAL_LIMITS.specialtyMax}
                value={newTutorSpecialty}
                onChange={(e) => setNewTutorSpecialty(e.target.value)}
                placeholder="e.g. JSS & SSS Mathematics, Physics"
                className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <button
              type="submit"
              disabled={savingTutor}
              className="w-full h-11 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors"
            >
              {savingTutor ? 'Saving Tutor...' : 'Grant Tutor Access'}
            </button>
          </form>

          {/* Authorized Tutors & Student Assignments */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
              <div className="p-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                  Authorized Tutors
                </h3>
                <span className="text-xs text-slate-500 tabular-nums">
                  {tutorsList.length} tutor(s)
                </span>
              </div>

              {tutorsList.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  No additional tutor accounts added yet. As Coordinator, you already have full access to log sessions and attach reports.
                </div>
              ) : (
                tutorsList.map((tutor) => (
                  <div
                    key={tutor.tutorUid}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-sm text-[#0B1F3A]">
                        {tutor.displayName}
                        <span aria-hidden="true"> · </span>
                        <span className={tutor.active ? 'text-emerald-700' : 'text-slate-500'}>
                          {tutor.active ? 'Active' : 'Paused'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {tutor.specialty}
                        <span aria-hidden="true"> · </span>
                        <span>{tutor.email}</span>
                      </p>
                      <p className="text-xs font-mono text-slate-400 truncate">UID: {tutor.tutorUid}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleToggleTutorActive(tutor)}
                      className="px-3.5 py-2 text-xs font-semibold text-[#0B1F3A] border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0 self-start sm:self-auto"
                    >
                      {tutor.active ? 'Pause Access' : 'Reactivate'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Student Tutor Assignments */}
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                    Student–Tutor Assignments
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Link an authorized tutor UID to each student so they can manage logs &amp; reports.
                  </p>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  No registered students in the roster yet.
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.studentId}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-[#0B1F3A]">{student.studentName}</p>
                      <p className="text-xs text-slate-500">
                        {student.studentClass}
                        <span aria-hidden="true"> · </span>
                        Parent: {student.parentName}
                        <span aria-hidden="true"> · </span>
                        Display Tutor: {student.assignedTutor}
                      </p>
                    </div>

                    <select
                      aria-label={`Assign tutor account for ${student.studentName}`}
                      disabled={assigningStudentId === student.studentId}
                      value={student.assignedTutorUid || ''}
                      onChange={(e) => void handleAssignTutorToStudent(student, e.target.value)}
                      className="h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] sm:w-56 shrink-0"
                    >
                      <option value="">Coordinator Only (Unassigned UID)</option>
                      {tutorsList
                        .filter((t) => t.active)
                        .map((t) => (
                          <option key={t.tutorUid} value={t.tutorUid}>
                            {t.displayName}
                          </option>
                        ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiet link to public tutor profiles on About */}
      <p className="text-xs text-slate-500 text-center">
        Public staff credentials are configured in BrightPath’s{' '}
        <Link to="/about" className="text-[#8C6A1B] underline hover:text-[#0B1F3A]">
          Meet Our Tutors
        </Link>{' '}
        roster ({siteConfig.about.tutors.length} featured lead tutors).
      </p>
    </div>
  );
}
