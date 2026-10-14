import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetForm, toAssetFormValue } from '../asset-form';
import React from 'react';
import type { Asset } from '../../lib/types';

describe('AssetForm', () => {
  it('toAssetFormValue provides correct defaults', () => {
    const val = toAssetFormValue();
    expect(val).toEqual({
      name: '', url: '', category: '其他', description: '', tags: [], is_favorite: false
    });
  });

  it('toAssetFormValue maps asset correctly', () => {
    const a: Asset = {
      id: '1', user_id: 'u1', created_at: '', updated_at: '',
      name: 'Test', url: 'https://test.com', category: '代码',
      description: 'desc', tags: ['t1'], is_favorite: true
    };
    const val = toAssetFormValue(a);
    expect(val).toEqual({
      name: 'Test', url: 'https://test.com', category: '代码',
      description: 'desc', tags: ['t1'], is_favorite: true
    });
  });

  it('renders tag remove buttons with localized accessible aria-labels', () => {
    const initial = {
      name: 'Test Asset', url: '', category: '其他', description: '',
      tags: ['提示词', '代码'], is_favorite: false
    };
    render(<AssetForm initial={initial} onSubmit={async () => {}} busy={false} submitLabel="保存" />);
    expect(screen.getByRole('button', { name: '移除标签 提示词' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '移除标签 代码' })).toBeTruthy();
  });
});
