import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Badge from './badge.svelte';

describe('Badge', () => {
  it('should render with default variant classes', () => {
    const { container } = render(Badge);

    const badge = container.querySelector('div');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('bg-primary');
    expect(badge?.className).toContain('text-primary-foreground');
    expect(badge?.className).toContain('rounded-md');
  });

  it('should render with secondary variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'secondary' }
    });

    const badge = container.querySelector('div');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('bg-secondary');
    expect(badge?.className).toContain('text-secondary-foreground');
  });

  it('should render with destructive variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'destructive' }
    });

    const badge = container.querySelector('div');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('bg-destructive');
    expect(badge?.className).toContain('text-destructive-foreground');
  });

  it('should render with outline variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'outline' }
    });

    const badge = container.querySelector('div');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('text-foreground');
    // Outline variant should not have bg-primary
    expect(badge?.className).not.toContain('bg-primary');
  });

  it('should apply custom class names', () => {
    const { container } = render(Badge, {
      props: { class: 'custom-class' }
    });

    const badge = container.querySelector('div');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('custom-class');
    // Should still have base classes
    expect(badge?.className).toContain('rounded-md');
    expect(badge?.className).toContain('border');
  });

  it('should have proper base styling classes', () => {
    const { container } = render(Badge);

    const badge = container.querySelector('div');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('inline-flex');
    expect(badge?.className).toContain('items-center');
    expect(badge?.className).toContain('text-xs');
    expect(badge?.className).toContain('font-semibold');
  });
});
