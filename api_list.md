### Student API list

Base path: `/api/v1`. All routes need a login token, except the ones marked public.

### 1. Auth and account

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/login | Login with ID and password |
| POST | /auth/register | Register with email/phone & password after verified OTP |
| POST | /auth/otp/send, /auth/otp/verify | OTP login or reset |
| POST | /auth/token/refresh | Refresh JWT access token |
| POST | /auth/backup-code/verify | Login when phone is lost |
| POST | /auth/logout | Logout |
| POST | /auth/password/reset | Reset password |
| GET | /auth/devices | List logged in devices |
| DELETE | /auth/devices/{id} | Force logout a device |
| GET | /auth/login-alerts | Odd login history |

### 2. Profile and joining

| Method | Endpoint | Purpose |
|---|---|---|
| GET, PATCH | /me | View or update profile |
| POST | /me/name-correction | Request name fix |
| GET | /me/joining-checklist | Joining steps |
| GET | /admission/status | Admission tracker |
| POST | /admission/documents | Upload documents |
| GET | /roommates/suggestions | Roommate finder |
| GET | /me/id-card | Digital ID card with QR |

### 3. Academics

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /timetable | Live timetable |
| GET | /subjects, /subjects/{id}/syllabus | Subjects and syllabus |
| GET | /subjects/{id}/materials | Notes and slides |
| GET | /assignments | List assignments |
| POST | /assignments/{id}/submit | Submit work |
| GET | /results | Marks and results |
| POST | /results/{id}/recheck | Recheck request |
| GET | /results/{id}/recheck-status | Track recheck |

### 4. Attendance

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /attendance/summary | Percentage per subject |
| POST | /attendance/mark | Mark with class QR or code |
| POST | /attendance/disputes | Raise "I was present" |
| GET | /attendance/disputes/{id} | Dispute status |
| POST | /leaves | Apply medical or event leave |
| GET | /leaves | Leave list and status |

### 5. Hostel

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /hostel/room | My room and bed |
| POST | /hostel/room-change | Request room change |
| POST | /complaints | Raise complaint with photo |
| GET | /complaints, /complaints/{id} | List and track |
| POST | /complaints/{id}/reopen | Reopen if not fixed |
| POST | /outpasses | Apply outpass |
| GET | /outpasses | Status and history |
| POST | /outpasses/{id}/checkin | Mark return |
| GET | /mess/menu | Mess menu |
| POST | /mess/feedback | Food feedback |
| POST | /lost-found | Post lost or found item |
| GET | /lost-found | Search board |
| POST | /lost-found/{id}/claim | Claim item |

### 6. Campus services

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /library/books?search= | Search books |
| GET | /library/loans, /library/fines | My books and fines |
| POST | /library/books/{id}/reserve | Reserve a book |
| GET | /gym/slots | Free slots |
| POST | /gym/bookings | Book a slot |
| DELETE | /gym/bookings/{id} | Cancel |
| GET | /canteen/menu | Menu and prices |
| GET | /transport/routes | Bus routes and timing |
| GET | /transport/live/{busId} | Live bus location |
| GET | /map/places | Campus map data (offline cache) |

### 7. Notices and alerts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /notices | One feed |
| POST | /notices/{id}/read | Mark read |
| GET | /notifications | All alerts |
| PATCH | /notifications/settings | Alert preferences |
| POST | /devices/push-token | Register device for push |

### 8. Activities

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /events | Events and competitions |
| POST | /events/{id}/register | One tap register |
| GET | /me/certificates | Activity certificates |
| GET, POST | /teams | Find or create team |
| GET | /placements/drives | Company drives |
| POST | /placements/drives/{id}/apply | Apply |

### 9. Documents

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /documents/types | Bonafide, bort, transfer, etc. |
| POST | /documents/requests | Apply for a document |
| GET | /documents/requests/{id} | Track stage |
| GET | /documents/{id}/download | QR verified PDF |
| GET | /verify/{code} | Public: verify a certificate |

### 10. Payments

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /fees | Fee breakup and due dates |
| POST | /payments/initiate | Start payment (shows name check) |
| POST | /payments/webhook | Gateway callback (server only) |
| GET | /payments/history | Past payments |
| GET | /payments/{id}/receipt | Receipt PDF |
| POST | /payments/{id}/refund | Request refund |
| GET | /refunds/{id} | Refund tracker |

### 11. Support and safety

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /sos | Send SOS with location |
| POST | /sos/{id}/cancel | Cancel false alarm |
| GET | /sos/{id}/status | Who was alerted and reply |
| POST | /reports/anonymous | Anonymous ragging report |
| GET | /reports/anonymous/{token} | Check status with token |
| POST | /counselling/bookings | Book counsellor |
| POST | /feedback/faculty | Faculty feedback |
| GET | /emergency-contacts | Contacts list |
| POST | /parents/consent | Set what parents can see |

### 12. Alumni and exit

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /no-dues | No-dues checklist |
| POST | /no-dues/{dept}/request | Ask a department to clear |
| GET | /transcripts | Download transcripts |
| GET, POST | /alumni/network | Alumni directory and connect |

### 13. Offline sync

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /sync/push | Send offline actions |
| GET | /sync/pull?since= | Get latest changes |

### Rules for all APIs

- Every write is saved in an audit log.
- Rate limit and captcha on login, complaints and reports.
- Idempotency key on payments, SOS and bookings to stop double action.
- Same error format and a ticket or request ID in every response.

Next step: the database tables behind these APIs, or a downloadable file of this list?


### Warden API list

I picked Warden next because the student hostel APIs (outpass, complaints, SOS, room) need someone on the other side to act on them. Base path: `/api/v1/warden`. All routes need a warden token and the warden's hostel scope.

### 1. Outpass approvals

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /outpasses?status=pending | Approval inbox |
| GET | /outpasses/{id} | View request and student history |
| POST | /outpasses/{id}/approve | Approve |
| POST | /outpasses/{id}/reject | Reject with reason |
| POST | /outpasses/bulk-approve | Approve many (for example a holiday) |
| GET | /outpasses/overdue | Students not back on time |
| POST | /outpasses/{id}/notify-parent | Alert parent on late return |
| POST | /backup-approver | Set approver during leave |

### 2. Complaints and maintenance

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /complaints?status=&priority= | Complaint list |
| GET | /complaints/{id} | Details with photos |
| POST | /complaints/{id}/assign | Assign to staff or vendor |
| PATCH | /complaints/{id}/status | In progress, fixed, rejected |
| POST | /complaints/{id}/escalate | Send to admin |
| POST | /complaints/{id}/comments | Update the student |
| GET | /complaints/repeat-faults | Items failing again and again |

### 3. SOS and emergency

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /sos/active | Live SOS cases |
| POST | /sos/{id}/acknowledge | "I am on the way" |
| POST | /sos/{id}/escalate | Call next person or ambulance |
| POST | /sos/{id}/updates | Post status for parents |
| POST | /sos/{id}/close | Close with report |
| GET | /emergency-contacts | Nurse, security, ambulance, hospital |
| POST | /broadcast/emergency | Alert all hostel students |

### 4. Rooms and students

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /rooms, /rooms/{id} | Room and bed map |
| GET | /rooms/vacant | Empty beds |
| POST | /rooms/allocate | Allocate a bed |
| GET | /room-changes | Change requests |
| POST | /room-changes/{id}/decide | Approve or reject |
| GET | /students?search= | Find hostel student |
| GET | /students/{id}/profile | Contacts and guardian info |
| GET | /roll-call/today | Present, out, on leave |
| POST | /roll-call/mark | Night roll call (works offline) |

### 5. Mess, visitors and discipline

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /mess/feedback | Food complaints |
| POST | /mess/menu | Update menu |
| GET | /mess/headcount | Meal count |
| POST | /mess/hygiene-checks | Daily checklist |
| GET, POST | /visitors | Visitor log and pre-approval |
| POST | /warnings | Issue warning or fine |
| GET | /warnings?studentId= | Warning history |
| POST | /lost-found/{id}/verify-claim | Verify an item claim |
| POST | /notices | Post hostel notice (needs approval) |

### 6. Reports and sync

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /reports/daily | Outpass, complaints, roll call |
| GET | /reports/export?type= | Excel or PDF |
| POST | /sync/push | Send offline actions |
| GET | /sync/pull?since= | Get latest changes |

### Rules for all warden APIs

- Warden sees only their own hostel.
- Every approve, reject and warning is saved in an audit log.
- A pending outpass or complaint auto-escalates to the backup approver after a set time.
- SOS actions use idempotency keys to stop double actions.

Next set: Faculty, Parent or Admin? I suggest Faculty.



### Faculty API list

Base path: `/api/v1/faculty`. All routes need a faculty token. Faculty sees only their own classes and mentees.

### 1. Attendance

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /classes/{id}/attendance/session | Start session, get QR or short code |
| POST | /classes/{id}/attendance/session/refresh | New code every minute |
| POST | /classes/{id}/attendance/manual | Manual tick list |
| PATCH | /attendance/{id} | Correct one record (logged) |
| GET | /attendance/disputes | Student "I was present" requests |
| POST | /attendance/disputes/{id}/decide | Approve or reject |
| GET | /classes/{id}/attendance/summary | Class percentage |
| GET | /classes/{id}/attendance/shortage | Students below the limit |

### 2. Timetable and leave

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /timetable | My schedule |
| POST | /timetable/changes | Change room or time (clash check) |
| POST | /classes/{id}/cancel | Cancel class and alert students |
| POST | /leaves | Apply faculty leave |
| GET | /leaves | Leave status |
| POST | /leaves/{id}/substitute | Pick a substitute |
| GET | /substitutions | Classes I cover for others |

### 3. Course material

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /subjects/{id}/materials | Upload notes or slides |
| PUT | /materials/{id} | New version |
| DELETE | /materials/{id} | Remove (soft delete) |
| GET | /materials/{id}/versions | Version history |
| PATCH | /subjects/{id}/syllabus-progress | Mark topics done |

### 4. Assignments

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /assignments | Create with deadline and rubric |
| PATCH | /assignments/{id} | Edit or extend deadline |
| GET | /assignments/{id}/submissions | All submissions |
| GET | /submissions/{id}/similarity | Copy check report |
| POST | /submissions/{id}/grade | Rubric based marks and feedback |
| POST | /assignments/{id}/bulk-feedback | Same feedback to many |

### 5. Marks and results

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /marks/upload | Upload Excel file |
| POST | /marks/validate | Error check before saving |
| POST | /marks/submit | Submit and lock |
| POST | /marks/change-requests | Ask to edit after lock |
| GET | /marks/change-requests/{id} | Approval status |
| GET | /rechecks | Recheck requests for my papers |
| POST | /rechecks/{id}/result | Post recheck result |

### 6. Exams

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /exams/papers | Upload encrypted paper with time lock |
| GET | /exams/duties | My duty list |
| POST | /exams/duties/{id}/accept | Accept or request swap |
| POST | /exams/{id}/incidents | Report malpractice or issue |

### 7. Student support

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /students/at-risk | Early warning list |
| POST | /students/{id}/refer-counselling | Refer to counsellor |
| GET | /mentees | My mentees |
| POST | /mentees/{id}/notes | Private mentor note |
| POST | /mentees/{id}/meetings | Log a meeting |
| GET | /mentees/{id}/progress | Attendance, marks, activity |

### 8. Approvals and messages

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /approvals?status=pending | One approval inbox |
| POST | /approvals/{id}/approve | Approve |
| POST | /approvals/{id}/reject | Reject with reason |
| POST | /approvals/{id}/delegate | Send to backup faculty |
| POST | /messages | Message a class or student |
| PATCH | /messages/settings | Reply hours and mute |
| POST | /notices | Class notice |

### 9. Safety, complaints and profile

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /sos | Classroom emergency with room location |
| GET | /complaints/against-me | Notices of complaints |
| POST | /complaints/{id}/reply | Send my reply |
| GET, PATCH | /profile | Profile and documents |
| POST | /profile/records | Add paper, training or certificate |
| GET | /reports/audit?type= | NAAC style report |
| GET | /feedback/summary | Student feedback on me |

### 10. Offline sync

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /sync/push | Send offline attendance and marks |
| GET | /sync/pull?since= | Get latest changes |

### Rules for all faculty APIs

- Marks are locked after submit. Changes need approval and are logged with the old value.
- Same person cannot enter marks and approve them.
- Attendance codes expire in one minute and work once per student.
- Student data is limited to the faculty's own classes. Every view is logged.

Next set: Parent or Admin? I suggest Parent, then Admin.




### Parent API list

Base path: `/api/v1/parent`. All routes need a parent token. A parent is linked to one or more students. Data is limited by what the student allows.

### 1. Auth and link

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/login | Login with phone and OTP |
| POST | /auth/backup-code/verify | Login when phone is lost |
| POST | /auth/logout | Logout |
| POST | /link/request | Link to a student with ID and DOB |
| GET | /children | List linked students |
| GET | /children/{id}/consent | See what the student allows |
| GET, PATCH | /profile | Parent contact and language |
| PATCH | /notifications/settings | Push, SMS, call alerts |

### 2. Research and admission

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /public/colleges/{id}/fees | Verified fee breakup (public) |
| GET | /public/colleges/{id}/reviews | Reviews from verified users (public) |
| GET | /admission/checklist | Document list |
| POST | /admission/documents | Upload documents |
| GET | /admission/status | Application tracker |
| GET | /scholarships | Schemes with last dates |
| GET | /scholarships/{id}/checklist | Papers needed |

### 3. Fees and payments

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /children/{id}/fees | All costs and due dates |
| POST | /payments/initiate | Start payment (shows student name check) |
| GET | /payments/history | Past payments |
| GET | /payments/{id}/receipt | Receipt PDF |
| POST | /payments/{id}/refund | Request refund |
| GET | /refunds/{id} | Refund tracker |
| POST | /payments/report-issue | Report wrong or double payment |

### 4. Safety and hostel

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /children/{id}/outpasses | Outpass alerts and status |
| POST | /outpasses/{id}/approve | Approve if the rule needs parent consent |
| GET | /children/{id}/hostel | Room, warden contact |
| GET | /children/{id}/location | Only if the student agreed |
| GET | /sos/{id} | Live emergency updates |
| POST | /sos/{id}/respond | Confirm "I am on the way" |
| GET | /children/{id}/health-alerts | Medical room or hospital leave (no details) |
| GET | /transport/routes | Bus route and timing |
| GET | /transport/live/{busId} | Bus delay and location |

### 5. Academics and discipline

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /children/{id}/attendance | Weekly summary |
| GET | /children/{id}/results | Marks and PDF |
| GET | /children/{id}/recheck-status | Recheck tracker |
| GET | /children/{id}/warnings | Warnings and fines |
| POST | /warnings/{id}/reply | Reply to a warning |
| POST | /meetings | Ask mentor or warden for a meeting |
| GET | /meetings | Meeting status |
| GET | /children/{id}/placements | Placement updates |

### 6. Complaints and communication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /complaints | Raise a ticket |
| GET | /complaints, /complaints/{id} | Track with ticket number |
| POST | /reports/anonymous | Anonymous report |
| POST | /messages | Message mentor or warden |
| GET | /messages | Message history |
| GET | /contacts | Help desk and named contacts |
| GET | /notices | Parent notices |

### 7. Documents and fraud

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /documents/requests | Fee certificate or bonafide |
| GET | /documents/requests/{id} | Track stage |
| GET | /documents/{id}/download | QR verified PDF |
| GET | /verify/{code} | Public: verify a certificate |
| POST | /fraud/report | Report fake agent or link |

### 8. Final year

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /children/{id}/no-dues | Clearance status |
| GET | /children/{id}/documents-ready | Final documents alert |

### 9. SMS and call fallback

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /sms/inbound | Server only: handles SMS keywords like FEES or STATUS |
| POST | /ivr/missed-call | Server only: status by missed call |

### Rules for all parent APIs

- Parent sees only linked students and only what the student has allowed.
- Health details and student private notes are never shown.
- Every view of student data is saved in an access log.
- Payments use idempotency keys and a name check to stop wrong or double payment.

Next set: Admin. Shall I list it?



### Admin API list

Base path: `/api/v1/admin`. All routes need an admin token with two step login. Each route also checks a permission like `users.write`. Super admin can do everything. Other admins get only the modules they own.

### 1. Roles and permissions (RBAC)

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /roles | List or create role |
| GET, PATCH, DELETE | /roles/{id} | View, edit, disable role |
| GET | /permissions | All permission keys |
| PUT | /roles/{id}/permissions | Set permissions for a role |
| POST | /users/{id}/roles | Assign role to user |
| DELETE | /users/{id}/roles/{roleId} | Remove role |
| GET | /users/{id}/effective-permissions | What this user can really do |
| POST | /roles/conflict-check | Check clashes (enter marks and approve marks) |
| POST | /scopes | Limit a role to a hostel, department or batch |
| POST | /temporary-access | Time limited access with expiry |
| POST | /approvers/backup | Set backup approver for a role |

### 2. Users and accounts

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /users | List, search or create user |
| GET, PATCH | /users/{id} | View or edit |
| POST | /users/bulk-import | Import from Excel |
| POST | /users/{id}/freeze | Freeze account (never delete) |
| POST | /users/{id}/unfreeze | Restore access |
| POST | /users/{id}/reset-password | Reset with ID proof check |
| POST | /users/{id}/force-logout | Kill all sessions |
| GET | /users/{id}/login-history | Devices and locations |
| GET | /users/duplicates | Duplicate record finder |
| POST | /users/merge | Merge duplicates (needs approval) |
| POST | /staff/onboarding | Join checklist, access on day one |
| POST | /staff/{id}/offboarding | Exit checklist, move data to new owner |

### 3. Students and academic structure

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /students | List or admit student |
| PATCH | /students/{id} | Edit record |
| POST | /students/{id}/assign-batch | Assign course, branch, section, batch |
| POST | /students/{id}/branch-change | Move to new branch, link old data |
| POST | /students/{id}/assign-mentor | Assign mentor |
| POST | /students/{id}/assign-hostel | Assign hostel and room |
| POST | /students/{id}/status | Active, suspended, dropped, transferred, alumni |
| POST | /students/{id}/link-parent | Link parent or guardian |
| POST | /students/bulk-assign | Bulk assign by Excel |
| GET, POST | /courses | Courses |
| GET, POST | /departments | Departments |
| GET, POST | /batches | Batches and sections |
| GET, POST | /subjects | Subjects |
| POST | /subjects/{id}/assign-faculty | Faculty to subject and batch |
| GET, POST | /academic-years | Years and semesters |
| POST | /promotions/run | Promote batch to next semester |
| GET | /name-corrections | Pending name fix requests |
| POST | /name-corrections/{id}/decide | Approve or reject |

### 4. Admission

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /applications | All applications |
| POST | /applications/{id}/verify-documents | Verify documents |
| POST | /applications/{id}/decide | Accept, reject, waitlist |
| POST | /applications/{id}/offer | Send offer and welcome email |
| GET | /seats | Seat count per course |
| POST | /admission/dates | Set dates and deadlines |
| GET | /admission/reports | Funnel report |

### 5. Timetable and academics

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /timetable | View or create timetable |
| POST | /timetable/generate | Auto build with clash check |
| PATCH | /timetable/{id} | Change slot, alerts students |
| POST | /timetable/check-clash | Room, faculty, batch clash |
| GET, POST | /rooms | Classrooms and labs |
| POST | /holidays | Add holiday or event day |
| POST | /classes/{id}/substitute | Assign substitute |
| GET, POST | /syllabus | Syllabus per subject and version |
| GET | /attendance/reports | Attendance by batch or subject |
| POST | /attendance/rules | Minimum percentage and leave rules |
| GET | /attendance/disputes | Escalated disputes |

### 6. Exams and results

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /exams | Exam schedule |
| POST | /exams/{id}/seating | Seat plan |
| POST | /exams/{id}/duties | Assign invigilators |
| POST | /exams/{id}/papers/unlock | Time lock release |
| GET | /marks/pending | Faculty who have not submitted |
| POST | /marks/change-requests/{id}/decide | Approve mark change |
| POST | /results/publish | Publish with cache and PDF mail |
| POST | /results/withdraw | Pull back wrong result |
| GET | /rechecks | All recheck requests |

### 7. Hostel and assets

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /hostels | Hostels and blocks |
| GET, POST | /hostels/{id}/rooms | Rooms and beds |
| POST | /hostels/allocate | Auto allocation |
| GET | /hostels/occupancy | Live bed map |
| POST | /hostels/{id}/assign-warden | Assign warden |
| GET, POST | /assets | Asset register |
| GET | /assets/{id} | Location, owner, condition, history |
| POST | /assets/{id}/qr | Generate QR tag |
| POST | /assets/{id}/issue | Issue to user |
| POST | /assets/{id}/return | Return item |
| POST | /assets/{id}/damage | Damage report with photo and fine |
| POST | /assets/{id}/dispose | Write off |
| GET | /assets/reports | Count, value, condition |
| GET, POST | /maintenance/tickets | All tickets and priority rules |
| GET | /maintenance/repeat-faults | Repeat issues per item |

### 8. Fees and payments

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /fee-structures | Fee heads per course and year |
| POST | /fees/assign | Assign fees to a batch |
| POST | /fines/rules | Late fine rules |
| POST | /fines/pause | Pause fines when gateway is down |
| GET | /payments | All payments |
| POST | /payments/offline | Enter office payment |
| POST | /payments/{id}/move | Move payment to correct student |
| GET | /payments/reconcile | Match with bank file |
| POST | /payments/reconcile/upload | Upload bank statement |
| GET | /refunds | Refund queue |
| POST | /refunds/{id}/decide | Approve or reject |
| POST | /waivers/{id}/decide | Approve fee waiver |
| GET, POST | /scholarships | Create and assign scholarships |
| GET | /fees/defaulters | Due list |

### 9. Notices, alerts and emergency

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /notices/pending | Notices waiting approval |
| POST | /notices/{id}/approve | Approve |
| POST | /notices/{id}/recall | Recall and resend |
| POST | /broadcast | Send by role, batch, hostel |
| POST | /broadcast/emergency | One tap push, SMS, email to all |
| POST | /mode/online-classes | Switch to online mode |
| POST | /mode/lockdown | Lockdown mode |
| GET, PUT | /emergency-contacts | Contact list |
| GET | /sos | All SOS cases |
| POST | /sos/{id}/override | Take over a case |
| GET, PUT | /templates | Message templates in 3 languages |

### 10. Complaints and safety cases

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /tickets | All tickets, filter by status and age |
| POST | /tickets/{id}/reassign | Reassign owner |
| GET | /tickets/sla | Late tickets |
| POST | /escalation/rules | Timers and steps |
| GET | /cases | Ragging and harassment (committee only) |
| GET | /cases/{id}/access-log | Who opened the case |
| POST | /cases/{id}/assign | Assign to committee member |
| GET | /warnings | All warnings and fines |
| POST | /students/{id}/suspend | Suspend with limited access |
| POST | /students/{id}/restore | Restore |

### 11. Documents and certificates

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /document-types | Bonafide, bort, transfer, etc. |
| GET | /document-requests | Queue with stage |
| POST | /document-requests/{id}/decide | Approve, reject, ask more info |
| POST | /document-requests/{id}/issue | Generate QR verified PDF |
| POST | /documents/{id}/revoke | Cancel a certificate |
| GET | /verify/logs | Who verified which certificate |
| POST | /templates/documents | Certificate templates |

### 12. Campus services and vendors

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /library/books | Book catalog |
| GET | /library/fines | Fine report |
| GET, POST | /gym/slots | Slots and capacity |
| GET, POST | /canteen/menu | Menu and prices |
| GET, POST | /transport/routes | Routes and buses |
| GET, POST | /vendors | Mess, bus, canteen, repair |
| GET | /vendors/{id}/performance | Ratings and complaints |
| POST | /vendors/{id}/contracts | Contract and payment dates |
| GET, POST | /events | Events and club approval |
| GET, POST | /placements/drives | Company drives |
| GET, POST | /map/places | Campus map data |

### 13. System, security and backup

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /audit-logs | Search by user, action, date |
| GET | /audit-logs/{id} | Who, when, old and new value |
| GET, PATCH | /rules | Rule settings with version history |
| POST | /rules/{id}/schedule | Apply from a set date |
| GET | /system/health | Servers, queue, errors |
| GET | /system/alerts | Tech team alerts |
| POST | /backups/run | Manual backup |
| GET | /backups | Backup list |
| POST | /backups/{id}/restore | Restore (needs second approval) |
| POST | /trash/{id}/restore | Restore soft deleted item |
| POST | /mode/read-only | Read only mode on crash |
| GET, PATCH | /feature-flags | Release to small groups, rollback |
| GET | /security/alerts | Odd logins, bot spam |
| POST | /security/ip-block | Block IP or device |
| POST | /breach/notify | Send breach alert to users |
| GET, PATCH | /retention | Archive and delete rules |
| GET, PATCH | /settings | College name, logo, languages |

### 14. Reports

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /dashboard | One view for principal and admin |
| GET | /reports/{type} | Attendance, results, fees, assets, events |
| POST | /reports/naac | Auto audit report |
| POST | /reports/export | Excel or PDF export |
| POST | /reports/schedule | Send report by email weekly |

### Rules for all admin APIs

- Every write is saved in the audit log with old and new value.
- Delete is always soft delete. Restore needs a second approval.
- Risky actions (refund, waiver, mark change, restore, role change) need two people.
- No admin can edit their own permissions or approve their own request.

This is about 220 endpoints. Next step: I can pick the first 30 for the MVP, or move to the database tables for all 5 roles. Which one?



### Shared system API list

These are used by all 5 roles. Base path: `/api/v1`. Most are internal, so some are called by the server and not by a user.

### 1. File upload and storage

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /files/upload-url | Get a signed upload link (direct to storage) |
| POST | /files/{id}/complete | Confirm upload finished |
| GET | /files/{id} | Download with a short lived signed link |
| DELETE | /files/{id} | Soft delete |
| POST | /files/{id}/scan | Virus and file type check (server only) |
| POST | /files/{id}/thumbnail | Make preview or compress image |
| GET | /files/{id}/versions | Version history |
| POST | /files/{id}/share | Time limited share link |
| GET | /files/quota | Storage used |

### 2. Notifications (push, SMS, email, call)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /notify/send | Send one alert (server only) |
| POST | /notify/bulk | Send to a role, batch or hostel |
| GET | /notifications | In app inbox |
| POST | /notifications/{id}/read | Mark read |
| PATCH | /notifications/preferences | Channel and quiet hours |
| POST | /devices/push-token | Register device |
| DELETE | /devices/push-token | Remove device |
| POST | /notify/fallback | If push fails, try SMS, then call |
| GET | /notify/{id}/delivery | Sent, delivered, read status |
| POST | /notify/{id}/recall | Recall a sent alert |
| POST | /webhooks/sms-status | Provider callback |
| POST | /webhooks/email-status | Bounce and delivery callback |

### 3. Email and templates

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /email/send | Send email (server only) |
| GET, POST | /templates | Email, SMS and push templates |
| PUT | /templates/{id} | Edit with version and language |
| POST | /templates/{id}/preview | Test render |
| GET | /email/suppression | Bounced or blocked addresses |
| POST | /email/verify | Verify email with a link |

### 4. OTP, tokens and security

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /otp/generate | Create OTP (limited tries) |
| POST | /otp/verify | Check OTP |
| POST | /token/refresh | New access token |
| POST | /token/revoke | Cancel a token |
| POST | /captcha/verify | Bot check |
| POST | /mfa/enroll | Set up two step login |
| POST | /backup-codes/generate | Make backup codes |
| POST | /device/trust | Trust a new device after approval |
| GET | /security/rate-limit-status | Current limits |

### 5. Documents, PDF and QR

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /pdf/generate | Make PDF from a template |
| POST | /qr/generate | QR for ID, asset, gate pass, certificate |
| POST | /qr/scan | Read a QR and return details |
| POST | /signature/apply | Digital signature on a PDF |
| GET | /verify/{code} | Public certificate check |
| POST | /bulk-pdf/zip | Many PDFs as one zip |

### 6. Payments (gateway)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /gateway/order | Create order |
| POST | /webhooks/payment | Gateway callback (checks signature) |
| POST | /gateway/status-check | Re-check pending payments |
| POST | /gateway/refund | Refund through gateway |
| GET | /gateway/health | Is the gateway up |
| POST | /gateway/switch | Move to a backup gateway |

### 7. Search and lookup

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /search?q= | Global search by role access |
| GET | /lookup/{type} | Dropdown data (courses, hostels, departments) |
| GET | /autocomplete | Student ID, book or room suggestions |

### 8. Real time and location

| Method | Endpoint | Purpose |
|---|---|---|
| WS | /realtime | Live alerts, SOS, bus location |
| POST | /location/update | Send location (SOS or bus only) |
| GET | /geo/campus-map | Map tiles and places for offline use |
| POST | /geo/geofence/check | Inside campus or not (for outpass check-in) |
| GET | /geo/route | Route to a place |

### 9. Background jobs and scheduler

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /jobs | Add a job (reports, bulk mail) |
| GET | /jobs/{id} | Status |
| POST | /jobs/{id}/retry | Retry a failed job |
| GET | /jobs/dead-letter | Jobs that kept failing |
| POST | /scheduler/rules | Daily or weekly jobs (fee reminders, escalation, backup) |
| POST | /escalation/run | Check stuck tickets (server only) |

### 10. Language, accessibility and settings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /i18n/{lang} | Text for English, Hindi, Odia |
| PATCH | /me/preferences | Language, large text, theme |
| GET | /config/public | App version, feature flags, maintenance notice |
| GET | /config/min-version | Force update if the app is too old |

### 11. Comments, tickets and workflow (shared)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /comments | Add a comment on any item |
| GET | /timeline/{type}/{id} | Full history of a request |
| POST | /workflow/{type}/{id}/advance | Move to next approval step |
| POST | /workflow/{type}/{id}/escalate | Escalate after timer |
| GET | /workflow/definitions | Steps for each request type |

### 12. Privacy and data rights

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | /consents | Store and change consent |
| POST | /me/data-export | Download my data |
| POST | /me/data-delete-request | Request deletion (as per retention rule) |
| GET | /me/access-log | Who viewed my data |
| POST | /breach/report | Report a suspected leak |

### 13. Integrations

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /integrations/university/sync | Exam and result data with the university |
| POST | /integrations/digilocker/pull | Fetch marksheets and ID |
| POST | /integrations/bank/import | Bank statement for matching |
| POST | /integrations/biometric/sync | Gate or attendance devices |
| POST | /integrations/calendar/ics | Calendar feed for timetable |
| POST | /integrations/sms-gateway/send | SMS provider |
| POST | /integrations/ivr/inbound | Missed call and IVR |
| GET, POST | /integrations/webhooks | Manage outgoing webhooks |

### 14. Monitoring and platform

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /health | Server up check (public) |
| GET | /health/dependencies | DB, queue, storage, gateway status |
| GET | /metrics | Traffic and error numbers |
| POST | /errors/report | App crash report |
| GET | /status | Public status page |
| POST | /feedback/app | App feedback and bug report |
| POST | /sync/push, GET /sync/pull | Offline sync (used by all apps) |

### Rules for all system APIs

- Files go straight to storage by signed link, and are scanned before anyone can open them.
- Every notification has a fallback chain: push, then SMS, then call.
- Gateway and SMS webhooks check a signature and use idempotency keys.
- Jobs retry with a limit, and failed ones go to a dead-letter list.
- All system actions are saved in the audit log.

Next step: the database tables for all 5 roles plus these system parts, or the MVP list of the first 30 endpoints?


