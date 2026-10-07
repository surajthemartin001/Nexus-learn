# Security Specification & Threat Model

## 1. Data Invariants
1. **User Isolation**: A user can only access, create, update, or delete records in `/users/{userId}/**` where `request.auth.uid == userId`.
2. **Identity Integrity**: Any document containing `userId` must strictly have `userId == request.auth.uid`. Cross-user identity spoofing is impossible.
3. **Verified Email**: Write operations require `request.auth.token.email_verified == true` or valid authenticated user context.
4. **Volumetric Boundaries**: String fields are constrained by length limits (e.g. titles <= 256, descriptions <= 4096, IDs <= 128) to prevent denial-of-wallet payload attacks.
5. **No Blind Global Reads**: Catch-all default deny `match /{document=**} { allow read, write: if false; }`.

## 2. The Dirty Dozen Payloads (Designed to Break Identity & Integrity)
1. **Identity Spoofing**: Attempting to write into `/users/victim_user_123` with `auth.uid = attacker_456`.
2. **Shadow Field Injection**: Adding unmodeled admin override flags `isAdmin: true` into `users/{userId}`.
3. **Payload Oversize Bomb**: Injecting a 2MB string into `title` or `prompt` to exhaust database quotas.
4. **Ghost Attempt Write**: Creating a QuestionAttempt pointing to another user's `userId`.
5. **Unauthenticated Read**: Querying `/users/{userId}/notes` without an active auth token.
6. **Cross-Tenant Project Hijack**: Updating a project under a different user's path.
7. **Invalid Path ID**: Supplying an exploit string like `../../../system` as a `pathId` or `userId`.
8. **Negative Study Time**: Submitting `durationMinutes: -9999` in a `StudySession`.
9. **Arbitrary Question Modification**: A learner attempting to modify another user's question bank.
10. **State Corruption**: Bypassing prerequisite status by directly mutating internal system markers.
11. **Blanket Query Scraping**: Attempting a collection group query across all users' private notes.
12. **Null User ID Creation**: Creating a resource without a valid user ID.

All 12 attacks are blocked by the rule architecture and return `PERMISSION_DENIED`.
