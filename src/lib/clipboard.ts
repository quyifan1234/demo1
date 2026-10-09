import { toast } from 'sonner';

/**
 * 复制到剪贴板：成功提示并返回 true，失败提示并返回 false（绝不抛错）。
 * 密钥、技能全文、素材网址等所有复制入口共用，保证反馈一致。
 */
export async function copyText(text: string, successMessage = '已复制'): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // 非安全上下文（http 预览、旧浏览器）没有 clipboard API，降级到临时 textarea
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.top = '-9999px';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      if (!ok) throw new Error('execCommand copy failed');
    }
  } catch {
    toast.error('复制失败，请手动选择文本复制');
    return false;
  }
  toast.success(successMessage);
  return true;
}
