# Collection Buckets

## collection_bucket

**Purpose:** Defines DPD (Days Past Due) buckets for loan collections with provisioning percentages and collection strategies. This table configures how delinquent loans are categorized based on overdue days.

**Schema:** lmsSchema

**Table Name:** `collection_bucket`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random() | Unique bucket identifier |
| bucketCode | VARCHAR(50) | UNIQUE, NOT NULL | - | Human-readable bucket code (e.g., "B1", "STD") |
| bucketName | VARCHAR(255) | NOT NULL | - | Descriptive bucket name |
| minDpdDays | INTEGER | NOT NULL | - | Minimum DPD days for this bucket |
| maxDpdDays | INTEGER | NOT NULL | - | Maximum DPD days for this bucket |
| provisioningPercentage | DECIMAL(5,2) | NOT NULL | - | Provisioning percentage for risk coverage |
| collectionStrategy | TEXT | NOT NULL | - | Collection strategy instructions |
| isActive | BOOLEAN | NOT NULL | true | Whether bucket is currently active |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Bucket creation timestamp |

### Relationships

**Referenced By:**
- loan_collection_status (currentBucket → id)

### Indexes

- `coll_bucket_code` on `bucketCode` - Fast bucket lookup by code
- `coll_bucket_active` on `isActive` - Filter active buckets
- `coll_bucket_dpd` on `minDpdDays`, `maxDpdDays` - DPD range queries

### Business Logic

**DPD Bucket Classification:**
Typical bucket structure (example):
- **Standard (STD):** 0-30 DPD days - Normal collection
- **Bucket 1 (B1):** 31-60 DPD days - Early delinquency
- **Bucket 2 (B2):** 61-90 DPD days - Moderate delinquency
- **Bucket 3 (B3):** 91-180 DPD days - Severe delinquency
- **Loss Bucket:** 180+ DPD days - Near write-off

**Provisioning Logic:**
- Provisioning percentage increases with DPD severity
- Standard: 0-5% provisioning
- Sub-standard: 5-15% provisioning
- Doubtful: 15-50% provisioning
- Loss: 100% provisioning

**Bucket Assignment Rules:**
- Loans are automatically assigned to buckets based on DPD days
- DPD = Current Date - Last Payment Due Date
- Bucket boundaries are inclusive: `minDpdDays <= DPD <= maxDpdDays`
- Active buckets only are used in automated assignment

**Collection Strategy:**
- Contains instructions for collection agents
- Defines contact frequency (calls per week)
- Specifies escalation matrix
- Includes template messages and legal notices

**Overlapping Ranges:**
- minDpdDays and maxDpdDays can overlap for edge cases
- In overlaps, most severe bucket (highest provisioning) takes precedence
- isActive flag allows disabling buckets without deletion

### Common Queries

```sql
-- Get active bucket for a loan based on DPD days
SELECT b.*
FROM collection_bucket b
WHERE b.isActive = true
  AND 60 BETWEEN b.minDpdDays AND b.maxDpdDays
ORDER BY b.provisioningPercentage DESC
LIMIT 1;

-- List all buckets with DPD ranges
SELECT
    bucketCode,
    bucketName,
    minDpdDays,
    maxDpdDays,
    provisioningPercentage,
    isActive
FROM collection_bucket
ORDER BY minDpdDays;

-- Calculate total provisioning required
SELECT
    SUM(lcs.totalOverdueAmount * cb.provisioningPercentage / 100) as totalProvisioning
FROM loan_collection_status lcs
JOIN collection_bucket cb ON lcs.currentBucket = cb.id
WHERE cb.isActive = true;
```

**Related Tables:**
- loan_collection_status - Uses buckets for DPD classification
- loan_account - Linked through collection status
- repayment_history - DPD calculation based on payment dates
