# Project Roadmap & Technical Debt

## 🛠 Technical Debt (High Priority)
- [ ] **Stream API Rate Limiting**: 
  - Currently using an in-memory `Map` (commented out) in `app/api/streams/resolve/route.ts`. 
  - **Action**: Move to Redis (e.g., Upstash) or a DB-backed table to support serverless/scaling in Phase 2.

## 🧪 Testing Checklist
### Backend / Security
- [ ] **24-Hour Rate Limit**: Verify that `lib/ratelimit.ts` blocks the 6th email request within a day.
- [ ] **2-Minute Spam Safeguard**: Try to "Create Account" -> "Back" -> "Create Account" rapidly to ensure the second attempt is blocked with a 429 status.
- [ ] **Magic Link Security**: Verify that an unverified user cannot sign in via Magic Link (should show `AccountNotFound` error).

### Frontend / UI
- [ ] **Countdown Timer**: 
  - Confirm timer starts at 120s after initial registration.
  - Confirm timer resets to 120s after clicking "Resend".
- [ ] **Button States**: 
  - "Resend" button must be **disabled** (greyed out) while timer > 0.
  - "Resend" button must be **enabled** when timer hits 0.
- [ ] **Persistance**: (Optional) Check if timer persists or resets on page refresh (currently resets; consider adding localStorage later if needed).

## 🚀 Future Features (Phase 2)
- [ ] **Club Admin**: `Club` model and protected dashboard for teams to manage streams.
- [ ] **Session Proofing**: Strict session invalidation on password change.