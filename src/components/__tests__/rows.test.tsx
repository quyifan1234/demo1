import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RowAction } from '../rows';
import { Pencil } from 'lucide-react';

afterEach(cleanup);

describe('RowAction component', () => {
  it('renders button with correct aria-label', () => {
    const handleClick = vi.fn();
    render(
      <RowAction title="编辑" onClick={handleClick}>
        <Pencil data-testid="pencil-icon" />
      </RowAction>
    );

    const button = screen.getByRole('button', { name: '编辑' });
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('编辑');
  });

  it('triggers onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <RowAction title="编辑" onClick={handleClick}>
        <Pencil />
      </RowAction>
    );

    const button = screen.getByRole('button', { name: '编辑' });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies danger class when danger prop is true', () => {
    render(
      <RowAction title="删除" onClick={() => {}} danger>
        <Pencil />
      </RowAction>
    );

    const button = screen.getByRole('button', { name: '删除' });
    expect(button.classList.contains('is-danger')).toBe(true);
  });
});
