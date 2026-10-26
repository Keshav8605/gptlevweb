/**
 * Layout utility to dynamically arrange cards into beautiful, balanced rows & columns
 * depending on how many items are selected.
 * 
 * - 1 card: 1 centered card (max-w-md)
 * - 2 cards: 1 row of 2 columns (max-w-3xl)
 * - 3 cards: 1 row of 3 columns (max-w-5xl)
 * - 4 cards: 2 rows of 2 columns (2x2) (max-w-4xl)
 * - 5 cards: 3 on top row, 2 centered on bottom row (max-w-5xl)
 * - 6 cards: 2 rows of 3 columns (2x3) (max-w-5xl)
 * - 7 cards: 3 on top row, 3 in middle row, 1 centered on bottom row (max-w-5xl)
 * - 8 cards: 2 rows of 4 columns (2x4) (max-w-6xl)
 * - 9 cards: 3 rows of 3 columns (3x3) (max-w-6xl)
 * - 10+ cards: cleanly wrapped and centered
 */
export function getResponsiveCardGridLayout(count: number) {
  switch (count) {
    case 1:
      return {
        containerClass: "grid grid-cols-1 max-w-md mx-auto",
        cardClass: "w-full",
      };
    case 2:
      return {
        containerClass: "grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto",
        cardClass: "w-full",
      };
    case 3:
      return {
        containerClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto",
        cardClass: "w-full",
      };
    case 4:
      // Exactly 2 rows and 2 columns (2x2 grid)
      return {
        containerClass: "grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto",
        cardClass: "w-full",
      };
    case 5:
      // Row 1: 3 cards, Row 2: 2 cards centered underneath
      return {
        containerClass: "flex flex-wrap justify-center max-w-5xl mx-auto",
        cardClass: "w-full sm:w-[calc(50%-14px)] lg:w-[calc(33.333%-19px)] max-w-sm",
      };
    case 6:
      // Exactly 2 rows and 3 columns (2x3 grid)
      return {
        containerClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto",
        cardClass: "w-full",
      };
    case 7:
      // Row 1: 3 cards, Row 2: 3 cards, Row 3: 1 card centered underneath
      return {
        containerClass: "flex flex-wrap justify-center max-w-5xl mx-auto",
        cardClass: "w-full sm:w-[calc(50%-14px)] lg:w-[calc(33.333%-19px)] max-w-sm",
      };
    case 8:
      // Exactly 2 rows and 4 columns on large screens (2x4 grid)
      return {
        containerClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto",
        cardClass: "w-full",
      };
    case 9:
      // Exactly 3 rows and 3 columns (3x3 grid)
      return {
        containerClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto",
        cardClass: "w-full",
      };
    default:
      if (count % 3 === 0) {
        return {
          containerClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto",
          cardClass: "w-full",
        };
      }
      if (count % 4 === 0) {
        return {
          containerClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto",
          cardClass: "w-full",
        };
      }
      return {
        containerClass: "flex flex-wrap justify-center max-w-6xl mx-auto",
        cardClass: "w-full sm:w-[calc(50%-14px)] lg:w-[calc(33.333%-19px)] max-w-sm",
      };
  }
}
