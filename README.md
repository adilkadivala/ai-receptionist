# AI Receptionist

An AI that answers phone calls 24/7 for **businesses of every size**, in **42 languages from launch**. Customers range from a one-person plumbing business to busy hotels and large hospitals.

Prices were checked on 29–30 October 2026 against published rates. None of these numbers have been measured on real calls yet.

---

## 1. Who it's for: every level of business

| Customer | What the AI does for them | How we sell | Needed before we can sell |
|---|---|---|---|
| **Small businesses**: plumbers, cleaners, salons, shops, auto repair | Answers questions, takes messages, books jobs, emails the owner a summary | Self-serve monthly plans, AppSumo | The v1 features |
| **Business people**: founders, executives, consultants, agents, lawyers | Screens calls, takes messages, books meetings into their calendar, can answer in the owner's own voice | Self-serve monthly plans | Calendar booking, voice cloning |
| **Busy hotels** | Answers guests 24/7 in their own language; handles room availability, bookings, check-in times, directions; transfers to the front desk | Custom contract | Hotel booking system integration; many calls at once |
| **Large hospitals and clinics** | Books, moves and cancels appointments; gives hours, directions and visiting rules; routes calls to departments; takes prescription-refill messages | Custom contract | Health-data rules (below); scheduling system integration; many calls at once; audit logs |
| **Mid-size and large companies**: chains, multi-branch firms, call centers | Routes calls to the right branch or department; covers after hours and overflow | Custom contract | Department routing, single sign-on, uptime guarantee, choice of data region |

**Hospital rules:**
- **US hospitals fall under HIPAA.** Every service that hears or stores patient information must sign a business associate agreement (BAA):
  - **Telnyx** offers a BAA;
  - **Anthropic** offers one for the Claude API through its sales team;
  - **Cartesia** says it offers BAAs on enterprise plans;
  - **Soniox** says it is HIPAA compliant but doesn't say publicly whether it signs BAAs, so ask before selling to US hospitals.
- **Other countries** have their own health-data laws, such as the GDPR in Europe and the DPDP Act in India.
- **The AI never gives medical advice.** For anything urgent, it tells the caller to hang up and call the emergency number, or transfers them to a person.

---

## 2. Languages: global from launch

We launch with every language that both our listening service (Soniox) and our voice (Cartesia) support. The AI detects the caller's language and answers in it, and it can follow callers who mix two languages, such as Hindi and English or Arabic and English. This matters most for hotels and hospitals, whose callers speak many languages.

| Region | Languages |
|---|---|
| **Major global** (8) | English, Spanish, French, German, Portuguese, Italian, Dutch, Russian |
| **Asia** (18) | Chinese, Japanese, Korean, Hindi, Urdu, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Thai, Vietnamese, Indonesian, Malay, Tagalog |
| **Middle East** (3) | Arabic, Hebrew, Turkish |
| **Europe** (13) | Polish, Ukrainian, Czech, Slovak, Romanian, Bulgarian, Croatian, Hungarian, Greek, Swedish, Danish, Norwegian, Finnish |

**Not yet:**
- Soniox understands 18 more languages, such as Persian, Swahili and Serbian, but Cartesia can't speak them yet.
- Cartesia speaks Georgian and Odia, but Soniox can't understand them.

**Before selling in a language:**
- Test it with native speakers. Accuracy and voice quality differ by language and accent.
- For Arabic, test the Gulf, Egyptian and Levantine dialects separately.
- Languages aren't countries: phone numbers in each country have their own rules. For example, Indian numbers need an Indian registered company.

---

## 3. Best stack

| Part | Service | Cost per call minute |
|---|---|---|
| Phone line | **Telnyx** | ~$0.0087 (inbound + audio streaming); number $1/month |
| Listening (speech-to-text) | **Soniox**: 60 languages, follows mixed-language speech, detects when the caller stops talking | ~$0.002 |
| Brain | **Claude Haiku 5.5**: most written languages | ~$0.002 |
| Voice (text-to-speech) | **Cartesia Sonic 3.6**: 44 languages | ~$0.018 |
| Framework | **Pipecat** (open-source, Python) | Free |
| **Total** | | **~$0.031 per minute** |

**Backup listening service: Deepgram Flux Multilingual** ($0.0078/min). It covers only 10 of the languages (English, Spanish, French, German, Portuguese, Italian, Dutch, Japanese, Russian, Hindi), but its detection of when the caller has finished talking is proven. If Soniox sounds worse in testing for those languages, switch them to Flux. That makes those calls ~$0.037/min.

Soniox's price and accuracy figures are its own claims, so test before relying on them.

---

## 4. Monthly server cost

### Fixed at launch: about $100–250 a month, before any customers

| Item | Cost/month |
|---|---|
| 2 cloud servers (4 CPUs, 8 GB each; no GPU, because the AI runs through APIs) | $40–100 |
| Managed Postgres database | $15–30 |
| Cartesia Startup plan | $49 |
| Test calls | ~$50 |
| **Total** | **~$100–250** (the break-even numbers below budget $250) |

### Usage: grows with call minutes

| Call minutes/month | Usage cost (at $0.031/min) |
|---|---|
| 10,000 | ~$310 |
| 100,000 | ~$3,100 |

Each customer also needs a phone number, at $1 a month.

**When large customers join:** a hospital or hotel can take dozens of calls at the same time. That needs more servers (about $20–50 each a month) and higher provider plans with more simultaneous calls; for example, Cartesia's Scale plan is $299 a month. Their contract prices should cover this.

---

## 5. Plans and pricing: at least 80% margin on every plan

**Rule: every plan keeps at least $8 of every $10 the customer pays, even if they use every included minute.** The margin is what's left after their call minutes, their phone number and the payment fee (Dodo, 4% + $0.40).

### Self-serve plans (small businesses and business people)

| Plan | Price | Minutes/month | Our cost if all minutes are used | Profit | Out of $10 |
|---|---|---|---|---|---|
| Starter | $29 | 100 | $5.63 | $23.37 | **$8.10** |
| Pro | $79 | 350 | $15.30 | $63.70 | **$8.10** |
| Business | $149 | 700 | $28.85 | $120.15 | **$8.10** |
| **Typical mix** (50% Starter, 35% Pro, 15% Business) | $64.50 avg | — | $12.50 | **$52.00** | **$8.10** |
| Extra minutes | **$0.20 per minute** | — | — | — | **$8.10** |

Customers rarely use all their minutes. At a typical 60% usage, each plan keeps about **$8.50–8.60 of every $10**.

**Every plan includes:** all 42 languages, transfer to a person, and a summary and transcript of every call. Appointment booking and spam blocking are coming soon, and so are the add-ons below except extra numbers.

**Compared with competitors:**
- Rosie: $49 for 250 min or $149 for 1,000 min; appointment booking only from $149.
- Frontdesk (formerly My AI Front Desk): $99 for 200 min, extra minutes $0.25.
- Dialzara: $29 for 60 min.

Most competitors charge $0.25–0.48 for extra minutes and offer only English and Spanish.

### Paid add-ons (mostly software, so they cost us almost nothing)

| Add-on | Price | Out of $10 |
|---|---|---|
| Owner's own voice (voice clone) | $15/month | $9.60 |
| CRM connection pack (HubSpot, Salesforce, ServiceTitan) | $20/month | $9.60 |
| Extra phone number | $10/month | $8.60 |
| Version agencies resell under their own brand (white-label) | from $199/month | ~$9.00+ |

### Large contracts (hotels, hospitals, large companies)

- **Price per minute and bill by bank invoice.** That avoids the card fee.
- **Charge at least $0.16 a minute today** to keep 80%.
- **The price can fall toward $0.10 a minute** as our cost drops to about $0.02 a minute through volume discounts and the savings below.
- **Charge setup fees** for integrations, such as hotel booking systems and hospital scheduling systems.
- For comparison, enterprise voice AI for healthcare (Hyro, for example) starts around $10,000 a month.

### How we keep costs down

The voice (Cartesia) is 58% of our cost per minute, so most savings target it:
1. **Pre-recorded common phrases:** the greeting, the AI and recording notice, "Can I get your name?", goodbyes and opening hours. They're generated once per business and replayed free. If this cuts voice use by 25% (to be measured), cost falls from ~$0.031 to ~$0.026 a minute.
2. **No paying for junk calls:** block spam and robocalls before the AI answers, end calls after long silence, and cap call length (10 minutes by default).
3. **Volume prices:** move to Cartesia's Scale plan (about 15% cheaper per character) and negotiate Telnyx and Cartesia rates as volume grows.
4. **Backup:** Soniox's voice is about a third of Cartesia's price, but it sounds less natural.

---

## 6. Minimum customers to cover the monthly cost

**To cover $250 a month of running costs, you need 5 customers** on the typical mix, or 11 if everyone takes Starter. That's about $320 a month in revenue.

---

## 7. Minimum customers to be profitable at the start

Initial-stage costs: **$3,000 a month**:
- $250 running costs;
- $750 marketing;
- $2,000 founder pay (≈ ₹1.76 lakh).

**With self-serve customers only, you need 58** on the typical mix, or 129 if everyone takes Starter. That's about $3,750 a month in revenue.

| Self-serve customers | Monthly revenue | Profit after all costs | Out of $10 |
|---|---|---|---|
| 58 | ~$3,750 | ~$0 (everything paid, including you) | $0 |
| 100 | ~$6,450 | ~$2,200 | $3.40 |
| 200 | ~$12,900 | ~$7,400 | $5.70 |

**Large customers change this fast.** These examples use $0.16 a minute:

| Example customer | Minutes/month | Revenue | Profit after usage | Out of $10 | Worth about |
|---|---|---|---|---|---|
| Busy hotel | 20,000 | $3,200 | ~$2,590 | $8.10 | 50 typical small customers |
| Large hospital | 100,000 | $16,000 | ~$12,930 | $8.10 | 250 typical small customers |
| Large hospital, later ($0.10/min at $0.02 cost) | 100,000 | $10,000 | ~$8,000 | $8.00 | 155 typical small customers |

**One large hospital alone covers the $3,000 target several times over. One hotel plus about 8 small customers also covers it.**

**What changes these numbers:**
- Small-business software loses a few percent of customers each month. Holding 58 means winning roughly 3 new ones every month.
- Large customers take longer to sign (custom contracts, integrations, security reviews) and bring extra costs (more servers, higher provider plans, HIPAA setup).
- If testing moves some languages to Flux (~$0.037/min), those calls cost more. Plans would still be close to 80%, but slightly under at full usage.
- As we grow, fixed costs (support staff, servers, marketing) rise too, so profit at 200 customers will come in somewhat below the table.
- All plan prices, per-minute prices and the founder pay are placeholders. Change them and the counts change.
