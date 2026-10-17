// Refining the lower taper for a super sharp pointed heart bottom
const COLS = 16;
const ROWS = 16;
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill('..'));

const tiles = [
  // --- ROW 1-3: Left Lobe ---
  { id: 'h01', r: 1, c: 3, rs: 3, cs: 2 },
  { id: 'h02', r: 1, c: 5, rs: 3, cs: 3 },

  // --- ROW 1-3: Right Lobe ---
  { id: 'h03', r: 1, c: 10, rs: 3, cs: 3 },
  { id: 'h04', r: 1, c: 13, rs: 3, cs: 2 },

  // --- ROW 2-4: Shoulder Outer Caps ---
  { id: 'h05', r: 2, c: 2, rs: 3, cs: 1 },
  { id: 'h06', r: 2, c: 15, rs: 3, cs: 1 },

  // --- ROW 3-4: Cleft Bridge ---
  { id: 'h07', r: 3, c: 8, rs: 2, cs: 2 },

  // --- ROW 4-5: Broad Upper Chest ---
  { id: 'h08', r: 4, c: 3, rs: 2, cs: 2 },
  { id: 'h09', r: 4, c: 5, rs: 2, cs: 2 },
  { id: 'h10', r: 4, c: 7, rs: 1, cs: 1 },
  { id: 'h11', r: 4, c: 10, rs: 1, cs: 1 },
  { id: 'h12', r: 4, c: 11, rs: 2, cs: 2 },
  { id: 'h13', r: 4, c: 13, rs: 2, cs: 2 },

  // --- ROW 5-7: Widest Shoulders (Columns 1 to 16) ---
  { id: 'h14', r: 5, c: 1, rs: 3, cs: 1 },
  { id: 'h15', r: 5, c: 2, rs: 3, cs: 1 },
  { id: 'h16', r: 5, c: 15, rs: 3, cs: 1 },
  { id: 'h17', r: 5, c: 16, rs: 3, cs: 1 },

  // --- ROW 5-9: GRAND CENTER HERO (Focal Anchor in the exact center!) ---
  { id: 'HERO', r: 5, c: 7, rs: 5, cs: 4 },

  // --- ROW 6-8: Flanking Hero Mid-Level ---
  { id: 'h18', r: 6, c: 3, rs: 3, cs: 2 },
  { id: 'h19', r: 6, c: 5, rs: 3, cs: 2 },
  { id: 'h20', r: 6, c: 11, rs: 3, cs: 2 },
  { id: 'h21', r: 6, c: 13, rs: 3, cs: 2 },

  // --- ROW 8-10: Inward Incline Starts ---
  { id: 'h22', r: 8, c: 2, rs: 3, cs: 1 },
  { id: 'h23', r: 8, c: 15, rs: 3, cs: 1 },

  // --- ROW 9-11: Mid Lower Body ---
  { id: 'h24', r: 9, c: 3, rs: 3, cs: 2 },
  { id: 'h25', r: 9, c: 5, rs: 3, cs: 2 },
  { id: 'h26', r: 9, c: 11, rs: 3, cs: 2 },
  { id: 'h27', r: 9, c: 13, rs: 3, cs: 2 },

  // --- ROW 10-12: Sub-Hero Anchor Directly Below Hero ---
  { id: 'h28', r: 10, c: 7, rs: 3, cs: 4 },

  // --- ROW 11-12: Taper Stepping Inward ---
  { id: 'h29', r: 11, c: 2, rs: 2, cs: 1 },
  { id: 'h30', r: 11, c: 15, rs: 2, cs: 1 },

  // --- ROW 12-13: Narrowing Lower Taper (Columns 4 to 13) ---
  { id: 'h31', r: 12, c: 3, rs: 2, cs: 2 }, // r:12..13, c:3..4
  { id: 'h32', r: 12, c: 5, rs: 2, cs: 2 }, // r:12..13, c:5..6
  { id: 'h33', r: 12, c: 11, rs: 2, cs: 2 },// r:12..13, c:11..12
  { id: 'h34', r: 12, c: 13, rs: 2, cs: 2 },// r:12..13, c:13..14

  // --- ROW 13-14: Narrowing V ---
  // In row 13: c:7..10 is open! Let's fill with h35 (c:7..8, rs:2, cs:2) and h36 (c:9..10, rs:2, cs:2)
  { id: 'h35', r: 13, c: 7, rs: 2, cs: 2 }, // r:13..14, c:7..8
  { id: 'h36', r: 13, c: 9, rs: 2, cs: 2 }, // r:13..14, c:9..10

  // --- ROW 14: Flanks of V (Columns 6 and 11) ---
  { id: 'h37', r: 14, c: 6, rs: 1, cs: 1 }, // r:14, c:6
  { id: 'h38', r: 14, c: 11, rs: 1, cs: 1 },// r:14, c:11

  // --- ROW 15: Pre-Tip (Columns 7 to 10) ---
  { id: 'h39', r: 15, c: 7, rs: 1, cs: 2 }, // r:15, c:7..8
  { id: 'h40', r: 15, c: 9, rs: 1, cs: 2 }, // r:15, c:9..10

  // --- ROW 16: The Exact Heart Point (Columns 8 to 9) ---
  { id: 'h41', r: 16, c: 8, rs: 1, cs: 2 }  // r:16, c:8..9 (Point!)
];

let overlaps = 0;
tiles.forEach(t => {
  for (let row = t.r - 1; row < t.r - 1 + t.rs; row++) {
    for (let col = t.c - 1; col < t.c - 1 + t.cs; col++) {
      if (row >= ROWS || col >= COLS) {
        console.error(`Out of bounds: ${t.id} at [${row}, ${col}]`);
        overlaps++;
      } else if (grid[row][col] !== '..') {
        console.error(`Overlap: ${t.id} clashes with ${grid[row][col]} at [${row}, ${col}]`);
        overlaps++;
      } else {
        grid[row][col] = t.id === 'HERO' ? '♥♥' : t.id.slice(-2);
      }
    }
  }
});

console.log('Total tiles:', tiles.length);
console.log('Overlaps:', overlaps);
console.log('\nPerfect Sharp Heart Mosaic Map:');
console.log(grid.map((row, idx) => String(idx + 1).padStart(2, ' ') + ' ' + row.join(' ')).join('\n'));
