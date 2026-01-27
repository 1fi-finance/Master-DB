# Fee Master

## fee_master

**Purpose:** Master catalog of all fee types that can be applied to loans throughout their lifecycle. This table defines the fee structure, calculation methods, and accounting heads for various charges like processing fees, prepayment charges, foreclosure fees, bounce charges, legal fees, and inspection fees.

**Schema:** lmsSchema

**Table Name:** `fee_master`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | uuid_generate_v4() | Unique fee master identifier |
| feeCode | VARCHAR(50) | NOT NULL, UNIQUE | - | Unique fee code for system reference (e.g., PROC_FEE, PREPAY_FEE) |
| feeName | VARCHAR(255) | NOT NULL | - | Human-readable fee name (e.g., "Processing Fee", "Prepayment Charges") |
| feeType | fee_type_enum | NOT NULL | - | Type of fee: processing, prepayment, foreclosure, bounce, legal, inspection, other |
| calculationMethod | fee_calculation_method_enum | NOT NULL | - | How fee is calculated: flat_amount, percentage_of_loan, percentage_of_outstanding, percentage_of_emi, tiered |
| rate | DECIMAL(8,4) | - | - | Rate percentage when calculation method is percentage-based |
| fixedAmount | DECIMAL(15,2) | - | - | Fixed amount when calculation method is flat_amount |
| applicability | VARCHAR(100) | NOT NULL | - | When fee applies (e.g., "at_disbursement", "on_preclosure", "on_bounce", "on_inspection") |
| glHead | VARCHAR(100) | NOT NULL | - | General ledger head for accounting integration |
| isActive | BOOLEAN | NOT NULL | true | Whether this fee is currently active |
| effectiveDate | DATE | NOT NULL | - | Date from which this fee configuration is effective |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**Referenced By:**
- loan_fees (feeId → id)

### Indexes

- `fee_master_code` on feeCode
- `fee_master_type` on feeType
- `fee_master_active` on isActive

### Business Logic

**Fee Types (fee_type_enum):**
- **processing**: One-time fee charged at loan disbursement
- **prepayment**: Fee charged when borrower prepays loan amount
- **foreclosure**: Fee charged when borrower closes loan early
- **bounce**: Penalty for EMI payment bounce (NACH/rejected payment)
- **legal**: Legal expenses incurred during recovery
- **inspection**: Physical inspection or site visit charges
- **other**: Miscellaneous fees not covered above

**Calculation Methods:**

1. **flat_amount**: Fixed amount regardless of loan size
   - Example: Processing fee = ₹5000 flat
   - Uses: fixedAmount field

2. **percentage_of_loan**: Percentage of total loan amount
   - Example: Processing fee = 2% of loan amount
   - Uses: rate field
   - Formula: fee_amount = loan_amount × (rate / 100)

3. **percentage_of_outstanding**: Percentage of current outstanding principal
   - Example: Prepayment fee = 3% of outstanding principal
   - Uses: rate field
   - Formula: fee_amount = outstanding_principal × (rate / 100)

4. **percentage_of_emi**: Percentage of EMI amount
   - Example: Bounce charge = 1.5× EMI or 2% of EMI
   - Uses: rate field
   - Formula: fee_amount = emi_amount × (rate / 100)

5. **tiered**: Complex calculation based on slabs
   - Example: Prepayment fee varies by timeline:
     - 0-12 months: 4%
     - 13-24 months: 3%
     - 25+ months: 2%
   - Implementation requires application logic

**Fee Applicability Conditions:**
- **at_disbursement**: Fee applied when loan is disbursed (e.g., processing fee)
- **on_preclosure**: Fee applied when loan is foreclosed
- **on_prepayment**: Fee applied on partial prepayment
- **on_bounce**: Fee applied when EMI payment bounces
- **on_inspection**: Fee applied for site visits/inspections
- **on_legal**: Fee applied for legal proceedings

**Status Management:**
- Fees can be deactivated by setting `isActive = false`
- New fee versions can be created with new effective dates
- Historical fee records remain for audit trail

**Accounting Integration:**
- `glHead` field maps to accounting system's general ledger
- Each fee type must have a valid GL head for bookkeeping
- Debits: Borrower's account
- Credits: Fee income account

### Common Queries

```sql
-- Get all active fees with their calculation details
SELECT
    feeCode,
    feeName,
    feeType,
    calculationMethod,
    CASE
        WHEN calculationMethod = 'flat_amount' THEN fixedAmount::TEXT
        WHEN calculationMethod IN ('percentage_of_loan', 'percentage_of_outstanding', 'percentage_of_emi') THEN rate::TEXT || '%'
        ELSE 'See application logic'
    END AS fee_structure,
    applicability,
    glHead,
    effectiveDate
FROM fee_master
WHERE isActive = true
ORDER BY feeType, feeCode;

-- Calculate processing fee for a loan amount
SELECT
    fm.feeName,
    CASE
        WHEN fm.calculationMethod = 'flat_amount' THEN fm.fixedAmount
        WHEN fm.calculationMethod = 'percentage_of_loan' THEN (la.principalAmount * fm.rate / 100)
        ELSE 0
    END AS calculated_fee
FROM fee_master fm
CROSS JOIN loan_account la
WHERE fm.feeType = 'processing'
  AND fm.isActive = true
  AND la.id = 'loan-account-uuid';

-- Get fees applicable for prepayment based on timeline
SELECT
    feeCode,
    feeName,
    calculationMethod,
    rate,
    applicability
FROM fee_master
WHERE feeType = 'prepayment'
  AND isActive = true
  AND effectiveDate <= CURRENT_DATE;
```

**Related Tables:**
- loan_fees - Junction table linking fee_master to loan_account with actual fee amounts
- loan_account - Loan account details for fee calculation
- emi_schedule - EMI details for percentage_of_emi calculations
