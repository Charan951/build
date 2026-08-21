import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input, Select, Textarea } from './FormField';
import { Button } from './Button';
import { apiFetch } from '../../services/api';

interface SelectOption {
  label: string;
  value: string;
}

interface LeadFormProps {
  /** Extra fields beyond the always-present name/email/message — e.g. company +
   * project type + budget for the full Contact page inquiry, or nothing for a
   * compact sidebar proposal request. */
  variant?: 'full' | 'compact';
  projectTypeOptions?: SelectOption[];
  budgetOptions?: SelectOption[];
  /** Builds the POST body from the raw form values — lets each caller shape the
   * payload for its own use case (e.g. ServiceDetailPage prefixes the message
   * with the service name and adds a `services` array) without this component
   * needing to know about that context. */
  buildPayload: (values: {
    name: string;
    email: string;
    phone: string;
    company: string;
    projectType: string;
    budgetRange: string;
    message: string;
  }) => Record<string, unknown>;
  messageLabel?: string;
  messagePlaceholder?: string;
  messageRequired?: boolean;
  submitLabel?: string;
  /** 'banner' shows success/error above the form and resets it (ContactPage's
   * original behavior). 'replace' swaps the whole form for a thank-you message
   * once submitted (ServiceDetailPage's original behavior). */
  successDisplay?: 'banner' | 'replace';
  successReplaceMessage?: string;
  defaultProjectType?: string;
  defaultBudgetRange?: string;
}

const emptyValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
};

/** Single implementation for the "submit a lead" flow — replaces ContactPage's
 * inquiry form and ServiceDetailPage's proposal form, both of which POST to
 * /leads independently today. The API call and payload shape stay exactly
 * what each caller specifies via `buildPayload`; only the field chrome and
 * submit/loading/success/error handling are shared. */
export const LeadForm: React.FC<LeadFormProps> = ({
  variant = 'full',
  projectTypeOptions,
  budgetOptions,
  buildPayload,
  messageLabel = 'Project Overview',
  messagePlaceholder = 'Describe your project goals, technical requirements, and timeline...',
  messageRequired = true,
  submitLabel = 'Submit Inquiry',
  successDisplay = 'banner',
  successReplaceMessage = "Thank you! Our technical team will reach out to you shortly.",
  defaultProjectType,
  defaultBudgetRange,
}) => {
  const [values, setValues] = useState({
    ...emptyValues,
    projectType: defaultProjectType ?? projectTypeOptions?.[0]?.value ?? '',
    budgetRange: defaultBudgetRange ?? budgetOptions?.[0]?.value ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const data = await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify(buildPayload(values)),
      });
      if (data.success) {
        if (successDisplay === 'banner') {
          setSuccessMsg(data.message);
          setValues({
            ...emptyValues,
            projectType: defaultProjectType ?? projectTypeOptions?.[0]?.value ?? '',
            budgetRange: defaultBudgetRange ?? budgetOptions?.[0]?.value ?? '',
          });
        } else {
          setSubmitted(true);
        }
      } else {
        setErrorMsg(data.message || 'Submission failed.');
      }
    } catch {
      setErrorMsg('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successDisplay === 'replace' && submitted) {
    return (
      <div className="p-4 rounded-form bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
        {successReplaceMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={variant === 'full' ? 'space-y-6' : 'space-y-3'}>
      {successDisplay === 'banner' && successMsg && (
        <div className="p-4 rounded-form bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {successDisplay === 'banner' && errorMsg && (
        <div className="p-4 rounded-form bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className={variant === 'full' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-3'}>
        <Input label="Your Name" required value={values.name} onChange={set('name')} placeholder="John Doe" />
        <Input label="Work Email" type="email" required value={values.email} onChange={set('email')} placeholder="john@company.com" />
      </div>

      {variant === 'full' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Phone Number" type="tel" value={values.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
          <Input label="Company / Organization" value={values.company} onChange={set('company')} placeholder="Acme Corp" />
        </div>
      ) : (
        <Input label="Phone Number" type="tel" value={values.phone} onChange={set('phone')} placeholder="Optional" />
      )}

      {variant === 'full' && projectTypeOptions && budgetOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select label="Project Category" value={values.projectType} onChange={set('projectType')}>
            {projectTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select label="Estimated Budget" value={values.budgetRange} onChange={set('budgetRange')}>
            {budgetOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <Textarea
        label={messageLabel}
        required={messageRequired}
        rows={variant === 'full' ? 5 : 3}
        value={values.message}
        onChange={set('message')}
        placeholder={messagePlaceholder}
      />

      <Button variant="lime" size={variant === 'full' ? 'lg' : 'sm'} type="submit" disabled={loading} className="w-full gap-2 justify-center">
        {loading ? 'Submitting…' : submitLabel}
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
