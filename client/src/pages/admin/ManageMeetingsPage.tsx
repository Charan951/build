import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { MeetingsPanel } from '../../components/crm/MeetingsPanel';

export const ManageMeetingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <SEOHead title="Meetings | Admin Dashboard" />

      <MeetingsPanel />
    </div>
  );
};
