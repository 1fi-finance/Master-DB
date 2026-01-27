### Interest Module ERD

```mermaid
erDiagram
    loan_account ||--o{ interest_accrual : "accrues daily"
    loan_account ||--o{ interest_rate_history : "tracks rate changes"

    loan_account {
        uuid id PK
        varchar accountNumber UK
        decimal principalAmount
        decimal currentOutstanding
        decimal interestRate
        integer tenureMonths
        timestamp loanStartDate
        timestamp loanEndDate
        varchar status
        timestamp createdAt
        timestamp updatedAt
    }

    interest_accrual {
        uuid id PK
        uuid loanAccountId FK
        date accrualDate
        decimal principalOutstanding
        decimal interestRate
        integer daysInPeriod
        decimal accruedInterest
        boolean postedToLedger
        timestamp createdAt
    }

    interest_rate_history {
        uuid id PK
        uuid loanAccountId FK
        date effectiveDate
        decimal oldRate
        decimal newRate
        text reason
        varchar changedBy
        timestamp createdAt
    }
```

**Key Relationships:**
- **loan_account → interest_accrual**: One-to-Many (1:N) - Each loan accrues interest daily
  - Indexed on: loanAccountId, accrualDate
  - Tracks daily interest calculations
  - Links to ledger posting status

- **loan_account → interest_rate_history**: One-to-Many (1:N) - Each loan tracks all rate changes
  - Indexed on: loanAccountId, effectiveDate
  - Maintains audit trail of rate modifications
  - Stores reason and approver for each change

**Key Features:**
- **Daily Accrual**: interest_accrual table grows daily for each active loan
- **Rate Tracking**: Complete history of interest rate changes with reasons
- **Ledger Integration**: postedToLedger flag tracks posting to accounting system
