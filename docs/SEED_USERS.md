# Seed Users & Test Credentials Directory

This document details the standard seeded user accounts, login credentials, roll numbers, DOBs, and linked parent-student relationships for local development and testing on the **Campus Management System (Campus7)** platform.

---

## 🔐 Global Authentication Guidelines

- **Default Passwords**: All test/seed users use `Campus7UserPass!`
- **Development OTP Hint**: In local development (`NODE_ENV=development`), all OTP requests return `devOtpHint: "123456"`.
- **Primary Auth Routes**:
  - `POST /api/v1/auth/login`: Identity (`email` or `userCode`) + `password`.
  - `POST /api/v1/auth/otp/send` -> `POST /api/v1/auth/otp/verify` -> `POST /api/v1/auth/register` for signing up fresh accounts.

---

## 👥 Seed User Directory

### 1. 🛡️ System Administrator (`admin`)
- **Full Name**: System Administrator
- **Email**: `admin@campus7.edu`
- **Password**: `Campus7UserPass!`
- **Role**: `admin`
- **Permissions / Scope**: Global system administration, role approval queue, system settings, global notices management.

---

### 2. 🏛️ Hostel Warden (`warden`)
- **Full Name**: Warden Robert Vance
- **Email**: `warden@campus7.edu`
- **Password**: `Campus7UserPass!`
- **Role**: `warden`
- **Assigned Hostel**: Boys Hostel Block A
- **Permissions / Scope**: Manage student gate passes / outpasses (`GET /api/v1/warden/outpasses`), approve/reject leave applications, review hostel complaints.

---

### 3. 👨‍🏫 Faculty / Professor (`faculty`)
- **Full Name**: Prof. Eleanor Vance
- **Email**: `faculty@campus7.edu`
- **Password**: `Campus7UserPass!`
- **Role**: `faculty`
- **Employee Code**: `EMP-FAC-2026-001`
- **Department**: Computer Science & Engineering
- **Permissions / Scope**: View assigned course rosters, record student attendance, issue academic notices.

---

### 4. 🎓 Student (`student`)
- **Full Name**: Alex Rivera
- **Email**: `student@campus7.edu`
- **Password**: `Campus7UserPass!`
- **Role**: `student`
- **Roll Number**: `CS-2024-042`
- **Admission Number**: `ADM-2024-8901`
- **Date of Birth**: `2004-05-15`
- **Course**: B.Tech Computer Science & Engineering (Year 2)
- **Permissions / Scope**: Request hostel outpasses, view fee invoices, initiate fee payments (`POST /api/v1/student/payments/initiate`), view class schedule and notices.

---

### 5. 👪 Parent (`parent` - Linked to Student)
- **Full Name**: Maria Rivera
- **Email**: `parent@campus7.edu`
- **Password**: `Campus7UserPass!`
- **Role**: `parent`
- **Linked Student**: Alex Rivera (`student@campus7.edu`)
- **Verification Details Required for Link**:
  - **Student Admission No**: `ADM-2024-8901`
  - **Student DOB**: `2004-05-15`
- **Link Route**: `POST /api/v1/guardian-links/link-student`
- **Permissions / Scope**: View linked ward's attendance, review and approve outpass requests, view ward's fee payment status.

---

## 🧪 Quick Test Data Summary

| Role | Email | Password | Key Identifier | Special Attributes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus7.edu` | `Campus7UserPass!` | N/A | Full Administrative Access |
| **Warden** | `warden@campus7.edu` | `Campus7UserPass!` | Hostel Block A | Gate Pass & Hostel Approval |
| **Faculty** | `faculty@campus7.edu` | `Campus7UserPass!` | `EMP-FAC-2026-001` | CSE Department |
| **Student** | `student@campus7.edu` | `Campus7UserPass!` | `CS-2024-042` | DOB: `2004-05-15`, Adm: `ADM-2024-8901` |
| **Parent** | `parent@campus7.edu` | `Campus7UserPass!` | Ward: Alex Rivera | Linked via DOB & Admission No |
