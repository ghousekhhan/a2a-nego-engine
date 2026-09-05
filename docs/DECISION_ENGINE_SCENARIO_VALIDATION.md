# Decision Engine Scenario Validation

## Purpose

This document stress-tests the A2A Deal Engine before implementation. Each scenario defines the commercial facts, the expected deterministic engine behavior, and assertions that can become automated tests.

---

## Scenario 01 — Buyer Below Seller Floor

### Inputs
- Quantity: 100 units
- Seller product cost: ₹90/unit
- Seller minimum margin: 10%
- Buyer offer: ₹96/unit

### Calculation
Seller minimum revenue/unit:

`90 / (1 - 0.10) = ₹100`

Buyer offer revenue:

`96 × 100 = ₹9,600`

Seller cost:

`90 × 100 = ₹9,000`

Margin on revenue:

`600 / 9,600 = 6.25%`

### Expected Decision
**REJECT**

### Engine Reason
The offer violates the seller's financial hard constraint.

### Test Assertions
- `offer.valid = false`
- `reason = BELOW_SELLER_FLOOR`
- Engine must not counter at an arbitrary price.
- Engine may generate a counter only if another variable can compensate.

---

## Scenario 02 — Quantity Unlocks a Discount

### Inputs
- Seller cost: ₹90/unit
- Minimum margin: 10%
- Initial offer: ₹110 × 100
- Alternative: ₹105 × 150

### Economics

At 100 units:

`Revenue = ₹11,000`
`Cost = ₹9,000`
`Contribution = ₹2,000`

At 150 units:

`Revenue = ₹15,750`
`Cost = ₹13,500`
`Contribution = ₹2,250`

Buyer pays ₹1,750 more but receives 50 additional units.

### Expected Decision
**RECOMMEND ₹105 × 150**

### Engine Reason
The seller can give ₹5/unit while receiving additional contribution and volume.

### Test Assertions
- Alternative remains above seller floor.
- Additional quantity is acceptable to buyer.
- Recommendation explains the give/get relationship.

---

## Scenario 03 — Cheap but Unreliable Supplier

### Inputs
Supplier A:
- Price: ₹380/unit
- Reliability score: 0.72
- Delivery: 7 days

Supplier B:
- Price: ₹400/unit
- Reliability score: 0.97
- Delivery: 5 days

Buyer:
- Required delivery: ≤ 6 days
- Minimum reliability: 0.90

### Expected Decision
**ELIMINATE Supplier A**

### Engine Reason
Supplier A fails two hard constraints: reliability and delivery.

### Test Assertions
- Supplier A cannot appear in final feasible candidates.
- Supplier B remains feasible.
- Price difference must not override hard constraints.

---

## Scenario 04 — Single Supplier vs Multi-Supplier Basket

### Requirements
- Product A: 500 units
- Product B: 300 units

Supplier 1:
- A = ₹100
- B = ₹170
- Coordination cost = ₹0

Supplier 2:
- A = ₹92
- B unavailable

Supplier 3:
- B = ₹145

### Calculations

Single supplier:

`500×100 + 300×170 = ₹101,000`

Split:

`500×92 + 300×145 = ₹89,500`

Raw saving:

`₹11,500`

Assume split coordination/risk cost = ₹4,000.

Adjusted split cost:

`₹89,500 + ₹4,000 = ₹93,500`

### Expected Decision
**RECOMMEND SPLIT**

Net saving:

`₹101,000 - ₹93,500 = ₹7,500`

### Test Assertions
- Basket optimizer must evaluate supplier combinations.
- Coordination cost must be included.
- Cheapest individual supplier is not automatically the winner.

---

## Scenario 05 — Faster Delivery Has Economic Value

### Inputs
- Supplier standard delivery: 8 days
- Expedited delivery: +₹4,000
- Buyer delay cost if delivered late: ₹10,000
- Probability of delay without expedite: 100% for this scenario

### Calculation

Avoided delay cost:

`₹10,000`

Expedite cost:

`₹4,000`

Net value:

`₹10,000 - ₹4,000 = ₹6,000`

### Expected Decision
**RECOMMEND EXPEDITED DELIVERY**

### Test Assertions
- Delivery must be evaluated economically, not just as a text preference.
- Recommendation must show ₹6,000 net expected value.

---

## Scenario 06 — Upfront Payment for Discount

### Inputs
- Order value: ₹100,000
- Seller offers ₹2,000 discount for payment 30 days earlier
- Buyer cost of capital: 12% annual

### Financing value

`₹100,000 × 0.12 × 30/365 ≈ ₹986`

Discount received:

`₹2,000`

Net buyer benefit:

`₹2,000 - ₹986 = ₹1,014`

### Expected Decision
**RECOMMEND EARLY PAYMENT**

### Test Assertions
- Engine calculates financing cost.
- Discount is not treated as free value.
- Recommendation is accepted because net benefit is positive.

---

## Scenario 07 — Long-Term Contract Unlocks Better Economics

### Inputs
Current:
- 100 units/month
- Price: ₹110

12-month contract:
- 150 units/month commitment
- Price: ₹101
- Seller minimum acceptable price: ₹100

Buyer values flexibility at ₹5/unit equivalent.

### Calculation

Price saving:

`₹110 - ₹101 = ₹9/unit`

Flexibility cost:

`₹5/unit`

Net value:

`₹4/unit`

Monthly net value:

`150 × ₹4 = ₹600`

### Expected Decision
**RECOMMEND 12-MONTH CONTRACT**

### Test Assertions
- Contract duration is treated as an economic variable.
- Buyer flexibility cost is included.
- Seller price must remain above its floor.

---

## Scenario 08 — No Overlap Between Reservation Values

### Buyer
- Maximum price: ₹98/unit

### Seller
- Minimum profitable price: ₹105/unit

### Feasible price interval

`[₹105, ₹98]`

This interval is empty.

### Expected Decision
**NO DEAL**

### Required Output
Generate a **No-Deal Certificate** containing:
- buyer ceiling
- seller floor
- gap: ₹7/unit
- variables that could potentially close the gap:
  - quantity
  - payment timing
  - delivery
  - specification
  - contract duration

### Test Assertions
- Engine must not invent a compromise price.
- LLM cannot override the empty feasible region.

---

## Scenario 09 — Unknown Mandatory Information

### Inputs
Buyer requires:
- Grade X material
- Certification required
- Delivery ≤ 5 days

Seller response:
- Price known
- Quantity known
- Certification status unknown

### Expected Decision
**ESCALATE / REQUEST INFORMATION**

### Reason
Certification is a mandatory constraint and its state is unknown.

### Test Assertions
- Unknown ≠ false.
- Unknown ≠ true.
- Engine cannot rank the candidate as fully feasible.
- Agent should request certification evidence.

---

## Scenario 10 — Seller Excess Inventory

### Inputs
- Seller inventory: 2,000 units
- Normal monthly sales: 400 units
- Buyer asks: 800 units
- Seller normal price: ₹120
- Seller cost: ₹90
- Seller minimum margin: 10%
- Seller inventory pressure: high

Seller floor:

`₹90 / 0.90 = ₹100`

Buyer offers ₹103.

### Economics

Contribution:

`₹103 - ₹90 = ₹13/unit`

Order contribution:

`800 × ₹13 = ₹10,400`

The price is above the seller floor and clears substantial inventory.

### Expected Decision
**ACCEPT / STRONGLY CONSIDER ₹103**

### Test Assertions
- Inventory pressure can change seller utility.
- It must not violate minimum margin.
- Engine should prefer the deal over a ₹120 offer only if strategic utility/risk supports it.

---

## Scenario 11 — Buyer Should Increase Budget to Unlock a Better Deal

### Inputs
- Buyer target budget: ₹380,000
- Buyer maximum budget: ₹410,000
- Supplier offer: ₹420,000
- Supplier can reduce to ₹400,000 if quantity increases
- Buyer can increase budget to ₹400,000

### Expected Recommendation
**WHAT-IF: INCREASE BUDGET BY ₹20,000**

### Engine Explanation
Current gap to feasible supplier offer:

`₹420,000 - ₹380,000 = ₹40,000`

Negotiated feasible outcome:

`₹400,000`

Additional budget required from target:

`₹20,000`

The engine should present this as a recommendation, not execute it.

### Test Assertions
- Target budget and maximum budget are distinct.
- Recommendation must remain inside buyer authority.
- Human approval is required before changing the target.

---

## Scenario 12 — Marginal Improvement Stopping Rule

### Inputs
Current feasible deal:
- Buyer utility: 0.842
- Seller utility: 0.831

Potential next concession:
- Buyer utility: 0.846
- Seller utility: 0.829
- Risk unchanged

Buyer gain:

`+0.004`

Seller loss:

`-0.002`

Assume configured minimum meaningful improvement = `0.01`.

### Expected Decision
**STOP NEGOTIATING**

### Reason
The potential improvement is below the configured materiality threshold.

### Test Assertions
- Engine does not negotiate indefinitely.
- Small utility changes are ignored when below threshold.
- Current deal can be finalized.

---

# Cross-Scenario Rules

The following must hold across every scenario.

## Rule 1 — Hard Constraints Always Win

The engine must reject a candidate that violates:
- financial authority
- mandatory specification
- mandatory certification
- required delivery ceiling
- minimum supplier reliability
- policy/security restrictions

No LLM-generated argument can override these.

## Rule 2 — Unknown Is Not Feasible

If a mandatory fact is unknown, the candidate enters:

`NEEDS_INFORMATION`

not:

`ACCEPT`

## Rule 3 — Private Economics Stay Private

The buyer's:
- maximum budget
- reservation value
- internal utility weights

must not automatically be revealed to the seller.

The seller's:
- product cost
- minimum margin
- reservation value

must not automatically be revealed to the buyer.

Agents negotiate using permitted public/negotiable information.

## Rule 4 — Every Concession Has a Give/Get

Examples:

`Lower price → higher quantity`

`Earlier payment → discount`

`Longer contract → lower unit price`

`Flexible specification → wider supplier set`

`Later delivery → lower price`

The engine should reject unexplained concessions.

## Rule 5 — Human Authority Is Explicit

Possible action states:

`AUTO_ALLOWED`
`REQUIRES_APPROVAL`
`BLOCKED`

A recommendation is not an authorization.

## Rule 6 — Decision Engine Is Deterministic

For identical structured inputs:

`same inputs → same feasible set → same ranking`

LLM wording may differ, but the commercial decision must not.

## Rule 7 — No Arbitrary Fairness Score

The engine should optimize explicit:
- utility
- economics
- risk
- constraints
- operational cost
- strategic objectives

It should not invent a generic "fairness" number.

---

# MVP Automated Test Matrix

| Test | Expected |
|---|---|
| Below seller floor | Reject |
| Above seller floor | Feasible |
| Hard constraint failure | Eliminate |
| Unknown mandatory field | Escalate |
| Quantity concession | Evaluate give/get |
| Payment concession | Calculate financing value |
| Delivery trade-off | Calculate delay/expedite value |
| Long-term contract | Evaluate LTV/flexibility |
| Multiple suppliers | Optimize basket |
| No reservation overlap | No deal |
| Excess inventory | Increase seller utility |
| What-if budget | Recommend, never auto-change authority |
| Tiny utility improvement | Stop |
| Same inputs repeated | Same decision |

# Build Gate

Do not start the agent/UI layer until all 12 scenarios pass.

The implementation should begin with pure deterministic functions:

```text
validateConstraints()
calculateSellerFloor()
calculateBuyerLandedCost()
calculateUtility()
calculateReservationValue()
calculateConcessionValue()
generateCandidates()
findParetoFrontier()
rankDeals()
generateWhatIf()
shouldContinueNegotiation()
```

Then wrap those functions with Buyer Agent and Seller Agent interfaces.

---

# Final Validation Standard

The system is ready for the demo only when it can answer:

**"Why did you recommend this deal?"**

with a traceable chain:

`Facts → Constraints → Economics → Utility → Risk → Alternatives → Recommendation`

and a human can still:

`Approve / Modify / Reject`

the recommendation.
