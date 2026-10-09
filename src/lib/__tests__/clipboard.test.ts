import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../clipboard';

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error 测试里直接清掉 jsdom 未实现的能力
  delete navigator.clipboard;
});

describe('copyText', () => {
  it('剪贴板可用时写入并提示成功', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await expect(copyText('hello', '已复制技能内容')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(toastSuccess).toHaveBeenCalledWith('已复制技能内容');
    expect(toastError).not.toHaveBeenCalled();
  });

  it('写入失败时提示错误并返回 false，绝不谎报成功', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await expect(copyText('hello')).resolves.toBe(false);
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('复制失败，请手动选择文本复制');
  });

  it('没有 clipboard API 时降级到 execCommand，成功仍算成功', async () => {
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    await expect(copyText('fallback')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(toastSuccess).toHaveBeenCalledWith('已复制');
    expect(document.querySelector('textarea')).toBeNull(); // 临时节点要清理干净
  });
});
