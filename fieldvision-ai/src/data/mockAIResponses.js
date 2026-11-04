// Mock AI responses and sample tactical queries without hardcoded player names or arbitrary confidence values

export const AI_TACTICAL_DATA = {
  insights: [
    {
      id: 'ins_1',
      type: 'warning',
      category: 'Boundary Risk Zone',
      title: 'Gap Exposed: Deep Extra Cover',
      description: 'With deliveries angled across the batsman on a fuller length, leaving Deep Extra Cover vacant creates an elevated boundary conversion risk along the drive corridor.',
      recommendation: 'Position Deep Extra Cover 25m deeper to protect the boundary rope.',
      impactScore: 'High Boundary Risk',
    },
    {
      id: 'ins_2',
      type: 'success',
      category: 'Wicket Opportunity',
      title: 'Short Ball Rib-Cage Corridor Available',
      description: 'Pitched short between the armpit and shoulder line with a packed leg-side ring, targeting miscued pull shots toward fine leg and deep square.',
      recommendation: 'Keep Deep Square Leg fine and position Short Leg or Short Mid-Wicket for the ballooned miscue.',
      impactScore: 'Wicket Trap',
    },
    {
      id: 'ins_3',
      type: 'info',
      category: 'ICC Rule Compliance',
      title: 'Fielding Restrictions Verified',
      description: 'Fielder distribution complies with Law 28 restrictions (infield circle quota and leg-side maximums).',
      recommendation: 'No penalty risk detected.',
      impactScore: 'Fully Compliant',
    },
  ],

  sampleQueries: [
    {
      query: 'How to contain boundaries during death overs (17-20)?',
      response: {
        summary: 'Deploy a wide yorker / boundary containment field with 5 deep boundary riders.',
        bullets: [
          'Station boundary riders at Deep Backward Point, Deep Extra Cover, Long-Off, Long-On, and Deep Mid-Wicket.',
          'Bring Mid-Wicket up inside the 30-yard ring to eliminate single rotation.',
          'Instruct the bowler to target the wide tramline (4th/5th stump line) with yorkers and slower ball variations.',
          'Keep Wicketkeeper back slightly to prevent under-edges from bypassing third man.',
        ],
        fieldAction: 'death_overs',
      },
    },
    {
      query: 'Should I bring up a slip against a new batter?',
      response: {
        summary: 'Yes, setting a close slip cordon applies high pressure on incoming batsmen.',
        bullets: [
          'New batsmen exhibit a higher false-shot frequency during their first 8 to 10 deliveries against pace.',
          'Position 1st Slip 18 to 22 meters from the batsman at approximately 20° from the pitch axis.',
          'Ensure the slip fielder and wicketkeeper have staggered depths to avoid overlapping reach.',
        ],
        fieldAction: 'attacking',
      },
    },
    {
      query: 'Where are the biggest gaps in the current field?',
      response: {
        summary: 'Identified gaps between deep square and cow corner on the leg-side.',
        bullets: [
          'If the batsman gets underneath a length ball, the 90° to 135° sector lacks deep protection.',
          'Recommend nudging Mid-On deeper or shifting Deep Fine Leg square to cut off aerial shots.',
        ],
      },
    },
    {
      query: 'What field adjustments are needed for a left-handed batsman (LHB)?',
      response: {
        summary: 'Invert off/leg side field quadrants and protect the cover boundary against the left-hand drive arc.',
        bullets: [
          'Mirror field geometry so the off-side is on the batter\'s off-side (Screen Right).',
          'Deploy Deep Point and Deep Extra Cover to intercept square cuts and lofted drives.',
          'Place a Short Fine Leg inside the circle to prevent easy pad-tuck singles.',
        ],
      },
    },
  ],
};
