# Applications

## Tables

### loan_applications

Master loan application table tracking the complete lifecycle from application creation to approval.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `userId` → `users.id` (ON DELETE RESTRICT)
- `loanProductId` → `loan_products.id` (ON DELETE RESTRICT)
- `reviewedBy` → `users.id` (ON DELETE SET NULL)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique loan application identifier |
| userId | UUID | FK, NOT NULL | Reference to user who created the application |
| loanProductId | UUID | FK, NOT NULL | Reference to loan product applied for |
| applicationNumber | VARCHAR(50) | NOT NULL, UNIQUE | Human-readable application number |
| status | LOAN_APPLICATION_STATUS | NOT NULL, DEFAULT 'draft' | Application status in workflow |
| requestedLoanAmount | DECIMAL(15,2) | NOT NULL | Loan amount requested by applicant |
| requestedTenureMonths | INTEGER | NOT NULL | Loan tenure requested (in months) |
| emiType | VARCHAR(20) | NOT NULL | EMI type preference (e.g., "Monthly", "Bi-Weekly") |
| approvedLoanAmount | DECIMAL(15,2) | - | Final approved loan amount |
| approvedTenureMonths | INTEGER | - | Final approved tenure (in months) |
| approvedInterestRate | DECIMAL(8,4) | - | Approved interest rate percentage |
| approvedEmiAmount | DECIMAL(15,2) | - | Calculated EMI amount based on approval |
| rejectionReason | TEXT | - | Reason for application rejection |
| submittedAt | TIMESTAMP | - | Timestamp when application was submitted |
| approvedAt | TIMESTAMP | - | Timestamp when application was approved |
| reviewedBy | UUID | FK, users.id | User who reviewed/approved the application |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `loan_app_user_id` on `userId` - For querying applications by user
- `loan_app_number` on `applicationNumber` - For fast lookup by application number
- `loan_app_status` on `status` - For filtering applications by status
- `loan_app_created` on `createdAt` - For date-based queries and reporting

**Relationships:**
- Many-to-one with `users` via `userId` (each user can have multiple applications)
- Many-to-one with `loan_products` via `loanProductId` (each application is for one product)
- One-to-one with `loan_sanction` via `id` (approved applications have sanction details)
- One-to-many with `documents` via `id` (each application can have multiple documents)
- One-to-many with `approval_workflow` via `id` (each application goes through approval levels)
- One-to-many with `mutual_fund_collateral` via `id` (each application can have multiple collateral records)

**Business Rules:**

1. **Application Lifecycle:**
   - Status progression: draft → submitted → under_review → kyc_pending → credit_pending → approved/rejected → disbursed/cancelled
   - Application number must be unique and generated upon submission
   - Application can only be submitted once all required fields are populated

2. **Requested vs Approved:**
   - `requestedLoanAmount` and `requestedTenureMonths` are mandatory and set by applicant
   - `approvedLoanAmount`, `approvedTenureMonths`, and `approvedInterestRate` are set during approval
   - Approved amounts cannot exceed product maximums
   - Approved tenure must be within product min/max range

3. **Status Transitions:**
   - draft → submitted: When applicant submits application
   - submitted → under_review: When application is assigned for review
   - under_review → kyc_pending: When KYC verification is initiated
   - kyc_pending → credit_pending: When KYC is approved and credit assessment begins
   - credit_pending → approved: When credit committee approves the application
   - credit_pending → rejected: When credit committee rejects the application
   - approved → disbursed: When loan amount is disbursed
   - Any status → cancelled: If applicant withdraws or timeline expires

4. **EMI Calculations:**
   - `approvedEmiAmount` is calculated based on approved loan amount, interest rate, and tenure
   - EMI type determines payment frequency (monthly, bi-weekly, etc.)
   - EMI calculations use standard amortization formulas

5. **Approval Workflow:**
   - `reviewedBy` is set when application moves to under_review status
   - `approvedAt` timestamp is set when application reaches approved status
   - `rejectionReason` is mandatory when status changes to rejected

6. **Data Integrity:**
   - Application must reference valid user and loan product
   - Requested amount must be within product min/max range
   - Requested tenure must be within product min/max range
   - Application numbers follow predefined format for consistency
