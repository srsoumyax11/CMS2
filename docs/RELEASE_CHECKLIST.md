# Production Release & App Store Audit Checklist

## 1. Store Listing Information
- **App Name**: Campus 360 (PS7 ERP & Portal)
- **Short Description**: Unified smart campus management system for students, faculty, wardens, parents, and administrators.
- **Full Description**: Comprehensive mobile and web portal providing outpass approvals, dynamic QR attendance, hostel mess & room management, fee payments, parent privacy controls, and emergency SOS alerts.
- **Privacy Policy URL**: `https://campus.edu/privacy-policy`
- **Support Contact Email**: `support@campus.edu`

## 2. Platform Permissions Explained
| Permission | Platform | Technical Justification for App Store Review |
|---|---|---|
| `ACCESS_FINE_LOCATION` | Android / iOS | Required for emergency SOS dispatch and live bus route tracking on campus. |
| `CAMERA` | Android / iOS | Required for dynamic QR code scanning during attendance verification. |
| `POST_NOTIFICATIONS` | Android 13+ / iOS | Required for real-time outpass status updates, emergency broadcasts, and parent alerts. |
| `USE_BIOMETRIC` | Android / iOS | Optional local biometric authentication (Face ID / Fingerprint) for sensitive financial & grade screens. |

## 3. Test Accounts for Reviewers (Apple App Review & Google Play)
| Role | Username / Email | Password | Test Data Scope |
|---|---|---|---|
| Student | `student.test@campus.edu` | `Pass123!` | Active student with 1 pending outpass, fee dues, room 102 |
| Faculty | `faculty.test@campus.edu` | `Pass123!` | Assigned to CS101, 2 assignments to grade |
| Warden | `warden.test@campus.edu` | `Pass123!` | Hostel Block A, 5 room entries, visitor log |
| Parent | `parent.test@campus.edu` | `Pass123!` | Linked to student `S101`, attendance visibility active |
| Admin | `admin.test@campus.edu` | `Pass123!` | Super admin with system governance & user freeze rights |

## 4. Operational Rollback Plan
1. **OTA Hotfix via EAS Update**:
   ```bash
   eas update --branch production --message "Hotfix rollback"
   ```
2. **Channel Rollback / Repointing**:
   - In case of critical regression in js bundle, re-point `production` channel to previous deployment update ID using EAS CLI.
3. **Database Migration Fallback**:
   - Backend migrations run via `prisma migrate deploy`. Rollback triggers standard down migrations via committed SQL scripts.
