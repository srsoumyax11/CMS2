import React, { useState, useEffect, useCallback } from 'react';
import { onboardingApi, RoleApplication } from '../api';
import {
  StudentRoleForm,
  FacultyRoleForm,
  WardenRoleForm,
  ParentLinkForm,
} from '../components/RoleForms';
import { MyApplicationsList } from '../components/MyApplicationsList';
import { GraduationCap, UserCheck, Shield, HeartHandshake, ArrowRight } from 'lucide-react';

export const RequestRolePage: React.FC = () => {
  const [activeFormRole, setActiveFormRole] = useState<'STUDENT' | 'FACULTY' | 'WARDEN' | 'PARENT' | null>(null);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  const [isAppsError, setIsAppsError] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    onboardingApi.getMyApplications().then((data) => {
      if (!ignore) {
        setApplications(data);
        setIsLoadingApps(false);
      }
    }).catch(() => {
      if (!ignore) {
        setIsAppsError(true);
        setIsLoadingApps(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const fetchApplications = useCallback(async () => {
    setIsLoadingApps(true);
    setIsAppsError(false);
    try {
      const data = await onboardingApi.getMyApplications();
      setApplications(data);
    } catch {
      setIsAppsError(true);
    } finally {
      setIsLoadingApps(false);
    }
  }, []);

  const handleFormSuccess = () => {
    setActiveFormRole(null);
    fetchApplications();
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Campus Role Applications</h1>
        <p className="text-sm text-muted-foreground">Select your primary role to access role-specific workflows</p>
      </div>

      {/* Form Drawer / Container */}
      {activeFormRole && (
        <div className="border rounded-2xl p-6 bg-card shadow-md space-y-4 animate-in fade-in duration-200 border-primary/30">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-bold text-foreground">
              {activeFormRole === 'PARENT' ? 'Link Student Profile (Parent / Guardian)' : `Request ${activeFormRole} Role`}
            </h2>
            <button
              onClick={() => setActiveFormRole(null)}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Close Form
            </button>
          </div>

          {activeFormRole === 'STUDENT' && (
            <StudentRoleForm onSuccess={handleFormSuccess} onCancel={() => setActiveFormRole(null)} />
          )}
          {activeFormRole === 'FACULTY' && (
            <FacultyRoleForm onSuccess={handleFormSuccess} onCancel={() => setActiveFormRole(null)} />
          )}
          {activeFormRole === 'WARDEN' && (
            <WardenRoleForm onSuccess={handleFormSuccess} onCancel={() => setActiveFormRole(null)} />
          )}
          {activeFormRole === 'PARENT' && (
            <ParentLinkForm onSuccess={handleFormSuccess} onCancel={() => setActiveFormRole(null)} />
          )}
        </div>
      )}

      {/* Role Option Cards */}
      {!activeFormRole && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Student */}
          <div
            onClick={() => setActiveFormRole('STUDENT')}
            className="border rounded-xl p-6 bg-card hover:border-primary cursor-pointer transition-all hover:shadow-md space-y-3 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Student Role
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apply for outpass requests, hostel room info, fees summary, and complaints.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-2">
              <span>Apply as Student</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Faculty */}
          <div
            onClick={() => setActiveFormRole('FACULTY')}
            className="border rounded-xl p-6 bg-card hover:border-primary cursor-pointer transition-all hover:shadow-md space-y-3 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Faculty Staff
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage academic courses, student attendance lists, and department complaints.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-2">
              <span>Apply as Faculty</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Warden */}
          <div
            onClick={() => setActiveFormRole('WARDEN')}
            className="border rounded-xl p-6 bg-card hover:border-primary cursor-pointer transition-all hover:shadow-md space-y-3 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                Hostel Warden
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review and approve student outpass applications and manage hostel maintenance tickets.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-2">
              <span>Apply as Warden</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Parent / Guardian (Direct Link) */}
          <div
            onClick={() => setActiveFormRole('PARENT')}
            className="border rounded-xl p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md space-y-3 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 transition-colors">
                I am a Parent / Guardian
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Link directly to your ward&apos;s student profile using admission number & DOB.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1 pt-2">
              <span>Link Student Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* Applications History */}
      <div className="space-y-4 pt-6 border-t">
        <h2 className="text-lg font-bold text-foreground">My Role Applications History</h2>
        <MyApplicationsList
          applications={applications}
          isLoading={isLoadingApps}
          isError={isAppsError}
          onRefresh={fetchApplications}
          onReapplyRequest={(role) => setActiveFormRole(role as 'STUDENT' | 'FACULTY' | 'WARDEN')}
        />
      </div>
    </div>
  );
};
