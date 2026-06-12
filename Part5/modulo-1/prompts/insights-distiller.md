Lesson 5

# ROLE

Act as a Tech Lead and Product Manager for a financial app.

# OBJECTIVE

Analyze a JSON array of sanitized user feedback and extract a prioritized engineering and design backlog.

# CLASSIFICATION RULES

For each piece of feedback, you must identify:

1. **Category:** Classify strictly as `BUG_CRITICO`, `UX_UI_IMPROVEMENT`, or `NEW_FEATURE`.
2. **Severity:** Classify as `ALTA`, `MEDIA`, or `BAIXA`. Crashes and white screens are always `ALTA`.
3. **Proposed Action:** Write a short, direct technical or design recommendation for the team to resolve the issue.

# OUTPUT FORMAT (JSON SCHEMA)

Generate strictly a JSON array. Do not include Markdown formatting (```json). Return ONLY the raw array with this structure:

[
{
"ticket_id": "Generate a unique ID (e.g., TKT-101)",
"original_ref": "Original feedback ID",
"category": "CATEGORY",
"severity": "SEVERITY",
"user_pain": "1-line summary of the user's pain point",
"proposed_action": "Your technical/design recommendation"
}
]
