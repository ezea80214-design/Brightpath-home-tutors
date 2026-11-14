import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  LogOut,
  Paperclip,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useFirebaseAuth } from './FirebaseProvider';
import { TutorDashboard } from './TutorDashboard';
import { siteConfig } from '../data/siteConfig';
import {
  PORTAL_LIMITS,
  type ParentProfile,
  type ProgressReport,
  type SessionLog,
  type TutorAccount,
} from '../types/portal';

const COORDINATOR_EMAIL = 'eobiagelianthonia@gmail.com';

type PortalViewMode = 'parent' | 'tutor';
type ParentSectionTab = 'reports' | 'sessions';

function buildStarterReports(
  parentUid: string,
  childName: string,
  assignedTutor: string
): Omit<ProgressReport, 'id'>[] {
  const safeChild = childName.slice(0, PORTAL_LIMITS.nameMax);
  const safeTutor = assignedTutor.slice(0, PORTAL_LIMITS.nameMax);

  return [
    {
      parentUid,
      studentName: safeChild,
      subject: 'Mathematics',
      term: 'First Term · Week 6 Review',
      assessmentScore: 84,
      tutorName: safeTutor,
      tutorNotes: `${safeChild} worked calmly through multi-step word problems and fractions this week. Written steps are much neater, and careless addition slips dropped noticeably during timed practice.`,
      nextFocus: 'Percentages, ratio word problems, and weekly 15-minute mental arithmetic drills.',
      reportDate: '2026-11-10',
      status: 'Published',
    },
    {
      parentUid,
      studentName: safeChild,
      subject: 'English Language',
      term: 'First Term · Week 5 Review',
      assessmentScore: 88,
      tutorName: 'Kemi Ogunsola',
      tutorNotes: `Reading fluency aloud is steady and expressive. ${safeChild} answered 9 out of 10 comprehension questions accurately by referring back to evidence in the passage before writing.`,
      nextFocus: 'Paragraph transitions in guided compositions and punctuation in direct speech.',
      reportDate: '2026-11-03',
      status: 'Published',
    },
    {
      parentUid,
      studentName: safeChild,
      subject: 'Study Habits & Homework',
      term: 'First Term · Month 1 Summary',
      assessmentScore: 91,
      tutorName: safeTutor,
      tutorNotes: `Punctual at the study desk with textbooks and stationery prepared before lessons begin. Shows growing confidence when asking follow-up questions on unfamiliar school topics.`,
      nextFocus: 'Maintain 20 minutes of quiet evening reading four nights per week.',
      reportDate: '2026-10-27',
      status: 'Acknowledged',
      parentReply: 'We have noticed calmer homework evenings at home. Thank you for the steady pace.',
    },
  ];
}

export function ParentPortal() {
  const { user, authReady, authError, signingIn, signInWithGoogle, signOutUser, clearAuthError } =
    useFirebaseAuth();

  // Role & access detection
  const [roleLoading, setRoleLoading] = useState(false);
  const [isAdminDoc, setIsAdminDoc] = useState(false);
  const [tutorAccount, setTutorAccount] = useState<TutorAccount | null>(null);
  const [portalMode, setPortalMode] = useState<PortalViewMode>('parent');
  const [hasAutoSelectedMode, setHasAutoSelectedMode] = useState(false);

  // Parent view state
  const [profileLoading, setProfileLoading] = useState(false);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [sessionLogsLoading, setSessionLogsLoading] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [parentSectionTab, setParentSectionTab] = useState<ParentSectionTab>('reports');
  const [portalError, setPortalError] = useState<string | null>(null);

  // Registration state (first-time parent setup)
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regChildName, setRegChildName] = useState('');
  const [regStudentClass, setRegStudentClass] = useState(
    siteConfig.contactPage.studentClassOptions[0] ?? 'Primary 1 – Primary 3'
  );
  const [regTutor, setRegTutor] = useState(
    siteConfig.about.tutors[0]?.name ?? 'Adaeze Nwosu'
  );
  const [registering, setRegistering] = useState(false);

  // Report filtering and parent reply state
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const isAdmin =
    Boolean(user?.emailVerified && user.email === COORDINATOR_EMAIL) ||
    Boolean(user?.emailVerified && isAdminDoc);
  const isTutor = Boolean(user?.emailVerified && tutorAccount?.active);
  const hasTutorAccess = isAdmin || isTutor;

  // Check Admin & Tutor roles for the signed-in user
  useEffect(() => {
    if (!authReady || !user) {
      setIsAdminDoc(false);
      setTutorAccount(null);
      setRoleLoading(false);
      setHasAutoSelectedMode(false);
      setPortalMode('parent');
      return;
    }

    let cancelled = false;
    setRoleLoading(true);

    void getDoc(doc(db, 'admins', user.uid))
      .then((snap) => {
        if (!cancelled) {
          setIsAdminDoc(snap.exists());
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdminDoc(false);
        }
      });

    const tutorPath = `tutors/${user.uid}`;
    const unsubscribeTutor = onSnapshot(
      doc(db, 'tutors', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setTutorAccount({
            id: snapshot.id,
            ...(snapshot.data() as Omit<TutorAccount, 'id'>),
          });
        } else {
          setTutorAccount(null);
        }
        setRoleLoading(false);
      },
      (error) => {
        setTutorAccount(null);
        setRoleLoading(false);
        try {
          handleFirestoreError(error, OperationType.GET, tutorPath);
        } catch {
          // Error logged in handleFirestoreError
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribeTutor();
    };
  }, [authReady, user]);

  // Listen to parent's own profile
  useEffect(() => {
    if (!authReady || !user) {
      setParentProfile(null);
      setReports([]);
      setSessionLogs([]);
      setPortalError(null);
      return;
    }

    setRegDisplayName(user.displayName?.slice(0, PORTAL_LIMITS.nameMax) || '');
    setProfileLoading(true);
    setPortalError(null);

    const profilePath = `parents/${user.uid}`;
    const profileRef = doc(db, 'parents', user.uid);

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setParentProfile(snapshot.data() as ParentProfile);
        } else {
          setParentProfile(null);
        }
        setProfileLoading(false);
      },
      (error) => {
        setProfileLoading(false);
        setPortalError('Unable to load your parent profile. Please check permissions or try again.');
        try {
          handleFirestoreError(error, OperationType.GET, profilePath);
        } catch {
          // Logged with full JSON context in handleFirestoreError
        }
      }
    );

    return () => unsubscribeProfile();
  }, [authReady, user]);

  // Default coordinators/tutors to Tutor Dashboard if they haven't registered as a parent yet
  useEffect(() => {
    if (!authReady || !user || roleLoading || profileLoading || hasAutoSelectedMode) {
      return;
    }
    if (hasTutorAccess && !parentProfile) {
      setPortalMode('tutor');
    } else if (hasTutorAccess && parentProfile) {
      setPortalMode('tutor');
    } else {
      setPortalMode('parent');
    }
    setHasAutoSelectedMode(true);
  }, [authReady, user, roleLoading, profileLoading, hasTutorAccess, parentProfile, hasAutoSelectedMode]);

  // Ensure existing registered parents also have a matching /students/{uid} roster doc
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified || !parentProfile) return;

    let cancelled = false;
    const studentRef = doc(db, 'students', user.uid);

    void getDoc(studentRef)
      .then((snap) => {
        if (cancelled || snap.exists()) return;
        return setDoc(studentRef, {
          studentId: user.uid,
          parentUid: user.uid,
          studentName: parentProfile.childName.slice(0, PORTAL_LIMITS.nameMax),
          studentClass: parentProfile.studentClass.slice(0, PORTAL_LIMITS.classMax),
          parentName: parentProfile.displayName.slice(0, PORTAL_LIMITS.nameMax),
          assignedTutor: parentProfile.assignedTutor.slice(0, PORTAL_LIMITS.nameMax),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      })
      .catch(() => {
        // Non-blocking backfill
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, user, parentProfile]);

  // Load Parent's Progress Reports and Session Logs
  useEffect(() => {
    if (!authReady || !user || !parentProfile) {
      setReports([]);
      setSessionLogs([]);
      return;
    }

    setReportsLoading(true);
    const reportsPath = `parents/${user.uid}/progressReports`;
    const reportsQuery = query(
      collection(db, 'parents', user.uid, 'progressReports'),
      where('parentUid', '==', user.uid)
    );

    const unsubscribeReports = onSnapshot(
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
        setPortalError('Unable to load progress reports right now.');
        try {
          handleFirestoreError(error, OperationType.LIST, reportsPath);
        } catch {
          // Logged with full JSON context in handleFirestoreError
        }
      }
    );

    setSessionLogsLoading(true);
    const logsPath = `parents/${user.uid}/sessionLogs`;
    const logsQuery = query(
      collection(db, 'parents', user.uid, 'sessionLogs'),
      where('parentUid', '==', user.uid)
    );

    const unsubscribeLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const loaded: SessionLog[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<SessionLog, 'id'>),
          }))
          .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
        setSessionLogs(loaded);
        setSessionLogsLoading(false);
      },
      (error) => {
        setSessionLogsLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, logsPath);
        } catch {
          // Logged with full JSON context in handleFirestoreError
        }
      }
    );

    return () => {
      unsubscribeReports();
      unsubscribeLogs();
    };
  }, [authReady, user, parentProfile]);

  const handleCompleteRegistration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setPortalError(null);

    const cleanName = regDisplayName.trim().slice(0, PORTAL_LIMITS.nameMax);
    const cleanChild = regChildName.trim().slice(0, PORTAL_LIMITS.nameMax);
    const cleanClass = regStudentClass.trim().slice(0, PORTAL_LIMITS.classMax);
    const cleanTutor = regTutor.trim().slice(0, PORTAL_LIMITS.nameMax);
    const cleanEmail = (user.email || '').trim().slice(0, PORTAL_LIMITS.emailMax);

    if (!cleanName || !cleanChild || !cleanEmail) {
      setPortalError('Please enter your full name and your child’s name to continue.');
      return;
    }

    if (!user.emailVerified) {
      setPortalError('Please use a verified email account to register in the Parent Portal.');
      return;
    }

    setRegistering(true);
    const profilePath = `parents/${user.uid}`;

    try {
      const batch = writeBatch(db);
      const profileRef = doc(db, 'parents', user.uid);
      const studentRef = doc(db, 'students', user.uid);

      batch.set(profileRef, {
        parentUid: user.uid,
        displayName: cleanName,
        email: cleanEmail,
        childName: cleanChild,
        studentClass: cleanClass,
        assignedTutor: cleanTutor,
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(studentRef, {
        studentId: user.uid,
        parentUid: user.uid,
        studentName: cleanChild,
        studentClass: cleanClass,
        parentName: cleanName,
        assignedTutor: cleanTutor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const starterReports = buildStarterReports(user.uid, cleanChild, cleanTutor);
      const docIds = ['report_maths_01', 'report_english_02', 'report_study_03'];

      starterReports.forEach((report, idx) => {
        const reportRef = doc(db, 'parents', user.uid, 'progressReports', docIds[idx]);
        batch.set(reportRef, {
          ...report,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      setPortalError('Could not complete portal registration. Please try again.');
      handleFirestoreError(error, OperationType.WRITE, profilePath);
    } finally {
      setRegistering(false);
    }
  };

  const handleAcknowledgeReport = async (report: ProgressReport) => {
    if (!user || report.status === 'Acknowledged') return;
    setPortalError(null);
    setAcknowledgingId(report.id);

    const reportPath = `parents/${user.uid}/progressReports/${report.id}`;
    const replyText = (replyDrafts[report.id] || '').trim().slice(0, PORTAL_LIMITS.parentReplyMax);

    try {
      const reportRef = doc(db, 'parents', user.uid, 'progressReports', report.id);
      await updateDoc(reportRef, {
        status: 'Acknowledged',
        parentReply: replyText || 'Reviewed and noted with thanks.',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setPortalError('Could not save your acknowledgement note. Please try again.');
      handleFirestoreError(error, OperationType.UPDATE, reportPath);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const distinctSubjects = ['All', ...Array.from(new Set(reports.map((r) => r.subject)))];
  const visibleReports =
    selectedSubject === 'All'
      ? reports
      : reports.filter((report) => report.subject === selectedSubject);

  const averageScore =
    reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.assessmentScore, 0) / reports.length)
      : 0;
  const acknowledgedCount = reports.filter((r) => r.status === 'Acknowledged').length;

  // 1. Auth Initializing State
  if (!authReady) {
    return (
      <div className="p-10 rounded-xl border border-slate-200 bg-white text-center space-y-2">
        <p className="font-display text-xl font-semibold text-[#0B1F3A]">
          Verifying Portal Session...
        </p>
        <p className="text-sm text-slate-500">Connecting securely to BrightPath Portal.</p>
      </div>
    );
  }

  // 2. Signed-Out State (Secure Firebase Auth Login)
  if (!user) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6A1B]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Secure Firebase Authentication</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
              Sign In to View Progress Reports &amp; Session Logs
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Registered BrightPath parents and authorized tutors sign in securely with Google. Parents review session logs and termly reports; authorized tutors update lesson logs and attach student progress reports.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-sm text-red-800"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{authError}</span>
              </div>
              <button
                type="button"
                onClick={clearAuthError}
                className="text-xs font-semibold underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={signingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 text-base font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
            >
              <span>{signingIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}</span>
              <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
            </button>

            <p className="text-xs text-slate-500 leading-relaxed">
              Only verified Google accounts are permitted. Family profiles and student records are strictly scoped to authorized accounts.
            </p>
          </div>
        </div>

        <aside className="lg:col-span-5 p-8 sm:p-10 rounded-xl bg-[#0B1F3A] text-white flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-wide text-[#D8B45A]">
              Inside BrightPath Portal
            </p>
            <h3 className="font-display text-2xl font-bold text-white">
              Transparent Tracking for Families &amp; Tutors
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D8B45A] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Subject-by-subject diagnostic and term quiz scores</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D8B45A] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Verified home visit session logs, topics &amp; homework</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D8B45A] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Dedicated Tutor Dashboard for authorized staff</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/15 space-y-2">
            <p className="text-xs text-slate-300">New to BrightPath Home Tutors?</p>
            <Link
              to="/contact#enquiry"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D8B45A] hover:text-white transition-colors"
            >
              <span>Book an initial home lesson</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    );
  }

  // 3. Loading Roles / Profile
  if (roleLoading || profileLoading) {
    return (
      <div className="p-10 rounded-xl border border-slate-200 bg-white text-center space-y-2">
        <p className="font-display text-xl font-semibold text-[#0B1F3A]">
          Loading Portal Workspace...
        </p>
        <p className="text-sm text-slate-500">Verifying family profile and tutor permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Role Switcher Bar (Visible to authorized Tutors & Coordinator) */}
      {hasTutorAccess && (
        <div className="p-4 sm:px-6 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#0B1F3A]">
            <GraduationCap className="w-5 h-5 text-[#8C6A1B] shrink-0" aria-hidden="true" />
            <span className="font-semibold">
              {isAdmin ? 'Coordinator & Tutor Access Enabled' : 'Verified Tutor Access Enabled'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Switch portal workspace"
              className="inline-flex items-center gap-1 p-1 bg-[#F8FAFC] border border-slate-200 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setPortalMode('tutor')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  portalMode === 'tutor'
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Tutor Dashboard
              </button>
              <button
                type="button"
                onClick={() => setPortalMode('parent')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  portalMode === 'parent'
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Parent View
              </button>
            </div>

            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* TUTOR DASHBOARD VIEW */}
      {hasTutorAccess && portalMode === 'tutor' ? (
        <TutorDashboard user={user} isAdmin={isAdmin} tutorAccount={tutorAccount} />
      ) : !parentProfile ? (
        /* FIRST-TIME PARENT REGISTRATION */
        <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-xl border border-slate-200 bg-white space-y-6">
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#8C6A1B]">
                Signed in as {user.email}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                Complete Parent Portal Setup
              </h2>
              <p className="text-sm text-slate-600">
                Confirm your child’s details to activate your private progress report and session log dashboard.
              </p>
            </div>

            {!hasTutorAccess && (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            )}
          </div>

          {portalError && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{portalError}</span>
            </div>
          )}

          <form onSubmit={handleCompleteRegistration} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="portal-parent-name" className="block text-sm font-semibold text-[#0B1F3A]">
                Parent / Guardian Full Name
              </label>
              <input
                id="portal-parent-name"
                type="text"
                required
                maxLength={PORTAL_LIMITS.nameMax}
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                placeholder="e.g. Mrs. Folake Adeyemi"
                className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="portal-child-name" className="block text-sm font-semibold text-[#0B1F3A]">
                Child’s Name
              </label>
              <input
                id="portal-child-name"
                type="text"
                required
                maxLength={PORTAL_LIMITS.nameMax}
                value={regChildName}
                onChange={(e) => setRegChildName(e.target.value)}
                placeholder="e.g. Tolu Adeyemi"
                className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="portal-student-class"
                  className="block text-sm font-semibold text-[#0B1F3A]"
                >
                  Student’s Class
                </label>
                <select
                  id="portal-student-class"
                  value={regStudentClass}
                  onChange={(e) => setRegStudentClass(e.target.value)}
                  className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                >
                  {siteConfig.contactPage.studentClassOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="portal-assigned-tutor"
                  className="block text-sm font-semibold text-[#0B1F3A]"
                >
                  Assigned Lead Tutor
                </label>
                <select
                  id="portal-assigned-tutor"
                  value={regTutor}
                  onChange={(e) => setRegTutor(e.target.value)}
                  className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                >
                  {siteConfig.about.tutors.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors"
            >
              <span>{registering ? 'Setting Up Portal...' : 'Activate Parent Portal'}</span>
              <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
            </button>
          </form>

          {!hasTutorAccess && (
            <p className="pt-4 border-t border-slate-200 text-xs text-slate-500">
              Are you a BrightPath Tutor? Share your Firebase UID{' '}
              <span className="font-mono text-[#0B1F3A] select-all">{user.uid}</span> with our coordinator to activate Tutor Dashboard access.
            </p>
          )}
        </div>
      ) : (
        /* AUTHENTICATED PARENT VIEW */
        <div className="space-y-8">
          {/* Family Summary Banner */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#0B1F3A] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#D8B45A]">
                <UserCheck className="w-4 h-4" aria-hidden="true" />
                <span>Registered Parent Account</span>
                <span aria-hidden="true">·</span>
                <span>{parentProfile.email}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {parentProfile.childName} — Progress &amp; Tutor Notes
              </h2>
              <p className="text-sm text-slate-300">
                Parent: {parentProfile.displayName}
                <span aria-hidden="true"> · </span>
                Class: {parentProfile.studentClass}
                <span aria-hidden="true"> · </span>
                Lead Tutor: {parentProfile.assignedTutor}
              </p>
            </div>

            {!hasTutorAccess && (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#132E53] border border-white/15 rounded-lg hover:bg-[#1D4173] transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
              >
                <LogOut className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Summary KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-xs font-medium text-slate-500">Published Reports</p>
              <p className="font-display text-3xl font-bold text-[#0B1F3A] tabular-nums">
                {reports.length}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-xs font-medium text-slate-500">Tutor Session Logs</p>
              <p className="font-display text-3xl font-bold text-[#0B1F3A] tabular-nums">
                {sessionLogs.length}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-xs font-medium text-slate-500">Average Assessment Score</p>
              <p className="font-display text-3xl font-bold text-[#0B1F3A] tabular-nums">
                {averageScore}%
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-xs font-medium text-slate-500">Reports Acknowledged</p>
              <p className="font-display text-3xl font-bold text-[#0B1F3A] tabular-nums">
                {acknowledgedCount} / {reports.length}
              </p>
            </div>
          </div>

          {portalError && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{portalError}</span>
            </div>
          )}

          {/* Parent View Tabs: Progress Reports vs Session Logs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Parent portal sections"
              className="inline-flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setParentSectionTab('reports')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  parentSectionTab === 'reports'
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                <span>Progress Reports</span>
              </button>
              <button
                type="button"
                onClick={() => setParentSectionTab('sessions')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  parentSectionTab === 'sessions'
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                <span>Tutor Session Logs</span>
              </button>
            </div>

            {parentSectionTab === 'reports' && reports.length > 0 && (
              <div
                role="group"
                aria-label="Filter progress reports by subject"
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg"
              >
                {distinctSubjects.map((subject) => {
                  const active = selectedSubject === subject;
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setSelectedSubject(subject)}
                      aria-pressed={active}
                      className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#0B1F3A] text-white'
                          : 'text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-50'
                      }`}
                    >
                      {subject === 'All' ? 'All Subjects' : subject}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {parentSectionTab === 'reports' ? (
            /* PROGRESS REPORTS LIST */
            reportsLoading ? (
              <div className="p-8 rounded-xl border border-slate-200 bg-white text-center text-sm text-slate-500">
                Loading progress reports...
              </div>
            ) : visibleReports.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-200 bg-white text-center space-y-2">
                <BookOpen className="w-6 h-6 text-[#8C6A1B] mx-auto" aria-hidden="true" />
                <p className="font-display text-lg font-semibold text-[#0B1F3A]">
                  No progress reports in this view yet
                </p>
                <p className="text-sm text-slate-600">
                  Your child’s tutor notes will appear here after each monthly assessment.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {visibleReports.map((report) => {
                  const isAcknowledged = report.status === 'Acknowledged';
                  return (
                    <article
                      key={report.id}
                      className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="text-[#8C6A1B] font-semibold">{report.term}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{report.reportDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>Tutor: {report.tutorName}</span>
                          </div>
                          <h3 className="font-display text-2xl font-bold text-[#0B1F3A]">
                            {report.subject}
                          </h3>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-slate-500">Assessment</p>
                            <p className="font-display text-2xl font-bold text-[#0B1F3A] tabular-nums">
                              {report.assessmentScore}%
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-slate-500">Status</p>
                            <p
                              className={`text-sm font-semibold inline-flex items-center gap-1.5 ${
                                isAcknowledged ? 'text-emerald-700' : 'text-[#8C6A1B]'
                              }`}
                            >
                              <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                              <span>{report.status}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 space-y-3">
                          <p className="text-xs font-semibold text-[#0B1F3A]">Tutor Notes</p>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                            {report.tutorNotes}
                          </p>
                          {(report.attachmentTitle || report.attachmentUrl) && (
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#8C6A1B]">
                              <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{report.attachmentTitle || 'Attached Progress Sheet'}</span>
                              {report.attachmentUrl && (
                                <a
                                  href={report.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold underline hover:text-[#0B1F3A]"
                                >
                                  <span>View Attachment</span>
                                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-5 p-4 sm:p-5 rounded-lg bg-[#FCF9F0] border border-[#C59B38]/30 space-y-2">
                          <p className="text-xs font-semibold text-[#8C6A1B]">
                            Next Learning Focus
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {report.nextFocus}
                          </p>
                        </div>
                      </div>

                      {/* Parent Acknowledgement Section */}
                      <div className="pt-5 border-t border-slate-200">
                        {isAcknowledged ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-emerald-800">
                              Parent Observation Saved
                            </p>
                            <p className="text-sm text-slate-600">
                              “{report.parentReply || 'Reviewed and noted with thanks.'}”
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                              type="text"
                              maxLength={PORTAL_LIMITS.parentReplyMax}
                              value={replyDrafts[report.id] || ''}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [report.id]: e.target.value,
                                }))
                              }
                              placeholder="Add an optional parent observation or question for the tutor..."
                              aria-label={`Parent note for ${report.subject} report`}
                              className="flex-1 h-11 px-4 text-sm text-slate-900 bg-[#F8FAFC] border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B1F3A]"
                            />
                            <button
                              type="button"
                              disabled={acknowledgingId === report.id}
                              onClick={() => void handleAcknowledgeReport(report)}
                              className="px-5 h-11 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                            >
                              {acknowledgingId === report.id ? 'Saving...' : 'Acknowledge Report'}
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          ) : /* TUTOR SESSION LOGS VIEW FOR PARENTS */
          sessionLogsLoading ? (
            <div className="p-8 rounded-xl border border-slate-200 bg-white text-center text-sm text-slate-500">
              Loading tutoring session logs...
            </div>
          ) : sessionLogs.length === 0 ? (
            <div className="p-8 rounded-xl border border-slate-200 bg-white text-center space-y-2">
              <CalendarCheck className="w-6 h-6 text-[#8C6A1B] mx-auto" aria-hidden="true" />
              <p className="font-display text-lg font-semibold text-[#0B1F3A]">
                No session logs recorded yet
              </p>
              <p className="text-sm text-slate-600">
                After each home visit, your assigned BrightPath tutor will record topics covered, duration, and homework here.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
              {sessionLogs.map((log) => (
                <article key={log.id} className="p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">
                        <span className="text-[#8C6A1B] font-semibold tabular-nums">
                          {log.sessionDate}
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span className="tabular-nums">{log.durationMinutes} minutes</span>
                        <span aria-hidden="true"> · </span>
                        <span>Tutor: {log.tutorName}</span>
                      </p>
                      <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                        {log.subject}
                      </h3>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        log.attendance === 'Completed'
                          ? 'text-emerald-700'
                          : log.attendance === 'Rescheduled'
                            ? 'text-[#8C6A1B]'
                            : 'text-red-700'
                      }`}
                    >
                      {log.attendance}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#0B1F3A]">Topics Covered</p>
                      <p className="text-slate-700 leading-relaxed">{log.topicsCovered}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#0B1F3A]">Homework Assigned</p>
                      <p className="text-slate-700 leading-relaxed">{log.homeworkAssigned}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 pt-3 border-t border-slate-100">
                    <span className="font-semibold text-[#0B1F3A]">Tutor Remarks: </span>
                    {log.sessionNotes}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
