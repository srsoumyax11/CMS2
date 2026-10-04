import React, { useState } from 'react';
import { ResourceConfig } from '@/components/data/types';
import { PageHeader, PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { RecordViewer } from '@/components/record-viewer/RecordViewer';
import { useUrlState } from '@/hooks/useUrlState';
import { MockBanner } from '@/components/ui/MockBanner';
import { t } from '@/i18n';

interface ResourcePageProps<T extends Record<string, unknown> = Record<string, unknown>> {
  resource: ResourceConfig<T>;
  headerActions?: React.ReactNode;
}

export function ResourcePage<T extends Record<string, unknown>>({
  resource,
  headerActions,
}: ResourcePageProps<T>) {
  const { state: urlState, updateState: setUrlState } = useUrlState();
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  const handleSelectRow = (row: T) => {
    setSelectedRecord(row);
    setUrlState({ selectedId: String(row[resource.idField]) });
  };

  const handleCloseViewer = () => {
    setSelectedRecord(null);
    setUrlState({ selectedId: null });
  };

  return (
    <PageLayout>
      <MockBanner />

      <PageHeader
        title={t(resource.titleKey)}
        subtitle={resource.subtitleKey ? t(resource.subtitleKey) : undefined}
        actions={headerActions}
      />

      <DataTable resource={resource} onSelectRow={handleSelectRow} />

      <RecordViewer
        resource={resource}
        record={selectedRecord}
        isOpen={Boolean(urlState.selectedId || selectedRecord)}
        onClose={handleCloseViewer}
      />
    </PageLayout>
  );
}
