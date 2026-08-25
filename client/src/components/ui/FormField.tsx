import React, { useId } from 'react';
import { useOperateMode } from './OperateModeContext';

interface FieldChromeProps {
  label?: string;
  id?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

const fieldBase =
  'w-full px-4 py-2.5 rounded-form bg-background border text-sm text-dark placeholder:text-mutedOnLight transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

const borderClass = (hasError?: boolean) =>
  hasError ? 'border-rose-300 focus:border-rose-500' : 'border-dark/10 focus:border-dark';

// Persuade's lime focus-ring glow is a bold marketing accent; Operate mode's
// spec calls for a quiet border-color-only focus state instead (see
// DESIGN.md's Operate input treatment), so Operate fields skip .focus-ring.
const focusClass = (isOperate: boolean) => (isOperate ? '' : 'focus-ring');

const Label: React.FC<{ htmlFor: string; required?: boolean; children: React.ReactNode }> = ({
  htmlFor,
  required,
  children,
}) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold text-dark mb-1.5">
    {children}
    {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const Hint: React.FC<{ id: string; error?: string; hint?: string }> = ({ id, error, hint }) => {
  if (!error && !hint) return null;
  return (
    <p id={id} className={`mt-1.5 text-xs ${error ? 'text-rose-600 font-semibold' : 'text-mutedOnLight'}`}>
      {error || hint}
    </p>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldChromeProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, hint, required, className = '', ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const descId = `${fieldId}-desc`;
    const isOperate = useOperateMode();
    return (
      <div className={className}>
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error || hint ? descId : undefined}
          className={`${fieldBase} ${borderClass(!!error)} ${focusClass(isOperate)}`}
          {...props}
        />
        <Hint id={descId} error={error} hint={hint} />
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldChromeProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, error, hint, required, className = '', rows = 4, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const descId = `${fieldId}-desc`;
    const isOperate = useOperateMode();
    return (
      <div className={className}>
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error || hint ? descId : undefined}
          className={`${fieldBase} ${borderClass(!!error)} ${focusClass(isOperate)} resize-none`}
          {...props}
        />
        <Hint id={descId} error={error} hint={hint} />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, FieldChromeProps {
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, error, hint, required, className = '', children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const descId = `${fieldId}-desc`;
    const isOperate = useOperateMode();
    return (
      <div className={className}>
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error || hint ? descId : undefined}
          className={`${fieldBase} ${borderClass(!!error)} ${focusClass(isOperate)}`}
          {...props}
        >
          {children}
        </select>
        <Hint id={descId} error={error} hint={hint} />
      </div>
    );
  }
);
Select.displayName = 'Select';

/** Generic labeled wrapper for a custom field (e.g. a third-party control) that
 * still needs the same label/error/hint chrome and htmlFor/id pairing. */
export const FormField: React.FC<
  FieldChromeProps & { children: (fieldId: string, descId: string) => React.ReactNode }
> = ({ label, id, error, hint, required, className = '', children }) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const descId = `${fieldId}-desc`;
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      {children(fieldId, descId)}
      <Hint id={descId} error={error} hint={hint} />
    </div>
  );
};
