import React, { useEffect, useRef, useState } from 'react';
import { X, Wand2, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { ProposalContentEditor } from './ProposalContentEditor';

export interface ProposalBrandingData {
  logoUrl?: string;
  headerGradientFrom?: string;
  headerGradientTo?: string;
  footerAddress?: string;
  footerAddressLine2?: string;
  footerText?: string;
  companyName?: string;
  companyTagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

export interface ProposalMetaData {
  preparedFor?: string;
  projectType?: string;
  currency?: string;
  docRef?: string;
  validityText?: string;
}

export interface ProposalTemplateData {
  _id?: string;
  proposalProjectId: string;
  type: string;
  kind?: 'generated' | 'uploaded';
  title: string;
  contentHtml: string;
  fileUrl?: string;
  fileName?: string;
  branding: ProposalBrandingData;
  meta?: ProposalMetaData;
}

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalProjectId: string;
  projectName: string;
  template: ProposalTemplateData | null; // null = create new
  onSaved: () => void;
}

const DEFAULT_TYPES = ['website', 'app', 'website_app'];

const DEFAULT_BRANDING: ProposalBrandingData = {
  logoUrl: '',
  headerGradientFrom: '#0f2a3d',
  headerGradientTo: '#1f9d63',
  footerAddress: 'T-Hub, Plot No 1/C, Sy No 83/1, Raidurgam, Knowledge City Road,',
  footerAddressLine2: 'Serilingampalle (M), Hyderabad, Telangana 500032, India',
  footerText: '',
  companyName: 'Speshway Solutions',
  companyTagline: 'Website & App Development Company | Hyderabad, India',
  contactEmail: 'info@speshway.com',
  contactPhone: '+91 91000 06020',
  website: 'www.speshway.com',
};

const DEFAULT_META: ProposalMetaData = {
  preparedFor: '',
  projectType: '',
  currency: 'Indian Rupees (INR)',
  docRef: '',
  validityText: '30 Days from Date of Issue',
};

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  proposalProjectId,
  projectName,
  template,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('website');
  const [customType, setCustomType] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [branding, setBranding] = useState<ProposalBrandingData>(DEFAULT_BRANDING);
  const [meta, setMeta] = useState<ProposalMetaData>(DEFAULT_META);
  const [brandingOpen, setBrandingOpen] = useState(false);

  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiProvider, setAiProvider] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlRef = useRef<string>('');

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    if (template) {
      setTitle(template.title || '');
      const isCustom = !DEFAULT_TYPES.includes(template.type);
      setType(isCustom ? 'custom' : template.type);
      setCustomType(isCustom ? template.type : '');
      setContentHtml(template.contentHtml || '');
      setBranding({ ...DEFAULT_BRANDING, ...(template.branding || {}) });
      setMeta({ ...DEFAULT_META, ...(template.meta || {}) });
    } else {
      setTitle('');
      setType('website');
      setCustomType('');
      setContentHtml('');
      setBranding(DEFAULT_BRANDING);
      setMeta(DEFAULT_META);
    }
    setErrorMsg('');
    setAiError('');
    setAiInstruction('');
    setAiPromptOpen(false);
    setBrandingOpen(false);
    setPreviewError('');

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, template]);

  const resolvedType = type === 'custom' ? customType.trim() || 'custom' : type;

  const refreshPreview = React.useCallback(async () => {
    if (!contentHtml.trim()) {
      setPreviewUrl('');
      return;
    }
    setPreviewLoading(true);
    setPreviewError('');
    try {
      const token = localStorage.getItem('adminToken') || '';
      const response = await fetch(getApiUrl('/proposals/preview-pdf'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ title, contentHtml, branding, meta }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to render PDF preview.');
      }
      const blob = await response.blob();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } catch (err: any) {
      setPreviewError(err.message || 'Failed to render PDF preview.');
    } finally {
      setPreviewLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, contentHtml, branding, meta]);

  // Debounced live preview refresh, ~800ms after the last edit.
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refreshPreview();
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, title, contentHtml, branding, meta]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!aiInstruction.trim()) {
      setAiError('Enter a short instruction first.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await apiFetch('/proposals/ai-generate', {
        method: 'POST',
        body: JSON.stringify({
          instruction: aiInstruction,
          projectName,
          type: resolvedType,
          currency: meta.currency,
        }),
      });
      if (res.success) {
        setContentHtml(res.contentHtml);
        setAiProvider(res.provider);
        setAiPromptOpen(false);
        setAiInstruction('');
      } else {
        setAiError(res.message || 'AI generation failed.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Error contacting AI service.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Template title is required.');
      return;
    }
    setSaving(true);
    setErrorMsg('');

    const payload = {
      proposalProjectId,
      type: resolvedType,
      title,
      contentHtml,
      branding,
      meta,
    };

    try {
      const res = template?._id
        ? await apiFetch(`/proposals/templates/${template._id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await apiFetch('/proposals/templates', { method: 'POST', body: JSON.stringify(payload) });

      if (res.success) {
        onSaved();
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to save template.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to server.');
    } finally {
      setSaving(false);
    }
  };

  const setBrandingField = (field: keyof ProposalBrandingData, value: string) =>
    setBranding((prev) => ({ ...prev, [field]: value }));
  const setMetaField = (field: keyof ProposalMetaData, value: string) =>
    setMeta((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-dark/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-dark/10 overflow-hidden z-10 my-auto flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-5 bg-dark text-white border-b border-white/10 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold">
              {template ? 'Edit Proposal Template' : 'New Proposal Template'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{projectName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
          {/* Left: edit form */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 border-b lg:border-b-0 lg:border-r border-dark/10">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Template Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., HRMS Website Proposal"
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">Type</label>
                <div className="flex gap-2">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark font-semibold"
                  >
                    <option value="website">Website</option>
                    <option value="app">App</option>
                    <option value="website_app">Website + App</option>
                    <option value="custom">Custom...</option>
                  </select>
                  {type === 'custom' && (
                    <input
                      type="text"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="Custom type"
                      className="flex-1 px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Document meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Prepared For
                </label>
                <input
                  type="text"
                  value={meta.preparedFor || ''}
                  onChange={(e) => setMetaField('preparedFor', e.target.value)}
                  placeholder="Client or company name"
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Project Type
                </label>
                <input
                  type="text"
                  value={meta.projectType || ''}
                  onChange={(e) => setMetaField('projectType', e.target.value)}
                  placeholder="e.g., Web + Mobile App"
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Currency
                </label>
                <input
                  type="text"
                  value={meta.currency || ''}
                  onChange={(e) => setMetaField('currency', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Document Ref
                </label>
                <input
                  type="text"
                  value={meta.docRef || ''}
                  onChange={(e) => setMetaField('docRef', e.target.value)}
                  placeholder="SPW/EST/PROJECT/2026"
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Validity
                </label>
                <input
                  type="text"
                  value={meta.validityText || ''}
                  onChange={(e) => setMetaField('validityText', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
            </div>

            {/* AI content prompt - the primary way to write/refine the document */}
            <div>
              <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                Describe the proposal content
              </label>
              <div className="p-3 rounded-2xl bg-lime-50 border border-primary/30 space-y-2">
                <textarea
                  rows={3}
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder="e.g., Write a project estimation for an HRMS web app with payroll and attendance modules, two pricing plans (web only and web + mobile)"
                  className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark resize-none"
                />
                {aiError && <p className="text-[10px] font-semibold text-rose-600">{aiError}</p>}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-slateText">
                    {contentHtml
                      ? aiProvider
                        ? `Last generated using ${aiProvider}. Describe changes to regenerate.`
                        : 'Content loaded. Describe changes to regenerate.'
                      : 'Nothing generated yet.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={aiLoading || !aiInstruction.trim()}
                    className="shrink-0 px-4 py-1.5 rounded-lg bg-dark text-white font-bold text-[10px] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    {aiLoading ? 'Generating' : contentHtml ? 'Regenerate' : 'Generate with AI'}
                  </button>
                </div>
              </div>
            </div>

            {/* Editable, section-aware content editor - select text to refine just that part with AI */}
            <div className="rounded-2xl bg-background border border-dark/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setAiPromptOpen((v) => !v)}
                className="w-full flex items-center justify-between p-4"
              >
                <div>
                  <h3 className="text-xs font-bold text-dark uppercase tracking-wider">Edit content</h3>
                  <p className="text-[10px] text-slateText mt-0.5">
                    Select any text below to refine just that part with AI.
                  </p>
                </div>
                {aiPromptOpen ? (
                  <ChevronUp className="w-4 h-4 text-dark" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-dark" />
                )}
              </button>
              {aiPromptOpen && (
                <div className="px-4 pb-4">
                  <ProposalContentEditor
                    contentHtml={contentHtml}
                    onChange={setContentHtml}
                    projectName={projectName}
                    type={resolvedType}
                    placeholder='Generate content above, or start typing / paste HTML here (e.g. <div class="section-bar">1. Project Overview</div><p>...</p>)'
                  />
                </div>
              )}
            </div>

            {/* Branding Panel */}
            <div className="rounded-2xl bg-background border border-dark/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setBrandingOpen((v) => !v)}
                className="w-full flex items-center justify-between p-4"
              >
                <h3 className="text-xs font-bold text-dark uppercase tracking-wider">Branding &amp; Details</h3>
                {brandingOpen ? (
                  <ChevronUp className="w-4 h-4 text-dark" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-dark" />
                )}
              </button>

              {brandingOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={branding.companyName || ''}
                        onChange={(e) => setBrandingField('companyName', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={branding.companyTagline || ''}
                        onChange={(e) => setBrandingField('companyTagline', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={branding.logoUrl || ''}
                      onChange={(e) => setBrandingField('logoUrl', e.target.value)}
                      placeholder="https://res.cloudinary.com/.../logo.png"
                      className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                        Header Gradient From
                      </label>
                      <input
                        type="color"
                        value={branding.headerGradientFrom || '#0f2a3d'}
                        onChange={(e) => setBrandingField('headerGradientFrom', e.target.value)}
                        className="w-full h-9 bg-white border border-dark/10 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                        Header Gradient To
                      </label>
                      <input
                        type="color"
                        value={branding.headerGradientTo || '#1f9d63'}
                        onChange={(e) => setBrandingField('headerGradientTo', e.target.value)}
                        className="w-full h-9 bg-white border border-dark/10 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                        Contact Email
                      </label>
                      <input
                        type="text"
                        value={branding.contactEmail || ''}
                        onChange={(e) => setBrandingField('contactEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={branding.contactPhone || ''}
                        onChange={(e) => setBrandingField('contactPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                      Website
                    </label>
                    <input
                      type="text"
                      value={branding.website || ''}
                      onChange={(e) => setBrandingField('website', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                      Footer Address Line 1
                    </label>
                    <input
                      type="text"
                      value={branding.footerAddress || ''}
                      onChange={(e) => setBrandingField('footerAddress', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                      Footer Address Line 2
                    </label>
                    <input
                      type="text"
                      value={branding.footerAddressLine2 || ''}
                      onChange={(e) => setBrandingField('footerAddressLine2', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: persistent PDF preview */}
          <div className="p-5 sm:p-6 flex flex-col min-h-[400px] lg:min-h-0 bg-background/60">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-[10px] font-bold text-dark uppercase tracking-wider">Live PDF Preview</h3>
              <button
                type="button"
                onClick={refreshPreview}
                disabled={previewLoading}
                className="px-3 py-1.5 rounded-lg bg-dark/5 hover:bg-dark/10 text-dark font-bold text-[10px] flex items-center gap-1.5 disabled:opacity-50"
              >
                {previewLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Refresh Preview
              </button>
            </div>

            {previewError && (
              <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shrink-0">
                {previewError}
              </div>
            )}

            <div className="flex-1 min-h-[420px] rounded-xl border border-dark/10 overflow-hidden bg-white relative">
              {previewUrl ? (
                <iframe title="Proposal PDF Preview" src={previewUrl} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slateText font-semibold text-center px-6">
                  {previewLoading ? 'Rendering preview' : 'Add content to see the live PDF preview here.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-dark/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md disabled:opacity-50"
          >
            {saving ? 'Saving' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
