import { Ionicons } from "@expo/vector-icons";

export type InterviewType = "In-person" | "Phone" | "Google Meet" | "Zoom" | "Video";
export type InterviewStatus = "upcoming" | "past" | "inprogress";
export type CandidateStatus = "Applied" | "Screening" | "Shortlisted" | "Hired" | "Rejected";

export interface AISummary {
  experienceSnapshot: string;
  keyHighlights: string[];
  communicationFit: string;
  notedGaps: string;
  availability: string;
}

export interface ScoringCriterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
}

export interface RoleTemplate {
  role: string;
  criteria: ScoringCriterion[];
  coachingPrompts: string[]; // pre-interview: questions to ask
}

export interface InterviewFeedback {
  overallImpression: string;
  whatWentWell: string[];
  areasToImprove: string[];
  suggestedFollowUp: string;
}

export interface CriterionScore {
  criterionId: string;
  score: number;
  note?: string; // AI-generated rationale
}

export interface Interview {
  id: string;
  name: string;
  role: string;
  durationMin: number;
  type: InterviewType;
  date: string;
  time: string;
  email?: string;
  phone?: string;
  rating?: number;
  score?: { value: number; outOf: number };
  criterionScores?: CriterionScore[];
  interviewerFeedback?: InterviewFeedback;
  candidateStatus: CandidateStatus;
  aiSummary?: AISummary;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    role: "Shift Lead",
    criteria: [
      { id: "sl-1", label: "Leadership Experience", description: "Has managed or led a team in a food service or retail setting.", maxScore: 5 },
      { id: "sl-2", label: "Conflict Resolution", description: "Can describe specific examples of resolving team or customer conflicts.", maxScore: 5 },
      { id: "sl-3", label: "Ops & Scheduling", description: "Familiar with opening/closing duties, labor management, or inventory.", maxScore: 5 },
      { id: "sl-4", label: "Food Safety", description: "Holds or is willing to obtain a food safety certification.", maxScore: 5 },
      { id: "sl-5", label: "Availability", description: "Schedule aligns with role requirements including evenings and weekends.", maxScore: 5 },
    ],
    coachingPrompts: [
      "Ask for a specific example of a time they led through a stressful rush.",
      "Probe how they've handled an underperforming team member.",
      "Ask what their opening or closing checklist looks like from memory.",
      "Confirm if they have or are willing to get ServSafe certification.",
    ],
  },
  {
    role: "Cashier",
    criteria: [
      { id: "ca-1", label: "Customer Service", description: "Demonstrates warmth, patience, and professionalism with customers.", maxScore: 5 },
      { id: "ca-2", label: "POS & Cash Handling", description: "Comfortable with point-of-sale systems and accurate cash reconciliation.", maxScore: 5 },
      { id: "ca-3", label: "Speed & Accuracy", description: "Can maintain accuracy under high transaction volume.", maxScore: 5 },
      { id: "ca-4", label: "Communication", description: "Clear, friendly communicator with customers and team members.", maxScore: 5 },
      { id: "ca-5", label: "Availability", description: "Schedule aligns with peak hours, especially lunch and weekend shifts.", maxScore: 5 },
    ],
    coachingPrompts: [
      "Ask how they've handled a frustrated or difficult customer.",
      "Ask if they've been responsible for cash drawers or end-of-day reconciliation.",
      "Probe their comfort level with learning a new POS system.",
      "Confirm availability during lunch rush hours.",
    ],
  },
  {
    role: "Sandwich Associate",
    criteria: [
      { id: "sa-1", label: "Food Prep Experience", description: "Comfortable building orders to spec in a fast-paced environment.", maxScore: 5 },
      { id: "sa-2", label: "Speed Under Pressure", description: "Can maintain quality and pace during lunch or dinner rushes.", maxScore: 5 },
      { id: "sa-3", label: "Attention to Detail", description: "Follows order specifications accurately, including dietary restrictions.", maxScore: 5 },
      { id: "sa-4", label: "Physical Readiness", description: "Able to stand for extended periods and handle food prep physically.", maxScore: 5 },
      { id: "sa-5", label: "Availability", description: "Available during key service windows including weekends.", maxScore: 5 },
    ],
    coachingPrompts: [
      "Ask how they stay organized when multiple orders come in at once.",
      "Probe their experience with specific dietary accommodations (gluten-free, etc.).",
      "Ask how they've handled making a mistake on an order.",
      "Confirm physical readiness and any restrictions.",
    ],
  },
  {
    role: "Delivery Driver",
    criteria: [
      { id: "dd-1", label: "Driving Record", description: "Clean driving record, valid license, and current insurance.", maxScore: 5 },
      { id: "dd-2", label: "Area Knowledge", description: "Familiar with local delivery area; can navigate efficiently.", maxScore: 5 },
      { id: "dd-3", label: "Vehicle Reliability", description: "Owns a reliable, insured vehicle suitable for regular deliveries.", maxScore: 5 },
      { id: "dd-4", label: "Punctuality", description: "Demonstrated track record of on-time delivery and reliability.", maxScore: 5 },
      { id: "dd-5", label: "Availability", description: "Available during key delivery windows including lunch and dinner.", maxScore: 5 },
    ],
    coachingPrompts: [
      "Ask them to confirm license, insurance, and if they've had any violations in the past 3 years.",
      "Ask how they handle a situation where an order is delayed or wrong.",
      "Probe their familiarity with the neighborhood — do they need GPS for most routes?",
      "Confirm vehicle age, mileage, and maintenance habits.",
    ],
  },
];

export const IONICON: Record<InterviewType, keyof typeof Ionicons.glyphMap> = {
  "In-person": "person-outline",
  Phone: "call-outline",
  "Google Meet": "videocam-outline",
  Zoom: "videocam-outline",
  Video: "videocam-outline",
};

// Today's scheduled interviews — no ratings yet
export const UPCOMING: Interview[] = [
  {
    id: "1",
    name: "Jordan Patel",
    role: "Shift Lead",
    durationMin: 45,
    type: "In-person",
    date: "Today",
    time: "10:00 AM",
    email: "jordan.patel@gmail.com",
    phone: "(312) 555-0147",
    candidateStatus: "Screening",
  },
  {
    id: "2",
    name: "Aisha Rahman",
    role: "Delivery Driver",
    durationMin: 30,
    type: "Phone",
    date: "Today",
    time: "11:15 AM",
    email: "aisha.rahman@gmail.com",
    phone: "(312) 555-0238",
    candidateStatus: "Applied",
  },
  {
    id: "3",
    name: "Devon Carter",
    role: "Sandwich Associate",
    durationMin: 20,
    type: "Phone",
    date: "Today",
    time: "1:00 PM",
    email: "devon.carter@yahoo.com",
    phone: "(312) 555-0391",
    candidateStatus: "Applied",
  },
  {
    id: "4",
    name: "Sofia Alvarez",
    role: "Sandwich Associate",
    durationMin: 30,
    type: "Google Meet",
    date: "Today",
    time: "2:30 PM",
    email: "sofia.alvarez@gmail.com",
    phone: "(312) 555-0412",
    candidateStatus: "Screening",
  },
];

// Past completed interviews — have ratings and AI summaries
export const SECTIONS: { title: string; data: Interview[] }[] = [
  {
    title: "Sun Apr 6",
    data: [
      {
        id: "5",
        name: "Marcus Webb",
        role: "Shift Lead",
        durationMin: 45,
        type: "In-person",
        email: "marcus.webb@gmail.com",
        phone: "(312) 555-0519",
        date: "Sun",
        time: "10:00 AM",
        rating: 4.8,
        score: { value: 23, outOf: 25 },
        criterionScores: [
          { criterionId: "sl-1", score: 5, note: "5 years food service with direct team leadership at Chipotle and Panera." },
          { criterionId: "sl-2", score: 5, note: "Gave specific, confident conflict resolution examples unprompted." },
          { criterionId: "sl-3", score: 5, note: "Managed scheduling and labor costs for 20+ person teams." },
          { criterionId: "sl-4", score: 4, note: "ServSafe certified through 2026 — strong, though no Potbelly-specific training." },
          { criterionId: "sl-5", score: 4, note: "Mon–Sat flexible, prefers 10 AM–8 PM. No Sunday availability noted." },
        ],
        interviewerFeedback: {
          overallImpression: "One of the strongest candidates interviewed this cycle. Came prepared, gave structured answers, and asked thoughtful questions about growth paths.",
          whatWentWell: [
            "Opened with a strong leadership example without being prompted — set a confident tone early.",
            "Asked about the GM development track, which signals long-term motivation.",
            "Conflict resolution answers were specific and outcome-focused, not vague.",
          ],
          areasToImprove: [
            "Could have probed deeper on Sunday availability — left it unresolved.",
            "The 'over-qualified' concern wasn't addressed directly. Worth raising the development path conversation earlier next time.",
          ],
          suggestedFollowUp: "Schedule a second conversation focused on growth expectations and confirm Sunday availability before extending an offer.",
        },
        candidateStatus: "Shortlisted",
        aiSummary: {
          experienceSnapshot:
            "5 years food service, most recently shift supervisor at Chipotle (2 years) — managed a team of 8, handled opening/closing, and trained 4 new hires. Before that, crew lead at Panera (3 years).",
          keyHighlights: [
            "Strong leadership presence — gave clear examples of conflict resolution",
            "Food safety certified (ServSafe Manager), valid through 2026",
            "Experience managing labor costs and scheduling for 20+ person teams",
            "Open to closing and weekend shifts",
          ],
          communicationFit:
            "Direct and confident. Came prepared with specific numbers and examples. Showed genuine interest in growing within the company — mentioned wanting to move toward a GM role.",
          notedGaps:
            "No prior Potbelly-specific experience, though familiar with sandwich concepts. Slightly over-qualified for the role; may need a development path conversation early.",
          availability: "Mon–Sat, flexible. Prefers 10 AM–8 PM range.",
        },
      },
      {
        id: "6",
        name: "Carlos Mendoza",
        role: "Delivery Driver",
        durationMin: 30,
        type: "Phone",
        email: "carlos.mendoza@hotmail.com",
        phone: "(312) 555-0623",
        date: "Sun",
        time: "11:30 AM",
        rating: 4.2,
        score: { value: 17, outOf: 25 },
        criterionScores: [
          { criterionId: "dd-1", score: 4, note: "Clean record confirmed verbally — no written verification yet." },
          { criterionId: "dd-2", score: 5, note: "Navigates most local routes without GPS. Strong area familiarity." },
          { criterionId: "dd-3", score: 4, note: "Has a vehicle but it's older — asked about mileage reimbursement." },
          { criterionId: "dd-4", score: 2, note: "Claims 98% on-time on gig platforms but no documentation." },
          { criterionId: "dd-5", score: 2, note: "Weekdays 11 AM–7 PM only. Limited weekend availability." },
        ],
        interviewerFeedback: {
          overallImpression: "Decent candidate with real local knowledge, but the vehicle situation and thin documentation on reliability are concerns. Worth a conditional move forward if weekend coverage isn't critical.",
          whatWentWell: [
            "Local area knowledge came across as genuine — didn't feel rehearsed.",
            "Friendly tone made the phone call easy. Didn't get defensive when pressed on the vehicle.",
            "Brought up the mileage reimbursement question proactively, which showed he'd thought through the role.",
          ],
          areasToImprove: [
            "Should have pushed harder for documented reliability metrics — accepting 'I think it was 98%' wasn't enough.",
            "Didn't follow up on weekend availability after he said 'some weekends' — left it vague.",
          ],
          suggestedFollowUp: "Request a copy of his driving record and ask him to clarify weekend availability in writing before advancing.",
        },
        candidateStatus: "Screening",
        aiSummary: {
          experienceSnapshot:
            "2 years delivery experience — DoorDash and UberEats independently, plus 8 months as an in-house driver for a local pizza chain. Owns a reliable vehicle with current insurance.",
          keyHighlights: [
            "Clean driving record, confirmed during call",
            "Familiar with the local area — navigates without GPS for most deliveries",
            "Punctual track record; mentioned 98% on-time rate on gig platforms",
          ],
          communicationFit:
            "Friendly and straightforward. Answered questions clearly but kept responses short. Seemed genuinely motivated by the hourly + tip structure.",
          notedGaps:
            "No experience with in-store prep or multi-tasking between delivery and counter work. Would need training if coverage duties are expected.",
          availability: "Weekdays 11 AM–7 PM, some weekends.",
        },
      },
    ],
  },
  {
    title: "Fri Apr 4",
    data: [
      {
        id: "7",
        name: "Priya Nair",
        role: "Cashier",
        durationMin: 20,
        type: "Phone",
        email: "priya.nair@gmail.com",
        phone: "(312) 555-0734",
        date: "Fri",
        time: "9:30 AM",
        rating: 4.9,
        score: { value: 24, outOf: 25 },
        criterionScores: [
          { criterionId: "ca-1", score: 5, note: "Exceptional customer feedback — 4.9 star average at prior employer." },
          { criterionId: "ca-2", score: 5, note: "Trained colleagues on POS at Target. Comfortable with cash drawers." },
          { criterionId: "ca-3", score: 5, note: "High-volume experience at both Target and a busy coffee shop." },
          { criterionId: "ca-4", score: 5, note: "Bilingual English/Hindi. Warm, articulate communicator." },
          { criterionId: "ca-5", score: 4, note: "Full availability Mon–Sun but prefers mornings. Slight preference concern for PM shifts." },
        ],
        interviewerFeedback: {
          overallImpression: "Exceptional candidate. The energy and genuine brand enthusiasm came through immediately. Likely to be a front-of-house standout from day one.",
          whatWentWell: [
            "The interview felt natural — she drove the conversation without losing structure.",
            "Bilingual ability was raised naturally, not as a box-checking moment.",
            "The question about team culture showed real curiosity about fit, not just the job.",
          ],
          areasToImprove: [
            "Didn't clarify the PM shift concern clearly enough — she said flexible but defaulted to mornings.",
            "Could have tested her under a high-pressure hypothetical to see how she responds to stress.",
          ],
          suggestedFollowUp: "Confirm PM availability before scheduling. If she's open to evenings, move to offer immediately.",
        },
        candidateStatus: "Shortlisted",
        aiSummary: {
          experienceSnapshot:
            "3 years customer-facing experience — cashier at Target (1.5 years) and barista at a local coffee shop (1.5 years). Comfortable with high-volume environments and POS systems.",
          keyHighlights: [
            "Top-rated by customers at previous employer — mentioned a 4.9 star review average",
            "Fast learner with POS systems; trained colleagues at Target",
            "Bilingual (English/Hindi) — a plus for diverse customer base",
            "Enthusiastic about the Potbelly brand specifically",
          ],
          communicationFit:
            "Warm, energetic, and easy to talk to. Asked thoughtful questions about team culture. Likely to be a strong front-of-house presence.",
          notedGaps: "No food service experience specifically, but handles food safety basics. Would benefit from a brief onboarding on food prep standards.",
          availability: "Full availability, Mon–Sun. Prefers morning shifts but flexible.",
        },
      },
      {
        id: "8",
        name: "James Okafor",
        role: "Shift Lead",
        durationMin: 45,
        type: "In-person",
        email: "james.okafor@gmail.com",
        phone: "(312) 555-0845",
        date: "Fri",
        time: "2:00 PM",
        rating: 4.6,
        score: { value: 20, outOf: 25 },
        criterionScores: [
          { criterionId: "sl-1", score: 5, note: "1 year formal shift lead at Subway plus broader QSR background." },
          { criterionId: "sl-2", score: 2, note: "Acknowledged conflict resolution is an area he's actively working on." },
          { criterionId: "sl-3", score: 5, note: "Strong inventory background — reduced waste 15% at prior role." },
          { criterionId: "sl-4", score: 4, note: "CPR and food handler certified. Not ServSafe manager level." },
          { criterionId: "sl-5", score: 4, note: "Mon–Fri afternoons/evenings only. Limited weekend availability." },
        ],
        interviewerFeedback: {
          overallImpression: "Solid, reliable candidate who would likely be dependable day-to-day. The conflict resolution gap is real but he owns it, which is a good sign. Weekend availability is the biggest blocker.",
          whatWentWell: [
            "The inventory example was specific and measurable — 15% waste reduction stood out.",
            "He stayed calm and composed throughout, even on harder questions.",
            "Certifications were volunteered upfront without prompting.",
          ],
          areasToImprove: [
            "Needed too much prompting on the conflict scenario — should have pushed for a real example earlier rather than accepting the general answer.",
            "Weekend availability was glossed over. Should have gotten a concrete timeline on when that opens up.",
          ],
          suggestedFollowUp: "Check back in 4–6 weeks on weekend availability. In the meantime, consider him for a weekday-heavy shift structure.",
        },
        candidateStatus: "Shortlisted",
        aiSummary: {
          experienceSnapshot:
            "4 years QSR experience including 1 year as a shift lead at Subway. Managed daily operations, handled cash reconciliation, and coordinated lunch rush staffing.",
          keyHighlights: [
            "Proven shift lead experience in a comparable sandwich concept",
            "Strong inventory management background — reduced waste by 15% at prior role",
            "CPR certified and food handler certified",
          ],
          communicationFit:
            "Calm and methodical. Gave thoughtful answers, occasionally needed prompting for specifics. Would be reliable in a steady operational role.",
          notedGaps:
            "Limited experience managing conflict between team members. Acknowledged this directly and described it as an area he's actively working on.",
          availability: "Mon–Fri, afternoons and evenings. Limited weekend availability.",
        },
      },
      {
        id: "9",
        name: "Lily Chen",
        role: "Sandwich Associate",
        durationMin: 20,
        type: "Phone",
        email: "lily.chen@outlook.com",
        phone: "(312) 555-0956",
        date: "Fri",
        time: "4:00 PM",
        rating: 4.7,
        score: { value: 21, outOf: 25 },
        criterionScores: [
          { criterionId: "sa-1", score: 5, note: "Deli and Panera experience — comfortable building orders to spec." },
          { criterionId: "sa-2", score: 5, note: "Memorized a full menu in 3 days at prior job. Handles pressure well." },
          { criterionId: "sa-3", score: 5, note: "Attention to spec called out specifically by prior employer." },
          { criterionId: "sa-4", score: 4, note: "Comfortable with physical demands but no formal confirmation." },
          { criterionId: "sa-5", score: 2, note: "Only 20 hrs/week until May due to school. Full availability after." },
        ],
        interviewerFeedback: {
          overallImpression: "Strong technical candidate for the role. The availability constraint is the only real hesitation — if the team can absorb a part-time hire through May, she's worth it.",
          whatWentWell: [
            "The menu memorization story was compelling and specific — gave a clear picture of how she learns.",
            "She was honest about her school schedule upfront rather than hiding it.",
            "Answers improved meaningfully with follow-up questions — she just needed the prompt.",
          ],
          areasToImprove: [
            "Phone was a weak format for her — she was noticeably quieter than expected. Should have pushed for a follow-up in person earlier in the call.",
            "Didn't probe enough on dietary accommodation experience — the job description mentions it and it was skipped.",
          ],
          suggestedFollowUp: "Schedule an in-person follow-up before committing. The phone impression undersells her — she'll come across much stronger face to face.",
        },
        candidateStatus: "Shortlisted",
        aiSummary: {
          experienceSnapshot:
            "1.5 years food service experience at a local deli and a brief stint at Panera. Comfortable building orders to spec under pressure.",
          keyHighlights: [
            "Quick learner — mentioned memorizing a full menu within 3 days at prior job",
            "Comfortable with the physical demands of the role",
            "Food handler certified",
          ],
          communicationFit:
            "A little quiet on the phone but gave solid answers when asked follow-up questions. In-person would likely be a better gauge.",
          notedGaps: "Limited availability during school semester — only 20 hrs/week until May.",
          availability: "Weekends and weekday evenings through May, then full availability.",
        },
      },
    ],
  },
  {
    title: "Thu Apr 3",
    data: [
      {
        id: "10",
        name: "Tyrese Brown",
        role: "Delivery Driver",
        durationMin: 30,
        type: "Google Meet",
        email: "tyrese.brown@gmail.com",
        phone: "(312) 555-1067",
        date: "Thu",
        time: "11:00 AM",
        rating: 3.9,
        score: { value: 14, outOf: 25 },
        criterionScores: [
          { criterionId: "dd-1", score: 4, note: "Valid license and insurance confirmed. No violations reported." },
          { criterionId: "dd-2", score: 4, note: "Some familiarity with the area but relies on GPS regularly." },
          { criterionId: "dd-3", score: 2, note: "Older vehicle — proactively asked about mileage reimbursement." },
          { criterionId: "dd-4", score: 2, note: "No documented reliability metrics. Gig work only, no references." },
          { criterionId: "dd-5", score: 2, note: "Generally flexible but has a Tuesday morning conflict." },
        ],
        interviewerFeedback: {
          overallImpression: "Below average interview. The lack of specifics was consistent across every question — not a good sign for a role that requires reliability. The vehicle situation adds more uncertainty.",
          whatWentWell: [
            "He was punctual for the Google Meet and professional in appearance.",
            "Didn't oversell himself — what he said was probably accurate, he just doesn't have much to show yet.",
          ],
          areasToImprove: [
            "Accepted surface-level answers too readily — should have pushed back with 'can you give me a specific example?' on every response.",
            "The vehicle age and mileage reimbursement question deserved more follow-up — it's a potential dealbreaker and it was left unresolved.",
            "Should have asked for at least one professional reference early in the call.",
          ],
          suggestedFollowUp: "Only advance if the pipeline is thin. If so, require a driving record and a reference check before any offer.",
        },
        candidateStatus: "Screening",
        aiSummary: {
          experienceSnapshot:
            "1 year delivery experience through gig platforms. No prior in-house delivery role. Valid license and insured vehicle confirmed.",
          keyHighlights: [
            "Familiar with the delivery area",
            "Available immediately",
          ],
          communicationFit:
            "Struggled to provide specific examples when asked. Answers were surface-level. May need structured onboarding.",
          notedGaps:
            "No references available. Vehicle is older — asked about mileage reimbursement policy, which could be a deciding factor for him.",
          availability: "Flexible, though has another part-time commitment on Tuesday mornings.",
        },
      },
      {
        id: "11",
        name: "Fatima Al-Hassan",
        role: "Cashier",
        durationMin: 20,
        type: "Phone",
        email: "fatima.alhassan@gmail.com",
        phone: "(312) 555-1178",
        date: "Thu",
        time: "1:30 PM",
        rating: 4.4,
        score: { value: 18, outOf: 25 },
        criterionScores: [
          { criterionId: "ca-1", score: 5, note: "Strong de-escalation experience with frustrated customers." },
          { criterionId: "ca-2", score: 5, note: "Zero discrepancies in 2 years of cash handling per her account." },
          { criterionId: "ca-3", score: 4, note: "High transaction volume at grocery chain, though food service pace may differ." },
          { criterionId: "ca-4", score: 2, note: "Bilingual English/Arabic, but answers were brief — hard to assess depth." },
          { criterionId: "ca-5", score: 2, note: "Mon–Sat only. No Sunday availability confirmed." },
        ],
        interviewerFeedback: {
          overallImpression: "Professional and composed throughout. The cash handling track record is genuinely impressive. The brevity of her answers made it hard to gauge depth — she gave correct answers but rarely elaborated.",
          whatWentWell: [
            "De-escalation example was clear and showed real emotional intelligence.",
            "Bilingual ability came up naturally and felt like a genuine asset rather than a resume item.",
            "She maintained composure even when the questions got more pointed toward the end.",
          ],
          areasToImprove: [
            "Let her give one-sentence answers too often without pushing for detail — need to use 'tell me more' more consistently.",
            "Didn't probe what 'zero discrepancies' actually means in practice — is it self-reported or verified by a manager?",
            "Sunday availability was treated as a minor issue when it may actually affect scheduling significantly.",
          ],
          suggestedFollowUp: "Get a manager reference specifically on the cash handling claim. Clarify Sunday coverage before advancing to offer stage.",
        },
        candidateStatus: "Shortlisted",
        aiSummary: {
          experienceSnapshot:
            "2 years retail cashier experience at a grocery chain. Comfortable with high transaction volumes and cash handling.",
          keyHighlights: [
            "Zero cash handling discrepancies in 2 years per her account",
            "Experience de-escalating frustrated customers",
            "Bilingual (English/Arabic)",
          ],
          communicationFit:
            "Composed and professional. Gave concise, well-structured answers. Would represent the brand well at the counter.",
          notedGaps: "No food service background. Will need food safety orientation.",
          availability: "Mon–Sat, open availability.",
        },
      },
    ],
  },
  {
    title: "Wed Apr 2",
    data: [
      {
        id: "12",
        name: "Noah Reyes",
        role: "Shift Lead",
        durationMin: 45,
        type: "In-person",
        email: "noah.reyes@yahoo.com",
        phone: "(312) 555-1289",
        date: "Wed",
        time: "10:00 AM",
        rating: 4.3,
        score: { value: 19, outOf: 25 },
        criterionScores: [
          { criterionId: "sl-1", score: 4, note: "Informal lead duties at Taco Bell but no official title." },
          { criterionId: "sl-2", score: 4, note: "Showed initiative but gave scattered answers on conflict scenarios." },
          { criterionId: "sl-3", score: 5, note: "Comfortable with opening duties and cash counts." },
          { criterionId: "sl-4", score: 4, note: "No certification mentioned. Would need to obtain." },
          { criterionId: "sl-5", score: 2, note: "No weekend availability for the next 2 months." },
        ],
        interviewerFeedback: {
          overallImpression: "High potential, low readiness. His enthusiasm is genuine but his answers lack the structure you'd want from someone stepping into a lead role. The weekend gap for two months is a real scheduling problem.",
          whatWentWell: [
            "His energy and motivation were evident — he's clearly hungry for the title and the responsibility.",
            "The opening duties knowledge was solid and came across as hands-on, not theoretical.",
            "He recovered well when asked to clarify a scattered answer — showed self-awareness.",
          ],
          areasToImprove: [
            "Let him ramble on leadership questions without redirecting — need to cut in earlier and ask for a specific example.",
            "The certification gap was noted but not followed up with a timeline or commitment to get it.",
            "Should have asked what 'informal lead' actually meant day-to-day at Taco Bell — it could mean very little.",
          ],
          suggestedFollowUp: "Revisit in 6–8 weeks when weekend availability opens up. In the meantime, ask him to get food handler certified — use it as a signal of commitment.",
        },
        candidateStatus: "Screening",
        aiSummary: {
          experienceSnapshot:
            "3 years QSR experience, 6 months informal lead role at a Taco Bell franchise. No official shift lead title but performed the duties.",
          keyHighlights: [
            "Showed initiative in previous role without formal recognition",
            "Comfortable with opening duties and cash counts",
          ],
          communicationFit:
            "Enthusiastic and eager to grow. A bit scattered in longer answers but clearly motivated.",
          notedGaps:
            "Hasn't held a formal leadership title — may need a confidence-building approach early on.",
          availability: "Mon–Fri, flexible. No weekend availability for the next 2 months.",
        },
      },
      {
        id: "13",
        name: "Imani Jackson",
        role: "Sandwich Associate",
        durationMin: 20,
        type: "Phone",
        email: "imani.jackson@gmail.com",
        phone: "(312) 555-1390",
        date: "Wed",
        time: "2:15 PM",
        rating: 4.1,
        score: { value: 18, outOf: 25 },
        criterionScores: [
          { criterionId: "sa-1", score: 4, note: "Brief retail background. No direct food prep experience yet." },
          { criterionId: "sa-2", score: 4, note: "Upbeat attitude suggests she'd handle pressure well, but untested." },
          { criterionId: "sa-3", score: 4, note: "No evidence of spec-following yet — would need close onboarding." },
          { criterionId: "sa-4", score: 4, note: "No concerns raised. Seems physically capable." },
          { criterionId: "sa-5", score: 2, note: "Seeking 30–35 hrs/week with full availability — positive sign." },
        ],
        interviewerFeedback: {
          overallImpression: "No food service background but the attitude is genuinely refreshing. She's coachable, motivated, and not trying to oversell experience she doesn't have. A high-effort hire who'll need hand-holding early.",
          whatWentWell: [
            "She was upfront about her lack of experience without being apologetic — came across as self-aware.",
            "The long-term interest in food service felt authentic, not just a line.",
            "Full availability and desired hours are exactly what the role needs.",
          ],
          areasToImprove: [
            "The interview leaned too heavily on attitude and not enough on testing coachability — should have given her a scenario to work through.",
            "Didn't ask about her retail experience in enough detail — transferable skills around customer interaction and attention to detail were left unexplored.",
            "Food safety orientation wasn't discussed at all — should confirm she's willing to complete it before starting.",
          ],
          suggestedFollowUp: "If the role is trainable, she's worth a trial shift. Confirm food safety orientation commitment and check references from the shoe store role.",
        },
        candidateStatus: "Applied",
        aiSummary: {
          experienceSnapshot:
            "First food service role. Previously in retail (6 months, shoe store). Eager to transition to food service.",
          keyHighlights: [
            "Strong attitude and energy on the call",
            "Mentioned a genuine interest in the food industry long-term",
          ],
          communicationFit:
            "Upbeat and personable. Lack of food experience is the only hesitation — but attitude and coachability are strong.",
          notedGaps: "No food service or food safety experience. Would need full onboarding.",
          availability: "Full availability. Looking for 30–35 hrs/week.",
        },
      },
    ],
  },
];

export const INTERVIEW_MAP: Record<string, Interview> = Object.fromEntries(
  [...UPCOMING, ...SECTIONS.flatMap((s) => s.data)].map((i) => [i.id, i])
);

// ─── Brand switching ──────────────────────────────────────────────────────────

export type Brand = "potbelly" | "tacobell";

export const BRAND_META: Record<Brand, { name: string; email: string }> = {
  potbelly: { name: "Potbelly Sandwich Shop", email: "manager@potbelly.com" },
  tacobell: { name: "Taco Bell", email: "manager@tacobell.com" },
};

function applyBrand<T>(data: T, brand: Brand): T {
  if (brand === "potbelly") return data;
  return JSON.parse(
    JSON.stringify(data)
      .replace(/Sandwich Associate/g, "Team Member")
      .replace(/Potbelly/g, "Taco Bell")
  );
}

export function getBrandUpcoming(brand: Brand) { return applyBrand(UPCOMING, brand); }
export function getBrandSections(brand: Brand) { return applyBrand(SECTIONS, brand); }
export function getBrandInterviewMap(brand: Brand) { return applyBrand(INTERVIEW_MAP, brand); }
export function getBrandRoleTemplates(brand: Brand) { return applyBrand(ROLE_TEMPLATES, brand); }
