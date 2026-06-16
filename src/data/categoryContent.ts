export interface CalcTool {
  name: string;
  href: string;
  desc: string;
}

export interface CostItem {
  label: string;
  range: string;
  note?: string;
}

export interface RefTableSection {
  type: 'table';
  title: string;
  headers: string[];
  rows: string[][];
  note?: string;
}

export interface IntroSection {
  type: 'intro';
  text: string;
}

export interface ToolsSection {
  type: 'tools';
  title: string;
  tools: CalcTool[];
}

export interface CostsSection {
  type: 'costs';
  title: string;
  items: CostItem[];
  tip?: string;
}

export interface CalloutSection {
  type: 'callout';
  variant: 'tip' | 'info' | 'warning';
  title: string;
  items: string[];
}

export type CategorySection =
  | IntroSection
  | ToolsSection
  | CostsSection
  | RefTableSection
  | CalloutSection;

export interface CategoryContent {
  sections: CategorySection[];
}

export const categoryContent: Record<string, CategoryContent> = {
  concrete: {
    sections: [
      {
        type: 'intro',
        text: 'Concrete is the foundation of nearly every construction project. Getting your quantities right before you pour saves money, prevents mid-job shortages, and eliminates costly over-ordering. Our calculators use the same formulas contractors rely on every day, with built-in waste factors and both imperial and metric support.',
      },
      {
        type: 'tools',
        title: 'Concrete Calculator Tools',
        tools: [
          {
            name: 'Concrete Slab Calculator',
            href: '/calculators/concrete-slab-calculator/',
            desc: 'Enter length, width, and thickness to get cubic yards, cubic feet, and cubic meters instantly. Works for patios, garage floors, pool decks, and any flat pour.',
          },
          {
            name: 'Concrete Bags Calculator',
            href: '/calculators/concrete-bags-calculator/',
            desc: 'Tells you exactly how many 40, 50, 60, or 80 lb bags you need for hand-mixed jobs. Accounts for yield per bag so you never underorder.',
          },
          {
            name: 'Concrete Footing Calculator',
            href: '/calculators/concrete-footing-calculator/',
            desc: 'Handles rectangular strip footings and gives you volume for the entire run. The most critical pour in any structure.',
          },
          {
            name: 'Concrete Driveway Calculator',
            href: '/calculators/concrete-driveway-calculator/',
            desc: 'Accounts for standard driveway thickness (4–6 inches) and outputs volume ready to pass to your ready-mix supplier.',
          },
          {
            name: 'Concrete Block Calculator',
            href: '/calculators/concrete-block-calculator/',
            desc: 'Enter wall dimensions and block size to get a precise count with mortar joints included.',
          },
          {
            name: 'Post Hole Calculator',
            href: '/calculators/post-hole-calculator/',
            desc: 'Concrete volume for fence posts, deck footings, and sign bases. Enter hole diameter, depth, and post count.',
          },
          {
            name: 'Concrete Slab + Rebar Calculator',
            href: '/calculators/concrete-slab-rebar-calculator/',
            desc: 'Get concrete volume and rebar quantities in one step — cubic yards of concrete plus linear feet, piece count, and weight of rebar for any reinforced slab.',
          },
        ],
      },
      {
        type: 'costs',
        title: 'Concrete Cost Reference',
        items: [
          {
            label: 'Ready-mix concrete',
            range: '$125–$175 per cubic yard',
            note: 'Delivered; varies by region and mix design',
          },
          {
            label: 'Bag concrete (80 lb)',
            range: '$6–$9 per bag',
            note: 'Yields approx. 0.60 cu ft — practical for jobs under 1 yard',
          },
          {
            label: 'Fiber reinforcement additive',
            range: '$8–$15 per bag added',
            note: 'Reduces cracking; replaces rebar for small residential slabs',
          },
        ],
        tip: 'Always add 5–10% to your calculated volume for waste, spillage, and subgrade variation.',
      },
      {
        type: 'table',
        title: 'Concrete Mix Reference',
        headers: ['Strength', 'Typical Use', 'Mix Ratio (cement:sand:aggregate)'],
        rows: [
          ['3,000 psi', 'Residential slabs, sidewalks', '1:2:3'],
          ['3,500 psi', 'Driveways, commercial floors', '1:1.5:3'],
          ['4,000 psi', 'Structural, heavy loads', '1:1.5:2.5'],
        ],
        note: 'Ready-mix suppliers offer these as standard mixes. For bag concrete, follow the bag label for the labeled psi rating.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Curing Time Guidelines',
        items: [
          'Foot traffic: safe after 24–48 hours',
          'Vehicle traffic: safe after 7 days (~70% strength)',
          'Full design strength: 28 days',
          'Avoid heavy loads and freezing temperatures during the first 7 days',
        ],
      },
    ],
  },

  framing: {
    sections: [
      {
        type: 'intro',
        text: 'Framing is the structural skeleton of every building. Whether you\'re framing a new wall, calculating rafter lengths for a shed roof, or estimating lumber for a room addition, accurate material counts prevent waste and keep your project on schedule.',
      },
      {
        type: 'tools',
        title: 'Framing Calculator Tools',
        tools: [
          {
            name: 'Stud Calculator',
            href: '/calculators/stud-calculator/',
            desc: 'Enter wall length and stud spacing (16" or 24" OC). Accounts for corners, openings, and top/bottom plates.',
          },
          {
            name: 'Rafter Calculator',
            href: '/calculators/rafter-calculator/',
            desc: 'Calculate rafter length, ridge height, bird\'s mouth cut, and board feet from span and roof pitch. Works for gable, shed, and hip roofs.',
          },
          {
            name: 'Roof Pitch Calculator',
            href: '/calculators/roof-pitch-calculator/',
            desc: 'Convert rise-over-run to degrees, calculate slope multipliers, and find rafter length from run. Essential before ordering any roofing material.',
          },
          {
            name: 'Roofing Calculator',
            href: '/calculators/roofing-calculator/',
            desc: 'Estimate shingles (squares), underlayment, and ridge cap for any roof shape.',
          },
          {
            name: 'Metal Roofing Calculator',
            href: '/calculators/metal-roofing-calculator/',
            desc: 'Calculate metal panel coverage, trim lengths, and fastener quantities for standing seam and corrugated profiles.',
          },
          {
            name: 'Drywall Calculator',
            href: '/calculators/drywall-calculator/',
            desc: 'How many 4×8 or 4×12 sheets for a room? Handles multiple walls, windows, and doors with 10% waste built in.',
          },
          {
            name: 'Plywood Calculator',
            href: '/calculators/plywood-calculator/',
            desc: 'Sheet count for subfloors, wall sheathing, or roof decking.',
          },
          {
            name: 'Lumber Calculator',
            href: '/calculators/lumber-calculator/',
            desc: 'Board count, linear footage, and board feet for any framing dimension. Use for joist packages, header stock, and material orders.',
          },
          {
            name: 'Board Foot Calculator',
            href: '/calculators/board-foot-calculator/',
            desc: 'The standard lumber pricing unit. Convert dimensions to board feet for any species and size.',
          },
          {
            name: 'Stair Calculator',
            href: '/calculators/stair-calculator/',
            desc: 'Rise, run, total staircase dimensions, and stringer length. Checks against IRC code limits for riser height and tread depth.',
          },
        ],
      },
      {
        type: 'table',
        title: 'Lumber Size Quick Reference',
        headers: ['Nominal Size', 'Actual Size'],
        rows: [
          ['2×4', '1.5" × 3.5"'],
          ['2×6', '1.5" × 5.5"'],
          ['2×8', '1.5" × 7.25"'],
          ['2×10', '1.5" × 9.25"'],
          ['2×12', '1.5" × 11.25"'],
        ],
        note: 'Always use actual dimensions for load capacity calculations. Use nominal size when ordering from the lumber yard.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Standard Framing Practices',
        items: [
          'Load-bearing walls: 16" on center stud spacing',
          'Non-load-bearing partitions: 24" on center is acceptable',
          'Quick estimate: approximately 1 stud per linear foot of wall at 16" OC',
          'Add 10–15% waste for standard cuts; 15–20% for complex roof framing',
          'Add 3 studs per corner assembly and 4 studs per opening (2 king + 2 jack studs)',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Actual vs. Nominal Lumber Sizes',
        items: [
          'A "2×4" measures 1.5" × 3.5" after drying and milling',
          'A "2×6" measures 1.5" × 5.5" — not 2" × 6"',
          'Always use actual dimensions for structural calculations and load capacity checks',
        ],
      },
    ],
  },

  decking: {
    sections: [
      {
        type: 'intro',
        text: 'A well-planned deck starts with accurate footing and material estimates. Undersized footings cause settlement; undersized material orders cause work stoppages. Our deck calculators help you get both right before the first shovel hits the ground.',
      },
      {
        type: 'tools',
        title: 'Deck Calculator Tools',
        tools: [
          {
            name: 'Deck Footing Calculator',
            href: '/calculators/deck-footing-calculator/',
            desc: 'Enter post count, load area, and soil bearing capacity to get footing diameter and concrete volume per footing. Outputs total cubic feet and bag count for all footings.',
          },
          {
            name: 'Concrete Bags Calculator',
            href: '/calculators/concrete-bags-calculator/',
            desc: 'Quick bag count for all your deck footings. Works alongside the footing calculator to give you a final order quantity.',
          },
          {
            name: 'Lumber Calculator',
            href: '/calculators/lumber-calculator/',
            desc: 'Joist, beam, and decking board quantities for any deck footprint.',
          },
          {
            name: 'Board Foot Calculator',
            href: '/calculators/board-foot-calculator/',
            desc: 'For pricing pressure-treated lumber orders by volume.',
          },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Footing Depth Requirements',
        items: [
          'Footings must extend below the frost line in your climate zone',
          'Northern US (Zone 5–7): 36–42 inches minimum depth',
          'Southern US (Zone 8–9): 12–18 inches is typically sufficient',
          'Always verify frost depth requirements with your local building department',
        ],
      },
      {
        type: 'table',
        title: 'Post Sizing by Deck Height',
        headers: ['Deck Height', 'Recommended Post Size'],
        rows: [
          ['Under 8 ft', '4×4 (light loads) or 6×6'],
          ['8–14 ft', '6×6'],
          ['Over 14 ft', '6×6 or engineered post'],
        ],
        note: 'For decks over 10 feet above grade, consult a structural engineer for post and beam sizing.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Standard Footing Diameters',
        items: [
          'Light loads, small deck, 6-ft spans: 10–12 inch diameter',
          'Typical residential deck: 12–16 inch diameter',
          'Heavy loads, hot tub, large cantilever: 16–24 inch diameter',
          'A 12-inch footing at 42 inches deep requires approx. 0.327 cubic feet of concrete (about half an 80 lb bag)',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Permit Requirements',
        items: [
          'Most jurisdictions require a permit for decks over 200 sq ft',
          'Decks attached to the house almost always require a permit',
          'Check with your local building department before breaking ground',
        ],
      },
    ],
  },

  fencing: {
    sections: [
      {
        type: 'intro',
        text: 'Whether you\'re installing a privacy fence, split rail, or chain link, the math always starts the same way: how many posts, how far apart, and how much concrete? Get those numbers right before you call the lumber yard.',
      },
      {
        type: 'tools',
        title: 'Fence Calculator Tools',
        tools: [
          {
            name: 'Fence Post Calculator',
            href: '/calculators/fence-post-calculator/',
            desc: 'Enter total fence length and post spacing. Returns post count, panel count, concrete per post, and total concrete volume. Handles corners, gates, and end posts.',
          },
          {
            name: 'Post Hole Calculator',
            href: '/calculators/post-hole-calculator/',
            desc: 'Enter hole diameter, depth, and post count to get cubic feet and bag equivalents. Subtracts post displacement automatically.',
          },
          {
            name: 'Concrete Bags Calculator',
            href: '/calculators/concrete-bags-calculator/',
            desc: 'Quick bag count for all your fence post holes.',
          },
          {
            name: 'Lumber Calculator',
            href: '/calculators/lumber-calculator/',
            desc: 'Rails, pickets, and boards for wood fence construction.',
          },
        ],
      },
      {
        type: 'table',
        title: 'Post Spacing by Fence Type',
        headers: ['Fence Type', 'Typical Post Spacing'],
        rows: [
          ['Wood privacy (6 ft)', '6–8 ft on center'],
          ['Wood rail fence', '8–10 ft on center'],
          ['Chain link', '10 ft on center'],
          ['Split rail', '8–10 ft on center'],
          ['Vinyl panel', '6–8 ft on center'],
        ],
        note: 'In high-wind zones, reduce to 6 ft spacing for privacy fences to improve rigidity.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Post Depth Standards',
        items: [
          'Posts should be buried 1/3 of their total length (minimum 2 ft in frost-free areas)',
          '6-foot fence post: bury 2 feet — use 8-foot posts',
          '8-foot fence post: bury 2.5–3 feet — use 10 or 12-foot posts',
          'A 10-inch diameter hole at 2.5 ft deep uses approx. 2 bags of 80 lb mix per post',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Panel vs. Board Fencing',
        items: [
          'Panel fencing (pre-assembled 6×6 or 6×8 sections) installs faster but is less flexible on uneven terrain',
          'Board-on-board fencing is adjustable for slopes, allows airflow, and has a more finished look',
          'Material cost for board-on-board is slightly higher but offers better long-term value',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Gate Post Requirements',
        items: [
          'Gate posts must be set at least 6 inches deeper than standard posts',
          'Use a minimum 12-inch diameter hole for gate posts',
          'Double-post gate systems use 4 posts for double gates',
          'Never hang a gate from standard fence posts — they will fail under lateral load',
        ],
      },
    ],
  },

  excavation: {
    sections: [
      {
        type: 'intro',
        text: 'Every outdoor project starts with the ground. Whether you\'re grading a yard, laying a gravel driveway, adding topsoil to a garden bed, or digging a French drain, knowing exact material volumes prevents costly over-ordering and shortfalls on delivery day.',
      },
      {
        type: 'tools',
        title: 'Excavation Calculator Tools',
        tools: [
          {
            name: 'Gravel Calculator',
            href: '/calculators/gravel-calculator/',
            desc: 'Enter area and depth to get cubic yards of gravel, crushed stone, or base material. Works for driveways, walkways, patios, and drainage layers.',
          },
          {
            name: 'Excavation Calculator',
            href: '/calculators/excavation-calculator/',
            desc: 'Calculate the volume of dirt to remove for a foundation, pool, or grade cut. Outputs cubic yards for hauling estimates and fill comparisons.',
          },
          {
            name: 'Topsoil Calculator',
            href: '/calculators/topsoil-calculator/',
            desc: 'How many cubic yards (or truckloads) of topsoil for a lawn, garden bed, or raised bed? Enter square footage and depth.',
          },
          {
            name: 'French Drain Calculator',
            href: '/calculators/french-drain-calculator/',
            desc: 'Linear footage of pipe, gravel volume for the trench, and fabric area for any drainage run.',
          },
          {
            name: 'Sand Calculator',
            href: '/calculators/sand-calculator/',
            desc: 'Volume and weight for bedding sand under pavers, sandbox fill, or concrete mix aggregate.',
          },
          {
            name: 'Mulch Calculator',
            href: '/calculators/mulch-calculator/',
            desc: 'Cubic yards of mulch for garden beds. Standard depth is 2–3 inches; 3–4 inches for weed suppression.',
          },
        ],
      },
      {
        type: 'table',
        title: 'Gravel and Fill Material Reference',
        headers: ['Material', 'Typical Use', 'Weight per Cubic Yard'],
        rows: [
          ['Crushed limestone', 'Driveways, base layers', '1.4–1.6 tons'],
          ['Pea gravel', 'Drainage, landscaping', '1.3–1.4 tons'],
          ['River rock', 'Decorative, drainage', '1.3–1.5 tons'],
          ['Crushed concrete', 'Base fill', '1.4–1.5 tons'],
          ['Clean fill dirt', 'Grading, backfill', '1.1–1.4 tons'],
          ['Topsoil', 'Lawn, garden beds', '0.9–1.1 tons'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Delivery Size Reference',
        items: [
          'Pickup truck: 0.5–1 cubic yard',
          'Small dump trailer: 2–3 cubic yards',
          'Single-axle dump truck: 5–7 cubic yards',
          'Tandem dump truck: 10–14 cubic yards',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'French Drain Planning',
        items: [
          'Standard trench: 12–18 inches wide, 18–24 inches deep',
          'Fill with clean 3/4" to 1.5" crushed stone (no fines)',
          'Use perforated pipe wrapped in filter fabric at the base',
          'Slope the trench at least 1/8" per foot toward the outlet',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Fill Dirt vs. Topsoil',
        items: [
          'Fill dirt is subsoil used to raise grades and fill voids',
          'Topsoil is the upper organic-rich layer used only for planting and lawn areas',
          'Never use topsoil as structural fill — it compresses and settles over time',
        ],
      },
    ],
  },

  masonry: {
    sections: [
      {
        type: 'intro',
        text: 'Masonry work requires careful material estimation. Too few blocks and you halt work waiting on delivery; too many and you\'re stuck with unmixed mortar and unused material. Our masonry calculators give you exact counts before the first block is laid.',
      },
      {
        type: 'tools',
        title: 'Masonry Calculator Tools',
        tools: [
          {
            name: 'Concrete Block Calculator',
            href: '/calculators/concrete-block-calculator/',
            desc: 'How many 8×8×16 CMU blocks for a wall? Enter wall dimensions, block size, and the tool accounts for mortar joints and standard course heights.',
          },
          {
            name: 'Mortar Calculator',
            href: '/calculators/mortar-calculator/',
            desc: 'Volume of mortar mix needed for block walls, brick veneer, or stone work. Accounts for joint width and coverage per bag.',
          },
          {
            name: 'Grout Calculator',
            href: '/calculators/grout-calculator/',
            desc: 'Tile and paver grout quantity by square footage and joint width. Works for sanded and unsanded grout.',
          },
          {
            name: 'Post Hole Calculator',
            href: '/calculators/post-hole-calculator/',
            desc: 'Concrete volume for post holes supporting masonry structures.',
          },
          {
            name: 'Square Footage Calculator',
            href: '/calculators/square-footage-calculator/',
            desc: 'Quick area calculator for any rectangular space — foundation for all masonry volume calculations.',
          },
        ],
      },
      {
        type: 'table',
        title: 'Standard Masonry Block Dimensions',
        headers: ['Block Type', 'Nominal Size', 'Actual Size'],
        rows: [
          ['Standard CMU', '8×8×16"', '7.625×7.625×15.625"'],
          ['Half block', '8×8×8"', '7.625×7.625×7.625"'],
          ['Solid block', '4×8×16"', '3.625×7.625×15.625"'],
          ['Standard brick', '4×2.25×8"', '3.75×2.25×8"'],
        ],
        note: 'Mortar joints are typically 3/8" (0.375") for block and brick work.',
      },
      {
        type: 'table',
        title: 'Mortar Mix Types',
        headers: ['Type', 'Mix Ratio (cement:lime:sand)', 'Typical Use'],
        rows: [
          ['Type S', '1:0.5:4.5', 'Load-bearing walls, below-grade work'],
          ['Type N', '1:1:6', 'Non-load-bearing, above-grade exterior'],
          ['Type M', '1:0.25:3', 'Foundations, retaining walls'],
        ],
        note: 'One 80 lb bag of mortar mix covers approximately 25–35 standard CMU blocks, depending on joint consistency.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Retaining Wall Design Guidelines',
        items: [
          'Walls under 4 ft: typically no engineered design required',
          'Walls 4–6 ft: consult local codes and manufacturer specs',
          'Walls over 6 ft: always requires a structural engineer',
          'Standard setback (batter): 1 inch per course for gravity walls',
          'Always include drainage aggregate and perforated pipe behind retaining walls',
        ],
      },
    ],
  },
};
