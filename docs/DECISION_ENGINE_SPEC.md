# A2A Deal Engine
## Decision Engine & Negotiation Mathematics Specification

**Version:** 1.0  
**Status:** MVP implementation specification  
**Depends on:** `PRODUCT_SPEC.md`  
**Purpose:** Define the deterministic commercial brain behind the Buyer Agent and Seller Agent.

---

# 1. Core Rule

The language model is **not the authority for commercial decisions**.

```text
Natural Language
      │
      ▼
Agent / LLM
      │
      │ structured intent
      ▼
┌───────────────────────────────┐
│       DECISION ENGINE         │
│                               │
│ Validate → Calculate → Search │
│ → Score → Compare → Approve   │
└───────────────┬───────────────┘
                │
                ▼
          Agent Response
```

The LLM may propose an action.

The engine decides whether that action is:

- valid
- economically feasible
- policy-compliant
- authorized
- worth pursuing

---

# 2. Decision Engine Inputs

Every decision is based on five categories:

```text
FACTS
  │
  ├── product
  ├── cost
  ├── inventory
  ├── delivery
  └── supplier history

PREFERENCES
  │
  ├── price importance
  ├── delivery importance
  └── quality importance

HARD CONSTRAINTS
  │
  ├── budget ceiling
  ├── minimum margin
  └── required specification

AUTHORITY
  │
  ├── maximum autonomous spend
  ├── maximum discount
  └── approval thresholds

STRATEGIC OBJECTIVES
  │
  ├── inventory clearance
  ├── cash flow
  └── repeat business
```

These categories must remain separate in storage and in calculation.

---

# 3. Hard vs Soft Constraints

This distinction is fundamental.

## Hard Constraint

A deal that violates it is invalid.

Examples:

```text
buyer budget <= ₹100,000
delivery <= 5 days
seller margin >= 10%
quantity <= available inventory
required certification = true
```

Mathematically:

```text
g_i(x) <= 0
```

or:

```text
h_i(x) = required_value
```

If a hard constraint fails:

```text
deal_status = INFEASIBLE
```

No utility score can rescue it.

---

## Soft Constraint

A preference that affects ranking.

Examples:

```text
prefer delivery within 3 days
prefer lower price
prefer supplier with high reliability
prefer longer warranty
```

Soft constraints contribute to utility.

---

# 4. Decision Pipeline

Every candidate deal follows:

```text
                CANDIDATE DEAL
                      │
                      ▼
             HARD CONSTRAINTS
                      │
             ┌────────┴────────┐
             │                 │
          FAIL                PASS
             │                 │
             ▼                 ▼
          REJECT         ECONOMIC CHECK
                               │
                               ▼
                          UTILITY SCORE
                               │
                               ▼
                         RISK ADJUSTMENT
                               │
                               ▼
                         DEAL RANKING
```

Never score an infeasible deal and then allow it to win.

---

# 5. Canonical Deal Representation

Every possible deal should be represented using the same structure.

```json
{
  "quantity": 150,
  "unit_price": 1390,
  "delivery_days": 5,
  "payment_terms": "upfront",
  "contract_months": 6,
  "shipping_cost": 0,
  "product_id": "bearing-6205",
  "supplier_id": "supplier-b",
  "conditions": []
}
```

For a basket:

```json
{
  "items": [
    {
      "product_id": "bearing-6205",
      "quantity": 100,
      "unit_price": 1390
    },
    {
      "product_id": "belt-x",
      "quantity": 50,
      "unit_price": 820
    }
  ],
  "delivery_days": 5,
  "payment_terms": "upfront"
}
```

Every calculation operates on this canonical representation.

---

# 6. Normalization

Different metrics have different units.

Example:

```text
Price       = ₹50,000
Delivery    = 4 days
Reliability = 93%
Quality     = 0.92
```

Before combining them, normalize each to `[0,1]`.

---

## 6.1 Benefit Metric

Higher is better.

```text
score = (x - min) / (max - min)
```

Example:

Reliability:

```text
supplier reliability = 0.93
range = 0.70–1.00

score = (0.93 - 0.70) / (1.00 - 0.70)
      = 0.767
```

---

## 6.2 Cost Metric

Lower is better.

```text
score = (max - x) / (max - min)
```

Price:

```text
price = ₹55,000
range = ₹50,000–₹60,000

score = (60,000 - 55,000) / 10,000
      = 0.50
```

---

## 6.3 Deadline Metric

Use a piecewise function.

If delivery is within preferred date:

```text
score = 1
```

If it reaches the latest acceptable date:

```text
score = 0
```

Between them:

```text
score =
(latest_date - actual_date)
/
(latest_date - preferred_date)
```

Values should be clipped to `[0,1]`.

---

# 7. Buyer Utility

The base buyer utility is:

```text
U_b =
  w_p P
+ w_d D
+ w_q Q
+ w_r R
+ w_t T
+ w_w W
```

Where:

```text
P = price score
D = delivery score
Q = quality score
R = supplier reliability score
T = payment-term score
W = warranty score
```

Weights satisfy:

```text
Σw = 1
```

Example:

```text
price       0.40
delivery    0.25
quality     0.20
reliability 0.15
```

---

# 8. Seller Utility

Seller utility should not simply maximize price.

Use:

```text
U_s =
  w_profit     ProfitScore
+ w_volume     VolumeScore
+ w_cashflow   CashflowScore
+ w_inventory  InventoryScore
+ w_customer   CustomerValueScore
- w_risk       RiskScore
- w_complexity ComplexityScore
```

Weights are seller-specific.

Example:

```text
profit       0.40
cashflow     0.15
inventory    0.20
volume       0.10
customer     0.10
risk         0.05
```

Weights must be normalized.

---

# 9. Seller Profit

For candidate deal `d`:

```text
Revenue(d) =
Σ(quantity_i × unit_price_i)
```

```text
VariableCost(d) =
Σ(quantity_i × product_cost_i)
+ logistics_cost
+ payment_cost
+ fulfillment_cost
```

```text
Profit(d) =
Revenue(d) - VariableCost(d)
```

```text
Margin(d) =
Profit(d) / Revenue(d)
```

Hard seller constraint:

```text
Margin(d) >= minimum_margin
```

---

# 10. Buyer Economic Cost

```text
BuyerCost(d) =
product_cost
+ shipping
+ tax
+ installation
+ financing_cost
+ expected_delay_cost
+ expected_failure_cost
```

Where unavailable components are zero or explicitly marked unknown.

Unknown must not silently become zero when the value is required for a decision.

---

# 11. Reservation Value

Reservation value is the maximum/minimum economically acceptable boundary.

## Buyer

For a simple purchase:

```text
BuyerReservation =
maximum_total_budget
```

For richer decisions, the system can calculate an economic reservation value based on:

```text
budget
+ value_of_faster_delivery
+ value_of_higher_quality
+ avoided_risk
```

However:

> The hard spending ceiling always remains a hard ceiling.

---

## Seller

The seller's minimum acceptable revenue is:

```text
SellerReservation =
TotalCost
+ MinimumRequiredProfit
```

Equivalent margin form:

```text
Revenue × (1 - minimum_margin) >= TotalCost
```

Therefore:

```text
MinimumRevenue =
TotalCost / (1 - minimum_margin)
```

Example:

```text
TotalCost = ₹80,000
MinimumMargin = 10%

MinimumRevenue =
80,000 / 0.90
= ₹88,888.89
```

This is the seller's minimum revenue for the deal.

---

# 12. Conditional Reservation Value

A seller's reservation value can change with conditions.

Example:

```text
Condition A:
100 units + 30-day payment
→ minimum revenue ₹95,000

Condition B:
500 units + upfront payment
→ minimum revenue ₹91,000

Condition C:
1,000 units + 12-month commitment
→ minimum revenue ₹86,000
```

The engine should calculate these dynamically rather than maintaining one universal floor.

---

# 13. Reservation Value Function

Conceptually:

```text
RV_seller =
f(
  quantity,
  payment_terms,
  delivery,
  contract_duration,
  inventory,
  logistics,
  customer_value,
  risk
)
```

The function must be transparent.

For MVP, use deterministic rules.

Later, historical data may estimate individual terms.

---

# 14. Concession Engine

The engine treats a concession as an exchange.

```text
SELLER GIVES
    │
    ▼
Economic Cost
    │
    ▼
SELLER RECEIVES
    │
    ▼
Economic Benefit
```

Example:

Seller reduces:

```text
₹60 → ₹55
```

Buyer increases:

```text
100 → 150 units
```

The engine compares the economic effect of both changes.

---

# 15. Concession Cost

For a price concession:

```text
PriceConcessionCost =
(BasePrice - NewPrice) × Quantity
```

Example:

```text
₹60 - ₹55 = ₹5

5 × 150 = ₹750
```

This is the direct revenue concession.

Other costs may also change.

---

# 16. Concession Benefit

Quantity increase can create:

```text
additional_profit
+
inventory_value
+
cashflow_value
+
customer_value
```

Example:

```text
Additional units = 50
Contribution per unit = ₹12

Additional contribution = ₹600
```

If the concession costs ₹750 and the immediate contribution is only ₹600, the deal is not necessarily worthwhile.

But if the buyer pays upfront or the seller avoids inventory carrying cost, additional value may make it worthwhile.

---

# 17. Net Concession Value

```text
NetConcessionValue =
ConcessionBenefit
- ConcessionCost
```

Only pursue a concession when:

```text
NetConcessionValue >= required_threshold
```

Example:

```text
Concession cost = ₹750
Benefit = ₹950

Net = ₹200
```

Positive.

---

# 18. Give → Get Matrix

The seller policy should define mappings.

```text
PRICE DISCOUNT
    ├── quantity increase
    ├── upfront payment
    ├── longer contract
    └── flexible delivery

FASTER DELIVERY
    ├── higher price
    └── reduced customization

LOWER MOQ
    └── higher unit price

FREE DELIVERY
    └── minimum order value

LONGER WARRANTY
    └── higher price
```

The engine should select combinations that improve seller utility.

---

# 19. Concession Curves

Discounts should become progressively harder.

Example:

```text
Discount
10% ┤                         ●
 8% ┤                   ●
 6% ┤             ●
 4% ┤        ●
 2% ┤   ●
 0% ┼────────────────────────────
      Round 1 2 3 4 5 6
```

A seller can define:

```text
round_1_max_discount = 2%
round_2_max_discount = 3%
round_3_max_discount = 4%
round_4_max_discount = 5%
```

The curve should still obey the economic floor.

---

# 20. Why Progressive Concessions Matter

Without a concession curve:

```text
Buyer:
"Lower."

AI:
"Okay."

Buyer:
"Lower."

AI:
"Okay."

Buyer:
"Lower."

AI:
"Okay."
```

This trains the buyer to negotiate forever.

With progressive concessions:

```text
Round 1 → small concession
Round 2 → conditional concession
Round 3 → trade-off
Round 4 → final zone
Round 5 → walk-away / approval
```

---

# 21. Offer Generation

The engine should generate candidate offers by changing one or more negotiable variables.

Variables:

```text
price
quantity
delivery
payment
warranty
shipping
contract_duration
product_variant
```

Example:

```text
Candidate 1:
₹60 × 100

Candidate 2:
₹58 × 100 + upfront

Candidate 3:
₹55 × 150 + upfront

Candidate 4:
₹57 × 100 + 7-day delivery

Candidate 5:
₹54 × 200 + 12-month contract
```

Each candidate is validated before being shown.

---

# 22. Candidate Generation Algorithm

Pseudo-code:

```python
def generate_candidates(current_deal, buyer_policy, seller_policy):
    candidates = []

    for price in allowed_prices:
        for quantity in allowed_quantities:
            for payment in allowed_payment_terms:
                for delivery in allowed_delivery_options:
                    for contract in allowed_contract_terms:

                        deal = create_deal(
                            price,
                            quantity,
                            payment,
                            delivery,
                            contract
                        )

                        if violates_hard_constraints(deal):
                            continue

                        candidates.append(deal)

    return candidates
```

For the MVP, use a bounded/discrete search.

Do not generate an infinite continuous space.

---

# 23. Search Optimization

For a small MVP dataset:

> brute-force enumeration is acceptable.

For larger spaces:

- prune invalid branches early
- use constraint propagation
- use Pareto pruning
- use beam search
- use integer/linear optimization where appropriate

The important point:

> **Never let the LLM perform this search.**

---

# 24. Deal Scoring

For every feasible deal:

```text
Buyer Utility
Seller Utility
Risk
Operational Complexity
```

Store all values.

Example:

```json
{
  "price": 543000,
  "buyer_utility": 0.91,
  "seller_utility": 0.84,
  "risk": 0.12,
  "complexity": 0.20
}
```

---

# 25. Balanced Deal Score

A simple balanced score:

```text
BalancedScore =
α × BuyerUtility
+
β × SellerUtility
-
γ × Risk
-
δ × Complexity
```

For equal importance:

```text
α = 0.45
β = 0.45
γ = 0.05
δ = 0.05
```

Weights can later become configurable.

---

# 26. Do Not Use a Single Score Everywhere

The system must preserve the underlying dimensions.

A single score can hide important trade-offs.

Therefore return:

```text
buyer_utility
seller_utility
profit
margin
cost
risk
delivery
conditions
```

Then calculate recommendation labels from them.

---

# 27. Pareto Frontier

A candidate deal is dominated if another deal is:

- at least as good for the buyer
- at least as good for the seller
- and strictly better for at least one

The dominated candidate is removed.

Pseudo-code:

```python
def pareto_frontier(deals):
    frontier = []

    for d in deals:
        dominated = False

        for other in deals:
            if dominates(other, d):
                dominated = True
                break

        if not dominated:
            frontier.append(d)

    return frontier
```

---

# 28. Recommendation Categories

After Pareto filtering:

### Best Buyer

```text
max(buyer_utility)
```

### Best Seller

```text
max(seller_utility)
```

### Best Balanced

```text
max(balanced_score)
```

### Lowest Risk

```text
min(risk)
```

### Best Long-Term

```text
max(expected_lifetime_value)
```

---

# 29. Expected Lifetime Value

For recurring contracts:

```text
ExpectedLTV =
ExpectedMarginPerPeriod
× ExpectedPeriods
× RetentionProbability
```

Then compare the LTV impact of concessions.

Example:

```text
Current:
₹10,000 margin × 1 purchase = ₹10,000

12-month agreement:
₹7,000 margin × 12 × 0.80
= ₹67,200 expected margin
```

A lower per-order margin may therefore be rational.

---

# 30. Quantity Optimization

For quantity `q`:

```text
TotalSpend(q) =
q × unit_price(q)
```

Calculate:

```text
MarginalCost(q) =
TotalSpend(q + Δq) - TotalSpend(q)
```

And:

```text
MarginalUnitPrice(q) =
MarginalCost(q) / Δq
```

This allows the system to explain:

> "Adding 50 units reduces marginal unit price by 6.4%."

---

# 31. Buyer Quantity Decision

The buyer should not increase quantity simply because unit price decreases.

Calculate:

```text
IncrementalValue =
ExpectedFutureUseValue
+ UnitPriceSavings
+ AvoidedFuturePriceRisk
```

versus:

```text
IncrementalCost =
AdditionalSpend
+ HoldingCost
+ ObsolescenceRisk
+ StorageCost
```

Recommend increase only when:

```text
IncrementalValue > IncrementalCost
```

---

# 32. Inventory Value

For the seller:

```text
InventoryBenefit =
AvoidedHoldingCost
+ AvoidedObsolescenceRisk
+ WorkingCapitalRelease
```

This may justify a lower price.

Example:

A seller has 1,000 slow-moving units.

Selling 500 today at lower margin may be better than waiting six months.

The engine can therefore increase:

```text
inventory_pressure
```

and adjust seller utility.

---

# 33. Payment-Term Economics

Payment timing has economic value.

Simplified:

```text
PaymentValue =
CashAmount × CostOfCapital × DaysAccelerated / 365
```

Example:

```text
₹100,000
10% annual cost of capital
30 days earlier

≈ ₹822 value
```

The seller may therefore give a discount for upfront payment if:

```text
discount_cost < payment_value
```

---

# 34. Delivery Economics

Expedited delivery should have a cost.

For seller:

```text
ExpediteCost =
additional_transport
+ overtime
+ capacity_cost
```

For buyer:

```text
DelayCost =
expected_project_delay
+ downtime
+ lost_revenue
```

The engine compares the two.

This creates rational delivery negotiation.

---

# 35. Risk Adjustment

Risk should not be a vague LLM opinion.

Use structured variables.

Example:

```text
supplier_reliability
delivery_variance
failure_rate
payment_failure_rate
inventory_confidence
substitution_confidence
```

Normalize them.

Then:

```text
RiskScore =
weighted_sum(risk_components)
```

A higher risk score reduces utility.

---

# 36. Supplier Reliability

Example:

```text
reliability =
successful_deliveries / total_deliveries
```

But raw success rate is insufficient.

Also track:

```text
average_delay
delay_variance
failure_rate
cancellation_rate
```

A supplier with 95% on-time delivery but high variance should not necessarily rank the same as one with consistently predictable delivery.

---

# 37. Negotiation Strategy Selection

The engine chooses strategy based on state.

```text
IF information_missing:
    ask_question

ELIF buyer_has_unused_trade:
    propose_give_get

ELIF seller_has_inventory_pressure:
    consider_quantity_discount

ELIF upfront_payment_has_value:
    offer_payment_trade

ELIF basket_synergy_exists:
    propose_bundle

ELIF no_meaningful_improvement:
    stop

ELIF outside_authority:
    escalate

ELSE:
    make_small_counteroffer
```

---

# 38. Information-Gathering Moves

A negotiation action does not always have to be a price offer.

The agent can ask:

> "What quantity are you considering?"

> "Is delivery by Friday mandatory?"

> "Would an equivalent specification be acceptable?"

> "Would upfront payment work?"

Information has value because it reduces uncertainty.

---

# 39. Information Value

For MVP, use a simple heuristic:

```text
ValueOfInformation =
ExpectedImprovementAfterInformation
- CostOfAsking
```

If positive:

> ask.

If negligible:

> proceed.

This prevents unnecessary questioning.

---

# 40. Buyer Private Information

The Buyer Agent should distinguish:

```text
private:
maximum_budget
reservation_value
strategic_priority

shareable:
required_quantity
required_delivery
public specifications
```

The negotiation engine decides what can be disclosed.

---

# 41. Seller Private Information

Private:

```text
product_cost
minimum_margin
reservation_value
inventory_pressure
internal strategy
```

Potentially shareable:

```text
MOQ
delivery capability
public price
available quantity
warranty
payment options
```

---

# 42. Information Disclosure Strategy

The agent should not lie.

It should simply avoid unnecessary disclosure.

Example:

Buyer:

> "What's your maximum budget?"

Buyer Agent:

> "We're looking for the most competitive offer within our procurement requirements."

The system does not reveal the hidden budget.

---

# 43. Negotiation State

Store:

```json
{
  "round": 3,
  "current_offer": {},
  "last_offer_by": "seller",
  "remaining_discount_budget": 0.03,
  "remaining_rounds": 3,
  "known_constraints": [],
  "unknowns": [],
  "approval_required": false
}
```

---

# 44. Stopping Function

Negotiation should stop if:

```text
agreement_reached
OR
no_feasible_deal
OR
maximum_rounds_reached
OR
reservation_value_crossed
OR
marginal_improvement < threshold
OR
approval_required
OR
required_information_missing
```

---

# 45. Marginal Improvement

Let:

```text
U_current = current utility
U_next = next feasible utility
```

Then:

```text
ΔU = U_next - U_current
```

If:

```text
ΔU < minimum_meaningful_utility_gain
```

stop.

For financial decisions, also use:

```text
ΔSavings < minimum_meaningful_saving
```

This prevents the engine from negotiating ₹100 savings on a ₹5L deal for ten more rounds.

---

# 46. Negotiation Deadlock

A deadlock occurs when:

```text
Buyer will not increase acceptable cost
AND
Seller will not decrease acceptable revenue
```

The engine should search for non-price variables.

```text
quantity
delivery
payment
contract
substitution
shipping
warranty
```

If no mutually beneficial trade exists:

> No Deal.

---

# 47. No-Deal Certificate

When negotiations fail, the system should explain why.

Example:

```text
NO FEASIBLE DEAL

Buyer maximum:
₹1,50,000

Seller minimum:
₹1,58,400

Tested alternatives:
47

Possible trade-offs:
+25 units → still above budget
+7 days delivery → still above budget
upfront payment → insufficient
substitution → unavailable
```

This is much stronger than:

> "Negotiation failed."

---

# 48. Human Escalation Score

Escalation should be triggered by rules.

Example:

```text
financial_value > approval_threshold
OR
new_term_detected
OR
technical_substitution_uncertain
OR
policy_conflict
OR
legal_term_changed
```

Do not use an arbitrary LLM confidence score as the sole escalation mechanism.

---

# 49. Validation Score

Instead of:

> "AI confidence = 99%"

use component validation.

Example:

```text
PRICE              PASS
MARGIN             PASS
INVENTORY          PASS
DELIVERY           PASS
PAYMENT            PASS
POLICY             PASS
AUTHORITY          PASS
SUBSTITUTION       REVIEW
```

A deal can be executable only if mandatory validations pass.

---

# 50. Confidence Model

If a numeric confidence score is required for internal use:

```text
Confidence =
  0.20 × data_completeness
+ 0.20 × constraint_validation
+ 0.20 × calculation_validation
+ 0.15 × supplier_data_quality
+ 0.15 × historical_support
+ 0.10 × scenario_familiarity
```

But this score should represent **decision support confidence**, not a probability that the LLM is "correct."

Hard safety rules always override confidence.

---

# 51. Basket Optimization

For a basket:

```text
Minimize:
Total Basket Cost
+ Risk Cost
+ Coordination Cost
```

Subject to:

```text
quantity requirements
budget
delivery
quality
supplier eligibility
inventory
```

---

# 52. Basket Objective

For buyer:

```text
BasketUtility =
Σ(item_utility)
- logistics_penalty
- coordination_penalty
- risk_penalty
```

The engine should also account for bundle discounts.

---

# 53. Supplier Count Penalty

A simple MVP model:

```text
coordination_cost =
supplier_count × coordination_cost_per_supplier
```

Example:

```text
1 supplier → ₹500
2 suppliers → ₹1,000
3 suppliers → ₹1,500
```

Later this can become nonlinear.

---

# 54. Basket Negotiation

Instead of:

```text
Product A → negotiate
Product B → negotiate
Product C → negotiate
```

the engine can generate:

```text
"If we purchase A + B + C together,
what is the best total commercial package?"
```

This allows basket-level concessions.

---

# 55. Basket Example

Initial:

```text
Steel       ₹300,000
Bearings    ₹120,000
Belts       ₹80,000
Total       ₹500,000
```

Supplier counter:

```text
₹490,000 if all products are purchased
and payment is upfront.
```

Engine compares:

```text
individual procurement:
₹500,000

bundle:
₹490,000

saving:
₹10,000

additional condition:
upfront payment
```

Then calculates the financial value of the payment condition.

---

# 56. Multi-Supplier Basket

Candidate:

```text
Supplier A:
Steel      ₹295,000

Supplier B:
Bearings   ₹110,000

Supplier C:
Belts       ₹72,000

Product subtotal:
₹477,000
```

Add:

```text
logistics
coordination
delivery risk
```

The system may discover that:

```text
single supplier:
₹490,000

three suppliers:
₹489,500 effective cost
```

Therefore the ₹500 nominal saving may not justify the additional complexity.

---

# 57. Bundle Synergy

The engine should support:

```text
bundle_discount
bundle_quantity_threshold
bundle_payment_condition
bundle_delivery_condition
```

Example:

```text
A alone → 2% discount
A+B     → 5% discount
A+B+C   → 8% discount
```

The optimizer tests whether the additional products are economically justified.

---

# 58. Contract Duration

Contract duration becomes a negotiable variable only when relevant.

Example:

```text
1 month
6 months
12 months
```

Seller may offer:

```text
1 month → ₹100/unit
6 months → ₹96/unit
12 months → ₹92/unit
```

Buyer evaluates expected future consumption.

---

# 59. Contract Duration Value

Seller:

```text
ExpectedContractValue =
margin_per_period
× expected_volume
× expected_retention
```

Buyer:

```text
ExpectedBuyerValue =
price_savings
+ supply_security
- commitment_risk
```

A long contract is recommended only when both sides benefit.

---

# 60. What-If Engine

The What-If engine changes one or more variables and reruns optimization.

Example:

```text
Scenario A
Budget = ₹5L
Quantity = 100
Delivery = 5 days

Scenario B
Budget = ₹5.1L
Quantity = 100
Delivery = 5 days
```

Compare:

```text
best deal
saving
delivery
risk
utility
```

---

# 61. What-If Explanation

The system should say:

> Increasing budget by ₹10,000 unlocks Supplier B.

> Expected saving versus the current option: ₹18,000.

> Net budget increase: ₹10,000.

> Delivery improves by 1 day.

This is decision support, not autonomous decision-making.

---

# 62. Scenario Sensitivity

The engine should identify variables with the largest effect on the outcome.

For each variable:

```text
change variable slightly
rerun optimizer
measure utility change
```

Example:

```text
Quantity +10% → utility +0.03
Budget +2%    → utility +0.08
Delivery +1d  → utility -0.11
```

The user learns which variable actually matters.

---

# 63. Negotiation Memory

Store every completed negotiation as structured data.

```text
product
quantity
opening_price
final_price
discount
conditions
delivery
payment
contract
supplier
buyer
outcome
```

Do not treat the transcript as the primary memory.

---

# 64. Historical Price Intelligence

For a product:

```text
historical_price_mean
historical_price_median
historical_price_min
historical_price_max
price_volatility
```

This can support:

> "Current offer is 6.2% below this supplier's recent median."

This is useful evidence.

---

# 65. Historical Supplier Behaviour

Track:

```text
average_opening_discount
average_final_discount
acceptance_rate
average_rounds
typical_counteroffer
delivery_accuracy
```

This can later improve initial strategy.

---

# 66. Future Acceptance Model

Later:

```text
P(accept | offer)
```

can be estimated using:

```text
price
quantity
payment
delivery
round
buyer/seller history
```

For MVP, use deterministic heuristics.

---

# 67. No Reinforcement Learning in MVP

Do not attempt to train a reinforcement-learning negotiator during the hackathon.

Reasons:

- insufficient real negotiation data
- hard to validate
- difficult to guarantee constraints
- unnecessary for the demo

The engine should be deterministic first.

---

# 68. LLM Responsibilities

The LLM handles:

```text
natural language → structured request
natural language → structured offer
structured decision → natural language response
```

Example:

User:

> "I'll take 150 if you can get me something better."

LLM extracts:

```json
{
  "quantity": 150,
  "request": "improve_price"
}
```

Decision engine calculates possible offers.

LLM then communicates the selected offer.

---

# 69. LLM Must Not Decide

The LLM must not independently determine:

```text
minimum price
maximum discount
seller margin
buyer maximum spend
payment authorization
contract approval
financial feasibility
technical equivalence
```

These are decision-engine responsibilities.

---

# 70. Agent Tool Contract

Agents should call explicit tools.

Example:

```text
get_product()
get_inventory()
get_supplier()
calculate_deal()
generate_candidates()
validate_deal()
rank_deals()
request_approval()
generate_contract()
create_payment()
```

The agent should not directly manipulate financial state.

---

# 71. Negotiation Action Schema

Every action should become structured:

```json
{
  "action": "counteroffer",
  "deal": {
    "quantity": 150,
    "unit_price": 1390,
    "payment_terms": "upfront"
  },
  "reason": "volume_discount",
  "requires_approval": false
}
```

The engine validates this before execution.

---

# 72. Decision Response Schema

```json
{
  "status": "approved",
  "deal": {},
  "buyer_utility": 0.91,
  "seller_utility": 0.84,
  "risk": 0.12,
  "conditions": [],
  "requires_human": false,
  "explanation": {
    "primary_reason": "volume_tier",
    "financial_impact": 17000
  }
}
```

---

# 73. Full Negotiation Loop

```text
USER REQUEST
     │
     ▼
PARSE
     │
     ▼
VALIDATE
     │
     ▼
DISCOVER
     │
     ▼
INITIAL OFFERS
     │
     ▼
GENERATE FEASIBLE COUNTERS
     │
     ▼
SCORE DEALS
     │
     ▼
SELECT NEXT ACTION
     │
     ├──── ask question
     ├──── counteroffer
     ├──── propose trade
     ├──── recommend
     ├──── escalate
     └──── stop
     │
     ▼
RECEIVE RESPONSE
     │
     ▼
UPDATE STATE
     │
     └───────────────┐
                     ▼
                 REPEAT
```

---

# 74. Next Action Selection

The engine should evaluate:

```text
expected_utility_gain
information_gain
concession_cost
risk
authority
```

Then select the highest-value valid action.

Conceptually:

```text
ActionScore =
ExpectedUtilityGain
+ InformationValue
- ActionCost
- Risk
```

Only actions inside authority are executable.

---

# 75. Negotiation Action Types

```text
ASK
OFFER
COUNTER
CONDITIONAL_OFFER
BUNDLE_OFFER
TRADE_OFFER
ACCEPT
REJECT
ESCALATE
STOP
```

This is enough for the MVP.

---

# 76. Example End-to-End Negotiation

Seller:

```text
100 units
₹60/unit
```

Buyer:

```text
Budget = ₹52/unit
```

Seller policy:

```text
minimum margin = 12%
```

Buyer asks:

> "Can you do ₹50?"

Engine checks seller economics.

Result:

```text
₹50 = infeasible
```

Agent does not say:

> "Maybe."

Instead:

> "₹50 doesn't work at 100 units. I can explore a lower effective price if the order quantity changes."

---

# 77. Conditional Counteroffer

Engine finds:

```text
150 units
₹53/unit
upfront payment
```

Both sides remain feasible.

Seller receives:

```text
higher volume
upfront cash
```

Buyer receives:

```text
lower unit price
```

Agent communicates:

> "I can offer ₹53/unit at 150 units with upfront payment."

---

# 78. Buyer Counter

Buyer:

> "I only need 100."

Engine searches alternatives.

Possible:

```text
100 × ₹55
150 × ₹53
100 × ₹54 + 30-day delivery
```

The buyer sees:

```text
Best current deal:
₹54 × 100

Maximum saving:
₹3/unit if quantity increases to 150
```

Human decides.

---

# 79. Final Deal Validation

Before acceptance:

```text
Buyer budget           PASS
Seller margin          PASS
Inventory              PASS
Delivery               PASS
Payment terms          PASS
Product specification  PASS
Authority               PASS
Risk threshold         PASS
```

Then:

```text
deal_status = READY_TO_COMMIT
```

---

# 80. Contract Generation Trigger

Contract generation occurs only after:

```text
buyer approval
AND
seller approval
AND
deal validation = PASS
```

The contract contains the exact validated deal state.

No values should be regenerated by the LLM.

---

# 81. Payment Trigger

Payment initiation occurs only after:

```text
contract_generated
AND
required_approvals_complete
AND
deal_state = AGREED
```

The payment amount must come from the validated deal object.

Never from free-form model output.

---

# 82. Audit Event

Every state-changing action produces:

```json
{
  "timestamp": "...",
  "actor": "buyer_agent",
  "action": "counteroffer",
  "deal_before": {},
  "deal_after": {},
  "rules_checked": [
    "minimum_margin",
    "quantity_discount"
  ],
  "result": "approved"
}
```

---

# 83. Explainability

Every recommendation should be reconstructable from stored values.

Example:

```text
Recommended:
₹53,000

Because:
+₹8,000 buyer savings
+1 day delivery
+20% quantity
seller margin remains 13.4%
risk remains below threshold
```

A user should not need to trust an opaque model.

---

# 84. Test Suite

At minimum, implement automated tests for:

### Test 1

Buyer budget below seller minimum.

Expected:

```text
NO_DEAL
```

### Test 2

Volume discount creates feasible overlap.

Expected:

```text
CONDITIONAL_OFFER
```

### Test 3

Upfront payment creates enough seller value.

Expected:

```text
DISCOUNT_ALLOWED
```

### Test 4

Discount violates margin.

Expected:

```text
REJECT
```

### Test 5

Quantity exceeds inventory.

Expected:

```text
REJECT
```

### Test 6

Delivery exceeds buyer deadline.

Expected:

```text
REJECT
```

### Test 7

Substitution uncertain.

Expected:

```text
HUMAN_REVIEW
```

### Test 8

No meaningful improvement.

Expected:

```text
STOP
```

### Test 9

Contract value exceeds approval authority.

Expected:

```text
ESCALATE
```

### Test 10

Basket has cheaper but riskier split.

Expected:

```text
BALANCED_OPTION_SELECTED
```

---

# 85. Example Mathematical Test

Seller:

```text
Product cost = ₹80
Operating cost = ₹5
Payment cost = ₹1
Logistics = ₹4

Total unit cost = ₹90
```

Minimum margin:

```text
10%
```

Minimum revenue:

```text
90 / 0.90
= ₹100
```

Therefore:

```text
₹99 → INVALID
₹100 → VALID
₹105 → VALID
```

---

# 86. Example Give-Get Test

Seller offers:

```text
₹110 → ₹105
```

Quantity:

```text
100 → 150
```

Direct concession:

```text
₹5 × 150 = ₹750
```

Additional contribution:

```text
50 × ₹20 contribution
= ₹1,000
```

Net immediate benefit:

```text
₹1,000 - ₹750
= ₹250
```

Therefore:

```text
concession = economically positive
```

before considering logistics, cashflow, risk and inventory.

---

# 87. Example Payment Trade

Seller offers:

```text
₹100,000
```

Buyer requests:

```text
30-day payment
```

Seller's cost of capital:

```text
12% annual
```

Approximate financing cost:

```text
100,000 × 0.12 × 30 / 365
≈ ₹986
```

The engine can therefore compare:

```text
₹986 financing cost
```

against any discount requested for delayed payment.

---

# 88. Example Delivery Trade

Seller:

```text
standard delivery = 7 days
```

Buyer:

```text
required = 3 days
```

Seller's expedited cost:

```text
₹4,000
```

Buyer estimates delay cost:

```text
₹10,000
```

The engine can determine that paying up to approximately ₹10,000 extra may still be economically rational for the buyer, subject to its hard budget.

---

# 89. Example Basket Decision

Three options:

```text
A:
₹5,80,000
1 supplier
4 days
low risk

B:
₹5,52,000
2 suppliers
5 days
medium risk

C:
₹5,43,000
3 suppliers
7 days
high risk
```

The engine should not simply select C.

It calculates:

```text
effective cost
+
coordination
+
risk
+
delivery impact
```

and may recommend B.

---

# 90. Implementation Architecture

Recommended module separation:

```text
src/
├── agents/
│   ├── buyerAgent
│   └── sellerAgent
│
├── engine/
│   ├── constraints
│   ├── economics
│   ├── utility
│   ├── reservation
│   ├── concessions
│   ├── candidates
│   ├── optimizer
│   ├── risk
│   ├── stopping
│   └── recommendations
│
├── industry/
│   └── mro/
│
├── contracts/
├── payments/
├── audit/
├── data/
└── api/
```

This separation should be maintained.

---

# 91. Engine Execution Contract

The engine should accept:

```text
buyer_policy
seller_policy
product_data
supplier_data
current_deal
negotiation_state
```

and return:

```text
feasible_actions
recommended_action
candidate_deals
validation_results
explanation
approval_requirement
```

---

# 92. Decision Engine Pseudocode

```python
def decide(context):

    validate_input(context)

    candidates = generate_candidates(context)

    feasible = []

    for deal in candidates:

        if not satisfies_hard_constraints(deal, context):
            continue

        economics = calculate_economics(deal, context)

        if not economics.valid:
            continue

        utilities = calculate_utilities(deal, context)

        risk = calculate_risk(deal, context)

        feasible.append(
            score_deal(
                deal,
                economics,
                utilities,
                risk
            )
        )

    if not feasible:
        return no_deal_result(context)

    frontier = pareto_frontier(feasible)

    recommendations = generate_recommendations(frontier)

    action = choose_next_action(
        recommendations,
        context
    )

    return action
```

---

# 93. Agent Pseudocode

```python
def buyer_agent(user_message):

    intent = llm_extract(user_message)

    validated_intent = validate_intent(intent)

    decision = decision_engine(
        buyer_intent=validated_intent
    )

    return llm_communicate(decision)
```

The important architecture is:

```text
LLM → structured intent
Decision Engine → decision
LLM → communication
```

not:

```text
LLM → decision
```

---

# 94. MVP Simplifications

For the hackathon:

### Use discrete values

```text
price steps
quantity tiers
delivery buckets
payment terms
contract durations
```

### Use deterministic utilities

No training required.

### Use synthetic supplier history

Enough to demonstrate reasoning.

### Use one industry

MRO.

### Use simulated supplier agents

Do not depend on real supplier onboarding.

---

# 95. What Should Be Learned Later

Once transaction history exists:

```text
Likely acceptance
Likely concession
Supplier flexibility
Buyer flexibility
Price elasticity
Quantity elasticity
Contract probability
```

These become predictive inputs.

But:

> learned predictions can recommend; hard policies still govern.

---

# 96. Final Decision Hierarchy

When rules conflict:

```text
1. Safety / policy constraints
2. Financial hard constraints
3. Product / technical constraints
4. Authority limits
5. Operational constraints
6. Strategic objectives
7. Preferences
8. Negotiation style
```

Higher-level rules always override lower-level preferences.

---

# 97. Final Mental Model

Think of the system as a search engine over **commercial possibility**.

```text
                 ALL POSSIBLE DEALS
                        │
                        ▼
                HARD CONSTRAINTS
                        │
                        ▼
                 FEASIBLE DEALS
                        │
                        ▼
                  RISK FILTER
                        │
                        ▼
                PARETO FRONTIER
                        │
                        ▼
               HUMAN-RELEVANT OPTIONS
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
       BEST PRICE   BEST BALANCE   BEST LONG TERM
           │            │            │
           └────────────┼────────────┘
                        ▼
                 HUMAN DECISION
                        │
                        ▼
                     CONTRACT
                        │
                        ▼
                    PAYMENT
```

---

# 98. North-Star Technical Definition

> **The Decision Engine is a constraint-aware, utility-based, explainable optimization system that searches a bounded commercial deal space and enables AI agents to negotiate toward Pareto-efficient outcomes without violating economic, operational, or authorization boundaries.**

The agents provide the conversation.

The Decision Engine provides the intelligence.

The human provides authority.

Razorpay provides transaction execution.
