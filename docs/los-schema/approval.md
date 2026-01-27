# Approval

## Tables

### approval_workflow

Multi-level approval workflow table for loan applications with hierarchical approval tracking, status management, and audit trail.

**Primary Key:** `id` (UUID)

**Foreign Key:** `loanApplicationId` → `loanApplications.id` (ON DELETE CASCADE), `approverId` → `users.id`

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique approval workflow record identifier |
| loanApplicationId | UUID | FK, NOT NULL | Reference to loan application being approved |
| approverId | UUID | FK, NOT NULL | Reference to user performing the approval |
| approvalLevel | INTEGER | NOT NULL | Hierarchical approval level (1, 2, 3, etc.) |
| role | VARCHAR(100) | NOT NULL | Role/position of the approver |
| status | approval_status | NOT NULL, DEFAULT 'pending' | Current approval status (pending, approved, rejected, conditional) |
| remarks | TEXT | - | Approval/rejection comments and conditions |
| approvedAt | TIMESTAMP | - | Timestamp when approval was completed |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `loanAppIdIdx`: Index on `loanApplicationId` for quick retrieval by application
- `approverIdIdx`: Index on `approverId` for quick retrieval by approver
- `statusIdx`: Index on `status` for quick retrieval by approval status

**Relationships:**
- One-to-many with `loanApplications` via `loanApplicationId` (each loan application can have multiple approval workflows)
- Many-to-one with `users` via `approverId` (each approval record is linked to a user)

---

## Business Rules for Approval Workflow

1. **Approval Hierarchy:**
   - Approval levels are sequential (1 → 2 → 3 → ...)
   - Each level must be completed before moving to the next level
   - Higher level approvers have authority to override lower level decisions

2. **Status Transitions:**
   - `pending` → `approved` (manual approval)
   - `pending` → `rejected` (manual rejection)
   - `pending` → `conditional` (approval with conditions)
   - `conditional` → `approved` (conditions met)
   - `conditional` → `rejected` (conditions not met)

3. **Mandatory Fields:**
   - `loanApplicationId` must reference a valid loan application
   - `approverId` must reference a valid user
   - `approvalLevel` must be greater than 0
   - `role` must be specified for audit purposes

4. **Approval Conditions:**
   - Conditional approvals require specific remarks outlining the conditions
   - Conditions must be clearly documented for future reference
   - System can track whether conditional approvals have been met

5. **Audit Trail:**
   - All approvals are timestamped with `approvedAt`
   - Remarks field is mandatory for rejections and conditional approvals
   - System maintains full history of approval status changes

6. **Data Integrity:**
   - Cannot approve a loan application at multiple levels simultaneously
   - Each approval workflow record is independent and can be tracked separately
   - Foreign key constraints ensure data consistency
