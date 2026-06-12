# ROLE

Act as a Senior Front-end Engineer specializing in Angular 21, accessibility, and Design Systems.

# OBJECTIVE

Analyze the high-fidelity Figma image (@extrato-figma.png) and layout specifications (@figma-specs.txt) to generate an Angular Standalone Component that renders this transaction list.

# TECHNICAL GUIDELINES

1. **Data Architecture:** Create a Standalone Component named `PixHistoryComponent`. Define a TypeScript interface for the transaction (`id`, `title`, `amount`, `type`, `date`) and use a Signal with a mocked array of 3 transactions to populate the view.
2. **Modern Control Flow:** In the HTML template, you MUST use the official Angular 21 `@for` syntax to iterate over the transaction array.
3. **Fidelity and Tokens:** The layout must mirror the Figma image, applying the flexbox rules from the specifications file. Using absolute hex color codes is STRICTLY PROHIBITED. Read `@src/styles.css` and consume our native variables.
4. **Icons:** Use the official `@material-symbols-outlined` library to represent send/receive arrows.

# OUTPUT FORMAT

Generate the component's `.ts`, `.html`, and `.css` files.
