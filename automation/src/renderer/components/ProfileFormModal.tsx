import React, { useState, useEffect } from 'react';
import { BrowserProfile } from './ProfileCard';

interface ProfileFormModalProps {
    profile: BrowserProfile | null;
    onSave: (data: any) => void;
    onClose: () => void;
}

const VIEWPORTS = [
    { label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
    { label: 'HD (1366×768)', width: 1366, height: 768 },
    { label: 'MacBook (1440×900)', width: 1440, height: 900 },
    { label: 'iPad (1024×768)', width: 1024, height: 768 },
];

const LOCALES = [
    { label: 'Việt Nam', value: 'vi-VN' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'English (UK)', value: 'en-GB' },
    { label: '日本語', value: 'ja-JP' },
    { label: '中文', value: 'zh-CN' },
];

const TIMEZONES = [
    { label: 'Asia/Ho_Chi_Minh (GMT+7)', value: 'Asia/Ho_Chi_Minh' },
    { label: 'Asia/Tokyo (GMT+9)', value: 'Asia/Tokyo' },
    { label: 'America/New_York (GMT-5)', value: 'America/New_York' },
    { label: 'Europe/London (GMT+0)', value: 'Europe/London' },
];

export function ProfileFormModal({ profile, onSave, onClose }: ProfileFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        viewport: { width: 1920, height: 1080 },
        locale: 'vi-VN',
        timezone: 'Asia/Ho_Chi_Minh',
        colorScheme: 'light' as 'light' | 'dark' | 'no-preference',
        userAgent: '',
        proxy: {
            enabled: false,
            server: '',
            username: '',
            password: '',
        },
        notes: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                viewport: profile.viewport || { width: 1920, height: 1080 },
                locale: profile.locale || 'vi-VN',
                timezone: profile.timezone || 'Asia/Ho_Chi_Minh',
                colorScheme: (profile.colorScheme || 'light') as 'light' | 'dark' | 'no-preference',
                userAgent: profile.userAgent || '',
                proxy: profile.proxy
                    ? { enabled: true, server: profile.proxy.server || '', username: profile.proxy.username || '', password: profile.proxy.password || '' }
                    : { enabled: false, server: '', username: '', password: '' },
                notes: profile.notes || '',
            });
        }
    }, [profile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            name: formData.name,
            viewport: formData.viewport,
            locale: formData.locale,
            timezone: formData.timezone,
            colorScheme: formData.colorScheme,
            userAgent: formData.userAgent || undefined,
            proxy: formData.proxy.enabled && formData.proxy.server
                ? {
                    server: formData.proxy.server,
                    username: formData.proxy.username || undefined,
                    password: formData.proxy.password || undefined,
                }
                : undefined,
            notes: formData.notes || undefined,
        };

        onSave(data);
    };

    const handleViewportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [width, height] = e.target.value.split('x').map(Number);
        setFormData(prev => ({ ...prev, viewport: { width, height } }));
    };

    const inputClass = "w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-dim)] transition-all text-sm";
    const selectClass = "w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-dim)] text-sm";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        {profile ? 'Edit Profile' : 'New Profile'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-[var(--text-ghost)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="form-label">Profile Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Facebook Account #1"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Viewport & Locale */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Viewport</label>
                                <select
                                    value={`${formData.viewport.width}x${formData.viewport.height}`}
                                    onChange={handleViewportChange}
                                    className={selectClass}
                                >
                                    {VIEWPORTS.map(v => (
                                        <option key={`${v.width}x${v.height}`} value={`${v.width}x${v.height}`}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Locale</label>
                                <select
                                    value={formData.locale}
                                    onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                                    className={selectClass}
                                >
                                    {LOCALES.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Timezone & Color Scheme */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Timezone</label>
                                <select
                                    value={formData.timezone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                                    className={selectClass}
                                >
                                    {TIMEZONES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Color Scheme</label>
                                <select
                                    value={formData.colorScheme}
                                    onChange={(e) => setFormData(prev => ({ ...prev, colorScheme: e.target.value as any }))}
                                    className={selectClass}
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="no-preference">No preference</option>
                                </select>
                            </div>
                        </div>

                        {/* User Agent */}
                        <div>
                            <label className="form-label">User Agent (optional)</label>
                            <input
                                type="text"
                                value={formData.userAgent}
                                onChange={(e) => setFormData(prev => ({ ...prev, userAgent: e.target.value }))}
                                placeholder="Leave empty for default Chrome UA"
                                className={inputClass}
                            />
                        </div>

                        {/* Proxy */}
                        <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.proxy.enabled}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        proxy: { ...prev.proxy, enabled: e.target.checked }
                                    }))}
                                    className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] bg-[var(--bg-elevated)]"
                                />
                                <span className="text-sm text-[var(--text-primary)] font-medium">Use Proxy</span>
                            </label>

                            {formData.proxy.enabled && (
                                <div className="mt-4 space-y-3">
                                    <input
                                        type="text"
                                        value={formData.proxy.server}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            proxy: { ...prev.proxy, server: e.target.value }
                                        }))}
                                        placeholder="http://proxy:port or socks5://proxy:port"
                                        className={inputClass}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={formData.proxy.username}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                proxy: { ...prev.proxy, username: e.target.value }
                                            }))}
                                            placeholder="Username (optional)"
                                            className={inputClass}
                                        />
                                        <input
                                            type="password"
                                            value={formData.proxy.password}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                proxy: { ...prev.proxy, password: e.target.value }
                                            }))}
                                            placeholder="Password (optional)"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="form-label">Notes (optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add any notes about this profile..."
                                rows={3}
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex justify-end gap-3 bg-[var(--bg-elevated)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary"
                    >
                        {profile ? 'Save Changes' : 'Create Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
}
