import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initRevealEngine } from '../reveal-engine';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('reveal-engine', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it('injects style and adds ready class to html', () => {
    initRevealEngine();

    expect(document.documentElement.classList.contains('reveal-ready')).toBe(true);
    expect(document.getElementById('reveal-engine-style')).not.toBeNull();
  });

  it('does not re-inject style on multiple calls', () => {
    initRevealEngine();
    initRevealEngine();

    const styles = document.querySelectorAll('#reveal-engine-style');
    expect(styles.length).toBe(1);
  });

  it('gracefully degrades if IntersectionObserver is not available', () => {
    // delete IntersectionObserver
    (window as any).IntersectionObserver = undefined;

    initRevealEngine();

    // should not have ready class or styles
    expect(document.documentElement.classList.contains('reveal-ready')).toBe(false);
    expect(document.getElementById('reveal-engine-style')).toBeNull();
  });
});
