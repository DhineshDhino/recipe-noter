import { calculateScaledQuantity, formatTime, formatIngredientName } from './utils';

describe('calculateScaledQuantity (Story 5)', () => {
  it('scales up correctly when target yield is doubled', () => {
    expect(calculateScaledQuantity(100, 4, 8)).toBe(200);
  });

  it('scales down correctly when target yield is halved', () => {
    expect(calculateScaledQuantity(100, 4, 2)).toBe(50);
  });

  it('returns the same quantity when target equals base yield', () => {
    expect(calculateScaledQuantity(100, 4, 4)).toBe(100);
  });

  it('does NOT scale optional ingredients — returns base quantity unchanged', () => {
    expect(calculateScaledQuantity(50, 4, 8, true)).toBe(50);
  });

  it('rounds to a maximum of 2 decimal places', () => {
    // 100 / 3 * 1 = 33.333... → should be 33.33
    expect(calculateScaledQuantity(100, 3, 1)).toBe(33.33);
  });

  it('handles non-integer yields correctly', () => {
    expect(calculateScaledQuantity(100, 4, 6)).toBe(150);
  });

  it('returns 0 if baseYield is 0 to prevent divide-by-zero', () => {
    expect(calculateScaledQuantity(100, 0, 8)).toBe(0);
  });

  it('returns 0 if targetYield is 0', () => {
    expect(calculateScaledQuantity(100, 4, 0)).toBe(0);
  });
});

describe('formatTime (Story 4.3)', () => {
  it('returns "0m" for 0 minutes', () => {
    expect(formatTime(0)).toBe('0m');
  });

  it('returns minutes only for values under 60', () => {
    expect(formatTime(45)).toBe('45m');
  });

  it('returns hours only when there are no remaining minutes', () => {
    expect(formatTime(120)).toBe('2h');
  });

  it('returns hours and minutes for mixed values', () => {
    expect(formatTime(90)).toBe('1h 30m');
    expect(formatTime(125)).toBe('2h 5m');
  });
});

describe('formatIngredientName', () => {
  it('strips the ing_ prefix and title-cases the result', () => {
    expect(formatIngredientName('ing_raw_rice')).toBe('Raw Rice');
  });

  it('handles multi-word names', () => {
    expect(formatIngredientName('ing_dry_red_chilli')).toBe('Dry Red Chilli');
  });
});
