### Collections Module ERD

```mermaid
erDiagram
    loan_account ||--|| loan_collection_status : "has"
    collection_bucket ||--o{ loan_collection_status : "classifies"
    loan_collection_status ||--o{ collection_activity : "tracks"
    loan_account ||--o{ recovery_proceeding : "subject to"

    loan_account {
        uuid id PK
        varchar accountNumber UK
        decimal currentOutstanding
        date nextEmiDueDate
        varchar status
    }

    loan_collection_status {
        uuid id PK
        uuid loanAccountId FK,UK
        uuid currentBucket FK
        integer dpdDays
        date lastPaymentDate
        decimal totalOverdueAmount
        decimal principalOverdue
        decimal interestOverdue
        decimal feeOverdue
        date npaDate
        varchar npaCategory
        decimal provisioningAmount
        varchar assignedTo
        date assignedDate
        date lastFollowUpDate
        date nextFollowUpDate
        timestamp createdAt
        timestamp updatedAt
    }

    collection_bucket {
        uuid id PK
        varchar bucketCode UK
        varchar bucketName
        integer minDpdDays
        integer maxDpdDays
        decimal provisioningPercentage
        text collectionStrategy
        boolean isActive
        timestamp createdAt
    }

    collection_activity {
        uuid id PK
        uuid loanCollectionStatusId FK
        varchar activityType
        date activityDate
        text notes
        varchar outcome
        date nextActionDate
        varchar assignedTo
        timestamp createdAt
    }

    recovery_proceeding {
        uuid id PK
        uuid loanAccountId FK
        varchar proceedingType
        varchar stage
        date filingDate
        varchar caseNumber
        varchar courtName
        varchar lawyerName
        decimal legalCharges
        date expectedRecoveryDate
        date actualRecoveryDate
        decimal recoveryAmount
        varchar status
        timestamp createdAt
        timestamp updatedAt
    }
```

**Key Relationships:**
- **loan_account → loan_collection_status**: One-to-One (1:1) - Each loan has one collection status
- **collection_bucket → loan_collection_status**: Many-to-One (N:1) - Multiple loans in one bucket
- **loan_collection_status → collection_activity**: One-to-Many (1:N) - Each status tracks multiple activities
- **loan_account → recovery_proceeding**: One-to-Many (1:N) - Each loan can have multiple legal proceedings
