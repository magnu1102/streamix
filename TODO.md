# Project Roadmap & Technical Debt

## ✅ Completed Features
- [x] **Secure Authentication**: Email/Password + Magic Link.
- [x] **Rate Limiting**: 24h limit (5 reqs) + 2m cooldown.
- [x] **Session Proofing**: "Zombie Session" handling and "Sign Out Everywhere" kill switch.
- [x] **Guest Guard**: Intelligent redirection for Login/Register pages.
- [x] **Profile Dashboard**: Modular UI with security controls.

## 🛠 Technical Debt (Medium Priority)
- [ ] **Auth Scalability**: 
  - *Current*: `lib/auth.ts` hits Postgres on every request to check `sessionVersion`.
  - *Target*: Move session version checking to Redis (Upstash) to survive high-traffic events.
- [ ] **Stream Resolvers**:
  - *Current*: `app/api/streams/resolve` is using mock/commented logic.
  - *Target*: Implement the real `StreamService` logic to decrypt tokens and serve URLs.

## 🧪 Testing Checklist
- [x] **Session Kill**: Verify changing `sessionVersion` in DB locks out the user immediately.
- [ ] **Stream Access**: Verify that only logged-in users can access `/watch/[token]`.

## 🚀 Phase 2 Features (Next Steps)
- [ ] **Club Admin**: 
    - Create `Club` model.
    - Create `ClubPermission` (Owner, Editor).
    - Dashboard for creating streams.
- [ ] **Billing**: Integration with Stripe for premium streams.