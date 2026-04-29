import { cn } from './utils';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('supports conditional object syntax', () => {
    expect(cn({ 'text-sm': true, 'text-lg': false })).toBe('text-sm');
  });

  it('returns empty string when no valid inputs', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
