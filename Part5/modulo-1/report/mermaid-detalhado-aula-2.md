# FLOW ENGINEERING COMMAND

Act as a Senior Solutions Architect. Based on the risk analysis and refined requirements we just generated above, create the code for a Flowchart using the **Mermaid.js** syntax.

## Diagram Requirements:

1. **Orientation:** Top-Down (`graph TD`).
2. **Coverage:** Must cover the "Happy Path" (Success) and ALL "Unhappy Paths" (API Errors, Validation, Timeout, Insufficient Balance) identified in the previous analysis.
3. **Interface States:** Clearly represent _Loading_, _Empty State_, and _Error Feedback_ screens.

4. **Semantic Styling:**

- Use rectangular `[]` nodes for User Actions or System Processes.

- Use double-spaced diamonds `{}` for Business Logic Decisions (e.g., "Do you have a balance?", "Online API?").

- **Important:** Apply styles (classes) to visually differentiate:

- `classDef error fill:#f96,stroke:#333,stroke-width:2px;` (For errors)

- `classDef success fill:#9f6,stroke:#333,stroke-width:2px;` (For success)

## Expected Output:

Only the Markdown code block (`mermaid`) ready for rendering. Do not include text explanations.

```mermaid
graph TD

%% Style Definitions

classDef error fill:#f96,stroke:#333,stroke-width:2px;
classDef success fill:#9f6,stroke:#333,stroke-width:2px;
classDef uiState fill:#e1f5fe,stroke:#01579b,stroke-width:1px;
classDef process fill:#fff,stroke:#333,stroke-width:1px;

%% Contact Selection Flow
Start((Start)) --> GetContacts[Load Contact List]
GetContacts --> LoadingContacts[UI: Loading Skeleton]
LoadingContacts --> CheckContacts{Contacts available?}

CheckContacts -- No --> EmptyContacts[UI: Empty State - No Contacts]
EmptyContacts --> SearchContact[Manual Key Search]

CheckContacts -- Yes --> SelectContact[Select Contact]
SearchContact --> SelectContact

%% Amount and Rules Flow
SelectContact --> InputAmount[Enter Amount (R$)]
InputAmount --> ValidateLimit{Amount > R$ 5,000.00?}

ValidateLimit -- Yes --> ErrorLimit[UI: Error - Daily Limit Exceeded]:::error
ErrorLimit --> InputAmount

ValidateLimit -- No --> SelectDate[Select Date from Calendar]

%% Date Validation
SelectDate --> CheckDate{Selected Date}
CheckDate -- Today --> SuggestPix[UI: Suggestion - Switch to Standard Pix]:::uiState
CheckDate -- Past --> ErrorDate[UI: Error - Invalid Past Date]:::error
CheckDate -- Future --> ReviewScreen[UI: Data Review Screen]

%% Processing and Security
ReviewScreen --> ConfirmAction[Button: Confirm Scheduling]
ConfirmAction --> MFA[Security Challenge: Password/Biometrics]

MFA --> MFA_Check{Authenticated?}
MFA_Check -- No --> MFA_Retry[UI: Incorrect Password Feedback]:::error
MFA_Retry --> MFA

MFA_Check -- Yes --> API_Call[API Call: POST /pix/schedule]
API_Call --> LoadingAPI[UI: Active Loading Overlay]:::uiState

%% API Response Handling
LoadingAPI --> API_Response{API Status}

API_Response -- 201 Created --> SuccessScreen[UI: Receipt Screen]:::success
API_Response -- 403 Forbidden --> ErrorBusiness[UI: Error - Insufficient Balance/Risk Rule]:::error
API_Response -- 429/500 --> ErrorServer[UI: Error - Central Bank Instability]:::error
API_Response -- Timeout --> ErrorTimeout[UI: Feedback - Check Statement Shortly]:::error

%% Management Flow (Cancellation)
SuccessScreen --> ListSchedule[Go to: My Scheduled Transfers]
ListSchedule --> CheckList{Are there scheduled transfers?}

CheckList -- No --> EmptyList[UI: Empty State - No Scheduled Transfers]:::uiState
CheckList -- Yes --> ViewDetails[View Schedule Details]

ViewDetails --> CancelAction[Button: Cancel Scheduled Transfer]
CancelAction --> API_Cancel[API Call: DELETE /pix/schedule/id]

API_Cancel --> CancelStatus{Cancellation Status}
CancelStatus -- 200 OK --> CancelSuccess[UI: Toast - Scheduled Transfer Cancelled]:::success
CancelStatus -- 400 Bad Request --> CancelLocked[UI: Error - Already being processed for sending]:::error

%% Error Relationships
ErrorLimit -.-> InputAmount
ErrorDate -.-> SelectDate
ErrorBusiness -.-> ReviewScreen
ErrorServer -.-> ConfirmAction
CancelLocked -.-> ListSchedule
```
