import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';

const LAST_UPDATED = 'August 21, 2026';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
      <SEOHead
        title="Terms of Service | Build Your Thoughts"
        description="The terms and conditions governing your use of the Build Your Thoughts website and services."
        canonical="https://www.buildyourthougths.in/terms-of-service"
      />

      <SectionHeader as="h1" align="left" badge="Legal" title="Terms of Service" subtitle={`Last updated: ${LAST_UPDATED}`} />

      <div className="prose prose-slate max-w-none space-y-8 text-slateText leading-relaxed">
        <p>
          These Terms of Service ("Terms") govern your access to and use of the Build Your Thoughts website and the
          services we provide ("Services"). By accessing our website or engaging our Services, you agree to be bound
          by these Terms.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">1. Use of This Website</h2>
          <p>
            You may use this website for lawful purposes only. You agree not to use the website in any way that
            could damage, disable, or impair it, or interfere with any other party's use of it, and not to attempt
            unauthorized access to any part of the website, other accounts, or connected systems.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">2. Our Services</h2>
          <p>
            Build Your Thoughts provides custom software, web, mobile application, and AI/technology consulting and
            development services. The specific scope, timeline, deliverables, and commercial terms of any project
            engagement are governed by a separate written proposal, quotation, or contract agreed between Build Your
            Thoughts and the client, which takes precedence over these general Terms for that engagement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">3. Intellectual Property</h2>
          <p>
            Unless otherwise agreed in a signed project contract, all content on this website — including text,
            graphics, logos, and code — is the property of Build Your Thoughts or its licensors and is protected by
            applicable intellectual property laws. Ownership and licensing of deliverables produced under a client
            engagement are governed by the terms of that engagement's contract.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">4. Client Portal &amp; Accounts</h2>
          <p>
            If we provide you with access to a client portal or admin account, you are responsible for maintaining
            the confidentiality of your login credentials and for all activity that occurs under your account. Notify
            us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">5. Payment Terms</h2>
          <p>
            Fees, payment schedules, and invoicing terms for any engagement are set out in the applicable proposal,
            quotation, or contract for that project. Late or non-payment may result in suspension of services or
            deliverables at our discretion, subject to the terms of the relevant agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">6. Disclaimer of Warranties</h2>
          <p>
            This website and its content are provided "as is" without warranties of any kind, express or implied,
            to the fullest extent permitted by law. We do not warrant that the website will be uninterrupted,
            error-free, or free of harmful components.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Build Your Thoughts shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising out of or related to your use
            of this website. Liability arising from a specific client engagement is governed by the limitation of
            liability terms in that engagement's contract.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">8. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the content, privacy
            practices, or terms of any third-party site, and inclusion of a link does not imply endorsement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to this website or the client portal at our
            discretion, including for conduct that we believe violates these Terms or is harmful to other users, us,
            or third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any
            disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of
            Hyderabad, Telangana, India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">11. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be reflected by updating the "Last
            updated" date at the top of this page. Continued use of the website after changes constitutes acceptance
            of the revised Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">12. Contact Us</h2>
          <p>If you have questions about these Terms, contact us at:</p>
          <p className="font-semibold text-dark">
            Build Your Thoughts
            <br />
            Orbit, Plot No 30/C, Sy No 83/1, Raidurgam, Knowledge City Rd, Hyderabad, Telangana 500032, India
            <br />
            Email: info@buildyourthougths.in
            <br />
            Phone: +91 6305804155
          </p>
        </section>
      </div>
    </div>
  );
};
