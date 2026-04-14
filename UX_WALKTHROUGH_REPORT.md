Here is the complete UX walkthrough report, evaluated from the perspective of a 55-year-old roofer who is used to pen and paper and barely knows how to use his iPhone.

---

# SNAPQUOTE UX WALKTHROUGH REPORT
## Persona: Non-tech-savvy roofer, 55, pen-and-paper guy, iPhone basic user
## Viewport: Mobile 375x812

---

## 1. /DASHBOARD

**First Impression:** This page is DENSE. A roofer opens the app in his truck and sees a wall of numbers, cards, sections, stats, charts. It scrolls to 3,822px tall -- that is nearly 5 full screens of content on mobile. He would not know where to start.

### Findings:

**[CRITICAL] Seven "$0" values staring at the user.**
Revenue This Month: $0. This Week: $0. Monthly Pace: $0. Pipeline: $0. AVG Quote: $0. Likely to Close: $0. The dashboard shows $0 seven times even though there are 26 quotes worth $357k and 20 active jobs worth $164k. A roofer would think: "This app says I made nothing? That can't be right." The $0 revenue figures are technically correct (no payments recorded this month yet) but are psychologically demoralizing and confusing when juxtaposed right next to "$357.4k QUOTES" in the workflow bar. The app is screaming "you're broke" when the roofer is actually busy.

**[CRITICAL] "Revenue Intelligence" / "Pipeline" / "Close Rate" / "deals" -- jargon overload.**
A roofer does not think in "pipeline" or "close rate" or "deals." He thinks: "How many jobs do I have lined up?" and "How much money am I owed?" The word "deals" appears 2 times ("20 deals", "deals need attention right now") but everywhere else these are called "jobs" or "quotes." This inconsistency would confuse the user. "25 deals need attention right now" -- a roofer would say "what deals? I do roofing jobs, not deals."

**[CRITICAL] Information overload -- no clear "what should I do right now?"**
The dashboard has 9+ sections: Workflow bar, Action badges, Dashboard Statistics, Revenue Intelligence, Revenue Trend (collapsed), Today's Schedule, Scheduling gaps, Do This Now, Quick Actions, Active Jobs, Recent Activity, Recent Quotes. A roofer would scroll and scroll and never find the ONE thing he needs to do next. The "Do This Now" section -- which is arguably the most important -- is buried at approximately Y:1900, nearly 2.5 screens down.

**[IMPORTANT] Workflow pipeline cards -- "INVOICING" label is unclear.**
The workflow pipeline shows: QUOTES (26) > JOBS (20) > INVOICING (1) > PAYMENTS (0). "Invoicing" as a noun is office-speak. A roofer would understand "Bills to Send" or "Money Owed" better. Also, the card labels are 10px font -- very small for a guy with reading glasses on a job site.

**[IMPORTANT] Action badges require horizontal scrolling.**
"15 need follow-up" / "7 deposits pending" / "$87,900 to collect" / "18 awaiting reply" are in a horizontal scroll row. The third and fourth badges are off-screen at x:401 and x:600 on a 375px wide phone. A roofer will see the first two and never discover "$87,900 to collect" exists. That is literally the most important number on the entire dashboard.

**[IMPORTANT] Header icons are mystery meat.**
Three 36x36 icon-only buttons in the header: Theme toggle, Notifications bell, Export. No labels. The Export button (download arrow icon) exports quotes -- but a roofer tapping it expecting something else would be confused. The Theme toggle (sun/moon icon) has no business being in a prominent header position for a roofer who does not know what "dark mode" is.

**[IMPORTANT] "Dashboard Statistics" heading is generic.**
The section heading says "Dashboard Statistics" -- which tells the user nothing. It should say something like "Your Numbers This Month."

**[NICE-TO-HAVE] "-21%" sent trend is alarming without context.**
A red "-21%" badge next to "SENT: 0 this month" is anxiety-inducing. The roofer doesn't know what this means. 21% less than what? Compared to when?

**[NICE-TO-HAVE] The greeting "Good morning, Matt" is nice but takes up valuable above-the-fold space.**
The header area (date + greeting + icon row) consumes 196px of precious mobile real estate before any actionable content appears.

---

## 2. BOTTOM NAVIGATION BAR

**First Impression:** Four tabs plus a center "+" button. Clean iOS-style layout.

### Findings:

**[IMPORTANT] "Search" tab goes to /clients -- label mismatch.**
The bottom nav tab says "Search" but links to `/clients`. A roofer tapping "Search" expects to search for something -- maybe a job, maybe an address. Instead he lands on an alphabetical client list. The tab should say "Clients" or "Customers" to match what it actually shows.

**[IMPORTANT] Bottom nav labels are 10px font.**
"Dashboard", "Schedule", "Search", "More" are rendered at 10px. For a roofer with aging eyes reading his phone in bright sunlight, this is dangerously small. Apple's HIG recommends minimum 11pt for tab bar labels. The inactive labels are also rgb(156, 163, 175) -- light gray that washes out in sunlight.

**[IMPORTANT] Center "+" button has no visible label.**
The center FAB (52x52px, good tap target) just shows a "+" icon. Its aria-label is "Quick add menu" but there is no visible text. A roofer would wonder: "Plus what? Add what?" He might be afraid to tap it.

**[NICE-TO-HAVE] Only 4 visible destinations.**
Dashboard, Schedule, Search/Clients, and More. Jobs, Invoices, Payments, Pipeline, and Settings are all hidden behind "More." For a roofer, "Jobs" is probably the second most important page after Dashboard. It should arguably be a primary tab, not buried behind a menu.

---

## 3. MORE MENU (Bottom Sheet)

**First Impression:** Contains: Jobs, Invoices, Pipeline, Payments, Settings. It is a bottom sheet with a drag handle.

### Findings:

**[IMPORTANT] "Pipeline" label is tech jargon.**
A roofer does not know what "Pipeline" means in a business context. He would understand "My Quotes" or "Quote Tracker" or "Follow-Ups." This is CRM/SaaS language, not contractor language.

**[IMPORTANT] No "Clients" in the More menu.**
Clients is accessible via the "Search" tab, but if a roofer is in the More menu looking for his customer list, he won't find it. Mental model mismatch.

**[NICE-TO-HAVE] Five items in More menu is manageable.**
The 15px font and 3.5py padding are good tap targets. The icon + label layout is clear.

---

## 4. /SCHEDULE

**First Impression:** A real calendar. Roofers understand calendars. This is the most intuitive page in the app.

### Findings:

**[NICE-TO-HAVE] Calendar day buttons are 45x44px -- decent tap targets.**
Month view with day buttons around 45x44px. Good enough for thick fingers.

**[IMPORTANT] "Create event" is an icon-only button (44x44 with no label).**
Top right corner, just a "+" icon. No text saying "Add Appointment" or "Schedule Job." A roofer might not notice it.

**[NICE-TO-HAVE] "NEEDS SCHEDULING (8)" section is great.**
Below the calendar, there is a "NEEDS SCHEDULING" section showing approved quotes that need to be booked. This is exactly what a roofer needs -- "Here are the jobs you sold, now pick a day." The "Show all" button is clear.

**[NICE-TO-HAVE] Event cards show name + time + address with a map icon.**
The address links are tappable for navigation. Very practical for a roofer driving between jobs.

**[IMPORTANT] "Estimate" label on events is ambiguous.**
Each scheduled event shows "Estimate" as the type. A roofer would call this a "roof inspection" or "bid appointment" or "measurement." "Estimate" is fine for the quote document, but for a calendar event it is vague.

---

## 5. /CLIENTS (Search Tab)

**First Impression:** An alphabetical contact list with 923 clients. Looks like a phone book. A roofer would understand this.

### Findings:

**[NICE-TO-HAVE] The A-Z letter scrubber on the right side is excellent.**
Familiar iOS contacts pattern. A roofer can jump to "S" for Smith instantly.

**[IMPORTANT] Search bar placeholder says "Search clients..." -- good.**
But there are also sort buttons (Name, Recent, Revenue) that are small and not obvious. The toggle between list/grid view icons next to the sort buttons are tiny unlabeled icons.

**[IMPORTANT] Some clients appear without phone numbers.**
Examples: "Andrea Glass", "Amanda Buckles", "Anne Barnett" show no phone number. For a roofer, a client without a phone number is useless. There should be a visual indicator that contact info is missing.

**[NICE-TO-HAVE] Client cards show job count ("2 jobs", "1 job") which is helpful.**
Lets the roofer know who is a repeat customer at a glance.

---

## 6. /JOBS

**First Impression:** A list of job cards with filter tabs (All, Active, Scheduled, Completed). Clean layout.

### Findings:

**[CRITICAL] Most jobs show "$0" as the amount.**
Out of 21 active jobs, many show "$0" (Larry Mckinney $0, Tyler Sizemore $0, Mary Jo Stangland $0, Lucas Johnson $0, etc.). This is because the deposit has not been recorded yet, but a roofer sees "$0" and thinks: "I'm doing this job for free?" The $0 is the amount collected, not the job value. The job VALUE should be displayed, not the collected amount (or show both clearly: "$18,020 job / $0 collected").

**[IMPORTANT] No job address on many cards.**
Several job cards show just a name and dollar amount with no address. A roofer identifies jobs by address ("the Smith roof on Oak Street"), not by client name. Missing addresses make jobs unidentifiable.

**[IMPORTANT] Status pills (In Progress, Scheduled, Completed) are clear.**
Good color coding. A roofer can tell at a glance what stage each job is in.

**[NICE-TO-HAVE] No search or filter by address.**
If a roofer wants to find "that job on Randolph Street," he has to scroll through 21+ cards visually. There is no search box on the jobs page.

---

## 7. /JOBS/[Carol Jones] -- Completed Job Detail

**First Impression:** Comprehensive job detail page with scope of work, line items, payment status. Shows "PAID" badge and "All Done -- This job is complete and fully paid."

### Findings:

**[NICE-TO-HAVE] The "All Done" completion state is clear and satisfying.**
Green checkmark, clear messaging. The roofer knows this one is handled.

**[IMPORTANT] Action bar has 6 buttons: Call, Text, Photos, Proposal, Invoice, Navigate.**
These are good real-world actions. However, on a 375px screen, 6 buttons in a row means each is very narrow. "Proposal" is a slightly confusing label -- a roofer might call this a "Quote" or "Estimate."

**[IMPORTANT] The "Review Request Sent" section with "Send Again" button is good.**
Proactively prompting for Google reviews is smart. However, the message says "Review request sent to carol jones" with a lowercase name, which looks unprofessional.

**[NICE-TO-HAVE] Line items show detailed scope of work.**
Very professional. The breakdowns (32 square x $50.00 = $1,600.00) are clear.

**[NICE-TO-HAVE] Tabs (Overview, Job, Activity) let the roofer dig deeper if needed.**
Good progressive disclosure.

---

## 8. /INVOICES

**First Impression:** Empty state with "No invoices yet" and helpful message.

### Findings:

**[IMPORTANT] Empty state says "Create invoices from the job detail page to get started."**
This is helpful guidance, but a roofer would think: "Wait, where is the job detail page? How do I get there?" There should be a direct link or button to navigate to jobs.

**[IMPORTANT] "New Invoice" button exists in the header alongside a "0 awaiting payment" counter.**
Good that there is a prominent creation path.

**[IMPORTANT] Filter tabs (All, Draft, Awaiting Payment, Paid, Overdue) are present even when empty.**
Showing 5 filter options on an empty page is visual clutter. They should appear only when there is content to filter.

---

## 9. /PAYMENTS

**First Impression:** Shows 2 payments totaling $19,365.50. Clean list with payment method icons.

### Findings:

**[NICE-TO-HAVE] Payment cards show clear info: client name, quote number, address, amount, date, type (Check/Cash).**
The check emoji and cash emoji make payment methods instantly identifiable.

**[NICE-TO-HAVE] Filter tabs (All, Cash, Check, Card) are practical.**
A roofer can quickly find all the checks he needs to deposit.

**[IMPORTANT] "Balance" label on Carol Jones payment is ambiguous.**
Shows "$13,200.00" with "Balance" next to it, and a notepad emoji. Is this the balance payment? The remaining balance? The full amount? Not clear without context.

---

## 10. /PIPELINE

**First Impression:** This is the most complex and confusing page in the entire app. A horizontal-scrolling kanban board with 8+ columns.

### Findings:

**[CRITICAL] The word "Pipeline" means nothing to a roofer.**
This is the most egregious jargon in the app. A roofer would call this "My Quotes" or "Where Things Stand" or "Quote Status." The word "pipeline" is pure CRM/SaaS terminology.

**[CRITICAL] 8 stage columns in a horizontal scroll on a 375px screen.**
The stages (Lead, Follow Up, Quote Created, Quote Sent, Deposit Collected, Scheduled, In Progress, Completed) extend to x:1143 on a 375px viewport. The user must scroll horizontally through 3x the screen width to see all stages. Most roofers would never discover the later stages. The stage pills at the top are 12px font.

**[CRITICAL] "Follow Up" stage has 24 items but no clear instruction on WHAT to do.**
A roofer sees "Follow Up 24 $189K" and 24 cards. But what does "follow up" mean? Call them? Text them? Send the quote again? Each card shows a name, quote number, dollar amount, and a cryptic score like "50" with a yellow dot. There is no "Call Now" or "Send Quote" action visible without tapping into each card.

**[IMPORTANT] Score badges (e.g., "50", "35", "15" with colored dots) are unexplained.**
What does "50" mean? Is that a temperature? A percentage? A roofer has no idea. These appear to be deal health/probability scores, but there is zero explanation on the page.

**[IMPORTANT] "Going Cold" label is good but alarming.**
Cards that say "Going Cold 41d" with red indicators create anxiety. Good that it creates urgency, but there is no direct action from the pipeline card -- the roofer has to tap in, figure out the context, then figure out what to do.

**[IMPORTANT] "Lead" vs "Quote" toggle in the header is confusing.**
The page has both a "Lead" and "Quote" toggle button at the top, suggesting two different pipeline views. A roofer does not distinguish between "leads" and "quotes" the way a CRM user does.

---

## 11. /QUOTES/NEW

**First Impression:** This is EXCELLENT. Three clear options: "Snap a Photo" (AI generates a quote from job photos), "Use a Template" (pre-filled line items), or "build a quote manually." This is the best-designed page in the app.

### Findings:

**[NICE-TO-HAVE] "How do you want to start?" is a perfect question.**
Clear, friendly, not intimidating. The three options have icons, titles, and descriptions.

**[NICE-TO-HAVE] "Snap a Photo -- AI generates a quote from your job photos" is the killer feature.**
A roofer takes a photo of the roof, and AI builds the quote. This is what differentiates SnapQuote. It is front and center. Perfect.

**[NICE-TO-HAVE] "Or build a quote manually" is a subtle link at the bottom.**
Good progressive disclosure. Power users can skip AI, but the AI path is the obvious primary choice.

**[IMPORTANT] The back button says "Back to dashboard" -- but the roofer might have come from a client page or job page.**
Should just be a generic back arrow without specifying "to dashboard."

---

## 12. /SETTINGS

**First Impression:** Settings with Theme selector, section buttons (Business, Features, Integrations), and sub-tabs (Account, Profile, Branding). Clean but sparse.

### Findings:

**[IMPORTANT] Theme toggle is the FIRST thing on the Settings page.**
Why is Light/Dark/System mode the most prominent setting? A roofer does not care about dark mode. Business info, company name, logo, phone number -- those should come first.

**[IMPORTANT] "QUOTE TEMPLATES" section shows "No templates yet" with guidance.**
Good empty state message: "Save a quote as a template to reuse line items for similar jobs." This is clear.

**[NICE-TO-HAVE] "Integrations" section suggests extensibility.**
Good forward-thinking, but a roofer won't know what "integrations" means. "Connect Other Apps" would be clearer.

**[NICE-TO-HAVE] "Sign Out" button is clearly visible.**
At the bottom of the Account section. Good placement.

---

## CROSS-CUTTING ISSUES

**[CRITICAL] Inconsistent terminology throughout the app.**
The same concept is called different things on different pages:
- "deals" (dashboard) vs "jobs" (jobs page) vs "quotes" (quotes page)
- "Pipeline" (nav) vs workflow pipeline stages (dashboard) vs kanban board (pipeline page)
- "Invoicing" (dashboard workflow card) vs "Invoices" (page title)
- "Search" (bottom nav tab) vs "Clients" (page title)

**[CRITICAL] No prominent "Create New Quote" button on the dashboard or primary navigation.**
The most important action in the app -- creating a new quote -- is hidden behind either: (a) the center "+" FAB that opens a sub-menu, or (b) scrolling to "Quick Actions" section deep in the dashboard, or (c) the sidebar nav (desktop only). There is no big obvious "NEW QUOTE" button on the main dashboard.

**[IMPORTANT] No offline capability evident.**
A roofer on a rural roof with no cell signal needs to at least view his schedule and client contact info. There is no indication of offline support.

**[IMPORTANT] The app page titles inconsistently show in the browser tab.**
The Carol Jones job page shows "Jobs | SnapQuote" instead of "carol jones | SnapQuote" or "Job: Carol Jones." The pipeline page says "Pipeline | SnapQuote." The invoices page says "SnapQuote -- AI-Powered Quotes for Contractors" (the marketing tagline, not the page name).

---

## SEVERITY SUMMARY

### CRITICAL (7 issues -- blocks user or loses money):
1. Seven "$0" revenue displays when there is $357k in quotes and $164k in active jobs
2. "deals" / "pipeline" / "close rate" jargon throughout
3. Dashboard information overload -- "Do This Now" buried 2.5 screens down
4. Pipeline page: "Pipeline" means nothing to a roofer
5. Pipeline: 8 horizontal columns on 375px -- stages are undiscoverable
6. Pipeline: 24 "Follow Up" items with no clear action or explanation of score badges
7. Jobs page: Most jobs show "$0" amount (shows collected, not job value)
8. Inconsistent terminology across pages (deals vs jobs vs quotes)
9. No prominent "Create New Quote" button on dashboard

### IMPORTANT (15 issues -- confusing but survivable):
1. Action badges: "$87,900 to collect" is off-screen in horizontal scroll
2. "Search" tab label goes to Clients page
3. Bottom nav labels are 10px font -- too small for outdoor/aging eyes
4. Center "+" button has no visible label
5. "INVOICING" label on dashboard workflow card
6. Header icons (theme/export) are mystery meat
7. "Create event" on schedule is icon-only
8. Some clients have no phone number with no warning
9. No job addresses on many job cards
10. Empty state on invoices has no link back to jobs
11. "Balance" label on payments is ambiguous
12. Score badges on pipeline cards are unexplained
13. "Lead" vs "Quote" toggle on pipeline header is confusing
14. Theme toggle is first setting on settings page
15. "Integrations" jargon in settings
16. Client name lowercase on review request ("carol jones")
17. "Estimate" label on calendar events is vague

### NICE-TO-HAVE (10+ polish items):
1. -21% trend is alarming without context
2. Greeting takes valuable above-the-fold space
3. Jobs page has no search/filter by address
4. "Back to dashboard" on quotes/new should be generic back
5. A-Z scrubber on clients is excellent (keep it)
6. Payment method emojis are clever (keep them)
7. "Snap a Photo" new quote flow is the best page in the app
8. "Needs Scheduling" section on calendar is very useful

---

## TOP 3 RECOMMENDATIONS (if the roofer could only get three fixes):

1. **Rename "Pipeline" to "My Quotes" and replace all "deals" with "jobs."** Remove the word "pipeline" from the UI entirely. Replace "Revenue Intelligence" with "Money Summary" or just remove it. Replace "Close Rate" with "Win Rate" or remove it.

2. **Promote "Do This Now" to the TOP of the dashboard.** The very first thing a roofer should see below the workflow bar is: "Karen Lemmon -- $12,500 at risk -- TAP TO TEXT." Not statistics. Not charts. Not revenue intelligence. Just: "Here is what you need to do right now."

3. **Fix the $0 problem everywhere.** On the dashboard stats, show the quote/job VALUE, not just collected revenue. On job cards, show the job total, not the collected amount. A roofer needs to see "$18,020 roof job" not "$0."