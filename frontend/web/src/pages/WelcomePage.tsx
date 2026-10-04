import React from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Clock,
  Bell,
  ArrowRight,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const features = [
    {
      title: 'Digital Outpass & Gate Pass',
      description: 'Streamlined QR-enabled hostel outpass approval workflows for students and wardens.',
      icon: Clock,
    },
    {
      title: 'Hostel & Mess Management',
      description: 'Centralized hostel room allocation, attendance tracking, and complaint ticketing system.',
      icon: Building2,
    },
    {
      title: 'Role-Based Campus Portal',
      description: 'Tailored permissions for Students, Faculty, Wardens, and Parent/Guardian access.',
      icon: ShieldCheck,
    },
    {
      title: 'Instant Emergency SOS Alerts',
      description: 'Real-time campus security emergency alerts and automated crisis dispatch notifications.',
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <GraduationCap className="h-4 w-4" />
          <span>Next-Generation Campus Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Unified Campus Management Platform
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Streamline hostel approvals, academics, fee management, and campus security in one fast, accessible web portal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 text-base">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-base">
              Log In to Portal
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-foreground">Core Services & Features</h2>
          <p className="text-sm text-muted-foreground">Everything you need to manage your campus experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
