# A2A Deal Engine
## Product & Technical Specification

> **Working principle:** Agents communicate. The decision engine evaluates. Humans retain authority. Razorpay executes.

**Version:** 1.0  
**Status:** MVP blueprint  
**Initial vertical:** Industrial MRO / spare-parts procurement  
**Deployment:** Vercel  
**Repository:** GitHub

---

## 1. Executive Summary

A2A Deal Engine is a commercial decision backend for **agent-to-agent commerce**.

A buyer describes a requirement in natural language. A Buyer Agent converts it into structured requirements and interacts with Seller Agents. The system does **not** let an LLM invent prices or make unconstrained commitments.

Instead, a deterministic decision layer evaluates:

- economics
- quantity
- delivery
- inventory
- payment terms
- supplier reliability
- product substitutions
- contract duration
- risk
- negotiation authority

The engine explores feasible combinations, negotiates within explicit boundaries, ranks the resulting deals, and explains the trade-offs to a human.

The objective is not:

> “Get the lowest possible price.”

The objective is:

> **Find the strongest mutually acceptable commercial outcome.**

---

# 2. Why This Product Exists

Traditional procurement often looks like:

```text
Requirement
    │
    ▼
Find suppliers
    │
    ▼
Ask for quotes
    │
    ▼
Compare spreadsheets / messages
    │
    ▼
Call / WhatsApp suppliers
    │
    ▼
Negotiate
    │
    ▼
Compare again
    │
    ▼
Get approval
    │
    ▼
Create PO / agreement
    │
    ▼
Pay
```

The problem is not simply “negotiation takes time.”

The harder problem is that humans rarely explore the full commercial search space.

A ₹1,000 lower unit price may be worse if it requires:

- excessive quantity
- slower delivery
- expensive logistics
- unreliable supplier
- poor warranty
- additional coordination
- unnecessary inventory

A good deal is therefore a **multi-variable optimization problem**.

---

# 3. Product Thesis

### The wrong product

```text
Buyer
  │
  ▼
LLM
  │
  ▼
"Try asking for a lower price."
```

### Our product

```text
                  BUYER
                    │
                    ▼
              Buyer Agent
                    │
                    ▼
             Intent Parser
                    │
                    ▼
        ┌──────────────────────┐
        │   DECISION ENGINE    │
        │                      │
        │ Economics            │
        │ Constraints          │
        │ Utility              │
        │ Reservation Value    │
        │ Concessions          │
        │ Optimization         │
        │ Risk                 │
        └──────────┬───────────┘
                   │
             Negotiation
                   │
          ┌────────┴────────┐
          ▼                 ▼
    Seller Agent A     Seller Agent B
          │                 │
          └────────┬────────┘
                   ▼
             Deal Options
                   │
                   ▼
             Human Review
                   │
                   ▼
                Contract
                   │
                   ▼
             Razorpay Pay
```

**The LLM is an interface and reasoning assistant. It is not the financial authority.**

---

# 4. Product Scope

## In Scope

- Buyer Agent
- Seller Agent
- universal commercial decision engine
- industry-specific policy layer
- single-product negotiation
- multi-product basket optimization
- multi-supplier optimization
- conditional concessions
- deal recommendations
- what-if analysis
- human approvals
- negotiation history
- audit trail
- automated contract generation
- Razorpay payment initiation
- synthetic supplier environment for MVP

## Out of Scope for MVP

- global live supplier marketplace
- 15 fully implemented industries
- custom-trained foundation model
- autonomous unrestricted real-money spending
- full ERP replacement
- legal e-signature infrastructure
- advanced voice before the text workflow is reliable

---

# 5. Design Principles

### 1. Facts ≠ Preferences ≠ Authority

A system must distinguish:

| Type | Example |
|---|---|
| Fact | Supplier has 800 units |
| Preference | Buyer prefers delivery within 3 days |
| Constraint | Buyer cannot spend over ₹1.5L |
| Authority | Agent may negotiate up to ₹1.4L without approval |

### 2. Unknown ≠ Allowed

If the engine does not know whether a condition is permitted, it must not assume permission.

### 3. Every concession needs an economic reason

A discount should normally be exchanged for value.

### 4. Lowest price ≠ best deal

Total economic value matters.

### 5. AI recommends before it autonomously commits

Autonomy is configurable.

### 6. Every financial decision must be explainable

A user should be able to ask:

> Why did the system recommend this?

and receive a calculation-backed answer.

---

# 6. System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                         USERS                            │
│                                                          │
│     Buyer / Procurement Manager      Supplier Manager   │
└──────────────────────┬───────────────────┬─────────────┘
                       │                   │
                       ▼                   ▼
                ┌────────────┐      ┌────────────┐
                │Buyer Agent │      │Seller Agent│
                └─────┬──────┘      └──────┬─────┘
                      │                    │
                      └─────────┬──────────┘
                                ▼
                    ┌─────────────────────┐
                    │  NEGOTIATION API    │
                    └──────────┬──────────┘
                               ▼
                 ┌────────────────────────────┐
                 │     DECISION ENGINE        │
                 │                            │
                 │ Requirement Interpretation │
                 │ Economics                  │
                 │ Constraints                │
                 │ Utility                    │
                 │ Reservation Value          │
                 │ Concessions                │
                 │ Deal Optimization          │
                 │ Risk                       │
                 │ Approval                   │
                 │ Stopping Rules             │
                 └────────────┬───────────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        Industry Rules    Agent Memory     Deal History
              │
              ▼
       ┌────────────────┐
       │ Human Approval │
       └───────┬────────┘
               ▼
       ┌────────────────┐
       │ Contract Engine│
       └───────┬────────┘
               ▼
       ┌────────────────┐
       │ Razorpay Layer │
       └────────────────┘
```

---

# 7. Component Responsibilities

## Buyer Agent

The Buyer Agent:

1. understands the request
2. extracts structured constraints
3. asks for missing information
4. discovers eligible suppliers
5. evaluates offers
6. negotiates
7. requests alternatives
8. explains options
9. requests human approval when required

It must not reveal the buyer's private constraints unnecessarily.

---

## Seller Agent

The Seller Agent:

1. understands the buyer requirement
2. retrieves catalog/inventory information
3. calculates commercially valid offers
4. negotiates within authority
5. evaluates give-get exchanges
6. protects minimum economics
7. escalates unusual requests
8. prepares the final commercial terms

It must not reveal private supplier economics such as product cost unless explicitly permitted.

---

# 8. Universal Buyer Parameters

## Financial

```text
maximum_total_budget
target_total_budget
maximum_unit_price
maximum_financing_cost
acceptable_payment_terms
```

## Quantity

```text
required_quantity
minimum_quantity
preferred_quantity
maximum_quantity
```

## Product

```text
required_specification
preferred_brand
acceptable_brands
acceptable_substitutes
minimum_quality
required_certifications
required_warranty
```

## Time

```text
required_delivery_date
latest_acceptable_delivery_date
urgency_level
```

## Supplier

```text
minimum_reliability
minimum_supplier_score
preferred_suppliers
blocked_suppliers
geographic_constraints
```

## Preference Weights

```text
price_weight
delivery_weight
quality_weight
reliability_weight
payment_weight
warranty_weight
```

All active weights should sum to `1.0`.

---

# 9. Universal Seller Parameters

## Economics

```text
base_price
product_cost
operating_cost
logistics_cost
payment_cost
target_margin
minimum_margin
minimum_profitable_order
```

## Inventory

```text
current_inventory
available_inventory
reserved_inventory
replenishment_time
inventory_pressure
```

## Commercial

```text
minimum_order_quantity
volume_discount_rules
maximum_discount
payment_terms
delivery_terms
```

## Customer

```text
customer_type
customer_history
customer_payment_reliability
repeat_purchase_probability
customer_acquisition_value
```

## Strategy

```text
inventory_clearance_priority
cashflow_priority
customer_acquisition_priority
capacity_utilization_priority
```

---

# 10. The Four-Layer Policy Model

Every negotiation should operate on four layers:

```text
                 MERCHANT / BUYER POLICY
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
             FACTS    PREFERENCES   AUTHORITY
              │           │           │
              └───────────┼───────────┘
                          ▼
                    DECISION ENGINE
                          │
                          ▼
                     VALID DEALS
```

### Facts

Current state of the world.

### Preferences

What produces more value.

### Constraints

What is unacceptable.

### Authority

What the agent can commit without human approval.

This separation prevents an LLM from turning a preference into a hard constraint or a suggestion into authorization.

---

# 11. Economic Engine

## Seller Gross Revenue

```text
gross_revenue = unit_price × quantity
```

## Seller Total Cost

```text
total_cost =
    product_cost
  + operating_cost
  + logistics_cost
  + payment_cost
  + additional_fulfillment_cost
```

## Seller Gross Profit

```text
gross_profit = gross_revenue - total_cost
```

## Seller Gross Margin

```text
gross_margin = gross_profit / gross_revenue
```

The engine must validate the result against the seller's minimum margin.

---

# 12. Buyer Total Landed Cost

```text
buyer_total_cost =
    product_price
  + shipping
  + taxes
  + installation
  + financing_cost
  + expected_delay_cost
  + expected_failure_cost
```

Only applicable components are included.

This prevents the engine from selecting a supplier purely because its listed unit price is lower.

---

# 13. Reservation Value

Reservation value is the economic boundary beyond which a party should not accept the deal.

## Seller

A seller's reservation value is influenced by:

```text
cost
+ minimum profit requirement
+ fulfillment burden
+ risk
- inventory value
- cashflow benefit
- customer value
```

It may therefore change with deal conditions.

Example:

```text
100 units + 30-day payment
→ minimum acceptable price: ₹55

500 units + upfront payment
→ minimum acceptable price: ₹51

1,000 units + 12-month commitment
→ minimum acceptable price: ₹48
```

The "floor" is therefore **conditional**, not necessarily a single static number.

---

# 14. Utility Model

## Buyer Utility

A simplified normalized model:

```text
buyer_utility =
    price_score       × price_weight
  + delivery_score    × delivery_weight
  + quality_score     × quality_weight
  + reliability_score × reliability_weight
  + payment_score     × payment_weight
  + warranty_score    × warranty_weight
```

Each component is normalized to `[0,1]`.

---

## Seller Utility

```text
seller_utility =
    profit_score
  + volume_value
  + cashflow_value
  + inventory_value
  + customer_value
  - risk_cost
  - concession_cost
```

Weights should be configurable rather than hidden.

---

# 15. Concession Engine

## Core rule

> **Give → Get**

A meaningful concession should normally produce a measurable return.

Examples:

| Seller gives | Seller receives |
|---|---|
| Lower price | Higher quantity |
| Lower price | Upfront payment |
| Lower price | Longer contract |
| Lower price | Flexible delivery |
| Faster delivery | Higher price |
| Lower MOQ | Higher unit price |
| Free delivery | Larger order |
| Customization | Additional charge |

The engine evaluates whether the value received justifies the value given.

---

# 16. Concession Value

For each proposed concession:

```text
concession_cost =
    economic_value_given
```

```text
concession_benefit =
    economic_value_received
```

A configurable safety factor can be used:

```text
benefit >= cost × safety_factor
```

Example:

```text
safety_factor = 1.10
```

This means the system prefers concessions where the expected value received exceeds the value given by at least 10%.

---

# 17. Deal Space

Instead of negotiating only through sequential price reductions, the engine creates a bounded set of commercially feasible combinations.

Example dimensions:

```text
Price:
₹50, ₹52, ₹54, ₹56, ₹58, ₹60

Quantity:
100, 150, 200, 300

Payment:
Upfront, 15 days, 30 days

Delivery:
3, 5, 7 days

Contract:
1 month, 6 months, 12 months
```

Invalid combinations are eliminated before ranking.

This converts negotiation from:

> "What should the LLM say next?"

into:

> **"Which feasible deal should the agent propose next?"**

---

# 18. Pareto-Efficient Deals

A deal is dominated when another feasible deal makes one side better off without making the other side worse off.

Dominated options should be removed.

The remaining options form the **negotiation frontier**.

Example:

```text
                    Seller Utility
                         ▲
                         │       ● A
                         │    ●
                         │  ● B
                         │ ●
                         └──────────────────► Buyer Utility
```

The system can show the human the meaningful frontier rather than dozens of weak offers.

---

# 19. Deal Recommendations

The engine should return multiple meaningful choices.

### Best for Buyer

Highest buyer utility.

### Best for Seller

Highest seller utility.

### Best Balanced

Strong utility for both parties.

### Lowest Risk

Lowest operational / fulfillment risk.

### Best Long-Term

Best expected value where repeat purchases or contracts matter.

Example:

```text
BEST PRICE
₹5,31,000

BEST OVERALL
₹5,43,000

FASTEST
₹5,52,000

LOWEST RISK
₹5,49,000

BEST LONG-TERM
₹5,40,000 + 12-month agreement
```

---

# 20. Marginal Improvement

The engine should stop negotiating when the expected improvement becomes too small.

```text
current_deal = ₹55,000
next_deal    = ₹54,900

improvement = ₹100
```

If:

```text
minimum_meaningful_improvement = ₹500
```

the engine can recommend stopping.

This avoids wasting negotiation rounds for insignificant gains.

---

# 21. Negotiation State Machine

```text
                 ┌─────────────┐
                 │ DISCOVERY   │
                 └──────┬──────┘
                        ▼
              ┌──────────────────┐
              │ VALIDATE REQUEST │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ FIND SUPPLIERS   │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ INITIAL OFFERS   │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ COUNTEROFFER     │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ EVALUATE TRADE   │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ OPTIMIZE DEAL    │
              └────────┬─────────┘
                       ▼
                ┌──────┴──────┐
                │             │
                ▼             ▼
             AGREEMENT      NO DEAL
                │
                ▼
         HUMAN APPROVAL
                │
                ▼
            CONTRACT
                │
                ▼
             PAYMENT
```

---

# 22. Negotiation Stopping Rules

Stop when any of the following occurs:

1. both parties accept
2. no feasible improvement exists
3. reservation value is crossed
4. maximum rounds are reached
5. required information is missing
6. a policy violation occurs
7. human approval is required
8. marginal improvement falls below threshold
9. supplier becomes unavailable
10. offer expires

The system must never negotiate indefinitely.

---

# 23. Multi-Product Basket Engine

A basket is not simply a collection of independent negotiations.

The engine must consider cross-product relationships.

Example:

```text
Bearings    40 units
Belts       20 units
Seals       100 units
Lubricant   50 units
```

Supplier A may be cheapest for bearings.

Supplier B may be cheapest for seals.

But one supplier may offer a basket discount.

Therefore:

```text
Basket Value =
    product prices
  + logistics
  + payment cost
  + coordination cost
  + delivery compatibility
  + supplier risk
```

---

# 24. Multi-Supplier Optimization

The system should evaluate:

### Option A — Single Supplier

Lowest operational complexity.

### Option B — Two Suppliers

Potentially lower cost.

### Option C — Multiple Suppliers

Potentially maximum savings but greater coordination and delivery risk.

Example:

```text
OPTION A
1 supplier
₹5.78L
4 days
Low coordination risk

OPTION B
2 suppliers
₹5.54L
5 days
Medium coordination risk

OPTION C
3 suppliers
₹5.47L
7 days
High coordination risk
```

The recommendation should consider the trade-off rather than automatically selecting Option C.

---

# 25. What-If Engine

Users should be able to modify assumptions without restarting the negotiation.

Examples:

> What if I increase quantity?

> What if I increase my budget?

> What if delivery can take two additional days?

> What if I accept an equivalent product?

> What if I pay upfront?

> What if I sign a 12-month contract?

The engine recalculates the feasible deal space.

---

# 26. What-If Example

Current:

```text
Budget: ₹5,00,000
Quantity: 100
Delivery: 5 days
```

User asks:

> What if I increase quantity to 150?

Engine:

```text
Current:
100 × ₹5,000 = ₹5,00,000

Alternative:
150 × ₹4,650 = ₹6,97,500

Unit saving:
₹350

Additional spend:
₹1,97,500
```

Recommendation:

> The unit price improves, but the additional inventory cost does not justify the purchase unless expected future demand supports the additional 50 units.

The system explains the trade-off instead of blindly celebrating the lower unit price.

---

# 27. Human Decision Layer

The user should see the result first and the agent conversation second.

Example:

```text
┌─────────────────────────────────────────┐
│            RECOMMENDED DEAL             │
├─────────────────────────────────────────┤
│ Total                 ₹5,43,000         │
│ Potential saving      ₹17,000           │
│ Delivery              4 days            │
│ Supplier reliability  93%               │
│ Condition              +50 units        │
├─────────────────────────────────────────┤
│ WHY?                                    │
│ Additional quantity unlocks a volume   │
│ tier while keeping seller margin above │
│ its minimum threshold.                 │
├─────────────────────────────────────────┤
│ [ APPROVE ] [ NEGOTIATE ] [ MODIFY ]   │
└─────────────────────────────────────────┘
```

---

# 28. Agent Work History

The buyer should be able to inspect what the agent did.

Example:

```text
14:03  Requirement received
14:03  Parsed 4 product constraints
14:04  Found 8 eligible suppliers
14:04  Removed 3 suppliers due to delivery
14:05  Requested quotes from 5 suppliers
14:06  Supplier B offered ₹58,000
14:07  Counteroffer sent
14:08  Supplier B requested higher MOQ
14:08  Economic value calculated
14:09  Alternative generated
14:10  Human approval requested
```

This creates transparency without forcing the user to read every message.

---

# 29. Seller Decision Screen

The seller sees:

```text
INCOMING REQUIREMENT
100 units

CURRENT OFFER
₹58,000

RECOMMENDED COUNTER
₹55,000

EXPECTED MARGIN
14.2%

BUYER TRADE
+20% quantity

EXPECTED BENEFIT
₹X

[APPROVE]
[MODIFY]
[LET AI CONTINUE]
```

The seller should be able to override or modify the agent.

---

# 30. Autonomy Levels

### Level 1 — Recommend

AI negotiates in the background but cannot commit.

### Level 2 — Bounded Negotiation

AI can negotiate and accept deals inside explicitly defined authority.

### Level 3 — Autonomous Execution

AI can negotiate, accept, generate contract and initiate payment within predefined limits.

Default MVP mode:

> **Level 1**

---

# 31. Human Escalation

Escalate if:

- spending authority is exceeded
- minimum margin would be violated
- unknown cost appears
- product substitution is uncertain
- contract duration changes materially
- payment terms move outside policy
- legal/commercial terms change
- required data is missing
- unusual condition appears

Escalation is a designed feature, not an error state.

---

# 32. Handling New / Unseen Requests

Example:

> "Give me the same price but I'll arrange pickup."

LLM interpretation:

```text
delivery_responsibility = buyer
```

Decision Engine checks:

```text
Is buyer pickup allowed?
Is pickup location known?
Does removing delivery reduce seller cost?
Does the resulting deal remain valid?
```

If yes:

→ calculate.

If no:

→ reject.

If unknown:

→ human clarification.

Never invent missing values.

---

# 33. Information Boundaries

The buyer agent may know:

```text
buyer budget
buyer preferences
buyer deadlines
```

The seller agent may know:

```text
seller cost
seller minimum margin
seller inventory
seller capacity
```

Private information should not automatically cross the negotiation boundary.

Example:

The seller should not receive:

> "Buyer can pay up to ₹60,000"

unless the buyer explicitly permits disclosure.

Likewise, the buyer should not receive:

> "Seller's product cost is ₹1,120"

unless the seller permits it.

---

# 34. Industry Layer

The universal engine remains unchanged.

An industry pack adds:

```text
Industry Facts
+
Industry Constraints
+
Industry Substitution Rules
+
Industry Risk Rules
+
Industry Utility Factors
```

Architecture:

```text
              UNIVERSAL ENGINE
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      MRO          HOTEL        TRAVEL
       │
       ▼
Industry-specific
rules + parameters
```

The MVP implements only one industry deeply.

---

# 35. Initial Industry: Industrial MRO

MRO = Maintenance, Repair and Operations.

Typical requirements include:

- bearings
- belts
- seals
- motors
- electrical components
- tools
- lubricants
- safety equipment

MRO is suitable because procurement can involve:

- repeated purchases
- large SKU counts
- technical specifications
- equivalent components
- urgent replacement
- quantity discounts
- delivery constraints
- supplier reliability
- manual quote comparison

---

# 36. MRO Parameters

```text
part_number
technical_specification
brand
acceptable_equivalent
certification
MOQ
quantity
lead_time
urgency
warranty
supplier_reliability
historical_price
historical_delivery
failure_rate
inventory
replacement_criticality
```

---

# 37. MRO-Specific Rules

### Critical part

If replacement criticality is high:

```text
delivery_weight ↑
supplier_reliability_weight ↑
price_weight ↓
```

### Equivalent component

Allow substitution only when structured specifications satisfy required compatibility.

### Emergency order

Fast delivery can justify higher price.

### Bulk order

Volume tiers become more important.

### Repeat requirement

Contract duration and recurring quantity become negotiation variables.

---

# 38. Product Substitution

The LLM may identify candidate equivalents.

The decision layer validates them.

Example:

```text
Required:
6205 bearing

Candidate:
6205-2RS

Validation:
Inner diameter ✓
Outer diameter ✓
Width ✓
Load rating ✓
Required certification ✓
```

Only then is the substitute allowed.

If technical equivalence cannot be established:

> Human review required.

---

# 39. Supplier History

Store structured history:

```text
average_price
price_volatility
average_delivery_days
delivery_variance
acceptance_rate
average_negotiated_discount
quality_score
failure_rate
repeat_order_rate
```

Future negotiations can use historical evidence.

---

# 40. Learning Strategy

Do not train a custom LLM for the MVP.

Use:

### LLM

For:

- natural language understanding
- intent extraction
- offer interpretation
- conversation
- explanation

### Deterministic Engine

For:

- calculations
- policy
- constraints
- utility
- reservation value
- deal generation
- optimization
- approvals

### Historical Data

Later used for:

- acceptance probability
- supplier behavior prediction
- likely concession prediction
- better initial offers

---

# 41. Contract Engine

After agreement:

```text
Negotiation
    │
    ▼
Deal Validation
    │
    ▼
Both Parties Approve
    │
    ▼
Generate Contract
    │
    ▼
Freeze Negotiated Terms
    │
    ▼
Payment
```

Contract fields:

```text
buyer
seller
products
quantities
unit_prices
taxes
total_value
delivery_terms
payment_terms
warranty
cancellation_terms
contract_duration
special_conditions
negotiated_concessions
approval_history
agreement_timestamp
```

---

# 42. Project / Recurring Contracts

Contract duration is optional.

Possible modes:

```text
one_time
project_duration
monthly
quarterly
6_month
12_month
custom
```

Recurring contracts may contain:

```text
monthly_quantity
agreed_unit_price
price_review_period
delivery_SLA
payment_terms
renewal_terms
termination_terms
```

The engine can determine whether longer commitment justifies a concession.

---

# 43. Deal Lifecycle

```text
DRAFT
  ↓
DISCOVERING
  ↓
NEGOTIATING
  ↓
PENDING_APPROVAL
  ↓
AGREED
  ↓
CONTRACT_GENERATED
  ↓
PAYMENT_PENDING
  ↓
PAID
```

Alternative terminal states:

```text
REJECTED
EXPIRED
CANCELLED
FAILED
ESCALATED
```

---

# 44. Audit Trail

Every financially relevant event must store:

```text
timestamp
actor
action
input
output
rule_triggered
decision
approval
```

The user should be able to trace:

> Why did this price change?

> Why was this supplier rejected?

> Why did the agent stop?

> Why did the system require approval?

---

# 45. Validation Status

Do not show meaningless "99% AI confidence."

Instead show actual validation:

```text
PRICE              ✓
MARGIN             ✓
INVENTORY          ✓
DELIVERY           ✓
POLICY             ✓
SUBSTITUTION       ⚠ REVIEW
AUTHORITY          ✓
```

A deal is executable only when all mandatory validations pass.

Target:

> **99% policy-compliance on deterministic decision paths.**

---

# 46. Voice Interface

Voice is an interface, not a separate negotiation system.

```text
Voice
  │
  ▼
Speech-to-Text
  │
  ▼
Buyer / Seller Agent
  │
  ▼
Structured Intent
  │
  ▼
Decision Engine
  │
  ▼
Agent Response
  │
  ▼
Text-to-Speech
```

The exact same policies and calculations must apply to voice and text.

Voice should be added after the text workflow is reliable.

---

# 47. API Architecture

Suggested endpoints:

```text
POST /api/requirements
POST /api/suppliers/search
POST /api/negotiations
POST /api/negotiations/:id/message
POST /api/negotiations/:id/counter
GET  /api/negotiations/:id
GET  /api/negotiations/:id/history

POST /api/deals/optimize
POST /api/deals/what-if
POST /api/deals/approve

POST /api/contracts
POST /api/payments

GET  /api/audit/:dealId
```

---

# 48. Core Data Model

```text
User
Organization
BuyerProfile
SellerProfile

Product
ProductSpecification
Supplier
Inventory

Requirement
Offer
CounterOffer
Negotiation
NegotiationRound

Deal
DealOption

Policy
Approval
Contract
Payment

SupplierHistory
AuditEvent
```

Relationship overview:

```text
Organization
 ├── BuyerProfile
 ├── SellerProfile
 ├── Products
 ├── Suppliers
 └── Policies

Requirement
 └── Negotiation
      ├── Offers
      ├── CounterOffers
      ├── DealOptions
      └── AuditEvents

Negotiation
 └── Deal
      ├── Contract
      └── Payment
```

---

# 49. Example Seller Policy

```json
{
  "base_price": 1500,
  "product_cost": 1120,
  "target_margin": 0.18,
  "minimum_margin": 0.12,
  "maximum_discount": 0.08,
  "minimum_order_quantity": 50,
  "payment_terms": ["upfront", "15_days"],
  "maximum_negotiation_rounds": 6,
  "human_approval_required_above": 500000
}
```

---

# 50. Example Buyer Policy

```json
{
  "maximum_budget": 60000,
  "target_budget": 54000,
  "minimum_quality": 0.90,
  "required_delivery_days": 3,
  "maximum_delivery_days": 5,
  "substitution_allowed": true,
  "weights": {
    "price": 0.40,
    "delivery": 0.25,
    "quality": 0.20,
    "reliability": 0.15
  }
}
```

---

# 51. Example Deal Option

```json
{
  "supplier_id": "supplier-b",
  "items": [],
  "total_price": 543000,
  "delivery_days": 4,
  "payment_terms": "upfront",
  "buyer_utility": 0.91,
  "seller_utility": 0.84,
  "risk_score": 0.12,
  "conditions": [
    "quantity >= 150"
  ]
}
```

---

# 52. Security Rules

The MVP must:

- keep buyer private constraints private
- keep seller private economics private
- validate every financial action
- prevent agents from modifying policy boundaries
- require authorization before payment
- preserve audit history
- reject unknown commercial conditions
- avoid sending sensitive policy data to external models unnecessarily

---

# 53. Buyer UX

## Screen 1 — Requirement

```text
Product / Specification
Quantity
Budget
Delivery
Quality
Substitution
Preferences
```

Optional:

> Let AI determine the best trade-offs.

---

## Screen 2 — Supplier Discovery

```text
Suppliers found
Eligible suppliers
Excluded suppliers
Reason for exclusion
```

---

## Screen 3 — Deal Room

Primary information:

```text
Best current deal
Potential savings
Delivery
Supplier reliability
Conditions
Alternatives
```

Conversation is secondary.

---

## Screen 4 — Recommendations

```text
Best Price
Best Overall
Fastest
Lowest Risk
Best Long-Term
```

---

## Screen 5 — Agent Activity

Timeline of meaningful agent actions.

---

## Screen 6 — What-If

Sliders / inputs:

```text
Budget
Quantity
Delivery
Payment
Quality
Contract duration
```

---

## Screen 7 — Contract

Readable agreement with negotiated terms.

---

## Screen 8 — Payment

Razorpay payment flow.

---

# 54. Seller UX

Seller dashboard:

```text
Incoming Requirements
Active Negotiations
Recommended Offers
Potential Profit
Inventory Impact
Pending Approvals
Completed Deals
```

Seller negotiation screen:

```text
Buyer Requirement
Current Offer
Recommended Counteroffer
Expected Margin
Expected Benefit
Buyer Trade
Risk

[Approve]
[Modify]
[Reject]
[Let AI Continue]
```

---

# 55. The Most Important UX Screen: Decision Explanation

Every recommendation should answer four questions:

### What?

> Recommended deal: ₹5,43,000

### Why?

> Higher quantity unlocks the supplier's volume tier.

### Impact?

> Saves ₹17,000 while adding 1 day of delivery.

### Condition?

> Quantity must increase by 50 units.

Then:

```text
[APPROVE]
[NEGOTIATE FURTHER]
[MODIFY]
[REJECT]
```

---

# 56. What the System Should Never Do

```text
❌ Invent a discount
❌ Ignore seller minimum margin
❌ Expose buyer maximum budget
❌ Expose seller product cost
❌ Assume unknown conditions are allowed
❌ Continue negotiation forever
❌ Choose lowest unit price blindly
❌ Treat an LLM response as authorization
❌ Execute payment without approval policy
❌ Claim arbitrary model confidence
```

---

# 57. Demo Scenario

## Requirement

> "I need 100 industrial bearings meeting specification X within five days."

Buyer:

```text
Budget: ₹1,50,000
Quantity: 100
Delivery: ≤ 5 days
Warranty: Required
Equivalent: Allowed
```

Suppliers:

### Supplier A

```text
₹1,550/unit
3-day delivery
```

### Supplier B

```text
₹1,480/unit
5-day delivery
```

### Supplier C

```text
₹1,600/unit
2-day delivery
```

The agents negotiate within their policies.

Supplier B may offer:

```text
₹1,430/unit
if quantity >= 120
```

The system evaluates:

- additional inventory
- unit price saving
- total spend
- delivery
- buyer utility
- seller margin

It does not automatically recommend the larger order simply because the unit price is lower.

---

# 58. Demo Flow

```text
USER
"I need 100 bearings in 5 days."
        │
        ▼
BUYER AGENT
Extracts requirements
        │
        ▼
SUPPLIER DISCOVERY
Finds 3 eligible suppliers
        │
        ▼
SELLER AGENTS
Return offers
        │
        ▼
NEGOTIATION ENGINE
Tests feasible concessions
        │
        ▼
DEAL OPTIMIZER
Finds 4 meaningful options
        │
        ▼
BUYER DASHBOARD
Shows:
Best price
Best overall
Fastest
Lowest risk
        │
        ▼
WHAT-IF
"What if I buy 150?"
        │
        ▼
RECALCULATE
        │
        ▼
HUMAN APPROVES
        │
        ▼
CONTRACT GENERATED
        │
        ▼
RAZORPAY PAYMENT
        │
        ▼
DEAL SECURED
```

---

# 59. Evaluation Framework

## Financial

- buyer savings
- seller profit
- seller margin preservation
- total transaction value

## Negotiation

- average negotiation rounds
- concession efficiency
- agreement rate
- mutually beneficial deal rate

## Optimization

- buyer utility
- seller utility
- Pareto efficiency
- basket savings

## Reliability

- policy violations
- unauthorized commitments
- invalid offers
- incorrect calculations
- invalid substitutions

## Human

- approval rate
- override rate
- time saved
- recommendation acceptance

---

# 60. Technical Evaluation

The system should be tested with synthetic scenarios.

### Test categories

1. straightforward agreement
2. buyer below seller floor
3. seller cannot meet quantity
4. delivery conflict
5. payment-term trade
6. volume discount
7. basket discount
8. substitute product
9. supplier failure
10. unknown commercial condition
11. human approval threshold
12. no-deal scenario

For each scenario, expected outputs should be predetermined.

---

# 61. MVP Build Order

## Phase 1 — Decision Core

Build first:

```text
Policy schemas
Economic calculator
Reservation value
Utility functions
Constraint validator
Concession engine
Deal generator
Deal scorer
Stopping rules
```

## Phase 2 — Agents

Then:

```text
Buyer Agent
Seller Agent
Negotiation orchestration
```

## Phase 3 — Product

Then:

```text
Dashboard
Deal Room
What-If
Activity history
Approval
```

## Phase 4 — Transaction

Then:

```text
Contract
Razorpay test payment
Audit
```

## Phase 5 — Polish

Only after the core works:

```text
Voice
Animations
Advanced analytics
```

---

# 62. Synthetic Data Strategy

The MVP should use a controlled supplier dataset.

Each supplier should have:

```text
catalog
inventory
cost
base price
margin
delivery capacity
location
payment terms
discount rules
supplier reliability
negotiation authority
```

Use at least:

```text
10 suppliers
30–50 products
multiple product specifications
multiple price tiers
historical transactions
```

The dataset should deliberately include conflicting supplier strengths.

Example:

```text
Supplier A → cheapest
Supplier B → fastest
Supplier C → highest reliability
Supplier D → strongest bulk discount
Supplier E → best payment terms
```

This forces the engine to make meaningful trade-offs.

---

# 63. Future Learning Layer

Once enough negotiation history exists:

```text
                 HISTORICAL DEALS
                       │
                       ▼
              FEATURE GENERATION
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Acceptance     Concession   Supplier
     Probability    Prediction   Behaviour
          │            │            │
          └────────────┼────────────┘
                       ▼
                DECISION ENGINE
```

ML should improve estimates.

It should not override hard commercial constraints.

---

# 64. Future Industry Expansion

The same engine can eventually support:

- industrial MRO
- wholesale
- hospitality
- travel
- logistics
- professional services
- equipment leasing
- corporate procurement
- event services
- automotive procurement

Each new industry adds a policy pack rather than rebuilding the entire platform.

---

# 65. Final Product Architecture

```text
                         HUMAN
                           │
                 ┌─────────┴─────────┐
                 │                   │
              BUYER              SELLER
                 │                   │
                 ▼                   ▼
            BUYER AGENT         SELLER AGENT
                 │                   │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │  NEGOTIATION API  │
                 └─────────┬─────────┘
                           ▼
        ┌─────────────────────────────────────┐
        │          DECISION ENGINE             │
        │                                      │
        │ Facts                                │
        │ Preferences                          │
        │ Constraints                          │
        │ Authority                            │
        │                                      │
        │ Economics                            │
        │ Reservation Value                    │
        │ Utility                              │
        │ Concessions                          │
        │ Deal Space                           │
        │ Optimization                         │
        │ Risk                                 │
        │ Stopping Rules                       │
        └──────────────────┬──────────────────┘
                           ▼
                 ┌───────────────────┐
                 │ HUMAN DECISION    │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │ CONTRACT ENGINE   │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │ RAZORPAY PAYMENT  │
                 └───────────────────┘
```

---

# 66. Product North Star

The product should not claim:

> "Our AI negotiates better than humans."

The stronger claim is:

> **"Our system explores commercial possibilities that humans would rarely have time to evaluate, while keeping every decision inside explicit economic and operational boundaries."**

The agent is not the product.

The negotiation engine is not the product by itself.

The product is the **combination of structured commercial intelligence, agent communication, optimization, human control and transaction execution.**

---

# 67. Implementation Rule for Antigravity

This document is the source of truth.

Antigravity must:

1. follow the defined data models
2. preserve the separation between LLM and decision logic
3. implement deterministic financial calculations
4. never invent business rules
5. never allow agents to modify policy boundaries
6. expose calculations in the UI
7. log financially relevant actions
8. use mock/synthetic data before live integrations
9. keep Razorpay payment execution behind explicit approval
10. ask for clarification rather than guessing when required information is missing

Do not begin by building a generic chatbot.

Build the **decision engine first**.

---

# 68. One-Sentence Definition

> **A2A Deal Engine is a human-controlled commercial decision system where AI buyer and seller agents negotiate within explicit economic constraints, optimize single products and baskets, explain the best available trade-offs, generate the resulting agreement, and use Razorpay to execute the transaction.**
