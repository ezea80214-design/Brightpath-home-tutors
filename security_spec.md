# BrightPath Parent & Tutor Portal Security Specification

## 1. Data Invariants
1. A `ParentProfile` document at `/parents/{parentId}` contains parent PII (`email`) and is strictly readable only by the verified owner (`request.auth.uid == parentId`) or coordinator (`isAdmin()`). Assigned tutors never read `/parents/{parentId}`.
2. Non-PII student details live in `/students/{studentId}` (`studentId == parentUid`), readable by the owning parent, coordinator (`isAdmin()`), or an active approved tutor whose UID matches `assignedTutorUid`. Parents cannot set or change `assignedTutorUid`.
3. Tutor privilege (`isTutor()`) is strictly verified against `/tutors/{request.auth.uid}` (`active == true`). Only `isAdmin()` can create, update, or delete `/tutors/{tutorId}` documents, preventing self-assigned tutor role escalation.
4. A `ProgressReport` at `/parents/{parentId}/progressReports/{reportId}` cannot exist without a valid parent document at `/parents/{parentId}` (`existsAfter`), must validate score (`0..100`), bounded strings, `https://` attachment URL if present, and `request.time` timestamps.
5. A `SessionLog` at `/parents/{parentId}/sessionLogs/{logId}` can only be created or updated by `isAdmin()` or an active `isTutor()` assigned to that student (`students/{parentId}.assignedTutorUid == request.auth.uid`), with `durationMinutes` (`15..240`), bounded strings, and immutable `parentUid`, `tutorUid`, and `createdAt`.
6. Parents can read their child's `sessionLogs` and `progressReports`, and may acknowledge a `Published` report once (`['parentReply', 'status', 'updatedAt']`), but can never create, edit, or delete session logs or alter tutor assessment scores.

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Profile Read**: Anonymous client attempts `get /parents/uid_123` or `get /students/uid_123`.
2. **Self-Assigned Tutor Escalation**: Parent A (`uid_A`) attempts `create /tutors/uid_A` with `{ tutorUid: "uid_A", active: true }`.
3. **Cross-Student PII Leak by Tutor**: Approved Tutor T attempts `get /parents/uid_B` to scrape Parent B's email address.
4. **Unassigned Tutor Roster Scrape**: Approved Tutor T1 attempts `list /students` without filtering to `assignedTutorUid == uid_T1` (or reads Tutor T2's student).
5. **Parent Forging Session Log**: Parent A (`uid_A`) attempts `create /parents/uid_A/sessionLogs/log1`.
6. **Unassigned Tutor Writing Session Log**: Approved Tutor T1 attempts `create /parents/uid_B/sessionLogs/log1` for a student assigned to Tutor T2.
7. **Shadow / Ghost Field Injection**: Tutor T1 attempts `create /parents/uid_B/sessionLogs/log1` with extra field `adminOverride: true`.
8. **Score or Duration Poisoning**: Tutor T1 attempts `create /parents/uid_B/sessionLogs/log1` with `durationMinutes: 9999` or `ProgressReport` with `assessmentScore: 150`.
9. **XSS Attachment URL Injection**: Tutor T1 attempts `create /parents/uid_B/progressReports/r2` with `attachmentUrl: "javascript:alert(1)"`.
10. **Email Spoofing Admin Bypass**: Authenticated user with `email: "eobiagelianthonia@gmail.com"` and `email_verified: false` attempts `list /parents`.
11. **Terminal State Report Overwrite**: Tutor T1 attempts `update /parents/uid_B/progressReports/r1` after Parent B already acknowledged it (`existing().status == 'Acknowledged'`).
12. **Immortal Field & Timestamp Tampering**: Tutor T1 attempts `update /parents/uid_B/sessionLogs/log1` changing `tutorUid`, `createdAt`, or sending a backdated `updatedAt`.
