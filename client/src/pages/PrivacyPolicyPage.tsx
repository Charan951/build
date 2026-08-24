import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';

const LAST_UPDATED = 'August 21, 2026';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
      <SEOHead
        title="Privacy Policy | Build Your Thoughts"
        description="How Build Your Thoughts collects, uses, and protects your personal information."
        canonical="https://www.buildyourthougths.in/privacy-policy"
      />

      <SectionHeader as="h1" align="left" badge="Legal" title="Privacy Policy" subtitle={`Last updated: ${LAST_UPDATED}`} />

      <div className="prose prose-slate max-w-none space-y-8 text-slateText leading-relaxed">
        <p>
          Build Your Thoughts ("we", "our", "us") respects your privacy and is committed to protecting the personal
          information you share with us through this website and our services. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">1. Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Information you provide directly:</strong> when you submit a contact or project inquiry form,
              request a proposal, or create a client portal account, we collect your name, email address, phone
              number, company name, and any project details you share with us.
            </li>
            <li>
              <strong>Automatically collected information:</strong> when you browse our website, we automatically
              collect certain technical information such as your IP address, browser type, device type, pages
              visited, and referring URL, via cookies and similar technologies (see Section 3).
            </li>
            <li>
              <strong>Client project data:</strong> if you engage us for a project, we may collect and process
              additional business information necessary to deliver the engagement (as agreed in your project scope
              or contract).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To respond to your inquiries and provide requested quotations or proposals.</li>
            <li>To deliver, manage, and support the projects and services you engage us for.</li>
            <li>To send you service-related communications, including project updates and invoices.</li>
            <li>To improve our website, services, and user experience.</li>
            <li>To comply with legal obligations and enforce our agreements.</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">3. Cookies &amp; Analytics</h2>
          <p>
            We use Google Analytics and Google Tag Manager to understand how visitors use our website and to improve
            our content and services. These tools use cookies to collect anonymized or pseudonymized usage data such
            as pages viewed, time on site, and general geographic location. You can disable cookies through your
            browser settings, though some site features may not function correctly without them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">4. How We Share Information</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Service providers</strong> who help us operate our business (e.g. cloud hosting, email
              delivery, and analytics providers), under obligations to protect your data.
            </li>
            <li>
              <strong>Legal authorities</strong> where required by law, regulation, or valid legal process.
            </li>
            <li>
              <strong>Business transfers</strong>, in the event of a merger, acquisition, or sale of assets, subject
              to standard confidentiality protections.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">5. Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical safeguards designed to protect your
            information from unauthorized access, disclosure, alteration, or destruction. However, no method of
            transmission or storage over the internet is completely secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">6. Data Retention</h2>
          <p>
            We retain personal information for as long as necessary to fulfill the purposes described in this
            policy, including to provide our services, comply with legal obligations, resolve disputes, and enforce
            our agreements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">7. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, update, or request deletion of
            your personal information, and to object to or restrict certain processing. To exercise these rights,
            contact us using the details below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">8. Children's Privacy</h2>
          <p>
            Our website and services are not directed to individuals under the age of 18, and we do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
            "Last updated" date at the top of this page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-dark">10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or how we handle your information, contact us at:</p>
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
