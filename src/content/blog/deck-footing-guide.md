---
title: "Deck Footing Calculator Guide: How Many Footings and How Deep"
description: "How to calculate deck footing sizes, spacing, depth, and concrete volume. Includes IRC tables and soil bearing capacity basics."
publishedAt: "2026-06-13"
updatedAt: "2026-11-09"
author: "BuildByMath Team"
tags: ["decking", "foundation", "concrete"]
relatedCalculators: ["deck-footing-calculator", "concrete-bags-calculator", "concrete-footing-calculator"]
draft: false
---
> **Sizing tables need project-specific verification.** The dimensional examples below estimate material only. The listed footing diameters and soil values have not been verified for your loads, soil, adopted code, or jurisdiction and must not be used as approved structural sizes. Obtain the footing and support schedule from your approved plans. The [AWC deck guide](https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf) explains why the framing layout and tributary loads matter.


Deck footings are the most safety-critical part of any deck project. They must carry the deck load to stable soil below the frost line. Under-sized or under-depth footings cause deck settlement, tilting, and structural failure. This guide covers how to get them right.

## How Many Footings Do You Need?

The number of footings depends on your post layout, which is driven by beam spans. A typical pattern:

- Posts every 8–10 feet along the beam run
- Beams spanning 8–12 feet between posts
- One footing per post

**Example:** A 12×20 ft deck with two beam lines, posts at 8 ft:
- Beam 1 (20 ft, supports at both ends): ceil(20/8) + 1 = 4 posts
- Beam 2 (20 ft, supports at both ends): 4 posts
- **Total: 8 footings for this assumed two-beam layout**

The calculator uses a full grid instead: a 12×16 ft footprint at maximum 8 ft spacing gives (ceil(12/8)+1) × (ceil(16/8)+1) = **9 supports**. A ledger-supported or two-beam design can differ. Neither example establishes an approved design; use the ledger, beam, joist and footing layout from your plans.

## Footing Size Requirements

Use our [Deck Footing Calculator](/calculators/deck-footing-calculator/) to estimate material after obtaining the support layout and dimensions from approved plans. Loads, tributary areas and site bearing pressure are required; the previous generic diameter table was not verified and is not a design reference.

## Footing Depth

Frost movement can damage foundations. Use the approved frost-protection detail and founding depth for the site; the regional figures below are context only.

Illustrative regional frost-depth ranges, not approved founding depths:

| Region | Frost Depth |
|--------|------------|
| South (FL, TX, AZ) | 0–12 inches |
| Mid-South | 12–18 inches |
| Mid-Atlantic | 24–36 inches |
| Midwest | 36–48 inches |
| Northern states | 42–60 inches |

Verify with your local building department — they have exact required depths for your jurisdiction.

## Concrete Volume Per Footing

For a round sonotube footing:
**Volume = π × (diameter ÷ 2)² × depth**

| Diameter | 36" Deep | 42" Deep | 48" Deep |
|---------|---------|---------|---------|
| 10" | 1.63 ft³ (3 bags 80lb) | 1.91 ft³ (4 bags) | 2.18 ft³ (4 bags) |
| 12" | 2.36 ft³ (4 bags) | 2.75 ft³ (5 bags) | 3.14 ft³ (6 bags) |
| 14" | 3.21 ft³ (6 bags) | 3.75 ft³ (7 bags) | 4.28 ft³ (8 bags) |

Bags assume 0.60 cu ft yield per 80 lb bag. Use our [Concrete Bags Calculator](/calculators/concrete-bags-calculator/) for totals across all footings.

## Frequently Asked Questions

**Do I need a permit for deck footings?**
Confirm permit and inspection requirements with the local building authority before construction.

**Can I use deck blocks instead of poured footings?**
Use deck blocks only where permitted by the approved design and local building requirements; this guide does not establish a permit exemption.

**How long after pouring before I can put posts on the footings?**
Use the concrete supplier and approved project requirements for curing, strength verification and loading. Elapsed time alone does not establish when a footing can carry construction or service loads.

---

**See also:** [Concrete Calculation Methodology](/methodology/concrete/) — footing volume formulas, bag yield tables, and ACI 318 references behind BuildByMath concrete calculators.
