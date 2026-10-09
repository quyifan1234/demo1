import { useCallback, useRef, useState } from 'react';
import { useBlocker } from '@tanstack/react-router';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './ui/alert-dialog';

/** useBlocker 的 resolver 结构（库未导出该类型，这里只取用到的字段） */
interface BlockerLike {
  status: 'blocked' | 'idle';
  proceed?: () => void;
  reset?: () => void;
}

/**
 * 未保存修改守卫：表单变脏后，任何路由跳转（底部 Tab、侧栏、面包屑、浏览器返回）
 * 以及刷新/关闭标签都会先弹确认框，不再静默丢弃用户刚写的内容。
 *
 * 用法：
 *   const { blocker, markDirty, clearDirty } = useUnsavedGuard();
 *   <div onChangeCapture={markDirty}>…</div>
 *   保存成功 → clearDirty(); navigate(...)   // 必须先清标记，否则跳转会被自己拦下
 *   <UnsavedGuardDialog blocker={blocker} />
 */
export function useUnsavedGuard() {
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  // shouldBlockFn 读 ref 而不是 state：保存成功后是「先清标记、紧接着同步跳转」，
  // 此时 state 还没重渲染，读 state 会把刚保存完的跳转又拦下来弹确认框。
  const blocker = useBlocker({
    shouldBlockFn: () => dirtyRef.current,
    enableBeforeUnload: () => dirtyRef.current,
    disabled: !dirty,
    withResolver: true,
  });
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
  }, []);
  const clearDirty = useCallback(() => {
    dirtyRef.current = false;
    setDirty(false);
  }, []);
  return { blocker, dirty, markDirty, clearDirty };
}

/** 离开确认框：默认动作是「继续编辑」，避免误触丢弃 */
export function UnsavedGuardDialog({ blocker }: { blocker: BlockerLike }) {
  return (
    <AlertDialog open={blocker.status === 'blocked'} onOpenChange={(open) => { if (!open) blocker.reset?.(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>放弃未保存的修改？</AlertDialogTitle>
          <AlertDialogDescription>当前还有没保存的内容，离开后这些修改会丢失。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset?.()}>继续编辑</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive hover:bg-destructive" onClick={() => blocker.proceed?.()}>
            放弃并离开
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
