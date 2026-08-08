I think we've reached a solid architecture. More importantly, it's one I would be comfortable defending in an MSc viva because every design decision has a clear justification.

The guiding principle of the entire system is:

> **Identity and ballot must become completely separated once voting begins.**

Everything else follows from that.

---

# High-Level Architecture

```text
                        UNIVERSITY

 Institution
      │
 Campus
      │
 Faculty
      │
 Department
      │
 Programme
      │
 AcademicSession

──────────────────────────────────────────

                     IDENTITY

                  VoterRoll
                      │
      ┌───────────────┼────────────────┐
      │               │                │
   Account      FaceReference         OTP
      │
RegistrationSession

──────────────────────────────────────────

                ELECTION MANAGEMENT

                 Position (Master)
                      │
                 Election
                      │
      ┌───────────────┼─────────────────────┐
      │               │                     │
ElectionScope  ElectionPosition  ElectionParticipation
                      │
                 Candidate

──────────────────────────────────────────

                    VOTING

              VotingSession
                      │
         Face Verification
                      │
          Anonymous Voting Token
                      │
                  Ballot
                      │
                     Vote

──────────────────────────────────────────

              ADMINISTRATION

Admin
AuditLog
SystemSetting
```

---

# Identity Domain

This part answers:

> **Who is the voter?**

```
VoterRoll
```

Contains

- NIN / Student ID
- Name
- Faculty
- Department
- Programme
- Level
- Campus

Everything related to identity.

---

```
Account
```

Only authentication.

- Password
- Lock status
- Last login

Nothing else.

---

```
FaceReference
```

Only stores

```
referenceId
```

The Python service owns the biometric data.

---

```
RegistrationSession
```

Tracks

```
ID verified

↓

OTP verified

↓

Face verified

↓

Information confirmed
```

After registration it becomes irrelevant.

---

# University Structure

Normalized.

```
Institution

↓

Campus

↓

Faculty

↓

Department

↓

Programme
```

No strings like

```
"Computer Science"
```

stored repeatedly.

---

# Election Domain

This is the biggest conceptual improvement we made.

An Election is

```
Student Union Election
```

NOT

```
Student Union Presidential Election
```

---

Example

```
Election

↓

Student Union Election 2027
```

---

Inside it

```
President

Vice President

Speaker

Treasurer

Social Director
```

Those are **ElectionPositions**.

---

Candidates belong to positions.

```
Election

↓

President

↓

John
Mary
David
```

---

# Position Table

Master data.

Seed once.

```
President

Vice President

Speaker

Treasurer

Social Director
```

---

ElectionPosition simply connects

```
Election

↓

Position
```

---

# ElectionScope

This determines

Who can vote?

Examples

```
UNIVERSITY
```

or

```
Department = Computer Science
```

or

```
Faculty = Engineering
```

Rules are stored.

---

# ElectionParticipation

This stores

```
Election

+

Voter
```

Only.

Example

```
John

↓

Student Union Election

↓

Eligible

↓

Not yet voted
```

Nothing about candidates.

---

When the election opens

The Eligibility Engine

```
ElectionScope

↓

Query VoterRoll

↓

Generate ElectionParticipation
```

The list is frozen.

---

# Voting

This is the most security-sensitive part.

---

Upcoming Elections

The voter sees

```
Student Union Election

Computer Science Election
```

Not

```
President

Vice President

Treasurer
```

---

Election Details

The voter reviews

```
President

Candidates

Vice President

Candidates

...
```

At the bottom

```
Join Election
```

---

Join Election

Server verifies

```
Election open

Eligible

Not voted
```

---

VotingSession

Now create

```
VotingSession
```

Purpose

- prevent multiple tabs
- recover crashes
- expire sessions
- audit

No votes stored.

---

Face Verification

Python verifies

```
Captured image

+

referenceId
```

If successful

Proceed.

---

Anonymous Token

Issue

```
2-minute JWT
```

Contains

```
Election

Expiry

Nonce
```

No voter identity.

---

Countdown

Starts **after**

the ballot loads.

```
02:00

01:59

...
```

---

Ballot

One page.

```
President

○ John

○ Mary

Vice President

○ ...

Treasurer

○ ...

...
```

---

Review

```
President

✓ John

Vice President

✓ Mary

...
```

---

Submit

Single transaction

```
Create Ballot

↓

Create Vote rows

↓

Mark ElectionParticipation.hasVoted

↓

Commit
```

---

# Ballot

Earlier I almost removed Ballot.

I changed my mind.

Ballot is valuable because it groups all selections from one voting action.

```
Ballot

↓

Vote

↓

Position

↓

Candidate
```

Example

Ballot

```
Student Union Election
```

Votes

```
President → John

Vice President → Mary

Speaker → David

Treasurer → Grace

Social Director → Ahmed
```

One Ballot.

Five Vote rows.

---

Importantly

Ballot contains

```
NO voterId
```

Ever.

---

# Vote

Stores only

```
Ballot

Position

Candidate
```

Nothing more.

---

# Blockchain

Later

```
Ballot

↓

Hash

↓

Block

↓

Blockchain
```

The blockchain protects integrity.

It does not identify voters.

---

# Administration

Separate admins.

```
Admin
```

Different from voters.

Roles

```
SUPER_ADMIN

ELECTION_OFFICER
```

Audit everything.

---

# Final Database Relationships

```text
Institution
    │
Campus
    │
Faculty
    │
Department
    │
Programme
    │
VoterRoll
    ├───────────────┐
    │               │
Account      FaceReference
    │
RegistrationSession
    │
ElectionParticipation
           │
           ▼
       Election
           │
    ├──────────────┐
    │              │
ElectionScope  ElectionPosition
                    │
                Position
                    │
                Candidate

────────────────────────────

VotingSession
      │
      ▼
Anonymous Token
      │
      ▼
Ballot
      │
      ▼
Vote
      │
      ▼
Blockchain
```

## The core principle that ties everything together

The architecture is intentionally split into two worlds:

**Identity world**

- Knows who the voter is.
- Knows eligibility.
- Knows whether the voter has already participated.
- Never stores vote selections.

**Ballot world**

- Knows the election.
- Knows the ballot.
- Knows the candidate selections.
- Never stores voter identity.

The only bridge between these worlds is the **short-lived authorization process** (VotingSession → face verification → anonymous voting token). Once the anonymous ballot is created, there is no persistent database relationship that can reconstruct how a specific voter voted.

I think this is the strongest version of the architecture we've developed. It satisfies your security goals, supports future blockchain integration, scales to multiple elections, and remains practical to implement with Next.js, Prisma, PostgreSQL, and your Python face-verification microservice. It also provides a clear set of architectural decisions that you can justify in your MSc dissertation.
