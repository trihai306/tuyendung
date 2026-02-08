---
description: Frontend phải dùng shared UI components, không dùng raw HTML/native API
---

# Rules: UI Component Standards

## Bắt buộc dùng shared components

Tất cả code frontend trong `frontend/src/features/` **PHẢI** import và sử dụng shared components từ `components/ui/` thay vì viết raw HTML hoặc dùng native browser API.

### Import

```tsx
import { Button, Input, Textarea, Select, Modal, ConfirmModal, useToast, Badge, Tooltip, Dropdown, EmptyState, Skeleton, Avatar, AvatarGroup } from '../../components/ui';
```

### ❌ CẤM sử dụng

| Cấm | Thay bằng |
|-----|-----------|
| `alert('...')` | `toast.success()` / `toast.error()` |
| `window.confirm('...')` | `<ConfirmModal />` |
| Raw `<input>` với class inline | `<Input />` |
| Raw `<textarea>` với class inline | `<Textarea />` |
| Raw `<select>` với class inline | `<Select />` |
| Tự build empty state | `<EmptyState />` |
| Tự build skeleton loader | `<Skeleton />` / `<Skeleton.Card />` |
| Tự build badge/tag status | `<Badge variant="..." />` |
| Tự build modal từ đầu | `<Modal />` hoặc `<ConfirmModal />` |
| Tự build tooltip | `<Tooltip content="..." />` |
| Tự build dropdown menu | `<Dropdown items={[...]} />` |

### ✅ Ví dụ đúng

```tsx
// Toast thay alert
const { toast } = useToast();
toast.success('Đã lưu thành công');
toast.error('Lỗi: Không thể kết nối');

// ConfirmModal thay window.confirm
const [showConfirm, setShowConfirm] = useState(false);
<ConfirmModal
    isOpen={showConfirm}
    onClose={() => setShowConfirm(false)}
    onConfirm={handleDelete}
    title="Xác nhận xóa"
    message="Bạn có chắc muốn xóa?"
    variant="danger"
/>

// Input với dark mode tự động
<Input label="Email" icon={<MailIcon />} error={errors.email} />
<Select label="Ngành" options={categories} />
<Textarea label="Mô tả" rows={4} />
```

### Checklist khi code

```
[ ] Không có alert() trong code mới
[ ] Không có window.confirm() trong code mới
[ ] Input/Select/Textarea dùng component, không viết raw
[ ] Button dùng component <Button variant="..." />
[ ] Loading dùng <Skeleton /> hoặc <Skeleton.Card />
[ ] Empty state dùng <EmptyState />
[ ] Status badges dùng <Badge />
```
