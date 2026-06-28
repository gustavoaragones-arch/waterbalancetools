'use strict';
// Academy – Vacation Rental Operations (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'CDC — Healthy Swimming Guidelines';

module.exports = [
  {
    id: 'vr-01',
    slug: 'academy/vacation-rentals/turnover-checklist',
    title: 'Pool Turnover Checklist for Vacation Rentals',
    description: 'A step-by-step turnover checklist for Airbnb and vacation rental pool and hot tub management between guest stays.',
    summary: 'A systematic turnover protocol ensures every incoming guest enters a safe, balanced pool or hot tub. This checklist covers chemistry, equipment, safety, and documentation.',
    category: 'vacation-rentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['vacation rental pool turnover', 'Airbnb pool checklist', 'rental pool between guests', 'short term rental pool maintenance'],
    overview: 'Between guest stays, a vacation rental pool or hot tub needs a systematic inspection and chemical reset. Rushing this process or skipping steps creates both safety risks and liability exposure.',
    keyFacts: [
      'Test water chemistry before and after every guest stay — departing guests may have significantly impacted it.',
      'Check pool safety equipment (life ring, reaching pole, first aid) at every turnover.',
      'A log of every turnover provides legal protection if a guest makes a safety complaint.',
      'Never allow incoming guests to access the pool before chemistry has been tested and confirmed safe.'
    ],
    sections: [
      {
        id: 'before-each-guest',
        h2: 'Before Each Guest Checks In',
        body: 'Test all water parameters (FC, pH, TA, hardness) within 24 hours of guest arrival. If FC is below 1 ppm (pool) or 3 ppm (hot tub), add chlorine immediately and test again before allowing access. If combined chlorine is above 0.5 ppm, shock overnight before the guest arrives. Inspect the pool deck and perimeter for hazards: broken tiles, slippery surfaces near the edge, damaged fencing, unsecured gates. Verify the safety equipment is present and accessible: US Coast Guard-approved life ring, reaching pole, first aid kit, and visible emergency contact numbers.'
      },
      {
        id: 'during-turnover',
        h2: 'During the Turnover',
        body: 'After the departing guests leave and before incoming guests arrive: 1) Empty skimmer baskets and pump strainer. 2) Skim the surface for visible debris. 3) Brush pool walls and floor if visible algae or dirt is present. 4) Test and record water chemistry. 5) Add any needed chemicals in the correct order (alkalinity, pH, then chlorine). 6) Inspect pool equipment (pump running, filter pressure normal, any visible leaks). 7) Check and record water clarity — turbidity should be low enough to see the main drain from the deck. 8) For hot tubs: test, adjust chemistry, and rinse the cover before each turnover.'
      },
      {
        id: 'after-turnover',
        h2: 'Documentation',
        body: 'Log the date, time, test results (before and after corrections), chemical additions, equipment status, and safety equipment check. If any issue was found that requires professional service (equipment failure, structural damage, persistent chemistry problem), note it and escalate appropriately before allowing guest access. This written record provides protection in the event of a liability claim and helps identify patterns — for example, if chemistry consistently degrades faster during summer weekend stays, you may need to adjust the chemical dosing for that period.'
      }
    ],
    examples: [
      {
        title: 'Sample Turnover Log Entry',
        body: 'Date: Saturday 10am. Pre-turnover test: FC 0.8 ppm (low), pH 7.9 (high), TA 100 ppm (ok), CH 220 ppm (ok), CC 0.4 ppm (borderline). Added: 2 quarts liquid chlorine (raised FC to estimate 2 ppm), 8 oz muriatic acid (lowered pH toward 7.4). Equipment check: all normal. Safety equipment: present and accessible. Re-test at noon: FC 2.5 ppm, pH 7.5, CC 0.1 ppm. Cleared for guest access 12:30pm. Logged and signed.'
      }
    ],
    commonMistakes: [
      'Testing chemistry the morning of check-in but not re-testing after adding chemicals — the correction may not have worked as expected.',
      'Skipping the safety equipment check because it was checked last time — equipment gets borrowed, moved, or damaged between stays.',
      'Not documenting turnover checks because the property seemed fine — without a log, you have no evidence of due diligence if a guest reports a problem.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-chlorine-calculator'],
    relatedResources: ['/resources/airbnb-pool-turnover-checklist', '/resources/pool-chemical-log-sheet', '/resources/water-test-log'],
    relatedTopics: ['academy/vacation-rentals/guest-safety', 'academy/vacation-rentals/chemical-log-sheets', 'academy/vacation-rentals/weekly-inspection'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/combined-chlorine', 'glossary/bather-load'],
    sources: [src, src2]
  },
  {
    id: 'vr-02',
    slug: 'academy/vacation-rentals/guest-safety',
    title: 'Pool Guest Safety for Vacation Rentals',
    description: 'Learn the safety requirements, equipment, signage, and communication steps that protect vacation rental guests and limit owner liability.',
    summary: 'Pool safety for vacation rentals requires proper equipment, clear signage, access controls, and guest communication. These measures protect guests and provide legal protection for the property owner.',
    category: 'vacation-rentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['vacation rental pool safety', 'Airbnb pool rules', 'rental property pool liability', 'pool guest safety requirements'],
    overview: 'Vacation rental pool safety is a combination of physical equipment, access controls, communication, and documentation. Each element reduces both guest injury risk and owner liability exposure.',
    keyFacts: [
      'Most jurisdictions require a US Coast Guard-approved life ring and reaching pole for residential pools available to guests.',
      'Pool access should be gated and locked when not supervised by adults.',
      'Guest communication (arrival email, physical signage) about pool rules provides documented evidence of safety instruction.',
      'Chemical safety: all pool chemicals must be stored in locked, ventilated areas inaccessible to guests and children.'
    ],
    sections: [
      {
        id: 'safety-equipment',
        h2: 'Required Safety Equipment',
        body: 'At minimum, every vacation rental pool should have: a Coast Guard-approved ring buoy with at least 50 feet of rope, mounted within reach of the pool edge; a reaching pole (15 feet minimum); a first aid kit with current supplies; visible CPR instruction placard; and a posted pool rules sign with emergency contact numbers (local emergency services and property manager). Check local jurisdictional requirements — many municipalities have specific requirements for residential pools rented to guests that go beyond these basics, including barrier height, gate self-closure, and drain safety compliance.'
      },
      {
        id: 'access-controls',
        h2: 'Access Controls',
        body: 'Pool gates should be self-latching and self-closing, with the latch on the pool side of the gate (so children cannot reach it from outside). Provide guests with a gate code or key that changes between stays. Consider a timer-based gate lock that prevents access during nighttime hours (typically 10pm–8am) — this protects you from liability during unsupervised late-night pool use. Hot tubs should have a lockable cover — provide guests with the combination or key. For platforms and raised spas, consider a removable barrier or fence section that prevents access during specific hours.'
      },
      {
        id: 'guest-communication',
        h2: 'Guest Communication',
        body: 'Communicate pool rules before and on arrival: send pool rules in the booking confirmation email, include a printed copy in the welcome packet, and post a laminated rules sign at the pool entrance. Rules should cover: no diving unless the pool is designed for it, no glass near the pool, no unsupervised children, hours of operation, maximum bather capacity (if applicable), shower before entering (especially for hot tubs), and emergency contact information. Document every communication — save the emails and photograph the posted signage annually.'
      }
    ],
    examples: [
      {
        title: 'Chemical Storage Audit',
        body: 'A vacation rental owner discovers that a guest child opened an unlocked storage bench near the pool and found several containers of pool chemicals. No injury occurred, but the situation reveals a significant liability gap. The fix: install a lockable chemical storage cabinet in the utility area, move all chemicals including test kits and small chlorine containers into it. Post "Pool Chemicals — Keep Locked" on the exterior. Change the combination with each guest turnover. Document the change with photos.'
      }
    ],
    commonMistakes: [
      'Storing pool chemicals in an unlocked area that guests can access — this is both a safety hazard and a liability issue.',
      'Not updating pool rules signage when pool features change (adding a hot tub, removing the diving board).',
      'Assuming the booking platform\'s general terms of service cover pool safety — most platforms require the host to comply with local safety regulations independently.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-chlorine-calculator'],
    relatedResources: ['/resources/airbnb-pool-turnover-checklist', '/resources/pool-chemical-log-sheet'],
    relatedTopics: ['academy/vacation-rentals/turnover-checklist', 'academy/vacation-rentals/chemical-log-sheets', 'academy/vacation-rentals/emergency-water-recovery'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/bather-load'],
    sources: [src2]
  },
  {
    id: 'vr-03',
    slug: 'academy/vacation-rentals/chemical-log-sheets',
    title: 'Chemical Log Sheets for Vacation Rentals',
    description: 'Learn what a pool chemical log should record, why documentation protects vacation rental owners, and how to set up an effective logging system.',
    summary: 'A written chemical log records every test, every addition, and every observation. It is both a management tool and legal protection for vacation rental pool owners.',
    category: 'vacation-rentals',
    readingTime: '4 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool chemical log', 'pool maintenance log sheet', 'vacation rental pool records', 'pool water test record'],
    overview: 'Chemical log sheets serve two purposes: they help you identify patterns in pool chemistry that need attention, and they provide documented evidence of diligent maintenance if a guest ever makes a health or safety complaint.',
    keyFacts: [
      'Record every test result, chemical addition, and observation — including when the pool was cleared for or closed to guest access.',
      'Store logs for at least 3 years — the standard statute of limitations for personal injury claims in most US states.',
      'A digital log (spreadsheet or app) is more searchable but a printed log that is signed is more defensible in a legal proceeding.',
      'The CDC and PHTA recommend logging free chlorine, pH, and combined chlorine for any pool serving multiple families.'
    ],
    sections: [
      {
        id: 'what-to-record',
        h2: 'What to Record',
        body: 'Every log entry should include: date and time; free chlorine reading; pH reading; total chlorine (and calculated combined chlorine); total alkalinity; calcium hardness (monthly); CYA (monthly); any chemicals added (product name, amount, time added); equipment status notes; water clarity assessment; and name or initials of the person who tested. For vacation rental properties, also record: when the pool was last cleared for guest access, any guest complaints received, and when (if ever) the pool was closed to guests for water quality reasons.'
      },
      {
        id: 'log-formats',
        h2: 'Log Formats',
        body: 'Physical logs: use the printable water test log sheet available in the Resources section. Laminate a fresh copy for each month and store completed months in a binder. Digital logs: a Google Sheet or spreadsheet shared with your property manager or pool service company allows real-time access. Pool management apps (like PoolMath or similar) provide timestamped logs that are difficult to alter retroactively — useful for demonstrating consistent maintenance history. Hybrid: use an app for daily recordings and print a monthly summary for the physical binder.'
      },
      {
        id: 'retention-and-storage',
        h2: 'Retention and Storage',
        body: 'Retain pool chemical logs for a minimum of 3 years. Store both the digital version (backed up to cloud storage) and a physical printed copy. If you switch to a new property manager or pool service, ensure the historical logs transfer with the property file. In the event of a liability claim, your attorney will want to see the complete maintenance history — gaps in the log are as problematic as bad readings. A clean, complete log demonstrating consistent testing and corrective action is the strongest possible defence against a claim of negligent pool management.'
      }
    ],
    examples: [
      {
        title: 'Using a Log to Catch a Pattern',
        body: 'Reviewing six months of pool logs for a busy vacation rental, the owner notices that free chlorine consistently drops below 1 ppm in the second day of any stay with 4+ guests. The log clearly shows this pattern across 12 separate stays. The fix: increase the automatic feeder rate for high-occupancy bookings and add a mid-stay chemistry check on day 2 for any reservation with more than 4 guests. Without the log, this pattern would have been invisible, and the under-chlorination would have continued to occur every other weekend.'
      }
    ],
    commonMistakes: [
      'Recording only test results and not recording chemical additions — without both, it is impossible to diagnose why results are changing.',
      'Logging with imprecise notes like "added some chlorine" instead of the specific amount — precise records are far more useful.',
      'Discarding physical logs after a calendar year — liability claims can be filed years after the alleged incident.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log', '/resources/pool-chemical-log-sheet', '/resources/pool-shock-log'],
    relatedTopics: ['academy/vacation-rentals/turnover-checklist', 'academy/vacation-rentals/weekly-inspection', 'academy/vacation-rentals/maintenance-schedule'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/combined-chlorine'],
    sources: [src, src2]
  },
  {
    id: 'vr-04',
    slug: 'academy/vacation-rentals/maintenance-schedule',
    title: 'Pool Maintenance Schedule for Vacation Rentals',
    description: 'Build a structured maintenance schedule for a vacation rental pool or hot tub that accounts for variable guest occupancy and seasonal chemistry changes.',
    summary: 'A written maintenance schedule accounts for the unpredictability of rental occupancy and ensures chemistry and equipment are managed consistently regardless of guest load.',
    category: 'vacation-rentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['vacation rental pool schedule', 'rental pool maintenance plan', 'Airbnb pool maintenance', 'rental property pool calendar'],
    overview: 'Vacation rental pools face variable bather load and potentially weeks between professional service. A structured schedule prevents the gaps that allow chemistry to drift into unsafe territory.',
    keyFacts: [
      'At-turnover testing (before each guest) is the non-negotiable minimum for any rented pool.',
      'High-occupancy weeks need at least one mid-stay chemistry check by a trusted neighbor or property manager.',
      'Schedule professional pool service visits to align with peak occupancy, not just calendar dates.',
      'Build a seasonal adjustment calendar: different chemical dosing schedules for low (winter) vs. peak (summer) seasons.'
    ],
    sections: [
      {
        id: 'daily-tasks',
        h2: 'Daily Tasks',
        body: 'Not all daily tasks can be performed remotely or by the homeowner between stays. For high-use periods, consider: automated systems (salt chlorinator, automatic feeder) that dose continuously; smart pool monitoring devices that alert you to chemistry drops via smartphone; or a local neighbor, property manager, or pool service company to check the pool on day 2 of any stay longer than 2 days. At minimum, check remotely that the pump is running and that the water appears clear (via security camera or smart pool monitor if available).'
      },
      {
        id: 'weekly-tasks',
        h2: 'Weekly Tasks',
        body: 'For vacation rentals, weekly tasks are most practically performed at turnover. Each turnover should include: full water test and correction; skimmer basket check; visual equipment inspection; and pool/hot tub surface wipe-down. If the rental has a week-long stay with no mid-week service visit, schedule a professional pool service call for mid-week during peak occupancy. Even one visit to test, correct, and check equipment mid-week protects water quality through the second half of the stay.'
      },
      {
        id: 'monthly-and-seasonal',
        h2: 'Monthly and Seasonal Tasks',
        body: 'Monthly: test CYA (especially with tablet chlorinators), test calcium hardness, filter clean or degreaser soak, and equipment lubrication (o-rings, multiport valve). Seasonal: spring opening — full equipment inspection, water balance, and equipment startup. Pre-summer — switch to summer dosing schedule and increase pump run time. Post-summer — clean equipment thoroughly and reduce chemical doses as temperatures drop. Pre-winter — service the heater, inspect for freeze exposure risk, and adjust chemistry to winter stability targets.'
      }
    ],
    examples: [
      {
        title: 'Sample Summer Peak Schedule',
        body: 'June through August: turnover check before every stay; professional service visit on Wednesday of every week-long booking; automatic chlorinator checked and refilled every 10 days; salt cell inspected monthly; CYA tested every 4 weeks. Chemical dosing schedule updated for summer: pH adjusted twice weekly (instead of weekly) due to higher CO2 off-gassing from heat and splash. This schedule for one property requires approximately 4 service hours per week during peak season — budgeted in the rental pricing.'
      }
    ],
    commonMistakes: [
      'Using the same chemical dosing schedule in August as in April — summer heat, UV, and bather load require significantly higher doses.',
      'Not scheduling mid-stay service for week-long bookings during summer — a week-long stay with 6 guests can deplete free chlorine within 2–3 days.',
      'Over-relying on automated systems without any verification testing — systems fail, salt cells scale, and feeders run empty.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/airbnb-pool-turnover-checklist', '/resources/pool-chemical-log-sheet'],
    relatedTopics: ['academy/vacation-rentals/turnover-checklist', 'academy/vacation-rentals/weekly-inspection', 'academy/vacation-rentals/chemical-log-sheets'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/bather-load', 'glossary/free-chlorine', 'glossary/chlorine-demand'],
    sources: [src]
  },
  {
    id: 'vr-05',
    slug: 'academy/vacation-rentals/weekly-inspection',
    title: 'Weekly Pool Inspection for Vacation Rentals',
    description: 'Learn the comprehensive weekly inspection protocol for vacation rental pools that catches chemistry, equipment, and safety problems before guests experience them.',
    summary: 'A weekly pool inspection covers water chemistry, equipment function, safety equipment, and physical hazards. It is the most important recurring maintenance action for a vacation rental pool.',
    category: 'vacation-rentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool weekly inspection', 'rental pool inspection checklist', 'pool safety check', 'vacation rental pool walkthrough'],
    overview: 'A thorough weekly pool inspection prevents the safety incidents and chemistry emergencies that result in guest complaints, negative reviews, and liability exposure.',
    keyFacts: [
      'A weekly inspection takes 20–30 minutes but prevents problems that take hours or days to fix.',
      'Inspect filter pressure every week — a rising pressure trend indicates a filter that needs service.',
      'Check the pool deck and equipment area for new hazards — cracked coping, loose drain covers, exposed wiring.',
      'Document the inspection in writing — a signed weekly inspection log demonstrates consistent due diligence.'
    ],
    sections: [
      {
        id: 'water-chemistry-check',
        h2: 'Water Chemistry Check',
        body: 'The chemistry portion of the weekly inspection covers: free chlorine (1–3 ppm), combined chlorine (below 0.5 ppm), pH (7.2–7.6), total alkalinity (80–120 ppm), and a visual clarity check — can you see the main drain from the pool deck? If not, the water fails the turbidity standard and should be closed to guests until clarity is restored. Test at mid-pool, 18 inches below the surface. Record all readings. If any parameter is significantly out of range, address it before recording the inspection as passed.'
      },
      {
        id: 'equipment-check',
        h2: 'Equipment Check',
        body: 'Check that the pump is running with normal sound and vibration. Check the filter pressure and compare to baseline. Inspect the skimmer basket and pump strainer (empty if needed). Verify the automated feeder or salt chlorinator has product and is displaying normal status. For heated pools: check heater operation and verify the set temperature is being maintained. For hot tubs: check all jets are operating, the cover is sealing correctly, and the temperature display matches a physical thermometer reading.'
      },
      {
        id: 'safety-check',
        h2: 'Safety Check',
        body: 'Walk the pool perimeter and check: the life ring and reaching pole are mounted and accessible; the pool gate opens, closes, and latches properly from both sides; no sharp edges, broken tiles, or damaged coping along the pool edge; all drain covers are secured and undamaged (suction entrapment risk if drain covers are missing or broken); no electrical hazards near the pool area; and the pool rules sign is posted and legible. Replace any missing or damaged safety equipment before the next guest arrival and log the replacement.'
      }
    ],
    examples: [
      {
        title: 'Catching Equipment Failure Early',
        body: 'During a routine Wednesday inspection, the filter pressure reads 22 psi — 12 psi above the clean baseline of 10 psi. The pool has been running for 4 days since the last backwash. Backwashing returns the pressure to 11 psi. The inspection also notes that the salt cell indicator light is flashing (low salt). Salt is added and the system returns to normal. Without this inspection, the next guests would have arrived to a pool with poor filtration and no chlorine generation — a preventable chemistry failure.'
      }
    ],
    commonMistakes: [
      'Not checking drain covers — damaged or missing main drain covers create entrapment hazards and are a common code violation for residential pools rented to guests.',
      'Performing the chemistry inspection but not walking the pool deck for physical hazards.',
      'Not recording the inspection in writing — verbal or informal checks provide no legal documentation.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist', '/resources/water-test-log', '/resources/airbnb-pool-turnover-checklist'],
    relatedTopics: ['academy/vacation-rentals/turnover-checklist', 'academy/vacation-rentals/chemical-log-sheets', 'academy/vacation-rentals/maintenance-schedule'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/combined-chlorine', 'glossary/filter-pressure'],
    sources: [src, src2]
  },
  {
    id: 'vr-06',
    slug: 'academy/vacation-rentals/emergency-water-recovery',
    title: 'Emergency Water Recovery for Vacation Rentals',
    description: 'Learn the step-by-step emergency protocol for recovering a pool or hot tub that has gone critically out of range between guest stays.',
    summary: 'When a pool is discovered in severely compromised condition between stays, a structured recovery protocol restores safe water in 24–72 hours. This guide covers every step.',
    category: 'vacation-rentals',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool emergency recovery', 'green pool rental property', 'pool water recovery quick', 'vacation rental pool problem'],
    overview: 'Emergency water recovery is required when a vacation rental pool is found with green water, zero chlorine, extreme pH, or severe cloudiness that makes it unsafe for use. A systematic protocol minimises recovery time.',
    keyFacts: [
      'A pool discovered in poor condition must be closed to guests until fully recovered — never allow swimming in compromised water.',
      'Green pool recovery takes 24–72 hours; hot tub recovery from zero FC takes 4–8 hours.',
      'The shock dose for a green pool is 30 ppm FC — the pool volume calculator determines the exact chemical amount.',
      'Document the problem and recovery with timestamped photos and test records for your insurance file.'
    ],
    sections: [
      {
        id: 'assess-the-situation',
        h2: 'Assess the Situation',
        body: 'Before adding any chemicals, run a full water test and note all readings. Photograph the pool condition. Identify the cause of the problem: Did the pump fail while guests were in residence? Did an automated feeder run empty? Did CYA drift to the point of chlorine ineffectiveness? Understanding the cause determines whether the recovery is a chemistry correction (fixable) or an equipment problem (fixable only after repair). If the pump is not running, the primary issue must be resolved before any chemistry recovery can be effective — circulating water is prerequisite for chemical treatment.'
      },
      {
        id: 'recovery-protocol',
        h2: 'The Recovery Protocol',
        body: 'Step 1: Lower pH to 7.2 (maximises chlorine activity). Step 2: For green water, brush all surfaces vigorously to break up algae biofilm. Step 3: Add shock chlorine to reach 30 ppm FC (for green water) or 10 ppm (for moderately compromised water). Step 4: Run the filter continuously. Step 5: Test every 4–6 hours and add more chlorine if FC drops below 10 ppm (sign that active algae or high chlorine demand is still consuming it). Step 6: When water turns from green to grey-white, vacuum dead algae to waste and backwash. Step 7: Continue filtering and testing until FC naturally drops to 5 ppm or below. Step 8: Run a full water test and balance all parameters.'
      },
      {
        id: 'prevention-for-next-time',
        h2: 'Prevention',
        body: 'After recovery, audit the maintenance system that failed: Was the automated feeder empty? Install a weekly refill reminder. Did the pump fail? Schedule quarterly equipment inspections. Did high bather load deplete chlorine faster than expected? Add a mid-stay chemistry check to all bookings with 4+ guests. Install a smart pool monitor (devices like Sutro, pHin, or similar) that sends chemistry alerts to your phone when FC or pH drifts out of range — these can detect a developing problem 24–48 hours before it becomes visible, giving you time to send someone to correct it before a guest is affected.'
      }
    ],
    examples: [
      {
        title: 'Green Pool Recovery Between Stays',
        body: 'Friday afternoon, a property manager arrives for turnover and finds the 18,000-gallon pool bright green. Guests checked out this morning. FC is zero, pH 8.1. New guests arrive Sunday. Timeline: Friday 4pm — lower pH with acid. Brush all surfaces. Add 10 gallons of liquid chlorine (10%) to achieve approximately 30 ppm. Run filter. Saturday 8am — water is grey-teal, FC 12 ppm. Brush again. Add 5 more gallons chlorine. Vacuum dead algae. Saturday 6pm — water almost clear, FC 8 ppm. Filter still running. Sunday 8am — water clear, FC 5 ppm. Full balance test — pass. Pool cleared for guest access Sunday noon. Recovery time: 40 hours.'
      }
    ],
    commonMistakes: [
      'Allowing guests to use the pool during recovery because it looks "almost clear" — the FC is still too high and chemistry is still unstable.',
      'Not identifying and fixing the root cause before the recovery — if the feeder is still empty or the pump is still failing, the pool will return to the same condition within days.',
      'Skipping the full post-recovery chemistry balance test — shock-treated water needs all parameters re-checked after the elevated chlorine stabilises.'
    ],
    relatedCalculators: ['/calculators/pool-shock-calculator', '/calculators/pool-chlorine-calculator', '/calculators/pool-volume-calculator'],
    relatedResources: ['/resources/pool-shock-log', '/resources/pool-chemical-log-sheet', '/resources/airbnb-pool-turnover-checklist'],
    relatedTopics: ['academy/vacation-rentals/turnover-checklist', 'academy/troubleshooting/green-water', 'academy/sanitizers/shock-treatments-explained'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/superchlorination', 'glossary/algae-bloom', 'glossary/chlorine-demand'],
    sources: [src, src2]
  }
];
