---
title: "Rafter Length Formula Guide: How to Calculate Roof Rafters"
description: "How to calculate rafter length, ridge height, bird's mouth dimensions, and total lumber for any roof configuration."
publishedAt: "2026-06-08"
updatedAt: "2026-06-13"
author: "ConstructCalc Team"
tags: ["framing", "roofing", "calculation"]
relatedCalculators: ["rafter-calculator", "roof-pitch-calculator", "lumber-calculator"]
draft: false
---

Calculating rafter length is one of the fundamental skills in roof framing. Every piece of the roof system — the ridge board, the rafters, the ceiling joists — depends on accurate rafter math. Get it right and your roof goes together smoothly. Get it wrong and you're making field corrections that waste material and time.

> **Quick Answer:** Rafter Length = Run × Slope Multiplier. For 6:12 pitch the multiplier is 1.118. Add overhang × multiplier for the tail, subtract half the ridge board thickness at the top. Use our [Rafter Calculator](/calculators/rafter-calculator/) for complete dimensions including bird's mouth cut.

## The Basic Rafter Triangle

A roof rafter forms the hypotenuse of a right triangle:
- **Run** = horizontal distance from wall plate to ridge (half the building width for a simple gable)
- **Rise** = vertical height from plate to ridge
- **Rafter length** = the diagonal distance

Using the Pythagorean theorem:
**Rafter Length = √(Run² + Rise²)**

## Calculating Rise from Pitch

Roof pitch is expressed as rise over run per 12 inches. For a 6:12 pitch:
- For every 12 inches of horizontal run, the roof rises 6 inches

**Rise = Run × (Pitch ÷ 12)**

**Example:** Building 28 feet wide, 6:12 pitch
- Run = 28 ÷ 2 = **14 feet**
- Rise = 14 × (6 ÷ 12) = 14 × 0.5 = **7 feet**
- Rafter length = √(14² + 7²) = √(196 + 49) = √245 = **15.65 feet**

Use our [Rafter Calculator](/calculators/rafter-calculator/) to get this result instantly, along with bird's mouth and tail dimensions.

## The Slope Multiplier Shortcut

Instead of the Pythagorean formula, you can use a pre-calculated slope multiplier:

**Rafter Length = Run × Multiplier**

| Pitch | Multiplier |
|-------|-----------|
| 3:12 | 1.031 |
| 4:12 | 1.054 |
| 5:12 | 1.083 |
| 6:12 | 1.118 |
|7:12 | 1.158 |
| 8:12 | 1.202 |
| 9:12 | 1.250 |
| 10:12 | 1.302 |
| 12:12 | 1.414 |

For our 14-foot run at 6:12: 14 × 1.118 = **15.65 feet** — same result.

The multiplier method is faster when you're calculating many rafters of the same pitch.

## Ridge Board Adjustment

The rafter length calculated above runs to the centerline of the ridge. In practice, the rafter sits against the side of the ridge board, not the center. Subtract half the ridge board thickness from the calculated length.

For a 1.5-inch thick ridge board (a standard 2× ridge):
- Deduct: 1.5 ÷ 2 = **0.75 inches** from the calculated rafter length

This is called the **ridge deduction** or **shortening allowance**.

## The Bird's Mouth Cut

The bird's mouth is a notch cut near the bottom of the rafter where it seats on the wall plate. It has two cuts:
- **Seat cut (plumb)** — vertical cut, parallel to the roof slope
- **Heel cut (level)** — horizontal cut, resting on the top of the wall plate

Standard bird's mouth depth: 1.5 inches (so the rafter doesn't cut more than 1/3 of the rafter depth — code requirement).

The bird's mouth is located at the outer face of the wall, measured along the rafter from the ridge end.

## Rafter Tail (Overhang)

The rafter tail is the portion that extends beyond the wall to form the roof overhang. Standard residential overhangs are 12–24 inches (measured horizontally).

**Tail rafter length = Overhang (horizontal) × Slope multiplier**

For a 12-inch overhang at 6:12: 1.0 × 1.118 = **1.118 feet = 13.4 inches**

Add this to the rafter length for the total rafter to cut.

## Total Rafter Length to Order

**Total = (Run × Multiplier) - Ridge deduction + Tail length + 6" cutting allowance**

For our example (14 ft run, 6:12, 18" overhang, 1.5" ridge):
- Rafter to ridge: 14 × 1.118 = 15.65 ft
- Ridge deduction: -0.0625 ft (0.75")
- Tail (18" ÷ 12" × 1.118): +1.68 ft
- Cutting allowance: +0.5 ft
- **Total: 17.77 ft → order 18-foot lumber**

## Rafter Count

For a simple gable roof: **(Building Length ÷ Rafter Spacing) + 1** per side, times 2 sides.

**Example:** 40-foot long building, 16" OC spacing:
- 40 ft ÷ (16/12) ft = 30 spaces + 1 = 31 rafters per side
- × 2 sides = **62 rafters**

Add 2 for end wall "lookout" or fly rafters if applicable.

## Frequently Asked Questions

**What size lumber for roof rafters?**
Rafter size depends on span, spacing, species, and load. Common rules of thumb for 16" OC framing:
- Up to 14 ft span: 2×6 (many species)
- Up to 18 ft span: 2×8
- Up to 22 ft span: 2×10
Always verify with span tables for your specific lumber species and load conditions.

**What's a common rafter vs. a hip rafter?**
A common rafter runs perpendicular from the wall plate to the ridge. A hip rafter runs diagonally from a building corner to the ridge. Hip rafter length calculation uses a different formula (the 3D version of the Pythagorean theorem).

**What is a plumb cut?**
The plumb cut is the vertical cut at the top of the rafter where it meets the ridge board. "Plumb" means vertical — the cut face is plumb (vertical) when the rafter is installed at its proper slope.

**How do I mark rafters for a production cut?**
Use a speed square and a story pole (a straight stick marked with your rise-per-run). Mark the plumb cut, seat cut, and heel cut on one rafter, test it, then use it as a pattern for the rest.

---

**See also:** [Framing Calculation Methodology](/methodology/framing/) — IRC R602 references, rafter length formulas, board-foot calculations, and lumber waste factors behind ConstructCalc framing calculators.
