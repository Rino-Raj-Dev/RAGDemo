CF SUMMIT 2026 - SYNTHETIC RAG CORPUS

All organizations, policies, identifiers and rules are fictional demo data.

STARTING CORPUS
Ingest ONLY assets/current/company-a for the normal Company A demo.
Do not recursively ingest the entire assets folder into the baseline assistant.

OPTIONAL FIXTURES
assets/archived/company-a: superseded 72-hour policy for historical/version tests.
assets/restricted/company-b: second tenant, 12-hour rule and leakage marker.
assets/conflicts/company-a: deliberate 48-hour conflict with current 24-hour rule.

The labels in PDFs and directory names do not enforce permissions. Map trusted
metadata into the index from corpus-manifest.json, validate it and enforce
tenant/role restrictions before model context construction. Protect source
viewers too. Files under wwwroot may be directly downloadable depending on
server configuration. All files here are synthetic; add real access controls
before using this structure to demonstrate secured source downloads.

SUGGESTED QUESTIONS
1. My company laptop broke during an overseas client visit. What should I do?
2. Can I replace my personally owned laptop through the company process?
3. What does incident INC-84721 say? (PDF snapshot, not live ticket status.)
4. What is the approved 2027 laptop reimbursement limit? (No amount supplied.)
5. Which deadline applies to a current Company A incident? (24 hours.)
6. Which deadline applied to a Company A incident in 2024? (72 hours.)
7. With the conflict fixture loaded, do approved sources agree? (No.)
8. What is the replacement inventory? (Requires a separate live database tool.)

Live employee asset and stock records are not PDFs and are not created here.
The PDF case references A-LT-1001 and TRIP-A-204 as future database seed IDs.
The manifest and this README are setup files; do not ingest them as evidence.

2022 ARCHIVE ADDITION
EQ-2022-001 version 0.9 applies to 2022 incidents only (72 hours).
EQ-2023-004 version 1.0 applies to 2023-2025 incidents (72 hours).
EQ-2026-007 version 3.0 applies from 2026 onward (24 hours).
The 2022 PDF is an optional archived fixture, not part of the normal corpus.
