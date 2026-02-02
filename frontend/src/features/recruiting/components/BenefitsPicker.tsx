import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
    TruckIcon,
    CakeIcon,
    BanknotesIcon,
    CurrencyDollarIcon,
    ShirtIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    BuildingOffice2Icon,
    DevicePhoneMobileIcon,
    GiftIcon,
    SparklesIcon,
    CheckIcon,
} from '../../../components/ui/icons';

export interface Benefit {
    id: string;
    iconId: string;
    name: string;
    selected: boolean;
    hasDetails?: boolean;
    details?: ShuttleDetails | string;
}

export interface ShuttleDetails {
    pickupPoint: string;
    pickupTime: string;
}

interface BenefitsPickerProps {
    benefits: Benefit[];
    onChange: (benefits: Benefit[]) => void;
}

// Icon mapping
const iconMap: Record<string, (props: { className?: string }) => ReactNode> = {
    shuttle: TruckIcon,
    meals: CakeIcon,
    tips: CurrencyDollarIcon,
    instant_pay: BanknotesIcon,
    uniform: ShirtIcon,
    training: AcademicCapIcon,
    insurance: ShieldCheckIcon,
    housing: BuildingOffice2Icon,
    phone: DevicePhoneMobileIcon,
    bonus: GiftIcon,
    custom: SparklesIcon,
};

const defaultBenefitsList: Omit<Benefit, 'selected'>[] = [
    { id: 'shuttle', iconId: 'shuttle', name: 'Xe đưa đón', hasDetails: true },
    { id: 'meals', iconId: 'meals', name: 'Bao ăn ca' },
    { id: 'tips', iconId: 'tips', name: 'Có tip' },
    { id: 'instant_pay', iconId: 'instant_pay', name: 'Thanh toán ngay' },
    { id: 'uniform', iconId: 'uniform', name: 'Có đồng phục' },
    { id: 'training', iconId: 'training', name: 'Đào tạo trước' },
    { id: 'insurance', iconId: 'insurance', name: 'Bảo hiểm' },
    { id: 'housing', iconId: 'housing', name: 'Hỗ trợ chỗ ở' },
    { id: 'phone', iconId: 'phone', name: 'Hỗ trợ điện thoại' },
    { id: 'bonus', iconId: 'bonus', name: 'Thưởng thêm' },
];

export function BenefitsPicker({ benefits, onChange }: BenefitsPickerProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [customBenefit, setCustomBenefit] = useState('');

    // Initialize benefits if empty
    const currentBenefits = benefits.length > 0
        ? benefits
        : defaultBenefitsList.map(b => ({ ...b, selected: false }));

    const toggleBenefit = (id: string) => {
        const updated = currentBenefits.map(b =>
            b.id === id ? { ...b, selected: !b.selected } : b
        );
        onChange(updated);
    };

    const updateShuttleDetails = (field: keyof ShuttleDetails, value: string) => {
        const updated = currentBenefits.map(b => {
            if (b.id === 'shuttle') {
                const currentDetails = (b.details as ShuttleDetails) || { pickupPoint: '', pickupTime: '' };
                return {
                    ...b,
                    details: { ...currentDetails, [field]: value }
                };
            }
            return b;
        });
        onChange(updated);
    };

    const addCustomBenefit = () => {
        if (!customBenefit.trim()) return;
        const newBenefit: Benefit = {
            id: `custom_${Date.now()}`,
            iconId: 'custom',
            name: customBenefit.trim(),
            selected: true,
        };
        onChange([...currentBenefits, newBenefit]);
        setCustomBenefit('');
    };

    const renderIcon = (iconId: string, className?: string) => {
        const IconComponent = iconMap[iconId] || SparklesIcon;
        return <IconComponent className={className || "w-4 h-4"} />;
    };

    const shuttleBenefit = currentBenefits.find(b => b.id === 'shuttle');
    const shuttleDetails = (shuttleBenefit?.details as ShuttleDetails) || { pickupPoint: '', pickupTime: '' };

    return (
        <div className="space-y-4">
            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <GiftIcon className="w-4 h-4" />
                Phúc lợi & Hỗ trợ
            </label>

            {/* Benefits Grid */}
            <div className="flex flex-wrap gap-2">
                {currentBenefits.map((benefit) => (
                    <button
                        key={benefit.id}
                        type="button"
                        onClick={() => toggleBenefit(benefit.id)}
                        className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                            ${benefit.selected
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : isDark
                                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }
                        `}
                    >
                        {renderIcon(benefit.iconId, "w-4 h-4")}
                        <span>{benefit.name}</span>
                        {benefit.selected && (
                            <CheckIcon className="w-3.5 h-3.5 ml-0.5" />
                        )}
                    </button>
                ))}
            </div>

            {/* Shuttle Details - Show when selected */}
            {shuttleBenefit?.selected && (
                <div className={`
                    p-4 rounded-xl border-2 border-dashed space-y-3
                    ${isDark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}
                `}>
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <TruckIcon className="w-5 h-5" />
                        Chi tiết xe đưa đón
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Điểm đón
                            </label>
                            <input
                                type="text"
                                value={shuttleDetails.pickupPoint}
                                onChange={(e) => updateShuttleDetails('pickupPoint', e.target.value)}
                                placeholder="VD: Bến xe Miền Đông, Q.9"
                                className={`
                                    w-full px-3 py-2 rounded-lg text-sm
                                    ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                        : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                                    }
                                    border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                                `}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Giờ đón
                            </label>
                            <input
                                type="time"
                                value={shuttleDetails.pickupTime}
                                onChange={(e) => updateShuttleDetails('pickupTime', e.target.value)}
                                className={`
                                    w-full px-3 py-2 rounded-lg text-sm
                                    ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-800'
                                    }
                                    border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                                `}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Add Custom Benefit */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={customBenefit}
                    onChange={(e) => setCustomBenefit(e.target.value)}
                    placeholder="Thêm phúc lợi khác..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())}
                    className={`
                        flex-1 px-3 py-2 rounded-lg text-sm
                        ${isDark
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                        }
                        border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                    `}
                />
                <button
                    type="button"
                    onClick={addCustomBenefit}
                    disabled={!customBenefit.trim()}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${customBenefit.trim()
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : isDark
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    + Thêm
                </button>
            </div>
        </div>
    );
}
