---
trigger: always_on
glob: frontend/**/*.{tsx,jsx,ts}
description: Quy tắc thiết kế Frontend theo Role - Quản lý (Owner/Admin) và Nhân viên (Member)
---

# Rules: Frontend Role-Based Design

## 1. Role System Overview

### Roles Hierarchy
```typescript
type CompanyRole = 'owner' | 'admin' | 'member';

// Manager = Owner + Admin (quyền quản lý)
// Member = Nhân viên thường
```

### Role Hook Usage
```tsx
import { useCompanyRole } from './features/dashboard/useCompanyRole';

function Component() {
  const { 
    isOwner,      // Chủ doanh nghiệp
    isAdmin,      // Quản trị viên
    isMember,     // Nhân viên
    role,         // 'owner' | 'admin' | 'member' | null
    companyId,
    companyName,
    isLoading,
    hasCompany 
  } = useCompanyRole();
  
  const isManager = isOwner || isAdmin; // Quyền quản lý
}
```

## 2. Page Access Matrix

### Quyền truy cập theo Role

| Trang | Owner | Admin | Member |
|-------|-------|-------|--------|
| Dashboard | AdminDashboard | AdminDashboard | MemberDashboard |
| Inbox/Chat | ✅ Tất cả | ✅ Tất cả | ✅ Chỉ tài khoản được gán |
| Recruiting/Jobs | ✅ CRUD | ✅ CRUD | ✅ View + Apply |
| Candidates | ✅ Tất cả | ✅ Tất cả | ✅ Chỉ phân công |
| Company | ✅ Chỉnh sửa | ✅ View | ✅ View |
| Permissions | ✅ Full | ✅ Limited | ❌ Không truy cập |
| Zalo Accounts | ✅ Tất cả | ✅ Tất cả | ✅ Chỉ được gán |
| Settings | ✅ Full | ✅ Full | ✅ Profile only |

## 3. Component Patterns

### Role-Based Rendering
```tsx
// ✅ Pattern: Conditional rendering theo role
function PageContent() {
  const { isOwner, isAdmin, isMember } = useCompanyRole();
  const isManager = isOwner || isAdmin;

  return (
    <div>
      {/* Chỉ Manager thấy */}
      {isManager && (
        <AdminActionsPanel />
      )}

      {/* Chỉ Owner thấy */}
      {isOwner && (
        <DangerZoneSection />
      )}

      {/* Nội dung cho tất cả */}
      <CommonContent />

      {/* Nội dung riêng Member */}
      {isMember && (
        <MemberOnlySection />
      )}
    </div>
  );
}
```

### Separate Dashboard Components
```tsx
// ✅ Pattern: Tách Dashboard theo role
function DashboardPage() {
  const { isOwner, isAdmin, isLoading, hasCompany } = useCompanyRole();
  const isManager = isOwner || isAdmin;

  if (isLoading) return <LoadingSpinner />;
  if (!hasCompany) return <CreateCompanyPrompt />;

  return isManager ? <AdminDashboard /> : <MemberDashboard />;
}
```

### Button/Action Visibility
```tsx
// ✅ Ẩn action không có quyền
function JobCard({ job }) {
  const { isOwner, isAdmin } = useCompanyRole();
  const canEdit = isOwner || isAdmin;

  return (
    <div>
      <h3>{job.title}</h3>
      
      {canEdit && (
        <>
          <Button onClick={handleEdit}>Sửa</Button>
          <Button onClick={handleDelete} variant="danger">Xóa</Button>
        </>
      )}
      
      {/* Tất cả đều có thể xem chi tiết */}
      <Button onClick={handleView}>Xem chi tiết</Button>
    </div>
  );
}
```

## 4. Data Filtering

### API Response Filtering (Backend handles)
```tsx
// Member chỉ thấy data được phân công
// Backend đã filter sẵn, FE chỉ cần render

function ZaloAccountList() {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    // API tự động filter theo role của user
    const res = await apiClient.get('/zalo-accounts');
    setAccounts(res.data.data); // Đã được filter
  }, []);
}
```

### Client-Side Role Awareness
```tsx
// ✅ UI hint cho member
function DataList({ data }) {
  const { isMember } = useCompanyRole();

  return (
    <div>
      {isMember && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
          💡 Bạn chỉ thấy dữ liệu được phân công cho mình
        </div>
      )}
      
      {data.map(item => <DataItem key={item.id} {...item} />)}
    </div>
  );
}
```

## 5. Navigation/Sidebar

### Role-Based Menu Items
```tsx
const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['owner', 'admin', 'member'] },
  { path: '/inbox', label: 'Inbox', icon: InboxIcon, roles: ['owner', 'admin', 'member'] },
  { path: '/recruiting', label: 'Tuyển dụng', icon: BriefcaseIcon, roles: ['owner', 'admin', 'member'] },
  { path: '/company', label: 'Doanh nghiệp', icon: BuildingIcon, roles: ['owner', 'admin', 'member'] },
  { path: '/permissions', label: 'Phân quyền', icon: ShieldIcon, roles: ['owner', 'admin'] }, // Chỉ Manager
  { path: '/settings', label: 'Cài đặt', icon: SettingsIcon, roles: ['owner', 'admin', 'member'] },
];

function Sidebar() {
  const { role } = useCompanyRole();
  
  const visibleItems = menuItems.filter(item => 
    item.roles.includes(role)
  );
  
  return (
    <nav>
      {visibleItems.map(item => (
        <NavLink key={item.path} to={item.path}>
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

## 6. Protected Routes

### Route-Level Protection
```tsx
// ✅ HOC bảo vệ route theo role
function ManagerRoute({ children }) {
  const { isOwner, isAdmin, isLoading } = useCompanyRole();
  const isManager = isOwner || isAdmin;

  if (isLoading) return <LoadingSpinner />;
  
  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Usage in App.tsx
<Route 
  path="/permissions" 
  element={
    <ProtectedRoute>
      <ManagerRoute>
        <PermissionsPage />
      </ManagerRoute>
    </ProtectedRoute>
  } 
/>
```

## 7. Dashboard Differences

### AdminDashboard (Owner/Admin)
```tsx
// Hiển thị:
// - Thống kê tổng quan công ty
// - Số ứng viên, tin tuyển dụng
// - Danh sách nhân viên và hoạt động
// - Biểu đồ performance
// - Quick actions: Tạo tin, Mời nhân viên, Quản lý Zalo
```

### MemberDashboard (Member)
```tsx
// Hiển thị:
// - Task được giao hôm nay
// - Tin nhắn cần xử lý (từ tài khoản được gán)
// - Lịch phỏng vấn được phân công
// - Thống kê cá nhân (tin nhắn đã xử lý, ứng viên đã liên hệ)
```

## 8. Form/Action Permissions

### Disable/Hide Actions
```tsx
// ✅ Disable nếu không có quyền
function CompanySettings() {
  const { isOwner } = useCompanyRole();

  return (
    <Form>
      <Input 
        name="companyName" 
        disabled={!isOwner}
        placeholder={!isOwner ? "Chỉ chủ doanh nghiệp có thể sửa" : ""}
      />
      
      {isOwner && (
        <Button type="submit">Lưu thay đổi</Button>
      )}
    </Form>
  );
}
```

## 9. Loading States

### Always Check Loading
```tsx
// ✅ BẮT BUỘC: Kiểm tra loading trước khi render role-based content
function RoleBasedComponent() {
  const { isLoading, hasCompany, isOwner } = useCompanyRole();

  // 1. Loading state
  if (isLoading) {
    return <Skeleton />;
  }

  // 2. No company state
  if (!hasCompany) {
    return <CreateCompanyPrompt />;
  }

  // 3. Role-based content
  return isOwner ? <OwnerView /> : <MemberView />;
}
```

## 10. Checklist

```
[ ] useCompanyRole hook được import từ features/dashboard
[ ] isLoading luôn được check trước khi render role-based content
[ ] hasCompany được check cho các trang cần company
[ ] Buttons/Actions có conditional rendering đúng role
[ ] Navigation menu filter theo role
[ ] Protected routes cho trang chỉ Manager
[ ] API calls đã được backend filter theo role
[ ] UI hints cho Member khi cần (dữ liệu giới hạn)
[ ] Tách AdminDashboard và MemberDashboard
[ ] Loading skeleton trong lúc fetch role
```
