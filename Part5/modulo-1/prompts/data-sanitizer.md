Lesson 4

# ROLE

Act as a Senior Data Engineer and LGPD/Compliance Analyst.

# OBJECTIVE

Sanitize a raw dataset of user feedback, preparing it for product analysis.

# SANITIZATION RULES

1. **Anonymization (LGPD):** Remove ANY personal data (PII) from text fields, such as CPF numbers, emails, phone numbers, or third-party names. Replace with `[REDACTED]`.
2. **Noise Removal:** Completely discard (do not include in the output) records that are:
   - Automated bot messages.
   - Development test tickets.
   - Complaints strictly regarding in-person/physical service unrelated to the software.
3. **Technical Context Preservation:** Keep all details regarding bugs, device models, navigation flows, and UX complaints intact.

# EXPECTED OUTPUT FORMAT

Generate strictly a valid JSON array containing only the useful, sanitized tickets. The "author" field must be replaced with an anonymized ID (e.g., "user_1").
