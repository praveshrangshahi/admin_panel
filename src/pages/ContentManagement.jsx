import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, FileText, Lock, MessageCircle, Phone, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { cn } from "@/lib/utils";

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('terms');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    // Data States
    const [terms, setTerms] = useState('');
    const [privacy, setPrivacy] = useState('');
    const [faqs, setFaqs] = useState([]);
    const [contact, setContact] = useState({ email: '', phone: '', hours: '' });

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/content/${activeTab}`);

            if (activeTab === 'terms') setTerms(data.data?.text || '');
            if (activeTab === 'privacy') setPrivacy(data.data?.text || '');
            if (activeTab === 'faq') setFaqs(data.data || []);
            if (activeTab === 'contact') setContact(data.data || { email: '', phone: '', hours: '' });

        } catch (error) {
            // content might not exist yet, ignore 404
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            let payload = {};

            if (activeTab === 'terms') payload = { text: terms };
            if (activeTab === 'privacy') payload = { text: privacy };
            if (activeTab === 'faq') payload = faqs;
            if (activeTab === 'contact') payload = contact;

            await api.put(`/content/${activeTab}`, { data: payload });
            toast.success('Content saved successfully');
        } catch (error) {
            toast.error('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    // FAQ Handlers
    const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
    const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));
    const updateFaq = (index, field, value) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    const tabs = [
        { id: 'terms', label: 'Terms & Conditions', icon: FileText },
        { id: 'privacy', label: 'Privacy Policy', icon: Lock },
        { id: 'faq', label: 'FAQs', icon: MessageCircle },
        { id: 'contact', label: 'Contact Info', icon: Phone },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-5xl mx-auto">
            <style>{`
                .input-field {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background-color: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    background-color: #FFFFFF;
                    border-color: #14B8A6;
                    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
                }
                .label-text {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #9CA3AF;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                    display: block;
                    margin-left: 4px;
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col gap-1 px-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">App Content</h2>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Manage Policies & Info</p>
            </div>

            {/* Custom Tabs */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-2 border border-white/50 shadow-sm flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] transition-all duration-300 font-bold text-xs uppercase tracking-wider relative overflow-hidden group",
                            activeTab === tab.id
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                                : "hover:bg-white/60 text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-teal-400" : "text-gray-400 group-hover:text-teal-500")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 min-h-[500px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2.5rem] z-10">
                        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Terms / Privacy */}
                        {(activeTab === 'terms' || activeTab === 'privacy') && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="label-text">
                                        {activeTab === 'terms' ? 'Terms & Conditions Text' : 'Privacy Policy Text'}
                                    </label>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Markdown Supported</span>
                                </div>
                                <textarea
                                    value={activeTab === 'terms' ? terms : privacy}
                                    onChange={(e) => activeTab === 'terms' ? setTerms(e.target.value) : setPrivacy(e.target.value)}
                                    className="input-field min-h-[400px] font-mono text-sm leading-relaxed custom-scrollbar"
                                    placeholder={`Enter ${activeTab === 'terms' ? 'terms' : 'privacy policy'} content here...`}
                                />
                            </div>
                        )}

                        {/* FAQs */}
                        {activeTab === 'faq' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="label-text">Frequently Asked Questions</label>
                                    <button onClick={addFaq} className="flex items-center gap-2 text-[10px] font-bold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors uppercase tracking-wider">
                                        <Plus className="h-3 w-3" /> Add Question
                                    </button>
                                </div>

                                {faqs.length === 0 ? (
                                    <div className="py-20 text-center flex flex-col items-center gap-3 opacity-50">
                                        <MessageCircle className="h-12 w-12 text-gray-300" />
                                        <p className="text-sm font-bold text-gray-400">No questions added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <div key={index} className="p-6 bg-white/60 rounded-[1.5rem] border border-white/60 shadow-sm relative group hover:shadow-md transition-all">
                                                <button
                                                    onClick={() => removeFaq(index)}
                                                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all scale-90 hover:scale-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <div className="space-y-4 pr-10">
                                                    <div>
                                                        <label className="label-text">Question {index + 1}</label>
                                                        <input
                                                            value={faq.question}
                                                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                            className="input-field bg-white"
                                                            placeholder="e.g. How do I reset my password?"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label-text">Answer</label>
                                                        <textarea
                                                            rows={2}
                                                            value={faq.answer}
                                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                            className="input-field bg-white"
                                                            placeholder="Enter the answer here..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contact Info */}
                        {activeTab === 'contact' && (
                            <div className="max-w-xl space-y-6">
                                <label className="label-text text-lg mb-4 block">Support Contact Details</label>

                                <div>
                                    <label className="label-text">Support Email</label>
                                    <input
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                        className="input-field"
                                        placeholder="support@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">Support Phone</label>
                                    <input
                                        value={contact.phone}
                                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">Working Hours</label>
                                    <input
                                        value={contact.hours}
                                        onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                                        className="input-field"
                                        placeholder="Mon-Fri, 9AM - 6PM"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Save Action */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 group-hover:text-teal-400 transition-colors" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ContentManagement;
