import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { CapsuleSearch } from '../rows';

afterEach(cleanup);

function SearchWrapper({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <CapsuleSearch value={value} onChange={setValue} placeholder="搜索测试" />;
}

describe('CapsuleSearch', () => {
  it('当输入框无内容时不显示清空按钮', () => {
    render(<SearchWrapper initialValue="" />);
    expect(screen.queryByRole('button', { name: '清空搜索' })).toBeNull();
  });

  it('当输入框有内容时显示清空按钮，点击后清空文本并重置焦点', () => {
    render(<SearchWrapper initialValue="OpenAI" />);
    const clearButton = screen.getByRole('button', { name: '清空搜索' });
    expect(clearButton).not.toBeNull();

    fireEvent.click(clearButton);

    const input = screen.getByRole('searchbox', { name: '搜索测试' }) as HTMLInputElement;
    expect(input.value).toBe('');
    expect(screen.queryByRole('button', { name: '清空搜索' })).toBeNull();
    expect(document.activeElement).toBe(input);
  });
});
