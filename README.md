# A2A DealFlow — Autonomous Agent-to-Agent Commercial Negotiation & Decision Engine

> **Commercial Axiom:** AI Agents communicate. The Deterministic Decision Engine evaluates. Businesses stay in control. Razorpay settles.

---

## Table of Contents

1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [The Commercial Journey (The 5 Stages)](#2-the-commercial-journey-the-5-stages)
3. [System Architecture](#3-system-architecture)
   - [Architectural Topology](#31-architectural-topology)
   - [Codebase Directory Structure](#32-codebase-directory-structure)
   - [Key Subsystems](#33-key-subsystems)
4. [Extensive Parameter Specification](#4-extensive-parameter-specification)
   - [4.1 Buyer Parameters & Policy (`BuyerPolicy`)](#41-buyer-parameters--policy-buyerpolicy)
   - [4.2 Seller Parameters & Economics (`SellerPolicy`)](#42-seller-parameters--economics-sellerpolicy)
   - [4.3 Negotiation Protocol & ZOPA Parameters](#43-negotiation-protocol--zopa-parameters)
   - [4.4 Multi-Objective Utility & Pareto Frontier Calculation](#44-multi-objective-utility--pareto-frontier-calculation)
   - [4.5 The 4 Canonical Deal Options](#45-the-4-canonical-deal-options)
   - [4.6 Hard Constraint Matrix & Spend Authority Gates](#46-hard-constraint-matrix--spend-authority-gates)
5. [Canonical Scenarios & Test Suite](#5-canonical-scenarios--test-suite)
6. [Getting Started & Operational Guide](#6-getting-started--operational-guide)

---

## 1. Executive Summary & Core Philosophy

**A2A DealFlow** is an autonomous commercial negotiation workspace and deterministic decision engine designed for B2B procurement and commercial sales.

In modern B2B commerce, negotiations are slow, fragmented across emails, phone calls, and spreadsheets, and human negotiators rarely explore the multi-dimensional commercial search space. A lower price is frequently offset by delayed delivery, high financing costs, poor supplier reliability, or strict payment terms.

At the same time, **LLMs cannot be trusted with autonomous commercial commitments**. A generative AI model hallucinates prices, invents unviable commitments, leaks private margin data, and fails at mathematical optimization.

**A2A DealFlow solves this through strict separation of responsibilities:**

```
                    NATURAL LANGUAGE / INTENT
                               │
                               ▼
                    AI CONVERSATIONAL LAYER
          (Interprets request · Synthesizes dialogue)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
       BUYER AGENT                           SELLER AGENT
   (Represents Buyer)                     (Represents Seller)
   [Private Budget & SLA]                 [Private Costs & Margin Floor]
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                               ▼
                   DETERMINISTIC DECISION ENGINE
             • Boundary Constraints (Budget, Margin, SLA)
             • Multi-Objective Utility Scoring (0.0 to 1.0)
             • Pareto Frontier Optimization
             • Spend Authority Governance Gates
                               │
                               ▼
                       HUMAN IN THE LOOP
                   (Chooses 1 of 4 Deal Options)
                               │
                               ▼
                   CONTRACT & RAZORPAY SETTLEMENT
             • Deterministic PDF/HTML Contract
             • Live Escrow Payment via Razorpay
```

### Core Rules of the System
1. **The LLM is NEVER the commercial authority:** It interprets human intent and communicates naturally, but the Decision Engine mathematically verifies feasibility.
2. **Private Asymmetric Economics:** The Buyer Agent never exposes its maximum budget ceiling or delay penalties. The Seller Agent never exposes its unit cost (COGS) or minimum 10% profit margin floor.
3. **Pareto Optimization over Zero-Sum Bargaining:** Agents do not haggle over a single scalar price. They trade off dimensions: e.g., upfront cash payment in exchange for volume discounts and guaranteed delivery SLAs.
4. **Human Authority:** The system does not silently drain corporate accounts. Deals above defined thresholds require explicit human authorization.

---

## 2. The Commercial Journey (The 5 Stages)

Every commercial transaction follows an auditable 5-stage pipeline:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 01 DISCOVER │ -> │  02 SEARCH  │ -> │ 03 NEGOTIATE│ -> │  04 DECIDE  │ -> │ 05 EXECUTE  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
  Natural text       Marketplace        Buyer Agent ↔      Deterministic      Contract &
  purchasing         supplier match     Seller Agent       Policy & Pareto    Razorpay
  intent             & verification     across table       Deal Selection     Escrow
```

1. **01 DISCOVER (Natural Intent):** The user enters an unconstrained procurement request (e.g., *"I need 500 industrial bearings for our Pune plant. They need to arrive within 6 days. Authorized budget is ₹390,000."*).
2. **02 SEARCH (Catalog Discovery):** The system searches the verified marketplace catalog, ranks candidate suppliers on stock availability, lead time, and reliability score, and selects the recommended supplier.
3. **03 NEGOTIATE (Agent-to-Agent Exchange):**
   - Buyer Agent probes baseline pricing.
   - Seller Agent presents standard catalog terms.
   - Buyer Agent proposes an economic concession (e.g., 100% upfront cash payment).
   - Seller Agent accepts the trade-off, lowering unit cost while protecting its margin floor.
4. **04 DECIDE (Commercial Choice):** The Decision Engine calculates the Pareto frontier and generates 4 distinct, actionable deal choices (*Best Overall*, *Lowest Outlay*, *Fastest Delivery*, *Best Unit Economics*).
5. **05 EXECUTE (Settlement):** The human clicks "Approve Deal", generating an immutable commercial agreement, audited contract certificate, and executing payment via Razorpay.

---

## 3. System Architecture

### 3.1 Architectural Topology

```
src/
├── agents/                  # Autonomous Buyer and Seller Agent logic
│   ├── buyerAgent.ts        # Buyer strategy, concessions & probe generation
│   ├── sellerAgent.ts       # Seller strategy, margin protection & counter-offers
│   └── negotiationProtocol.ts# Turn-taking protocol, ZOPA checks & state machine
│
├── engine/                  # Deterministic Decision & Optimization Core
│   ├── decisionEngine.ts    # Hard constraints, matrix validation, authority gates
│   ├── scoringEngine.ts     # Multi-attribute utility (MAUT) & cost modeling
│   └── paretoFrontier.ts    # Pareto-optimal deal generation & candidate ranking
│
├── store/                   # Canonical State & Application Store
│   └── canonicalState.ts    # Reactive state store with popstate URL sync
│
├── services/                # External & Synthetic Integrations
│   ├── aiService.ts         # Natural language parsing & fact-grounded dialogue
│   ├── contractGenerator.ts # Formal legal agreement generator
│   └── razorpayClient.ts    # Razorpay checkout & payment verification SDK
│
├── components/              # Hybrid AI Commercial Workspace UI
│   ├── RoleSelectionLanding.tsx # Homepage with live animated DealFlow hero
│   ├── BuyerInterface.tsx   # Buyer workspace (intent, search table, negotiation)
│   ├── SellerInterface.tsx  # Seller desk (inventory, margin, counter-offer)
│   ├── AdminConsole.tsx     # Governance, policy overrides & marketplace audit
│   ├── Header.tsx           # Global navigation with tab routing
│   ├── ContractModal.tsx    # Digital contract review modal
│   ├── RazorpayModal.tsx    # Live payment gateway modal
│   └── WhatIfSimulator.tsx  # Interactive sensitivity & parameter trade-off tool
│
├── data/                    # Seed Datasets & Canonical Scenarios
│   ├── marketplaceCatalog.ts# Verified industrial supplier & SKU catalog
│   └── canonicalScenarios.ts# 10 enterprise benchmark test scenarios
│
└── types/                   # TypeScript schemas & mathematical contracts
    └── index.ts             # CanonicalDeal, Policies, ScoredDeal, Matrices
```

### 3.2 Key Subsystems

- **Canonical State Store (`src/store/canonicalState.ts`):** Central source of truth. Synchronizes application state with browser URLs (`/`, `/buyer`, `/seller`, `/admin`) using native `window.history.pushState` and `popstate` event listeners to guarantee bookmarkable, refresh-safe navigation without route blanking.
- **Decision Engine (`src/engine/decisionEngine.ts`):** Evaluates candidate offers against `BuyerPolicy` and `SellerPolicy`. Outputs a boolean `passed`, an audit `matrix`, and a list of failure reasons. If no agreement is possible, generates a formal `NoDealCertificate`.
- **Scoring Engine (`src/engine/scoringEngine.ts`):** Computes normalized multi-attribute utilities $U_{\text{buyer}} \in [0, 1]$ and $U_{\text{seller}} \in [0, 1]$, incorporating delayed delivery risk costs, financing float, and coordination penalties.
- **AI Service (`src/services/aiService.ts`):** Implements heuristic intent interpretation and template-based factual dialogue generation. When an LLM API key is present, it uses generative synthesis strictly constrained to verified commercial facts.

---

## 4. Extensive Parameter Specification

The A2A DealFlow engine operates on strictly typed parameters categorized into Buyer Economics, Seller Economics, Protocol Mechanics, and Utility Weights.

---

### 4.1 Buyer Parameters & Policy (`BuyerPolicy`)

Defined in `src/types/index.ts`:

| Parameter | Type | Default / Example | Mathematical Meaning & Usage |
| :--- | :--- | :--- | :--- |
| `maxTotalBudget` | `number` | `₹390,000` | **Hard Ceiling.** Absolute maximum spend authorized for this procurement. Any deal where Total Cost > maxTotalBudget is immediately rejected with `price: 'FAIL'`. |
| `targetTotalBudget` | `number` | `₹360,000` | **Soft Target.** The preferred financial outlay. Deals at or below this target receive a maximum price utility score of 1.0. |
| `maxUnitPrice` | `number` | `₹820` | Optional cap on per-item unit cost. Prevents low-quantity, high-price anomalies. |
| `requiredQuantity` | `number` | `500` | **Mandatory Volume.** Number of units required by the production facility. |
| `minQuantity` | `number` | `450` | Minimum acceptable quantity if the supplier offers an attractive lower-outlay deal. |
| `maxQuantity` | `number` | `650` | Maximum volume the buyer can accept to unlock quantity volume tiers. |
| `requiredDeliveryDays` | `number` | `6` | **Target Delivery SLA.** Standard expected fulfillment timeline in business days. |
| `latestAcceptableDeliveryDays` | `number` | `8` | **Hard Cutoff.** If delivery > latestAcceptableDeliveryDays, the deal is rejected (`delivery: 'FAIL'`). |
| `urgencyLevel` | `enum` | `'medium'` | `'low'`, `'medium'`, `'high'`, `'emergency'`. Multiplies the delivery weight and delay penalties in the utility model. |
| `delayCostPerDay` | `number` | `₹2,500` | Economic penalty per day for late shipments: Penalty = max(0, d - targetDays) * delayCostPerDay. |
| `minSupplierReliability` | `number` | `0.90` (90%) | **Hard Cutoff.** Minimum supplier historical reliability score. Suppliers below this threshold are disqualified. |
| `minQuality` | `number` | `0.85` | Minimum grade score for specifications, tolerance, and materials. |
| `requiredCertification` | `boolean` | `true` | When true, supplier must possess accredited certification (e.g., ISO 9001:2015). |
| `acceptablePaymentTerms` | `string[]` | `['upfront', '30_days']` | Allowed payment structures. Deals requiring forbidden terms are rejected (`payment: 'FAIL'`). |
| `annualCostOfCapital` | `number` | `0.12` (12%) | Used to calculate working capital float for deferred payment terms (30 or 60 days). |
| `humanApprovalThreshold` | `number` | `₹100,000` | Any transaction exceeding this amount triggers human authorization before settlement. |
| `maxAutonomousSpend` | `number` | `₹50,000` | Level 1 automated threshold where agents can close without explicit human sign-off. |
| `weights` | `BuyerWeights` | See below | Normalization weights for utility calculation. |

#### Buyer Weights (`BuyerWeights`)
Normalized such that the sum of weights is 1.0:
- `weights.price` (Default: `0.45`): Sensitivity to financial outlay.
- `weights.delivery` (Default: `0.25`): Sensitivity to lead time speed.
- `weights.reliability` (Default: `0.15`): Preference for high supplier track records.
- `weights.quality` (Default: `0.10`): Preference for superior certifications and tolerances.
- `weights.payment` (Default: `0.05`): Preference for flexible payment terms (e.g. Net 30 vs Upfront).

---

### 4.2 Seller Parameters & Economics (`SellerPolicy`)

Defined in `src/types/index.ts`:

| Parameter | Type | Default / Example | Mathematical Meaning & Usage |
| :--- | :--- | :--- | :--- |
| `supplierId` | `string` | `'supplier-apex'` | Unique identifier of the selling enterprise. |
| `productCost` (COGS) | `number` | `₹450` | Direct variable manufacturing and acquisition cost per unit. **Kept private.** |
| `basePrice` (List) | `number` | `₹810` | Standard published catalog unit price before negotiation. |
| `minMargin` | `number` | `0.10` (10.0%) | **Hard Margin Floor.** Strict economic stop rule. Any deal where Margin < 0.10 is rejected (`margin: 'FAIL'`). |
| `targetMargin` | `number` | `0.18` (18.0%) | Target corporate profit margin where seller utility equals 1.0. |
| `availableInventory` | `number` | `1,200` | **Hard Capacity Limit.** Maximum units currently available in stock. Deals where Quantity > availableInventory fail (`inventory: 'FAIL'`). |
| `minOrderQuantity` (MOQ) | `number` | `100` | Minimum production or shipping batch size. |
| `operatingCostPerUnit` | `number` | `₹15` | Warehousing and handling cost per unit. |
| `logisticsCostPerOrder` | `number` | `₹2,500` | Baseline freight dispatch fee. |
| `expediteCostPerOrder` | `number` | `₹4,000` | Additional carrier surcharge required for expedited 2-3 day shipping. |
| `paymentCostRate` | `number` | `0.01` (1.0%) | Cost of carrying deferred receivables (Net 30/Net 60 float cost). |
| `quantityBreaks` | `Array` | See below | Step-function volume pricing tiers. |
| `weights` | `SellerStrategyWeights`| See below | Seller strategic priorities. |

#### Seller Quantity Breaks (`quantityBreaks`)
Defines automated volume concession rules:
- **Tier 1 (Base):** Quantity < 500 -> Discount = 0% (Price = ₹810)
- **Tier 2:** 500 <= Quantity < 600 -> Discount = 5.5% (Price = ₹765)
- **Tier 3:** 600 <= Quantity < 1000 -> Discount = 14.1% (Price = ₹695.45)
- **Tier 4:** Quantity >= 1000 -> Discount = 18.0% (Price = ₹664.20)

#### Seller Strategy Weights (`SellerStrategyWeights`)
- `profit` (Default: `0.40`): Weight on gross profit margin >= 10%.
- `volume` (Default: `0.25`): Weight on clearing large order quantities.
- `cashflow` (Default: `0.20`): Incentive for upfront payment terms.
- `inventory` (Default: `0.10`): Pressure to clear aging inventory.
- `risk` (Default: `0.05`): Exposure to buyer default or cancellations.

---

### 4.3 Negotiation Protocol & ZOPA Parameters

#### The Zone of Possible Agreement (ZOPA)
The decision engine mathematically calculates whether a commercial overlap exists:
- Buyer Reservation Ceiling = maxTotalBudget
- Seller Reservation Floor = (unitCost / (1 - minMargin)) * Quantity + Logistics
- ZOPA = [Seller Reservation Floor, Buyer Reservation Ceiling]

- If Buyer Ceiling >= Seller Floor: ZOPA is non-empty -> Negotiation proceeds to Pareto optimization.
- If Buyer Ceiling < Seller Floor: ZOPA is empty -> Immediate `NO_DEAL` status.
  The engine emits a `NoDealCertificate` detailing the monetary deficit and variables that could bridge the gap (e.g., reduce quantity from 500 to 450, or accept standard delivery).

#### Stopping Rule & Concession Increment
Negotiation rounds terminate when either:
1. **Convergence:** Difference between consecutive offers < ₹500.
2. **Marginal Improvement Exhaustion:** Marginal utility improvement < 0.01 over two consecutive turns.
3. **Turn Limit:** Maximum rounds (6 turns) reached.

---

### 4.4 Multi-Objective Utility & Pareto Frontier Calculation

#### Normalization Formulae
All attributes are mapped to the [0, 1] interval:
- **Cost / Price Metric (Lower is Better):**
  Score = max(0, min(1, (Budget Ceiling - Total Cost) / (Budget Ceiling - Target Budget)))
- **Lead Time Metric (Lower is Better):**
  Score = max(0, min(1, (Latest Allowed Days - Offered Days) / (Latest Allowed Days - Target Days)))
- **Reliability Metric (Higher is Better):**
  Score = max(0, min(1, (Reliability - Min Threshold) / (1.0 - Min Threshold)))

#### Multi-Attribute Utility Function (MAUT)
- Buyer Utility = w_p * S_price + w_d * S_delivery + w_r * S_reliability + w_q * S_quality + w_t * S_terms
- Seller Utility = w_profit * S_margin + w_vol * S_volume + w_cash * S_cashflow + w_inv * S_inventory

#### Pareto Dominance Criterion
A candidate deal A dominates deal B if:
- Buyer Utility(A) >= Buyer Utility(B) AND Seller Utility(A) >= Seller Utility(B)
- With at least one strict inequality.

The **Pareto Frontier** consists of all candidate deals that are not dominated by any other feasible deal.

---

### 4.5 The 4 Canonical Deal Options

From the computed Pareto frontier, the system distills four distinct commercial profiles for human selection:

1. **Option 01: Best Overall (Recommended):** Highest balanced utility score. Optimal trade-off of price concession for upfront payment (500 units @ ₹765 = ₹382,500).
2. **Option 02: Lowest Price / Cash Outlay:** Minimizes cash expenditure (₹360,000) to match the target budget, at a slightly reduced volume (450 units @ ₹800) on Net 30 terms.
3. **Option 03: Fastest Delivery:** Maximizes delivery SLA speed (3-day express fulfillment @ ₹780) staying within the authorized ceiling.
4. **Option 04: Best Unit Economics:** Lowest per-unit acquisition cost (₹695.45/unit) by committing to a larger order volume (600 units @ ₹417,270).

---

### 4.6 Hard Constraint Matrix & Spend Authority Gates

Before any deal is presented to the user, it must achieve a unanimous `PASS` across the deterministic Validation Matrix:

| Dimension | Status | Commercial Policy Rule |
| :--- | :--- | :--- |
| 1. Price | PASS | Total spend <= maxTotalBudget |
| 2. Margin Floor | PASS | Seller profit >= 10.0% COGS |
| 3. Inventory | PASS | Quantity <= availableStock |
| 4. Delivery SLA | PASS | Days <= latestAcceptableDays |
| 5. Payment Terms | PASS | Terms in acceptableTerms |
| 6. Certification | PASS | Required ISO 9001 certified |
| 7. Authority Gate | PASS | Spend within approval tier |

#### Spend Authority Governance Gates
- **Level 1 (Autonomous):** Orders < ₹50,000 with verified suppliers can execute autonomously if all hard constraints pass.
- **Level 2 (Standard Commercial Gate):** Orders between ₹50,000 and ₹500,000 require mandatory human sign-off via the Decision Interface.
- **Level 3 (Executive Escalation):** Orders > ₹500,000 or deals requesting policy exemptions require executive authorization.

---

## 5. Canonical Scenarios & Test Suite

The engine includes 10 canonical benchmark scenarios in `src/data/canonicalScenarios.ts` that serve as integration tests:

| Scenario ID | Name | Core Commercial Behavior Tested |
| :--- | :--- | :--- |
| `scenario-01` | Standard Commercial Agreement | ZOPA exists. Both sides negotiate to balanced Pareto compromise. |
| `scenario-02` | Buyer Below Seller Floor | Buyer budget < Seller floor. Correctly outputs `NoDealCertificate`. |
| `scenario-03` | Quantity Unlocks Volume Discount | Volume expansion from 500 to 600 unlocks Tier 3 pricing (₹695/u). |
| `scenario-04` | Cheap vs Reliable Supplier | Trade-off between a cheap 85% SLA supplier vs expensive 98% SLA supplier. |
| `scenario-05` | Multi-Supplier Basket | Order split across two suppliers to prevent stockout. |
| `scenario-06` | Faster Delivery Trade-Off | Expedited freight surcharge tested against production delay penalty. |
| `scenario-07` | Upfront Payment Financing Discount | 100% upfront cash payment yields a 5.5% price reduction. |
| `scenario-08` | Long-Term Contract Discount | 12-month commitment unlocks recurring enterprise discounts. |
| `scenario-09` | Missing Information Prompt | DealFlow detects missing delivery destination and prompts user. |
| `scenario-10` | Authority Boundary Gate | Purchase exceeding budget threshold triggers executive review modal. |

---

## 6. Getting Started & Operational Guide

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **Package Manager:** npm v10.0.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/a2a-deal-engine.git

# Enter project directory
cd a2a-deal-engine

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open https://a2a-nego-engine.vercel.app/ in your browser.
Supported direct routes:
- `/` — Homepage & Interactive Hero Demo
- `/buyer` — Buyer Negotiation Workspace & Intent Composer
- `/seller` — Seller Desk & Margin Control
- `/admin` — Governance Console & Audit Log

### Running the Test Suite
The repository includes a comprehensive 48-test test suite verifying scenarios, agent protocols, UI invariants, and AI services:
```bash
npm test
```
```
# tests 48
# suites 4
# pass 48
# fail 0
```

### Production Build
```bash
npm run build
```
Generates an optimized client bundle in `dist/` in ~300ms using Vite and Tailwind CSS v4.

---

## License

Enterprise Commercial License — A2A DealFlow Engine. All rights reserved.
