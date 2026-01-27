### Modifications Module ERD

```mermaid
erDiagram
    loan_account ||--o{ loan_restructuring : "undergoes"
    loan_restructuring ||--o{ restructuring_terms : "defines"
    loan_account ||--o{ interest_rate_adjustment : "adjusted"
    loan_account ||--o{ tenure_change : "modified"
    loan_account ||--o{ top_up_loan : "enhanced by"

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

    loan_restructuring {
        uuid id PK
        uuid loanAccountId FK
        varchar restructuringType
        date requestedDate
        date effectiveDate
        date approvedDate
        varchar approvedBy
        text reason
        varchar status
        timestamp createdAt
        timestamp updatedAt
    }

    restructuring_terms {
        uuid id PK
        uuid loanRestructuringId FK
        integer oldTenure
        integer newTenure
        decimal oldInterestRate
        decimal newInterestRate
        decimal oldEmiAmount
        decimal newEmiAmount
        integer moratoriumPeriod
        text moratoriumReason
        decimal restructuringCharges
        timestamp createdAt
    }

    interest_rate_adjustment {
        uuid id PK
        uuid loanAccountId FK
        date effectiveFrom
        decimal previousRate
        decimal newRate
        varchar adjustmentReason
        varchar approvedBy
        timestamp approvedAt
        boolean linkedToRestructuring
        timestamp createdAt
    }

    tenure_change {
        uuid id PK
        uuid loanAccountId FK
        integer oldTenureMonths
        integer newTenureMonths
        date effectiveDate
        text reason
        decimal impactOnEmi
        varchar approvedBy
        timestamp approvedAt
        timestamp createdAt
    }

    top_up_loan {
        uuid id PK
        uuid parentLoanAccountId FK
        decimal topUpAmount
        decimal newTotalLoan
        integer newTenure
        decimal newInterestRate
        date approvedDate
        date disbursedDate
        varchar status
        timestamp createdAt
    }
```

**Key Relationships:**
- **loan_account → loan_restructuring**: One-to-Many (1:N) - Each loan can be restructured multiple times
- **loan_restructuring → restructuring_terms**: One-to-One (1:1) - Each restructuring has detailed terms
- **loan_account → interest_rate_adjustment**: One-to-Many (1:N) - Each loan can have multiple rate adjustments
- **loan_account → tenure_change**: One-to-Many (1:N) - Each loan can have multiple tenure changes
- **loan_account → top_up_loan**: One-to-Many (1:N) - Each loan can have multiple top-ups

**Modification Types:**
1. **Restructuring**: Comprehensive changes (tenure + rate + EMI + moratorium)
2. **Rate Adjustment**: Standalone interest rate changes
3. **Tenure Change**: Standalone tenure modifications
4. **Top-up**: Additional lending with new terms
