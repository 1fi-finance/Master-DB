### Core Module ERD

```mermaid
erDiagram
    loan_account ||--o{ emi_schedule : "has"
    loan_account ||--o{ repayment : "receives"
    loan_account ||--o{ disbursement : "disbursed via"

    loan_account {
        uuid id PK
        uuid loanApplicationId FK
        uuid loanSanctionId FK
        varchar accountNumber UK
        decimal principalAmount
        decimal currentOutstanding
        decimal interestRate
        integer tenureMonths
        timestamp loanStartDate
        timestamp loanEndDate
        date nextEmiDueDate
        varchar status
        decimal totalCollateralValue
        decimal currentLtv
        timestamp createdAt
        timestamp updatedAt
    }

    emi_schedule {
        uuid id PK
        uuid loanApplicationId FK
        uuid loanSanctionId FK
        integer installmentNumber
        date dueDate
        decimal principalAmount
        decimal interestAmount
        decimal totalEmiAmount
        decimal openingPrincipal
        decimal closingPrincipal
        varchar status
        timestamp paidDate
        decimal paidAmount
        integer overdueDays
        decimal latePaymentCharges
        timestamp createdAt
        timestamp updatedAt
    }

    repayment {
        uuid id PK
        uuid loanApplicationId FK
        uuid emiScheduleId FK
        decimal paymentAmount
        timestamp paymentDate
        varchar paymentMode
        decimal principalComponent
        decimal interestComponent
        decimal latePaymentCharges
        varchar transactionReference
        varchar utrNumber
        jsonb paymentGatewayResponse
        varchar allocatedToEmiNumbers
        boolean foreclosurePayment
        timestamp createdAt
    }

    disbursement {
        uuid id PK
        uuid loanApplicationId FK
        uuid loanSanctionId FK
        decimal disbursementAmount
        timestamp disbursementDate
        varchar status
        varchar beneficiaryAccountNumber
        varchar beneficiaryIfsc
        varchar beneficiaryName
        varchar bankName
        varchar utrNumber
        varchar transactionReference
        varchar paymentGatewayReference
        timestamp initiatedAt
        timestamp completedAt
        text failureReason
        timestamp createdAt
        timestamp updatedAt
    }
```

**Key Relationships:**
- **loan_account → emi_schedule**: One-to-Many (1:N) - Each loan has multiple EMI schedules
- **loan_account → repayment**: One-to-Many (1:N) - Each loan receives multiple repayments
- **loan_account → disbursement**: One-to-Many (1:N) - Each loan can have multiple disbursements
- **repayment → emi_schedule**: Many-to-One (N:1) - Repayments are allocated to specific EMI schedules
