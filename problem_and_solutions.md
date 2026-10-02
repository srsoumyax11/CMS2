### 1. Research phase
- Fees are hidden: only tuition is shown, not hostel, exam, lab or transport fees.
- Reviews are fake or old. No way to know which are from real students.
- Hard to compare colleges, courses, faculty and placements in one place.
- Cannot see real hostel rooms, mess food or campus photos.
- No way to ask a current student a question.
- Scholarship, eligibility and last date info is scattered.

### 2. Admission and joining
- Confusing forms, document upload errors, no status tracker.
- Payment fails but money is cut, with no receipt.
- No welcome email or message after registration. (Good UX: a 🎉 email with next steps.)
- No joining checklist (documents, fees, hostel, ID card).
- No campus map or help desk on day one, so you feel lost.
- No way to find roommates or batchmates.

### 3. Academics
- Syllabus is a PDF buried on a website.
- Timetable changes are not announced, so you miss a class.
- Class notes are on random WhatsApp groups.
- Marks and results are delayed or wrong, with no easy recheck request.
- Backlog and revaluation process is unclear.
- Assignment deadlines are missed with no reminder.

### 4. Attendance
- Attendance is wrong and there is no way to raise it.
- You only learn you are short when it is too late.
- Medical or event leave is not linked to attendance.

### 5. Hostel
- Room fan, light or Wi-Fi breaks and complaints go nowhere. (Good UX: complaint goes to the right person, gets approved, and you see "Fixed".)
- Outpass needs paper, signatures and waiting.
- Parents get no alert when you leave or return.
- Mess menu is unknown and food complaints are ignored.
- Laundry, water and cleaning have no tracking.
- Lost items: you search everywhere. (Good UX: a lost and found board where you find it.)

### 6. Campus services
- Library: cannot check if a book is available, and fines are a surprise.
- Gym and sports: no slot booking or timings.
- Canteen: no menu, price or rush time info.
- Transport: no bus route, live location or timing.
- Medical room and emergency contacts are hard to find.

### 7. Communication
- Notices are missed because they are on a notice board or in 5 different groups.
- Too many emails, and important ones get buried.
- OTP does not arrive or expires.
- Forgot password means visiting the office.
- Different login for each portal.
- Warnings or fine alerts arrive too late.

### 8. Activities
- Competitions, hackathons and clubs are not shared widely.
- Registration is by Google Form with no confirmation.
- No record of participation, so certificates are lost.
- No way to find teammates.
- Placement and internship updates are shared late.

### 9. Documents and certificates
- Bonafide, bort/border certificate, character and transfer certificates need paper letters and many visits.
- No tracking: "Where is my application?"
- No digital copy with a verification QR.
- Marksheet correction takes weeks.
- Original documents get lost.

### 10. Payments
- No single fee page with due dates.
- Receipts are not saved, and old payment history is hard to find.
- Late fine is added without a warning.
- Refund (hostel, caution money) takes a very long time.

### 11. Support and safety
- Complaints about ragging, harassment or faculty have no safe, anonymous route.
- No ticket number or reply time for any complaint.
- No mental health or counselling support.
- No feedback on faculty that is actually read.

### 12. Final year and alumni
- No-dues clearance means running to 8 departments.
- Placement documents and final certificates are delayed.
- Account and email are closed on the last day.
- No alumni network, mentoring or job sharing.
- Cannot get old transcripts later.

### The big unseen problem
Every system is separate: a different app, login and office for each task. A student needs one place with one login, clear status for every request, and alerts that arrive on time.

### 1. Health and emergency
- A student is injured in the hostel at 2 AM. Who gets alerted first, and how fast?
- Can the app call an ambulance and share the location automatically?
- Who marks attendance for a student in hospital?
- What if the student cannot use the phone?

### 2. Identity and access
- A student loses their phone. How do they log in with OTP?
- Two students share one phone number or email. What happens?
- Someone logs in using another student's account. How do you detect it?
- A name is spelled wrong in the records. Which certificates break?

### 3. Money
- Money is cut twice. How does the refund work?
- The payment gateway is down on the last fee date. Is there a late fine?
- A parent pays for the wrong student ID.
- A scholarship is approved after the fee is paid.

### 4. Timing and load
- 5,000 students open the result page at the same minute. Does it crash?
- The internet is down on campus. Does the app work offline?
- Admin changes the timetable while a student is booking a slot.
- Two students book the last gym slot at the same second.

### 5. Staff and approvals
- The warden is on leave. Who approves the outpass?
- A complaint is stuck with one person for 10 days. Does it escalate?
- A teacher leaves the college. Where does their data go?
- An admin deletes data by mistake. Can you restore it?

### 6. Safety and privacy
- A student reports ragging anonymously. Can the admin still find who it was?
- Parents want to see location, but the student is an adult. Who decides?
- A data leak shows marks and phone numbers. What is the plan?
- A fake student posts a fake notice. Who verifies it?

### 7. Wrong or missing data
- A student transfers to another college or drops out. What happens to their account?
- A student changes branch in year 2. Does old data move over?
- A notice is sent to the wrong batch. Can you recall it?
- A lost item is claimed by the wrong person.

### 8. Special cases
- A student with a disability cannot use the map or forms. Is the app accessible?
- A student speaks only Odia or Hindi. Is the app available in their language?
- A student is suspended. What access do they keep?
- A student dies or is missing. Who handles the account and alerts?

### 9. Disasters
- Fire, flood or cyclone: can the app send an alert to everyone at once?
- A campus lockdown or strike: how do classes and exams move online?
- Server crash on result day: is there a backup?

### 10. Abuse and fraud
- A student uploads a fake bonafide or marksheet.
- Spam notifications from a club.
- A bot floods the complaint form.
- A teacher edits marks without a trace. Is there an audit log?

### The key question
If everything fails, what is the **manual backup** so no student is left stuck?

### 1. Core modules

| Module | Key features |
|---|---|
| One Login | Single login, OTP plus backup codes, login alerts, new device approval |
| Admission | Status tracker, document checker, welcome email, joining checklist, roommate finder |
| Academics | Live timetable with change alerts, syllabus, notes, results, recheck request, deadline reminders |
| Attendance | Live percentage, short attendance alert, medical and event leave linked |
| Hostel | Complaint ticket with auto routing and timer, digital outpass, parent alert, mess menu and feedback, lost and found board |
| Campus | Library search and fines, gym slot booking, canteen menu, bus live location, offline campus map |
| Notices | One feed, sent by batch, recall option, verified badge |
| Activities | Events, one tap registration, auto certificate in profile, team finder |
| Documents | Apply, track, QR verified PDF (bonafide, bort, transfer) |
| Payments | Fee page, receipts, refund tracker, late fine warning |
| Support | SOS button, anonymous report, counselling booking, faculty feedback |
| Alumni | No-dues checklist, transcript download, alumni network |

### 2. Solutions to the tough questions

| Problem | Solution |
|---|---|
| Injury at 2 AM | SOS button sends location to warden, security, nurse and ambulance in order. If no reply in 2 minutes, it calls the next person. Roommates and friends can also trigger it. |
| Student cannot use phone | Shake or power button x5 triggers SOS. Hostel help desk has a hotline. |
| Attendance in hospital | Doctor slip upload, then auto leave approval. |
| Lost phone | Login with backup codes, ID card QR at help desk, or email OTP. |
| Shared phone or email | Block it. One unique ID per student. |
| Account misuse | Device check, odd login alert, force logout. |
| Wrong name spelling | Name correction request before any certificate is made. |
| Double payment | Auto match by transaction ID, refund ticket with date. |
| Gateway down | Fine paused automatically. Offline payment at office is then entered in the app. |
| Wrong student ID paid | Name check shown before paying. Admin can move the payment. |
| Result day load | Cache pages, queue, and a PDF copy on email. |
| Internet down | Offline mode for timetable, map and ID card. Sync later. |
| Last gym slot | Slot lock, first request wins. |
| Warden on leave | Backup approver set in advance. |
| Stuck complaint | Auto escalate after 48 hours. |
| Staff leaves | Data transfers to a new owner. Account is frozen, not deleted. |
| Admin deletes by mistake | Soft delete, daily backup, restore button. |
| Anonymous ragging report | Hidden ID. Only the anti-ragging head can see it, with a log of who opened it. |
| Parent tracking an adult | Student gives consent. Parents get only outpass alerts by default. |
| Data leak | Encryption, role based access, breach plan with alerts to users. |
| Fake notice | Only verified staff can post. Others need approval. |
| Transfer or dropout | Account is archived. Certificates stay downloadable. |
| Branch change | Old records link to the new branch. |
| Wrong batch notice | Recall and resend. |
| Wrong lost item claim | Claimer must describe the item. Staff verify before handover. |
| Disability | Screen reader support, large text, voice help. |
| Language | English, Hindi and Odia. |
| Suspended student | Only fee, documents and appeal access. |
| Death or missing student | Admin locks the account. Only the college and family contact are alerted. |
| Disaster | One tap alert by push, SMS and email to all. |
| Strike or lockdown | Switch to online classes and exams. |
| Server crash | Backup server and read only mode. |
| Fake documents | QR verification on every certificate. |
| Spam and bots | Rate limit, captcha, club post limits. |
| Marks edited without trace | Audit log with who, when and old value. |

### 3. Manual backup

- Help desk in every hostel and department with a printed paper form for each request.
- Staff enter the paper form into the app later, so the ticket number still exists.
- Daily printed lists: attendance, outpass, and emergency contacts.
- SMS and phone call fallback when the app is down.
- A named person for each service, shown on a printed board.

### 4. Build order

1. One Login, notices, SOS, payments
2. Hostel, attendance, documents
3. Academics, campus services
4. Activities, alumni, offline mode

### 1. Faculty problems and solutions

| Area | Problem | Solution |
|---|---|---|
| Attendance | Taking roll call wastes 10 minutes. Proxy attendance happens. | Class QR or short code that changes every minute, plus a manual tick option. Works offline and syncs later. |
| Attendance | Student says "I was present" after it is marked absent. | Student raises a request in the app. Faculty approves or rejects with one tap. Every change is logged. |
| Timetable | Class room or time changes, and students do not know. | Faculty edits once. All students get an alert. Clash check blocks double booking of room or teacher. |
| Leave | Faculty is sick and the class is missed. | Apply leave in the app. Pick a substitute. Students are told the same day. |
| Course material | Notes and slides are shared on many WhatsApp groups. | One upload per subject. Version history. Students see it in one place. |
| Assignments | Late submissions, copied work, and checking by hand. | Deadline and reminders. Copy check. Rubric based marking. Bulk feedback. |
| Marks | Entering marks in Excel and then again in the portal. Mistakes happen. | Upload an Excel file once. The app checks for errors. Marks are locked after submission. Changes need approval and are logged. |
| Exams | Question paper leak risk. Duty list confusion. | Encrypted paper upload with time lock. Duty list in the app with alerts. |
| Students at risk | Faculty only notices a weak student near the exam. | Early warning list: low attendance, low marks, missed assignments. Option to refer to counselling. |
| Communication | Students call or message faculty at night. | Official message channel with set reply hours. Mute option. Personal phone number stays hidden. |
| Approvals | Many requests: leave, bonafide, recommendation letters. | One approval inbox. Approve in one tap. Auto escalation to a backup if the faculty is away. |
| Mentoring | Mentor has 30 students and no record of talks. | Mentor dashboard with notes, meeting dates, and student progress. Notes stay private. |
| Events and duty | Extra duties are given unfairly or at the last minute. | Duty list shows who did what. Fair rotation. Early notice. |
| Research and records | Certificates, papers and training records are scattered. | Faculty profile with documents. Auto report for NAAC or university audits. |
| Safety | A student faints in class. | SOS button for faculty. Nurse and warden are alerted with the room location. |
| Safety | A student makes a complaint against a faculty member. | Fair process. Faculty gets a notice and can reply. Only the committee sees details. |
| Privacy | Student data like marks and health slips are seen by wrong people. | Role based access. Faculty sees only their own classes. Access log kept. |
| Language and skill | Some faculty are not comfortable with apps. | Simple screens, a short video guide, and training. Help desk for support. |
| Network | No internet in the classroom. | Offline mode for attendance and marks. Sync later. |
| Exit | Faculty leaves or retires. | Account frozen. Classes and data move to the new faculty. Experience letter is generated from the app. |

### 2. Manual backup for faculty

- Printed attendance sheet for each class. Staff enter it later.
- Paper mark sheet signed by the faculty, then entered by the exam cell.
- Department office handles requests if the app is down.

### 3. Key idea

Faculty should spend time teaching, not doing paperwork. Every task should take one tap, and every change should be saved in a log.

### 1. Parent problems and solutions

| Area | Problem | Solution |
|---|---|---|
| Research | Hard to trust college claims on fees, hostel and placements. | Verified fee breakup, real photos, and reviews only from verified students and parents. |
| Admission | Parent must visit many times for forms and documents. | Parent login with a checklist, document upload, and a status tracker. |
| Fees | Hidden costs appear later. Fear of a wrong or fake payment link. | One fee page with all costs and due dates. Official payment only inside the app. Receipt saved. |
| Fees | Parent pays for the wrong student or pays twice. | Student name check before paying. Auto refund ticket for double payment. |
| Safety | Parent does not know if the child reached the hostel safely. | Outpass approval alert and a return alert. No live tracking unless the student agrees. |
| Emergency | Parent gets a call hours late when the child is sick or hurt. | Instant SOS alert with hospital name and a warden contact. Updates until the case is closed. |
| Health | Child is ill but hides it. | Parent is told about a medical room visit or a hospital leave. Details stay private. |
| Attendance | Parent finds out about low attendance only at exam time. | Weekly short summary and a low attendance alert with the exam rule. |
| Marks | Results come late or wrong. | Result alert, PDF copy, and a recheck status tracker. |
| Hostel | Complaints about food, room or ragging are ignored. | Parent can raise a ticket with a ticket number and an escalation timer. Anonymous report option. |
| Privacy | Parent wants full access, but the student is an adult. | Student gives consent. By default parents see fees, outpass alerts, attendance and results. |
| Communication | Parent cannot reach anyone at the college. | Official message to the mentor or warden with set reply hours. A help desk number. |
| Language | Parent speaks only Odia or Hindi, or is not good with apps. | App in English, Hindi and Odia. Simple screens. SMS and call backup. |
| Phone | Parent has a basic phone with no smartphone. | SMS alerts, missed call status check, and help desk support. |
| Documents | Parent needs a fee certificate or bonafide for a loan or scholarship. | Apply from the app. QR verified PDF. Tracker shows the stage. |
| Scholarship | Dates and papers are missed. | Reminders for last dates and a document checklist. |
| Transport | Parent worries about the bus route and timing. | Bus route, timing and delay alerts. |
| Discipline | Parent hears about a warning or fine only at the end. | Early notice for any warning, fine or meeting call. Parent can reply or ask for a meeting. |
| Fraud | Fake agents ask for money for admission or marks. | Warning banner: "The college never asks money outside the app." Report fraud button. |
| Account | Parent forgets the password or loses the phone. | Backup codes, email OTP, or a help desk with ID proof. |
| Final year | No clarity on placement, dues and final documents. | No-dues status, placement updates, and a document ready alert. |

### 2. Manual backup for parents

- A parent help desk with a phone number and a printed board of named contacts.
- Paper forms for every request, entered into the app by staff later.
- SMS and phone call alerts if the app is down.

### 3. Key idea

A parent needs peace of mind without taking away the student's privacy. Send fewer alerts, but make each one clear and on time.


### 1. Admin problems and solutions

| Area | Problem | Solution |
|---|---|---|
| Roles | Too many roles: student, faculty, warden, HOD, staff, parent. Wrong people get wrong access. | Role based access with a clear role list. Each role sees only what it needs. Admin can add a custom role. |
| Roles | A staff member gets two roles and misuses power. | Rule check for role clashes. Example: the same person cannot enter marks and approve them. |
| Roles | New staff join or leave and access is not updated. | Join and exit checklist. Access is given on day one and removed on the last day. Account is frozen, not deleted. |
| Assets | Rooms, beds, labs, books, computers and furniture are not tracked. | Asset register with a unique ID and QR tag. Shows location, owner and condition. |
| Assets | Items are lost, broken or taken without a record. | Issue and return log. Damage report with photo. Fine is added to the right student or staff. |
| Hostel | Rooms are empty in one hostel and full in another. | Live room and bed map. Auto allocation and easy room change requests. |
| Maintenance | Repairs are repeated or forgotten. | Ticket system with auto routing, timers and escalation. Repeat fault alert and service history per item. |
| Money | Fee data does not match bank records. Late fines cause fights. | Auto matching by transaction ID. Daily report of paid, due and refund cases. Fine rules set once. |
| Money | Staff change a payment or waive a fee without proof. | Approval steps for waivers and refunds. Full audit log. |
| Data | Marks, attendance and records are changed without a trace. | Audit log with who, when and old value. Locked records after submission. |
| Data | Duplicate or wrong student records. | Unique student ID, duplicate check, and a data correction request with approval. |
| Security | Data leak, hacked admin account or fake login. | Two step login for admins, encryption, login alerts, and a breach plan with user alerts. |
| Security | An admin deletes data by mistake. | Soft delete, daily backup and a restore button. |
| System | Server crash on result or fee day. | Backup server, cache, queue and read only mode. Health dashboard with alerts to the tech team. |
| System | App update breaks something. | Test copy first. Release in small groups. Easy rollback. |
| Notices | A wrong or fake notice goes to all. | Only verified senders. Approval for big notices. Recall option. |
| Emergency | Fire, flood, cyclone, strike or lockdown. | One tap alert by push, SMS and email. Online class and exam mode. Emergency contact list. |
| Rules | Rules change often: fee, attendance, exam, outpass. | Rule settings page with version history. Changes apply from a set date. |
| Reports | University, NAAC and government reports take weeks. | Auto reports for attendance, results, fees, assets and events. Export to Excel and PDF. |
| Complaints | Serious cases like ragging or harassment are mishandled. | Private case view for the committee only. Timers, reminders and a log of who opened it. |
| Vendors | Mess, bus, canteen and repair vendors are not tracked. | Vendor list with contracts, payment dates, ratings and complaint count. |
| Support | Many people ask for help in many ways. | One help desk dashboard with ticket numbers, status and reply time. |
| Exit and archive | Old students and staff data pile up. | Archive rules. Certificates stay downloadable. Old data is removed as per the retention period. |

### 2. Manual backup for admin

- Printed asset register and room list, updated every month.
- Paper forms for key actions, with a signed copy kept in the office.
- Offline copy of emergency contacts and key records, stored safely.
- A named backup admin for every key task.

### 3. Key idea

Admin needs one control room: clear roles, full tracking of every asset and action, and a backup plan. Nothing should depend on one person or one system.

### 1. IT & Infrastructure problems and solutions

| Area | Problem | Solution |
|---|---|---|
| Wi-Fi | Students complain about slow or disconnected Wi-Fi in specific rooms. | Wi-Fi dead-zone reporting in the app with auto-mapping for the IT team to fix routers. |
| Devices | Projectors or smart boards in classrooms stop working right before a lecture. | QR code on each device. Faculty scans it to instantly raise a high-priority IT ticket. |
| Software Licenses | Students struggle to get access to MATLAB, AutoCAD, or other licensed software. | Self-service portal in the app to request and automatically provision license keys based on course enrollment. |
| Printing | Long queues at the campus print shop; students lose USB drives. | Cloud print integration: upload documents via the app and scan a QR at the printer to release the job. |

### 2. Manual backup for IT & Infrastructure

- A physical IT helpdesk with standard paper forms for device requests.
- Spare offline projectors and routers kept in each block for emergency swapping.

### 3. Key idea

IT should be invisible when working and instantly reachable when broken. Self-service and quick ticketing prevent learning disruptions.


