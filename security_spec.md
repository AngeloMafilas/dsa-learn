# Security Specification (TDD)

## 1. Data Invariants
- **V01 (Identity Isolation)**: A profile document under `/profiles/{userId}` can only be created, read, or modified by the authenticated user whose `request.auth.uid` matches the `userId`.
- **V02 (Profile Domain Integrity)**: The document field `email` must match the authenticated user's `request.auth.token.email`.
- **V03 (Email Verification Requirement)**: Any write to a profile or submission requires the Firebase auth token to have `email_verified == true` (for verified security).
- **V04 (Immortal Core Fields)**: Immutability of core identifying fields (`uid`, `email`) must be strictly enforced during updates. Users cannot spoof or change these.
- **V05 (Submission Ownership)**: Submissions can only be saved by their respective owner (`userId` must match `request.auth.uid`).
- **V06 (Seal of Submissions)**: Submissions are write-once logs of developer performance. They can only be created; they can **never** be edited (`update`) or deleted (`delete`) by any user.
- **V07 (Structure Schema Validation)**: Input keys, string lengths, and data types must fit strict bounds to avoid Resource Poisoning.

---

## 2. The "Dirty Dozen" Poison Payloads

### Payload D1: Spoofing Owner ID on Profile Create
- **Target**: `create` on `/profiles/attacker_uid`
- **Payload**: `{ "uid": "target_user_uid", "email": "attacker@gmail.com", "displayName": "Attacker", ... }`
- **Goal**: Registering a profile where the inner field `uid` does not match the actual authenticated user's path ID.
- **Expected**: `PERMISSION_DENIED`

### Payload D2: Unverified Firebase Email Write
- **Target**: `create` on `/profiles/attacker_uid` with `request.auth.token.email_verified == false`
- **Payload**: `{ "uid": "attacker_uid", "email": "attacker@gmail.com", "displayName": "Attacker", ... }`
- **Goal**: Bypassing email verification checks on registration.
- **Expected**: `PERMISSION_DENIED`

### Payload D3: Corrupting Topic Mastery Ranges
- **Target**: `create` or `update` on `/profiles/user123`
- **Payload**: `{ ..., "topicMastery": { "Array": 999999 } }`
- **Goal**: Injecting a topic mastery value beyond bounds (valid is `0` to `100`).
- **Expected**: `PERMISSION_DENIED`

### Payload D4: Denial of Wallet ID Poisoning
- **Target**: `create` on `/profiles/super_long_junk_document_id_with_weird_unicode_characters_and_more_than_128_characters`
- **Payload**: `{ "uid": "user_id_123", "email": "user@algocode.io", ... }`
- **Goal**: Bloating database indexes to increase storage and search bills.
- **Expected**: `PERMISSION_DENIED`

### Payload D5: Ghost Fields in Profile Update (Shadow Update Attack)
- **Target**: `update` on `/profiles/user123`
- **Payload**: `{ ..., "isAdmin": true, "vipStatus": "premium" }`
- **Goal**: Injecting un-whitelisted administrative or billing fields to gain elevation.
- **Expected**: `PERMISSION_DENIED`

### Payload D6: Temporal Time Stamp Hijacking
- **Target**: `create` on `/profiles/user123/submissions/sub_999`
- **Payload**: `{ ..., "timestamp": "2050-01-01T00:00:00Z" }`
- **Goal**: Set a fake Future Timestamp to manipulate streak tracking or leaderboard order.
- **Expected**: `PERMISSION_DENIED`

### Payload D7: Updating Saved Submissions
- **Target**: `update` on `/profiles/user123/submissions/sub_1`
- **Payload**: `{ "status": "Accepted", "beatsRuntimePercent": 100.0 }`
- **Goal**: Modify a previously "Wrong Answer" state to "Accepted".
- **Expected**: `PERMISSION_DENIED`

### Payload D8: Deleting Historic Submissions
- **Target**: `delete` on `/profiles/user123/submissions/sub_1`
- **Payload**: `null` (Delete request)
- **Goal**: Delete failed attempts to artificially manipulate metrics.
- **Expected**: `PERMISSION_DENIED`

### Payload D9: Writing Submission For Another Developer
- **Target**: `create` on `/profiles/user_victim/submissions/sub_some`
- **Payload**: `{ "userId": "user_victim", "problemId": "two-sum", ... }`
- **Goal**: Write fake submissions into another user's sub-collection.
- **Expected**: `PERMISSION_DENIED`

### Payload D10: Bypassing Parent Profile Check for Submissions
- **Target**: `create` on `/profiles/non_existent_user/submissions/sub_1`
- **Payload**: `{ "userId": "non_existent_user", ... }`
- **Goal**: Orphan submissions inside a non-existent user hierarchy.
- **Expected**: `PERMISSION_DENIED`

### Payload D11: Negative Streak Manipulation
- **Target**: `update` on `/profiles/user123`
- **Payload**: `{ ..., "streak": -100 }`
- **Goal**: Set negative value fields to break score calculations in the dashboard.
- **Expected**: `PERMISSION_DENIED`

### Payload D12: Email Mutation
- **Target**: `update` on `/profiles/user123`
- **Payload**: `{ "email": "poison@hacker.com" }`
- **Goal**: Change profile email after registration to access privileged endpoints.
- **Expected**: `PERMISSION_DENIED`

---

## 3. Test Runner Design (Pre-Audit)
A test script suite checking all scenarios as defined in `Phase 0`.
The rules generated in `firestore.rules` will be evaluated directly against these specifications.
