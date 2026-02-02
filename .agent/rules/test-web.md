---
trigger: always_on
glob: frontend/**/*.{tsx,jsx,ts,js,css}
description: Quy tắc test web với browser - kiểm tra UI, responsive, và chức năng
---

# Rules: Test Web với Browser Testing

## 1. Browser Testing Protocol

### Khi nào test
- Sau khi hoàn thành bất kỳ thay đổi UI nào
- Trước khi commit code frontend
- Khi có lỗi liên quan đến UI/UX

### Công cụ sử dụng
- Browser subagent để navigate và interact
- Screenshot để verify UI state
- MCP mobile-mcp cho responsive testing

## 2. Test Checklist

### Functional Testing
```
[ ] Navigation hoạt động đúng
[ ] Forms submit và validate đúng
[ ] API calls trả về kết quả mong đợi
[ ] Error handling hiển thị đúng message
[ ] Loading states xuất hiện đúng lúc
```

### Responsive Testing Breakpoints
```
- Mobile:  375px (iPhone SE)
- Tablet:  768px (iPad)
- Desktop: 1024px (Laptop)
- Large:   1440px (Desktop)
```

### UI Elements Check
```
[ ] Buttons có đúng style và hover state
[ ] Typography đúng font-size theo screen
[ ] Colors theo design system
[ ] Spacing consistent
[ ] Images render đúng ratio
```

## 3. Bug Detection Workflow

### Bước 1: Capture screenshot
```
1. Navigate đến page cần test
2. Capture screenshot với browser_subagent
3. So sánh với design mockup
```

### Bước 2: Check logs
```
1. Mở DevTools Console
2. Kiểm tra lỗi JavaScript
3. Kiểm tra Network requests failed
4. Check LocalStorage/SessionStorage state
```

### Bước 3: Document bug
```
- Screenshot của bug
- Console logs
- Steps to reproduce
- Expected vs Actual behavior
```

## 4. Test URLs

```typescript
// Development
const DEV_URL = 'http://localhost:5173';

// Test pages
const TEST_PAGES = [
  '/',                    // Landing page
  '/login',               // Login page
  '/register',            // Register page
  '/company',             // Company dashboard
  '/zalo',                // Zalo integration
];
```

## 5. Responsive Test Commands

```bash
# Resize browser window for testing
# Use browser_subagent với các kích thước:
# Mobile: 375x667
# Tablet: 768x1024
# Desktop: 1440x900
```

## 6. Common Test Scenarios

### Auth Flow
1. Truy cập trang login
2. Nhập credentials
3. Verify redirect đến dashboard
4. Check session persistence

### Form Validation
1. Submit form trống → Check error messages
2. Nhập data không hợp lệ → Check validation
3. Nhập data hợp lệ → Check success state

### API Integration
1. Check loading state during fetch
2. Verify data render đúng
3. Check error handling khi API fail

## 7. Screenshot Naming Convention

```
{page}_{viewport}_{state}_{timestamp}.png

Ví dụ:
- login_mobile_initial_20260202.png
- dashboard_desktop_loaded_20260202.png
- form_tablet_error_20260202.png
```
