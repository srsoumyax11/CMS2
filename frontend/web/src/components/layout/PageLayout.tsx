import React from 'react';
import { Link, useLocation } from 'react-router';
import { t } from '@/i18n';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  const location = useLocation();

  // Auto generate breadcrumbs if not explicitly provided
  const generatedBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    { label: t('common.dashboard'), path: '/dashboard' },
    ...location.pathname
      .split('/')
      .filter(Boolean)
      .map((part, idx, arr) => {
        const path = '/' + arr.slice(0, idx + 1).join('/');
        return {
          label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
          path,
        };
      }),
  ];

  return (
    <div className="space-y-3 border-b pb-4 mb-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {generatedBreadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            {item.path && index < generatedBreadcrumbs.length - 1 ? (
              <Link to={item.path} className="hover:text-foreground transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return <div className="space-y-6">{children}</div>;
};
