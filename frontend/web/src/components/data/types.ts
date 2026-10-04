import React from 'react';
import { z } from 'zod';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'money'
  | 'select'
  | 'status'
  | 'user'
  | 'file'
  | 'link'
  | 'boolean';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldConfig<T = any> {
  key: string;
  labelKey: string;
  type: FieldType;
  schema?: z.ZodType<unknown>;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: Array<{ label: string; value: string }>;
  editable?: boolean;
  editPermission?: string;
  viewPermission?: string;
  sensitive?: boolean; // Never exported in CSV
  columnDefault?: boolean; // Default column visibility
  width?: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => React.ReactNode;
}

export type ConfirmType = 'none' | 'confirm' | 'reason';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionConfig<T = any> {
  key: string;
  labelKey: string;
  permission?: string;
  visibleWhen?: (row: T) => boolean;
  confirm: ConfirmType;
  danger?: boolean;
  handler?: (row: T, reason?: string) => Promise<void>;
  bulkHandler?: (rows: T[]) => Promise<Record<string, boolean>>;
  endpoint?: string;
}

export type DetailTab = 'details' | 'timeline' | 'comments' | 'attachments' | 'audit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ResourceConfig<T = any> {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  endpoint: {
    list: string;
    get?: string;
    update?: string;
    actions?: string;
  };
  idField: string;
  fields: FieldConfig<T>[];
  columns: string[]; // Field keys default shown as table columns
  defaultSort?: {
    key: string;
    order: 'asc' | 'desc';
  };
  pageSizeOptions?: number[];
  filters?: string[]; // Field keys that can be filtered
  rowActions?: ActionConfig<T>[];
  bulkActions?: ActionConfig<T>[];
  detailTabs?: DetailTab[];
  permissions?: {
    view?: string;
    edit?: string;
    export?: string;
  };
  pollingInterval?: number;
  exportable?: boolean;
  mockFallback?: (params: {
    page: number;
    limit: number;
    search?: string;
    sortKey?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, string>;
  }) => { data: T[]; total: number };
}

export function defineResource<T>(config: ResourceConfig<T>): ResourceConfig<T> {
  return config;
}
