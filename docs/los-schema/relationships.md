# LOS Entity Relationships

## Relationship Map

### Loan Products Domain
```
loan_products (1) ----< (N) ltv_config
     |
     +----< (N) loan_applications
          |
          +----< (N) loan_sanction
          |
          +----< (N) documents
          |
          +----< (N) approval_workflow
          |
          +----< (N) mutual_fund_collateral
```

## Cascade Rules

### ON DELETE CASCADE Relationships

The following relationships use CASCADE deletion, meaning deleting the parent record will automatically delete all related child records:

1. **Loan Products Cascade:**
   - Deleting `loan_products` → deletes `ltv_config` records

2. **Loan Applications Cascade:**
   - Deleting `loan_applications` → deletes `loan_sanction` records
   - Deleting `loan_applications` → deletes `documents` records
   - Deleting `loan_applications` → deletes `approval_workflow` records
   - Deleting `loan_applications` → deletes `mutual_fund_collateral` records

### ON DELETE RESTRICT Relationships

These relationships use RESTRICT, preventing deletion of parent records if child records exist:

1. **Users Relationship Protection:**
   - Cannot delete users referenced in `loan_applications.userId`
   - Cannot delete users referenced in `loan_sanction.sanctionedBy`
   - Cannot delete users referenced in `approval_workflow.approverId`
   - Cannot delete users referenced in `documents.verifiedBy` (if there are verified documents)

2. **Loan Product Protection:**
   - Cannot delete `loan_products` referenced in `loan_applications.loanProductId`

3. **Loan Application Protection:**
   - Cannot delete `loan_applications` referenced in:
     - `loan_sanction.loanApplicationId`
     - `documents.loanApplicationId`
     - `approval_workflow.loanApplicationId`
     - `mutual_fund_collateral.loanApplicationId`

### ON DELETE SET NULL Relationships

1. **Document Verification:**
   - Deleting users referenced in `documents.verifiedBy` → sets `verifiedBy` to NULL

## Key Relationships Table

| Child Table | Parent Table | Relationship | On Delete Action |
|-------------|--------------|--------------|------------------|
| `ltv_config` | `loan_products` | One-to-Many | CASCADE |
| `loan_applications` | `loan_products` | Many-to-One | RESTRICT |
| `loan_applications` | `users` | Many-to-One | RESTRICT |
| `loan_sanction` | `loan_applications` | One-to-One | CASCADE |
| `loan_sanction` | `users` | Many-to-One | RESTRICT |
| `documents` | `loan_applications` | Many-to-One | CASCADE |
| `documents` | `users` | Many-to-One | SET NULL |
| `approval_workflow` | `loan_applications` | Many-to-One | CASCADE |
| `approval_workflow` | `users` | Many-to-One | RESTRICT |
| `mutual_fund_collateral` | `loan_applications` | Many-to-One | CASCADE |

## Integration Points

### users ↔ LOS Schema

The LOS schema has multiple relationships with the users schema:

1. **Loan Applicants:**
   - `loan_applications.userId` → `users.id`
   - One user can have multiple loan applications
   - Deletion restricted (RESTRICT)

2. **Sanction Officers:**
   - `loan_sanction.sanctionedBy` → `users.id`
   - One user can sanction multiple loans
   - Deletion restricted (RESTRICT)

3. **Document Verifiers:**
   - `documents.verifiedBy` → `users.id`
   - One user can verify multiple documents
   - Deletion sets to NULL (SET NULL)

4. **Approvers:**
   - `approval_workflow.approverId` → `users.id`
   - One user can approve multiple workflows
   - Deletion restricted (RESTRICT)

### merchant ↔ LOS Schema

The LOS schema currently has no direct integration with merchant schema tables. All relationships within LOS are self-contained or reference the users schema.

## Data Integrity Rules

1. **Loan Product Deletion:**
   - Can delete inactive loan products
   - Hard delete cascades to LTV configuration
   - Cannot delete if referenced in active loan applications

2. **Loan Application Deletion:**
   - Generally allowed for draft applications
   - CASCADE deletes all related records (sanction, documents, approval, collateral)
   - Consider soft deletion for audit purposes

3. **User Deletion:**
   - Protected in most relationships (RESTRICT)
   - Document verification can be safely removed (SET NULL)
   - Must handle outstanding loan applications/sanctions

4. **Document Deletion:**
   - CASCADE deleted when loan application is deleted
   - Individual document deletions don't affect other records

## Query Patterns

### Loan Application Retrieval
```sql
-- Get application with all related data
SELECT la.*, ls.*, d.*, aw.*, mfc.*
FROM loan_applications la
LEFT JOIN loan_sanction ls ON la.id = ls.loanApplicationId
LEFT JOIN documents d ON la.id = d.loanApplicationId
LEFT JOIN approval_workflow aw ON la.id = aw.loanApplicationId
LEFT JOIN mutual_fund_collateral mfc ON la.id = mfc.loanApplicationId
WHERE la.userId = :userId
```

### Product-Based Queries
```sql
-- Get all applications for a product
SELECT la.*, u.*
FROM loan_applications la
JOIN users u ON la.userId = u.id
WHERE la.loanProductId = :productId
```

### Approval Workflow Tracking
```sql
-- Get approval status for multiple applications
SELECT la.applicationNumber, aw.status, aw.approvalLevel, aw.approvedAt
FROM loan_applications la
JOIN approval_workflow aw ON la.id = aw.loanApplicationId
WHERE la.userId = :userId
ORDER BY la.createdAt DESC
```

### Document Verification Status
```sql
-- Get verification progress
SELECT la.applicationNumber, d.documentType, d.status,
       d.verifiedBy, d.verifiedAt, d.verificationRemarks
FROM loan_applications la
JOIN documents d ON la.id = d.loanApplicationId
WHERE la.id = :applicationId
ORDER BY d.createdAt
```
