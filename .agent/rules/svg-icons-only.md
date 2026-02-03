# Rules: SVG Icons Only - No Emoji in UI

## 1. Icon System Overview

### Nguyên tắc chính
- **KHÔNG sử dụng emoji** (🚀📋📅🔍 etc.) trong UI components
- **CHỈ sử dụng SVG icons** từ file `/src/components/ui/icons.tsx`
- Tất cả icons phải đồng bộ với hệ thống icons chung

### Icon Library Location
```
frontend/src/components/ui/icons.tsx
```

## 2. Usage Rules

### ✅ ĐÚNG - Sử dụng SVG Icons
```tsx
import { CalendarIcon, BriefcaseIcon } from '../../../components/ui/icons';

// Trong component
<CalendarIcon className="w-4 h-4 text-emerald-500" />
<h3 className="flex items-center gap-2">
    <BriefcaseIcon className="w-5 h-5" />
    Tiêu đề
</h3>
```

### ❌ SAI - Không sử dụng emoji
```tsx
// KHÔNG LÀM
<h3>📋 Tiêu đề</h3>
<button>🚀 Gửi</button>
<span>📅 Ngày</span>
```

## 3. Adding New Icons

Khi cần icon mới:

1. **Kiểm tra icons.tsx** xem có icon tương tự không
2. **Thêm icon mới** vào `/src/components/ui/icons.tsx`
3. **Follow format chuẩn**:
```tsx
export const NewIcon = ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="..." />
    </svg>
);
```

## 4. Icon Categories

### Sidebar Icons
- `InboxIcon`, `RecruitingIcon`, `CandidateIcon`, `ReportsIcon`
- `CompanyIcon`, `SettingsIcon`, `HelpIcon`

### Action Icons
- `PlusIcon`, `PencilIcon`, `TrashIcon`, `EyeIcon`
- `CheckIcon`, `SearchIcon`, `FunnelIcon`

### Status/Info Icons
- `CalendarIcon`, `ClockIcon`, `MapPinIcon`
- `BriefcaseIcon`, `DocumentTextIcon`, `ChartBarIcon`

### Communication Icons
- `MessageIcon`, `NotificationIcon`, `InboxIcon`

### Benefits Icons
- `TruckIcon`, `CakeIcon`, `BanknotesIcon`, `GiftIcon`
- `ShirtIcon`, `AcademicCapIcon`, `ShieldCheckIcon`

## 5. Styling Guidelines

### Size Classes
```tsx
// Small (trong text, labels)
className="w-4 h-4"

// Medium (buttons, cards)
className="w-5 h-5"

// Large (headers, empty states)
className="w-6 h-6" hoặc "w-8 h-8"

// Extra Large (empty states, heroes)
className="w-12 h-12" hoặc "w-16 h-16"
```

### Color Classes
```tsx
// Primary accent
className="text-emerald-500"

// Secondary
className="text-teal-500"

// Muted (placeholders)
className="text-slate-400"

// Status colors
className="text-green-500"   // Success
className="text-amber-500"   // Warning
className="text-red-500"     // Error
```

## 6. Checklist

```
[ ] Import icons từ /src/components/ui/icons.tsx
[ ] KHÔNG có emoji trong JSX
[ ] Icons có className với size phù hợp
[ ] Icons có color class phù hợp với context
[ ] New icons được thêm vào icons.tsx trước khi sử dụng
```

## 7. Before Commit

Chạy search để đảm bảo không còn emoji:
```bash
# Tìm emoji trong tsx files
grep -r "[\U0001F300-\U0001F9FF]" --include="*.tsx" src/
```
