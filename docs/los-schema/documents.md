# Documents

## Tables

### documents

Master table for managing loan application documents. Supports multiple document types with verification workflow tracking.

**Primary Key:** `id` (UUID)

**Foreign Key:** `loanApplicationId` → `loan_applications.id` (ON DELETE CASCADE)
**Foreign Key:** `verifiedBy` → `users.id` (ON DELETE SET NULL)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique document identifier |
| loanApplicationId | UUID | FK, NOT NULL | Reference to loan application |
| documentType | ENUM | NOT NULL | Document type: aadhaar, pan, bank_statement, mutual_fund_statement, income_proof, agreement, kyc |
| documentUrl | VARCHAR(500) | NOT NULL | URL to access the uploaded document |
| fileName | VARCHAR(255) | NOT NULL | Original filename of the document |
| fileSize | INTEGER | - | File size in bytes |
| status | ENUM | NOT NULL, DEFAULT 'pending' | Document workflow status: pending, uploaded, verified, rejected |
| verificationRemarks | TEXT | - | Remarks from verification process (rejection reason, verification notes) |
| verifiedBy | UUID | FK, users.id | User who performed the verification |
| verifiedAt | TIMESTAMP | - | Timestamp when document was verified/rejected |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `docs_loan_app` on `loanApplicationId` (optimizes loan application lookups)
- `docs_type` on `documentType` (optimizes document type filtering)
- `docs_status` on `status` (optimizes status-based queries)

**Relationships:**
- One-to-many with `loan_applications` via `loanApplicationId` (each application can have multiple documents)
- Many-to-one with `users` via `verifiedBy` (tracks which user verified the document)

---

### Document Types

**Enumeration Values:**
- `aadhaar` - Indian national ID document
- `pan` - Permanent Account Number card
- `bank_statement` - Bank account statements
- `mutual_fund_statement` - Mutual fund investment statements
- `income_proof` - Employment/business income verification
- `agreement` - Loan agreement documents
- `kyc` - Know Your Customer compliance documents

---

### Document Status Workflow

**Status Progression:**
1. **pending** - Document requested from applicant
2. **uploaded** - Document uploaded by applicant
3. **verified** - Document approved by verification team
4. **rejected** - Document rejected for corrections/resubmission

**Workflow Rules:**
- Documents can only move forward in status (pending → uploaded → verified/rejected)
- Status transitions require appropriate user actions
- Verified documents cannot be modified (must create new document for updates)
- Rejected documents can be re-uploaded after corrections

---

### Business Rules

**Document Management:**
- Each loan application can have multiple documents of different types
- All documents must have a valid file URL and filename
- File size validation should be implemented at application level
- Document verification is optional but recommended for critical document types

**Verification Process:**
- Only authorized users can verify or reject documents
- Verification remarks are required for rejection status changes
- Documents remain in "uploaded" status until verification is completed
- System timestamps track all verification activities

**Data Integrity:**
- Foreign key constraints ensure documents are linked to valid loan applications
- Document types must be from the predefined enumeration
- Status changes follow the defined workflow sequence
- Soft deletion strategy (use status flags rather than actual deletion)

---

### File Management

**Storage Requirements:**
- Documents should be stored in a secure cloud storage solution
- URL must provide secure access with proper authentication
- File integrity should be verified upon upload
- Backup and retention policies must be defined

**Security Considerations:**
- Document URLs should have access controls and expiration policies
- Sensitive documents ( Aadhaar, PAN) require additional encryption
- Audit logging for all document access and modification events
- Compliance with data protection regulations (KYC, GDPR)
