// Friendlier mock data for "Abigail" version

const CONNECTOR_CATALOG = [
  { id: "gmail", label: "Gmail", icon: "icons/gmail.png", desc: "Where most of the day's work happens.", recommended: true,
    scopes: ["Read your emails and threads", "Search messages by sender or subject", "No sending, no deleting"] },
  { id: "qb", label: "QuickBooks", icon: "icons/quickbooks.png", desc: "Who paid, who hasn't, what's due.", recommended: true,
    scopes: ["Read invoices and balances", "View customer payment history", "No editing, no creating transactions"] },
  { id: "appfolio", label: "AppFolio", icon: "icons/appfolio.png", desc: "Tenants, leases, and balances.", recommended: true,
    scopes: ["Read tenant and lease records", "View maintenance requests", "No changes to any records"] },
  { id: "drive", label: "Google Drive", icon: "icons/drive.png", desc: "Invoices and lease documents.", recommended: true,
    scopes: ["Read documents and spreadsheets", "Find invoices and attachments", "No uploading, no editing files"] },
  { id: "outlook", label: "Outlook", icon: "icons/outlook.png", desc: "If you use Microsoft instead of Gmail.",
    scopes: ["Read your emails and calendar", "Search messages and contacts", "No sending, no deleting"] },
  { id: "stripe", label: "Stripe", icon: "icons/stripe.png", desc: "Confirms online payments.",
    scopes: ["Read payment records", "View transaction status", "No charges, no refunds"] },
];

const CONNECTED_SYSTEMS = [
  { id: "gmail", label: "Gmail", emoji: "✉️", desc: "1,486 emails read", time: "just now" },
  { id: "qb", label: "QuickBooks", emoji: "📒", desc: "428 balances read", time: "just now" },
  { id: "appfolio", label: "AppFolio", emoji: "🏢", desc: "312 tenants read", time: "1 min ago" },
  { id: "drive", label: "Google Drive", emoji: "📁", desc: "184 documents read", time: "2 min ago" },
  { id: "outlook", label: "Outlook", emoji: "📨", desc: "642 emails read", time: "3 min ago" },
  { id: "stripe", label: "Stripe", emoji: "💳", desc: "97 payments read", time: "3 min ago" },
];

const SCAN_TARGETS = [
  { id: "email", label: "Reading your emails", count: 1486 },
  { id: "balance", label: "Looking at unpaid balances", count: 428 },
  { id: "pms", label: "Reviewing tenant records", count: 312 },
  { id: "docs", label: "Scanning documents", count: 184 },
];

const FOUND_LOOPS = [
  { id: "rent", emoji: "💰", title: "Chasing late rent", count: "94×/month", readiness: "go", primary: true,
    hours: "~22 hrs/month", revenue: "$5.6k/month",
    reasons: [
      "It happens almost every day — you'll feel the time back right away",
      "It's mostly the same email each time — easy and safe to draft",
      "If something looks unusual (like a payment plan), No-Go AI will ask you first",
      "Nothing gets sent until you click 'Send'",
    ] },
  { id: "vendor", emoji: "🔧", title: "Following up with vendors", count: "63×/month", readiness: "wait",
    hours: "~14 hrs/month", revenue: "$3.2k/month",
    reasons: [
      "Vendor follow-ups are repetitive but some need custom terms",
      "We need to learn your vendor relationships before automating",
    ] },
  { id: "lease", emoji: "📝", title: "Lease renewals & paperwork", count: "38×/month", readiness: "wait",
    hours: "~10 hrs/month", revenue: "$1.8k/month",
    reasons: [
      "Lease docs vary a lot — we need more examples to draft safely",
      "Legal review is usually involved, so full automation isn't safe yet",
    ] },
  { id: "complaint", emoji: "🗣️", title: "Tenant complaints", count: "57×/month", readiness: "no",
    hours: "~18 hrs/month", revenue: "—",
    reasons: [
      "Complaints are sensitive — a wrong tone can escalate fast",
      "Each one needs human judgment; not safe to automate yet",
    ] },
];

// Per-workflow steps
const WORKFLOW_STEPS = {
  rent: [
    { kind: "trigger", label: "When rent is 7+ days late", detail: "No-Go AI checks every morning at 8am." },
    { kind: "step", label: "Reads the tenant's history", detail: "Did they pay last month? Are they on a payment plan? Any open issues?" },
    { kind: "step", label: "Drafts a friendly message", detail: "Tone matches the situation — gentle for first-timers, firmer for repeat lateness." },
    { kind: "human", label: "Asks you to look it over", detail: "Right here in your No-Go AI inbox. Approve, edit, or skip." },
    { kind: "step", label: "Sends after you approve", detail: "Goes out from your normal email address. Logged for the record." },
  ],
  vendor: [
    { kind: "trigger", label: "When a vendor invoice has no reply for 5+ days", detail: "No-Go AI checks Mon/Wed/Fri at 9am." },
    { kind: "step", label: "Checks invoice status in QuickBooks", detail: "Is it paid, pending, or disputed? Any notes from the team?" },
    { kind: "step", label: "Drafts a follow-up email", detail: "Professional tone. Includes invoice number, amount, and due date." },
    { kind: "human", label: "Asks you to review", detail: "You see the draft before it goes out. Approve, edit, or skip." },
    { kind: "step", label: "Sends after approval", detail: "Goes from accounts payable. Logged and tracked." },
  ],
  lease: [
    { kind: "trigger", label: "When a lease expires within 60 days", detail: "No-Go AI checks weekly on Monday mornings." },
    { kind: "step", label: "Pulls tenant history and lease terms", detail: "Payment history, maintenance requests, current rate vs market." },
    { kind: "step", label: "Drafts a renewal offer", detail: "Includes proposed terms, any rate adjustment, and renewal deadline." },
    { kind: "human", label: "Asks you to review terms", detail: "You confirm the rate and terms before anything is sent." },
    { kind: "step", label: "Sends to tenant after approval", detail: "Goes from your email. Tenant gets a clear, professional offer." },
  ],
  complaint: [
    { kind: "trigger", label: "When a tenant complaint comes in", detail: "No-Go AI monitors email and AppFolio daily at 7am." },
    { kind: "step", label: "Categorizes the issue", detail: "Maintenance, noise, billing, or other. Checks for urgency signals." },
    { kind: "step", label: "Finds relevant contacts", detail: "Matches the issue to the right vendor or team member." },
    { kind: "human", label: "Routes to you for judgment", detail: "You decide what action to take. No-Go AI never responds to complaints on its own." },
    { kind: "step", label: "Sends acknowledgment after approval", detail: "Tenant gets a confirmation that their issue was received and assigned." },
  ],
};
const HOW_IT_WORKS = WORKFLOW_STEPS.rent;

// Per-workflow chat replies
const WORKFLOW_REPLIES_MAP = {
  rent: [
    { keywords: ["tone", "soft", "gentle", "friendly", "nice"],
      text: "Got it — I've softened the tone across all templates. First-timers now get a warmer opener.",
      change: { idx: 2, label: "Drafts a warm, friendly message", detail: "Tone is always gentle — even for repeat lateness, the message stays supportive." } },
    { keywords: ["day", "wait", "delay", "time", "sooner", "later", "week"],
      text: "Updated — I'll now wait 10 days instead of 7 before the first reminder.",
      change: { idx: 0, label: "When rent is 10+ days late", detail: "No-Go AI checks every morning at 8am. Follow-ups spaced 5 days apart." } },
    { keywords: ["escalat", "manager", "priya", "forward", "route"],
      text: "Added an escalation step — if no response after two reminders, I'll flag it for Priya.",
      change: null, add: { kind: "human", label: "Escalates to Priya after 2 tries", detail: "Routes to your manager instead of sending more emails." } },
    { keywords: ["skip", "ignore", "exclude", "filter", "payment plan"],
      text: "Done — tenants on active payment plans will be automatically excluded.",
      change: { idx: 1, label: "Reads history (skips payment plans)", detail: "Checks for active payment plans and excludes those tenants." } },
    { keywords: ["cc", "copy", "bcc", "notify"],
      text: "Added — I'll BCC you on every outgoing reminder.",
      change: { idx: 4, label: "Sends after you approve (BCC to you)", detail: "You get a BCC copy. Logged for the record." } },
  ],
  vendor: [
    { keywords: ["tone", "soft", "gentle", "friendly", "firm"],
      text: "Updated the tone — follow-ups will stay polite but include a clear deadline reminder.",
      change: { idx: 2, label: "Drafts a polite but firm follow-up", detail: "Includes a gentle deadline reminder while staying professional." } },
    { keywords: ["day", "wait", "delay", "time", "sooner", "frequent"],
      text: "Changed — I'll now follow up after 3 days instead of 5, and check daily instead of Mon/Wed/Fri.",
      change: { idx: 0, label: "When invoice has no reply for 3+ days", detail: "No-Go AI checks every morning at 9am." } },
    { keywords: ["amount", "threshold", "limit", "minimum"],
      text: "Got it — I'll only follow up on invoices over $500. Smaller ones will be skipped.",
      change: { idx: 1, label: "Checks invoice status (over $500 only)", detail: "Filters out small invoices. Only follows up on amounts over $500." } },
  ],
  lease: [
    { keywords: ["early", "sooner", "advance", "day", "time"],
      text: "Updated — I'll start the renewal process 90 days before expiry instead of 60.",
      change: { idx: 0, label: "When a lease expires within 90 days", detail: "No-Go AI checks weekly. Earlier start gives tenants more time to decide." } },
    { keywords: ["rate", "price", "increase", "raise", "market"],
      text: "Added — I'll include a market comparison so tenants see the rate is fair.",
      change: { idx: 2, label: "Drafts renewal with market comparison", detail: "Includes current rate vs comparable units so the offer feels transparent." } },
    { keywords: ["remind", "follow", "second"],
      text: "Added a follow-up — if no response in 14 days, I'll send a gentle reminder.",
      change: null, add: { kind: "step", label: "Follows up after 14 days", detail: "Sends one reminder if the tenant hasn't responded to the renewal offer." } },
  ],
  complaint: [
    { keywords: ["urgent", "emergency", "immediate", "priority"],
      text: "Updated — urgent complaints (water, gas, safety) will be flagged immediately instead of waiting for the daily check.",
      change: { idx: 0, label: "Monitors complaints in real-time for urgency", detail: "Safety and utility issues trigger instant alerts. Others batch daily." } },
    { keywords: ["tone", "empathy", "sorry", "gentle"],
      text: "Updated the acknowledgment to lead with empathy before confirming assignment.",
      change: { idx: 4, label: "Sends empathetic acknowledgment", detail: "Leads with understanding, then confirms the issue is being handled." } },
    { keywords: ["assign", "route", "team", "who"],
      text: "Added smarter routing — maintenance goes to the vendor, billing to Priya, noise to the property manager.",
      change: { idx: 2, label: "Routes to the right person automatically", detail: "Maintenance → vendor, billing → Priya, noise → property manager." } },
  ],
};
const WORKFLOW_REPLIES = WORKFLOW_REPLIES_MAP.rent;

const WORKFLOW_DEFAULT_REPLY = "Understood — I've updated the workflow with that change. Take another look at the steps below.";

// Per-workflow simulation results
const SIM_RESULTS_MAP = {
  rent: {
    score: 96.4, total: 94, passed: 91, failed: 3,
    failures: [
      { tenant: "Unit 7C — David Park", reason: "Open maintenance dispute. Reminder could escalate.", suggestion: "Add dispute-detection to the skip list." },
      { tenant: "Unit 2A — Sarah Chen", reason: "Lease ends in 8 days. Late rent may be intentional.", suggestion: "Cross-check lease end dates before sending." },
      { tenant: "Unit 15B — James Okafor", reason: "Flagged as hardship case.", suggestion: "Exclude tenants with hardship flags." },
    ],
  },
  vendor: {
    pass1: {
      score: 82.5, total: 63, passed: 52, failed: 11,
      failures: [
        { tenant: "Northline Cleaning — INV-4421", reason: "Invoice is under dispute.", suggestion: "Skip invoices with open disputes." },
        { tenant: "Park Electric — INV-4398", reason: "Vendor requested a 30-day extension.", suggestion: "Respect extension requests." },
        { tenant: "Summit HVAC — INV-4455", reason: "Duplicate invoice detected.", suggestion: "Flag duplicates for manual review." },
        { tenant: "ClearView Windows — INV-4460", reason: "Work not yet completed.", suggestion: "Cross-check work completion." },
        { tenant: "Apex Plumbing — INV-4472", reason: "Vendor already paid via ACH.", suggestion: "Check payment status before follow-up." },
        { tenant: "Metro Roofing — INV-4481", reason: "Invoice amount doesn't match PO.", suggestion: "Flag amount mismatches." },
        { tenant: "ProClean Services — INV-4490", reason: "Contract expired, invoice may be invalid.", suggestion: "Verify active contracts." },
      ],
    },
    score: 94.2, total: 63, passed: 59, failed: 4,
    failures: [
      { tenant: "Northline Cleaning — INV-4421", reason: "Invoice is under dispute. Follow-up could complicate resolution.", suggestion: "Skip invoices with open disputes." },
      { tenant: "Park Electric — INV-4398", reason: "Vendor requested a 30-day extension. Too early to follow up.", suggestion: "Respect extension requests before following up." },
      { tenant: "Summit HVAC — INV-4455", reason: "Duplicate invoice detected.", suggestion: "Flag duplicates for manual review." },
      { tenant: "ClearView Windows — INV-4460", reason: "Work not yet completed. Invoice is premature.", suggestion: "Cross-check work completion before following up." },
    ],
  },
  lease: {
    score: 91.8, total: 38, passed: 35, failed: 3,
    failures: [
      { tenant: "Unit 3A — Maria Santos", reason: "Tenant submitted a complaint last week. Bad timing for renewal.", suggestion: "Delay renewal if open complaints exist." },
      { tenant: "Unit 9C — Robert Kim", reason: "Tenant already notified intent to vacate.", suggestion: "Check for move-out notices before sending renewal." },
      { tenant: "Unit 6B — Lisa Patel", reason: "Lease terms require legal review (commercial unit).", suggestion: "Flag commercial leases for legal review." },
    ],
  },
  complaint: {
    score: 87.3, total: 57, passed: 50, failed: 7,
    failures: [
      { tenant: "Unit 1A — Tom Wright", reason: "Complaint involves another tenant. Sensitive situation.", suggestion: "Flag tenant-vs-tenant issues for human handling." },
      { tenant: "Unit 8B — Ana Reyes", reason: "Repeat complaint — third time this month.", suggestion: "Escalate repeat complaints instead of standard ack." },
      { tenant: "Unit 5C — David Lee", reason: "Complaint mentions legal action.", suggestion: "Route legal mentions directly to management." },
      { tenant: "Unit 11A — Priya Sharma", reason: "Complaint is vague — can't categorize.", suggestion: "Ask for clarification before routing." },
      { tenant: "Unit 4B — Ava Thompson", reason: "Complaint about rent increase — billing, not maintenance.", suggestion: "Improve categorization for billing complaints." },
      { tenant: "Unit 7A — James Wu", reason: "Emergency (gas smell) filed as non-urgent.", suggestion: "Add keyword detection for safety emergencies." },
      { tenant: "Unit 14C — Karen O'Brien", reason: "Complaint references a prior unresolved issue.", suggestion: "Check complaint history before sending standard ack." },
    ],
  },
};
const SIM_RESULTS = SIM_RESULTS_MAP.rent;

// Per-workflow running metadata
const WORKFLOW_RUNNING_META = {
  rent: { title: "Chasing late rent", schedule: "runs every weekday at 8am", stats: { sent: 148, hours: 31, collected: 92, roi: "6.1x" } },
  vendor: { title: "Following up with vendors", schedule: "runs Mon/Wed/Fri at 9am", stats: { sent: 63, hours: 14, collected: 38, roi: "4.2x" } },
  lease: { title: "Lease renewals & paperwork", schedule: "runs weekly on Monday", stats: { sent: 38, hours: 10, collected: 22, roi: "3.8x" } },
  complaint: { title: "Tenant complaints", schedule: "runs daily at 7am", stats: { sent: 57, hours: 18, collected: 0, roi: "—" } },
};

const DRAFTS = [
  {
    id: "d1",
    name: "Ava Thompson",
    initials: "AT",
    account: "Unit 4B, Harbor Lofts · $1,240 overdue",
    risk: "low",
    time: "9:14 AM",
    aiNote: "Ava's never been late before. I drafted a gentle reminder.",
    subject: "Quick reminder — November rent",
    body: "Hi Ava,\n\nJust a quick note — November rent ($1,240) shows as outstanding. If you've already sent it, please disregard, our system can take a day to update.\n\nLet me know if anything looks off.\n\nThanks,\nHarbor & Stone",
    actions: ["Send it", "Edit first", "Skip"],
    primary: "Send it",
  },
  {
    id: "d2",
    name: "Michael Reed",
    initials: "MR",
    account: "Unit 12A, Stoneview · $2,100 overdue",
    risk: "wait",
    time: "9:14 AM",
    aiNote: "Michael mentioned a payment plan in an email last month. I don't want to send a generic reminder over that — should I send this to Priya instead?",
    note: "Found in his Oct 18 email: \"…can we work out a plan for November?\"",
    actions: ["Send to Priya", "Edit first", "Skip"],
    primary: "Send to Priya",
  },
  {
    id: "d3",
    name: "Northline Cleaning",
    initials: "NC",
    account: "Vendor invoice · $3,700 pending",
    risk: "low",
    time: "9:14 AM",
    aiNote: "Northline asked for reimbursement but didn't attach the invoice PDF. I can ask them to send it.",
    subject: "Following up on INV-4421",
    body: "Hi Northline team,\n\nThanks for sending the reimbursement request. We have the invoice number (INV-4421) but the PDF didn't come through.\n\nCould you re-send the invoice? Once we have it we'll process the $3,700 within 5 business days.\n\nThanks,\nHarbor & Stone — Accounts Payable",
    actions: ["Send it", "Edit first", "Skip"],
    primary: "Send it",
  },
];

const SAVINGS = {
  big: 92,
  bigUnit: "k",
  bigLabel: "collected last month after No-Go AI's reminders",
  desc: "That's $92,000 you would have spent more time chasing — or might have written off.",
  tiles: [
    { k: "Reminders sent", v: 148 },
    { k: "Times No-Go AI asked you first", v: 39 },
    { k: "Hours saved", v: 31, suffix: "h" },
    { k: "Faster than usual by", v: 4.7, suffix: " days" },
    { k: "Returned for every $1 spent", v: 6.1, prefix: "$", suffix: "" },
    { k: "Things you didn't have to do yourself", v: 420 },
  ],
};

const EXPANSION = [
  { id: "rent", label: "Chasing late rent", state: "live", sub: "Running daily" },
  { id: "vendor", label: "Vendor follow-ups", state: "next", sub: "Ready when you are" },
  { id: "lease", label: "Lease renewals", state: "queue", sub: "Suggested for January" },
  { id: "maint", label: "Maintenance updates", state: "queue", sub: "Suggested later" },
];

const STEPS = [
  { id: "connect", label: "Connect", n: 1 },
  { id: "recommend", label: "Recommend", n: 2 },
  { id: "deploy", label: "Automate", n: 3 },
  { id: "running", label: "Running", n: 4 },
];

Object.assign(window, {
  CONNECTOR_CATALOG, CONNECTED_SYSTEMS, SCAN_TARGETS,
  FOUND_LOOPS, RECOMMEND_REASONS, HOW_IT_WORKS,
  WORKFLOW_STEPS, WORKFLOW_REPLIES_MAP, WORKFLOW_REPLIES,
  WORKFLOW_DEFAULT_REPLY, SIM_RESULTS_MAP, SIM_RESULTS,
  WORKFLOW_RUNNING_META,
  DRAFTS, SAVINGS, EXPANSION, STEPS,
});
