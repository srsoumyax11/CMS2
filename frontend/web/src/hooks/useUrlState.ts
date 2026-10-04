import { useSearchParams } from 'react-router';
import { useMemo } from 'react';

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const sortKey = searchParams.get('sortKey') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
    const selectedId = searchParams.get('id') || undefined;

    const filters: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      if (key.startsWith('filter_')) {
        filters[key.replace('filter_', '')] = val;
      }
    });

    return {
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 20 : limit,
      search,
      sortKey,
      sortOrder,
      selectedId,
      filters,
    };
  }, [searchParams]);

  const updateState = (updates: Partial<{
    page: number;
    limit: number;
    search: string;
    sortKey: string;
    sortOrder: 'asc' | 'desc';
    selectedId: string | null;
    filters: Record<string, string>;
  }>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (updates.page !== undefined) {
        if (updates.page === 1) next.delete('page');
        else next.set('page', String(updates.page));
      }

      if (updates.limit !== undefined) {
        next.set('limit', String(updates.limit));
      }

      if (updates.search !== undefined) {
        if (!updates.search) next.delete('search');
        else next.set('search', updates.search);
      }

      if (updates.sortKey !== undefined) {
        if (!updates.sortKey) next.delete('sortKey');
        else next.set('sortKey', updates.sortKey);
      }

      if (updates.sortOrder !== undefined) {
        if (!updates.sortOrder) next.delete('sortOrder');
        else next.set('sortOrder', updates.sortOrder);
      }

      if (updates.selectedId !== undefined) {
        if (!updates.selectedId) next.delete('id');
        else next.set('id', updates.selectedId);
      }

      if (updates.filters !== undefined) {
        // Clear old filters
        Array.from(next.keys()).forEach((key) => {
          if (key.startsWith('filter_')) next.delete(key);
        });

        Object.entries(updates.filters).forEach(([fKey, fVal]) => {
          if (fVal) next.set(`filter_${fKey}`, fVal);
        });
      }

      return next;
    }, { replace: true });
  };

  return { state, updateState };
}
