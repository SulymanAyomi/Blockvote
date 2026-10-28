# School Voting System

A blockchain-based electronic voting platform designed to support secure, transparent, and verifiable student elections. The system combines voter eligibility checks, facial verification, anonymous ballot submission, and blockchain-backed vote recording to help promote election integrity while protecting voter privacy.

## Overview

The School Voting System is designed for school-wide and departmental elections. It allows eligible students to verify their identities, access authorized elections, cast their votes, and independently verify that election results are recorded transparently.

The platform follows a privacy-focused design that separates voter identity from ballot choices. Blockchain technology is used as a verifiable record of voting activity, while backend services manage eligibility, authentication, ballot processing, and transaction submission.

## Key Features

- **Voter eligibility verification** — Restricts voting to eligible students.
- **Facial verification** — Uses face verification and liveness checks as part of voter authentication.
- **Anonymous voting** — Separates voter identity records from ballot choices.
- **Election management** — Supports the design of school-wide and departmental elections.
- **Position and candidate management** — Organizes elections around positions and their candidates.
- **Blockchain-backed vote recording** — Designed to record validated votes through a Solidity smart contract on Polygon.
- **Double-voting prevention** — Uses eligibility checks, single-use authorization, and smart-contract validation.
- **Time-limited voting authorization** — Uses short-lived, identity-free voting tokens.
- **Vote verification** — Aims to provide a way to verify that votes have been recorded on-chain.
- **Background processing** — Uses separate release and publishing workers for ballot processing and blockchain submission.

## Technology Stack

| Component                  | Technology                                                       |
| -------------------------- | ---------------------------------------------------------------- |
| Frontend                   | Next.js, React, TypeScript                                       |
| Styling                    | Tailwind CSS, shadcn/ui                                          |
| Backend                    | Next.js API routes / Hono.js                                     |
| Database                   | PostgreSQL                                                       |
| ORM                        | Prisma                                                           |
| Face verification          | Python, FastAPI, InsightFace                                     |
| Authentication and tokens  | Server-side sessions, JOSE                                       |
| Smart contracts            | Solidity                                                         |
| Blockchain                 | Polygon                                                          |
| Smart contract development | Foundry / Forge                                                  |
| Deployment target          | Vercel for the web application, with separate background workers |

## System Architecture

The application is organized into components with distinct responsibilities.

1. **Web application:** Provides the voter interface and election management experience.
2. **Backend API:** Manages voter eligibility, voting sessions, authorization, and ballot submission.
3. **PostgreSQL database:** Stores election data, voter eligibility, sessions, and ballot-processing records.
4. **Face verification service:** Performs facial verification and liveness checks.
5. **Release worker:** Processes eligible pending ballots and prepares them for publication.
6. **Blockchain publisher:** Submits approved ballots to the Polygon smart contract.
7. **Smart contract:** Validates authorized submissions and records votes on-chain.

The release worker and blockchain publisher are designed as separate background processes rather than being tied to the web application's request lifecycle.

## Voting Workflow

The intended voting process follows these stages:

1. **Eligibility check:** The backend checks whether the student is eligible to participate and has not already voted in the election.
2. **Voting session:** An authorized voting session is created.
3. **Identity verification:** The voter completes facial verification and the required liveness checks.
4. **Token issuance:** The backend issues a short-lived, identity-free voting authorization token.
5. **Ballot submission:** The voter selects candidates and submits the ballot.
6. **Ballot validation:** The backend validates the authorization, election status, ballot structure, and applicable voting rules.
7. **Ballot processing:** The release worker processes the pending ballot according to the authorization and privacy rules.
8. **Blockchain publication:** The publisher submits the authorized vote to the smart contract.
9. **Confirmation:** The application can use the transaction status and on-chain record to confirm publication.

The workflow is designed to prevent a voter’s identity from being stored alongside their candidate selections.

## Privacy and Security Design

Privacy and election integrity are core design considerations.

- **Identity separation:** Voter identity and ballot choice must not be combined in a database record, application log, API response, backup, or blockchain transaction.
- **Short-lived authorization:** Voting authorization tokens are intended to expire after a limited period.
- **Replay protection:** Tokens, signatures, expiry checks, and nullifiers are intended to prevent unauthorized reuse.
- **Eligibility enforcement:** Eligibility and previous-vote checks are required before authorization is issued.
- **On-chain validation:** The smart contract is designed to validate authorized voting submissions and reject invalid or duplicate submissions.
- **Credential isolation:** Sensitive signing keys and ballot-sealing keys should be restricted to the components that require them.
- **Service separation:** Face verification, ballot release, and blockchain publication operate as distinct responsibilities.

These are design goals, not a claim that the system has already passed a security audit. Facial verification and blockchain recording alone do not guarantee anonymity or prevent every form of election manipulation.

## Project Structure

The repository is intended to contain the following logical components. Update this section to match the final repository structure.

```text
school-voting-system/
├── src/                    # Next.js application and backend
├── prisma/                 # Database schema and migrations
├── contracts/              # Solidity smart contracts
├── test/                   # Smart contract tests
├── face-verification/      # Python/FastAPI face service
├── release-worker/         # Pending ballot processing
├── publisher/              # Blockchain transaction publisher
├── public/                 # Static assets
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install or configure the following tools:

- Node.js and npm
- PostgreSQL
- Python and pip
- Foundry, including Forge and Cast
- A Polygon RPC endpoint for the intended network

### 1. Clone the Repository

```bash
git clone <repository-url>
cd school-voting-system
```

Replace `<repository-url>` with the actual repository URL.

### 2. Install Dependencies

```bash
npm install
```

Install Python dependencies from the face-verification service's requirements file, and install any dependencies required by the smart contracts and background workers according to their respective project configurations.

### 3. Configure Environment Variables

Create a local `.env` file using the variables required by the application.

Typical configuration categories include:

```dotenv
DATABASE_URL=
AUTH_SECRET=
FACE_VERIFICATION_URL=
POLYGON_RPC_URL=
CONTRACT_ADDRESS=
```

These names are illustrative; align them with the actual environment variables referenced in the codebase.

Keep private keys, signing secrets, database credentials, and other sensitive values out of source control. Do not use production credentials for local development.

### 4. Set Up the Database

Run the appropriate Prisma migrations:

```bash
npx prisma migrate deploy
```

For local development, use the migration workflow configured for the project. Seed the database with test elections and voters only through the project's configured seed process.

### 5. Run the Application

```bash
npm run dev
```

Start the face-verification service, release worker, and blockchain publisher separately using their configured development commands.

> The exact commands for these services should be documented after confirming their entry points and package scripts.

## Smart Contracts and Blockchain

The system is designed to use a Solidity smart contract deployed on Polygon. Contract responsibilities include validating authorized ballots, enforcing election rules, checking expiry and replay protection, and recording votes.

The intended integration workflow includes:

1. Compile and test the smart contracts.
2. Deploy the contract to the Polygon Amoy testnet.
3. Configure the RPC endpoint, contract address, and ABI.
4. Connect the backend and publisher to the deployed contract.
5. Verify transaction submission, receipt handling, and failure recovery.
6. Test duplicate submissions, invalid ballots, expired authorizations, and closed elections.
7. Review the privacy implications of all on-chain data before production deployment.

**Important:** A blockchain transaction being publicly visible does not automatically make an election anonymous, fair, or independently auditable. Those properties depend on the contract design, authorization mechanism, data published on-chain, and operational controls.

## Testing

Testing should cover the following areas before deployment:

- Voter eligibility and authentication
- Facial verification and liveness-check failures
- Voting-session expiry and invalid session states
- Ballot validation and candidate/position matching
- Duplicate-vote and replay prevention
- Smart-contract authorization and expiry checks
- Blockchain submission failures and retry handling
- Release-worker and publisher reliability
- Database consistency and concurrent voting attempts
- Separation of voter identity from ballot choices
- End-to-end voting and result verification

Smart-contract tests and end-to-end integration tests must pass before the application is considered ready for an actual election.

## Current Development Status

The latest recorded project status is:

- [x] Application implementation code written
- [x] Solidity smart contract written
- [x] Release worker and blockchain publisher written
- [ ] Automated tests executed and verified
- [ ] Backend connected to the deployed smart contract
- [ ] End-to-end voting workflow verified
- [ ] Polygon testnet deployment verified
- [ ] Web application and background services deployed
- [ ] Security and privacy review completed

The checklist reflects the last reported development status and should be updated as each item is verified.

## Limitations

- The project is not production-ready until its integration, testing, deployment, and security review are complete.
- Facial verification can produce false positives and false negatives.
- Blockchain transactions may incur fees and experience network delays or failures.
- Smart-contract and backend vulnerabilities may compromise election integrity.
- Privacy guarantees must be validated against the complete system, including logs, backups, database access, and on-chain metadata.

## Future Improvements

Potential future enhancements include:

- Independent election audit tools
- Improved voter-verification accessibility
- More comprehensive automated and security testing
- Election-result verification interfaces
- Monitoring, alerting, and transaction-recovery mechanisms
- Scalability improvements for larger elections

## Contributing

Contributions are welcome. For substantial changes, open an issue to discuss the proposed improvement before submitting a pull request.

## License

Add the appropriate license for this project before making the repository publicly available.

---

**Project purpose:** To explore how privacy-conscious identity verification, backend authorization, and blockchain technology can be combined to build a more transparent and verifiable school election system.
