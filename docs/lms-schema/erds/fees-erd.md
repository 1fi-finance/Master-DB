### Fees Module ERD

```mermaid
erDiagram
    fee_master ||--o{ loan_fees : "defines"
    loan_account ||--o{ loan_fees : "charged"
    loan_fees ||--o{ fee_payment : "paid via"
    emi_schedule ||--o{ penalty_calculation : "incurs"

    fee_master {
        uuid id PK
        varchar feeCode UK
        varchar feeName
        varchar feeType
        varchar calculationMethod
        decimal rate
        decimal fixedAmount
        varchar applicability
        varchar glHead
        boolean isActive
        date effectiveDate
        timestamp createdAt
    }

    loan_account {
        uuid id PK
        varchar accountNumber UK
        decimal principalAmount
        decimal currentOutstanding
        varchar status
    }

    loan_fees {
        uuid id PK
        uuid loanAccountId FK
        uuid feeId FK
        decimal feeAmount
        decimal waivedAmount
        decimal paidAmount
        decimal outstandingAmount
        date applicableDate
        date dueDate
        varchar status
        varchar waivedBy
        text waivedReason
        timestamp createdAt
    }

    fee_payment {
        uuid id PK
        uuid loanFeeId FK
        decimal paymentAmount
        date paymentDate
        varchar paymentMode
        varchar transactionReference
        varchar utrNumber
        timestamp createdAt
    }

    emi_schedule {
        uuid id PK
        uuid loanApplicationId FK
        integer installmentNumber
        date dueDate
        decimal totalEmiAmount
        varchar status
        integer overdueDays
        decimal latePaymentCharges
    }

    penalty_calculation {
        uuid id PK
        uuid emiScheduleId FK
        integer overdueDays
        decimal penaltyAmount
        date calculatedDate
        boolean waived
        varchar waivedBy
        text waivedReason
        timestamp createdAt
    }
```

**Key Relationships:**
- **fee_master → loan_fees**: One-to-Many (1:N) - Each fee type can be applied to multiple loans
- **loan_account → loan_fees**: One-to-Many (1:N) - Each loan can have multiple types of fees
- **loan_fees → fee_payment**: One-to-Many (1:N) - Each fee can have multiple partial payments
- **emi_schedule → penalty_calculation**: One-to-Many (1:N) - Each EMI can have multiple penalty calculations
