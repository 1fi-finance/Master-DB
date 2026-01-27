# Enums

This document describes all enum definitions used in the merchant schema.

## Merchant-Specific Enums

### merchant_status
**Definition:** `pgEnum("merchant_status", [...])`

**Values:**
- `pending` - Merchant registration submitted, awaiting verification
- `verified` - Merchant KYC verified and active
- `rejected` - Merchant registration rejected
- `suspended` - Merchant temporarily suspended (e.g., policy violations)
- `blacklisted` - Merchant permanently banned

**Used In:** `merchant_kyc.status`, `merchant_stores.status`

**Business Rules:**
- Only `verified` merchants can process payments and receive settlements
- Transition from `pending` to `verified` requires KYC approval
- `suspended` merchants can be reactivated after review

---

### store_type
**Definition:** `pgEnum("store_type", [...])`

**Values:**
- `physical` - Brick-and-mortar retail store
- `online` - E-commerce only store
- `hybrid` - Both physical and online presence
- `warehouse` - Distribution/fulfillment center
- `pop_up` - Temporary retail location

**Used In:** `merchant_stores.storeType`

**Business Rules:**
- `physical` stores require geolocation (latitude/longitude)
- `online` stores don't require address details
- `hybrid` stores support both in-store and online fulfillment

---

### order_status
**Definition:** `pgEnum("order_status", [...])`

**Values:**
- `pending` - Order placed, awaiting confirmation
- `processing` - Order confirmed, being prepared
- `confirmed` - Order confirmed, awaiting fulfillment
- `shipped` - Order dispatched for delivery
- `delivered` - Order successfully delivered
- `cancelled` - Order cancelled (before delivery)
- `returned` - Order returned by customer
- `refunded` - Order refunded
- `failed` - Order failed (payment or processing error)

**Used In:** `orders.status`

**Status Flow:**
```
pending → processing → confirmed → shipped → delivered
                                ↓
                            cancelled
                                ↓
                            refunded

delivered → returned → refunded
```

**Business Rules:**
- Orders can only be cancelled while in `pending`, `processing`, or `confirmed` status
- `refunded` status requires payment gateway refund processing
- `failed` orders can be retried by creating new order

---

### payment_status
**Definition:** `pgEnum("payment_status", [...])`

**Values:**
- `pending` - Payment awaiting initiation
- `paid` - Payment successfully completed
- `failed` - Payment failed (card declined, UPI error, etc.)
- `refunded` - Payment fully refunded
- `partially_refunded` - Payment partially refunded
- `initiated` - Payment initiated, awaiting confirmation

**Used In:** `orders.paymentStatus`

**Business Rules:**
- Settlement only triggered for `paid` orders
- Multiple partial refunds can lead to `partially_refunded`
- `failed` payments can be retried with different payment method

---

### channel_type
**Definition:** `pgEnum("channel_type", [...])`

**Values:**
- `online` - Website, mobile app, or e-commerce platform
- `offline` - Physical store purchase
- `pos` - Point of Sale terminal
- `marketplace` - Third-party marketplace (Amazon, Flipkart, etc.)
- `social_media` - Social commerce (Instagram, Facebook)
- `other` - Other channels not covered above

**Used In:** `orders.channel`

**Business Rules:**
- Commission rates may vary by channel
- `marketplace` orders may have additional fees
- `social_media` orders often have UTM parameters for tracking

---

### fulfillment_type
**Definition:** `pgEnum("fulfillment_type", [...])`

**Values:**
- `delivery` - Standard home delivery
- `pickup` - Customer picks up from store (BOPIS)
- `store_purchase` - In-store purchase
- `reserve_online` - Reserve online, pay in store

**Used In:** `orders.fulfillmentType`

**Business Rules:**
- `pickup` requires store selection
- `store_purchase` only for offline channel
- `reserve_online` supports partial payment online

---

### settlement_status
**Definition:** `pgEnum("settlement_status", [...])`

**Values:**
- `pending` - Settlement calculated, awaiting initiation
- `processing` - Settlement transfer initiated
- `completed` - Settlement successfully transferred
- `failed` - Settlement transfer failed
- `cancelled` - Settlement cancelled

**Used In:** `settlements.status`

**Status Flow:**
```
pending → processing → completed
                     ↓
                  failed
                     ↓
                 pending (retry)
```

**Business Rules:**
- Settlement period ends → status changes to `pending`
- Auto-settlement initiated → status changes to `processing`
- Bank transfer successful → status changes to `completed`
- Failed settlements can be retried (retryCount tracked)

---

### analytics_period
**Definition:** `pgEnum("analytics_period", [...])`

**Values:**
- `hourly` - Aggregated hourly metrics
- `daily` - Aggregated daily metrics
- `weekly` - Aggregated weekly metrics
- `monthly` - Aggregated monthly metrics

**Used In:** `merchant_analytics_daily.period`

**Business Rules:**
- Most analytics use `daily` period
- `hourly` used for real-time dashboards
- `weekly` and `monthly` used for trend analysis

---

## Cross-Domain Enums

### user_status
**Definition:** `pgEnum("user_status", [...])`

**Values:**
- `pending` - User registration pending verification
- `active` - User account active
- `suspended` - User temporarily suspended
- `blocked` - User permanently blocked
- `inactive` - User account inactive (e.g., no login for 6 months)

**Used In:** `users.status` (from users schema)

**Business Rules:**
- Only `active` users can place orders
- `suspended` users cannot log in
- `blocked` users cannot create new accounts

---

### JourneyType
**Definition:** `pgEnum("journey", [...])`

**Values:**
- `basic` - Basic product checkout journey
- `productBased` - Product-specific journey (pre-selected product)
- `variantBased` - Variant-specific journey (pre-selected variant)

**Used In:** `qrTable.journeyType`

**Business Rules:**
- `basic` QR codes redirect to general catalog
- `productBased` QR codes link to specific product page
- `variantBased` QR codes link to specific variant with add-to-cart

---

## Shared Enums (Not Merchant-Specific)

The following enums are defined in `src/db/schema/enums.ts` but are not directly used in merchant schema tables:

### LOS (Loan Origination System) Enums

#### loan_application_status
- `draft`, `submitted`, `under_review`, `kyc_pending`, `credit_pending`, `approved`, `rejected`, `disbursed`, `cancelled`

#### loan_status
- `active`, `fully_paid`, `foreclosed`, `defaulted`, `closed`

#### emi_status
- `scheduled`, `paid`, `partially_paid`, `overdue`, `waived`

#### document_type
- `aadhaar`, `pan`, `bank_statement`, `mutual_fund_statement`, `income_proof`, `agreement`, `kyc`

#### document_status
- `pending`, `uploaded`, `verified`, `rejected`

#### mutual_fund_type
- `equity`, `debt`, `hybrid`, `etf`

#### approval_status
- `pending`, `approved`, `rejected`, `conditional`

#### disbursement_status
- `pending`, `initiated`, `completed`, `failed`, `reversed`

### Interest Accrual Enums

#### accrual_status
- `pending`, `completed`, `failed`, `partial`

### Fees and Charges Enums

#### fee_type
- `processing`, `prepayment`, `foreclosure`, `bounce`, `legal`, `inspection`, `other`

#### fee_calculation_method
- `flat_amount`, `percentage_of_loan`, `percentage_of_outstanding`, `percentage_of_emi`, `tiered`

#### fee_status
- `applicable`, `applied`, `partially_paid`, `paid`, `waived`, `written_off`

### Collection and Recovery Enums

#### collection_activity_type
- `call`, `visit`, `email`, `sms`, `whatsapp`, `legal_notice`, `court_filing`, `other`

#### collection_outcome
- `promised_to_pay`, `paid`, `refused_to_pay`, `wrong_number`, `not_reachable`, `payment_arrangement`, `legal_action_initiated`

#### proceeding_type
- `legal_notice`, `civil_suite`, `criminal_case`, `sarfaesi`, `debt_recovery_tribunal`, `arbitration`

#### proceeding_stage
- `initiated`, `under_review`, `hearing_scheduled`, `judgment_awaited`, `judgment_in_favor`, `judgment_against`, `settled`, `closed`

### NPA (Non-Performing Assets) Enums

#### npa_category
- `standard`, `sub_standard`, `doubtful_1`, `doubtful_2`, `doubtful_3`, `loss`

### Loan Modifications Enums

#### restructuring_type
- `tenure_extension`, `interest_rate_reduction`, `moratorium`, `rescheduling`, `restructuring_and_rehabilitation`, `one_time_settlement`

#### restructuring_status
- `requested`, `under_review`, `approved`, `rejected`, `implemented`, `cancelled`

#### adjustment_reason
- `rate_revision`, `restructuring`, `regulatory_change`, `customer_request`, `error_correction`

---

## Enum Usage Summary

### High-Frequency Enums (used in orders, analytics)
- `order_status` - Critical for order lifecycle
- `payment_status` - Payment tracking
- `channel_type` - Channel analytics
- `fulfillment_type` - Fulfillment operations

### Financial Enums
- `settlement_status` - Settlement processing
- `merchant_status` - Merchant operations

### Configuration Enums
- `store_type` - Store classification
- `analytics_period` - Reporting periods
- `JourneyType` - QR code behavior

### Rarely Changed Enums
- Most enum values are stable
- Adding new values requires database migration
- Removing values should be avoided (use soft deprecation)
