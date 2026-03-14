# GRIPEN DISPERSAL AI — Demo Script
**Duration:** ~4 min 30 sec | **Format:** Live screen walkthrough

---

## PREPARATION (before presenting)

- App running at `localhost:3000`
- Browser zoomed to ~90% so all three panels are visible
- Default state — no recommendations generated yet
- Have the `.env.local` configured with your OpenRouter key

---

## SEGMENT 1 — Opening & Context Setting
*[0:00 – 0:45] — ~45 seconds*

**[Point to the top bar]**

"What you're looking at is the Gripen Dispersal AI — a real-time tactical decision support system built around the Swedish Air Force's BASE 90 concept. The idea behind BASE 90 is that Gripen fighters don't operate from fixed bases. They disperse across civilian highways, forest roads, and motorways — making them extremely difficult to locate, target, and destroy on the ground.

The problem dispersal solves is survivability. The problem dispersal *creates* is predictability. If you always disperse to the same three roads, in the same sequence, at the same time of day — the adversary learns your pattern and your advantage disappears.

This system exists to solve that second problem. It uses AI to continuously recommend unpredictable yet operationally optimal dispersal locations — creating information asymmetry between us and a potential adversary."

**[Gesture across the three-panel layout]**

"Three panels. Left: operator inputs and constraints. Centre: the tactical map of central Sweden. Right: AI-generated recommendations and our embedded tactical advisor."

---

## SEGMENT 2 — The Threat Picture
*[0:45 – 1:30] — ~45 seconds*

**[Point to the left panel threat section]**

"Before we generate anything, let's look at what the system already knows about the threat environment. We have a HIGH-confidence integrated air defence system in the northeast — S-300 class coverage. A mobile surveillance radar to the east, an EW station in the north, and an active adversary ISR patrol running a predictable 90-minute cycle.

**[Point to the satellite countdown in the right panel]**

Critically — there's a satellite overpass in 47 minutes, high confidence, 8-minute window. That's a hard constraint. Any dispersal we execute needs to be complete and aircraft under cover before that window opens.

**[Point to the map threat bubbles]**

On the map you can see those threat coverages visualised as pulsing red zones. The northwest corridor — where most of our candidate strips are — sits outside the main IADS bubble. That geographic fact is the foundation of every recommendation this system will make."

---

## SEGMENT 3 — Generating Recommendations
*[1:30 – 2:30] — ~60 seconds*

**[Point to the factor weight sliders]**

"The operator has full control over how the AI weights its priorities. Right now we're weighted heavily toward surface suitability and entropy — unpredictability — at 85. Stealth at 70. Logistics at 55. These weights don't override the AI's judgement, they *inform* it. The engine normalises these and runs a composite scoring function across all five candidate zones.

**[Click GENERATE RECOMMENDATIONS]**

Watch the right panel."

*[Pause ~1.2 seconds for the computation animation]*

"Three ranked zones appear on the map simultaneously — green for primary, blue for alternate, grey for tertiary. A routing line draws from Base Charlie to the top recommendation.

**[Point to the metrics panel]**

Four KPIs update instantly. Unpredictability score — this measures how hard it would be for an adversary to predict our next move based on our historical pattern. Threat exposure — the weighted average exposure across our top three options. Operational readiness — derived from aircraft availability, pilot status, and fuel. And pattern risk — the inverse of our entropy score.

**[Point to the asymmetry gauge]**

This gauge is the headline number — the Information Asymmetry Score. It's a composite of all four metrics. Above 70 means we have a meaningful cognitive advantage over an adversary trying to model our behaviour. We're sitting at 91."

---

## SEGMENT 4 — Diving Into a Recommendation
*[2:30 – 3:15] — ~45 seconds*

**[Click on the #1 recommendation card — ALFA-7]**

"Let's look at the top recommendation in detail. RV-7 Alfa Highway. 2800 metre asphalt strip, excellent condition. The system has given it a composite score of 91.

**[Point to the rationale box]**

'Recommended because' — this is the explainability layer. Maximally distant from the NE IADS corridor. E4 logistics spine gives us fuel access within 22 minutes. The strip's orientation is perpendicular to the ISR patrol flight path — that reduces our visual signature window. And critically — this zone hasn't been used in 96 hours, giving it a HIGH entropy rating. The adversary has no recent pattern data on this location.

**[Point to the timing window]**

Timing window opens in 47 minutes, closes at 107. But notice the fuzzy offset — plus or minus 35 minutes. The system deliberately avoids giving us a precise departure time. That jitter is intentional — it's how we deny the adversary a timing pattern to lock onto.

**[Point to the FARP READY tag]**

FARP is pre-positioned. Sub-12 minute turnaround on arrival."

---

## SEGMENT 5 — What-If Analysis & AI Advisor
*[3:15 – 4:10] — ~55 seconds*

**[Scroll down in the left panel to the What-If section]**

"Now here's where it gets interesting for planning. The What-If panel lets us ask hypothetical questions without committing to a weight change.

**[Drag the Entropy slider down to ~30 in the hypothetical section]**

Watch what happens to the zone scores. Bravo-3 — the novel forest strip — drops sharply because its main advantage *was* entropy. Charlie-9, the E18 motorway, rises — it has the best surface and fastest logistics. The delta bars show exactly which factor is driving each change.

This is a what-if, not a commitment. The live recommendations haven't moved.

**[Switch focus to the AI Advisor panel at the bottom right]**

"Finally — our embedded tactical advisor. This is a live Claude model running through OpenRouter, with the full operational picture injected into every query. Let me ask it something specific."

**[Type or click the quick prompt: 'Compare top 2 zones']**

*[Wait for streaming response]*

"Notice it streams in real time and uses the actual zone data — it knows the scores, the threat levels, the timing windows. It's not a generic chatbot. It's contextually aware of this specific mission, this specific threat picture, right now."

---

## SEGMENT 6 — Briefing Export & Close
*[4:10 – 4:30] — ~20 seconds*

**[Click COPY BRIEFING or DOWNLOAD .TXT in the left panel]**

"One final feature — one click generates a full OPORD-style text briefing. Situation, mission, execution, sustainment, command and signal. Ready to paste into a comms channel or hand to a pilot. Everything the AI just computed, in a format a human can act on immediately.

**[Pause — gesture at the full screen]**

"To summarise — dispersal is how you survive. Unpredictable dispersal is how you *win*. This system makes unpredictability systematic, measurable, and explainable. That's the edge."

---

## ANTICIPATED QUESTIONS

**"How does the entropy score actually work?"**
> Each zone has a historical use count and a recency flag. Zones never used score maximum entropy. Zones used in the last 24 hours take a penalty. The operator's entropy weight then scales how much that factor moves the composite score. It's deterministic but sensitive to operational history.

**"Could an adversary learn to defeat this?"**
> They'd need our full dispersal history and our weight configuration — both of which change per mission. The fuzzy timing windows also mean even if they know the zone, they can't predict the exact window. It raises their intelligence burden significantly.

**"What would a production version add?"**
> Real LINK 16 threat tracks instead of simulated bubbles, live weather feeds, actual classified strip survey data, and a backend proxy for the AI key. The scoring engine and UI are production-ready — the data layer is where you'd connect to real C2 systems.

**"Why OpenRouter instead of a single model provider?"**
> Model flexibility. You can run this on Claude for deep tactical reasoning, switch to a cheaper model for high-frequency queries during an exercise, or run a locally-hosted model in a classified environment with no internet access. Same API, same interface.

---

*— END OF SCRIPT —*
