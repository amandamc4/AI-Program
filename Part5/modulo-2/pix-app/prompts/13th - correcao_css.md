Responsiveness: We have two adjustments needed for mobile (screens smaller than 600px).

1. In `@pix-history.component.css`, the horizontal list layout is squeezing the values. Change the list item to a column layout (`flex-direction: column`).
2. The side menu (`@app.component.ts`, `.html`, and `.css`) is crowding the screen. Convert it into a collapsible menu. Create an `isMenuOpen` Signal in the TypeScript file. On mobile, hide the side menu and display a "hamburger menu" button (using `@material-symbols-outlined`) at the top to toggle the navigation.

We have an accessibility issue with our Pix receipt. The text color is too dark against the midnight blue background, making it unreadable. Please fix the receipt's CSS by applying our `var(--color-text-light)` variable to ensure proper contrast and readability.
