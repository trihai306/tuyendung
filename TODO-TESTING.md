# 📋 TODO - Test Tính Năng Dự Án Tuyển Dụng

> Checklist test đầy đủ từng tính năng. Đánh dấu ✅ khi hoàn thành.

---

## 1. 🔐 Authentication (Xác thực) ✅ HOÀN THÀNH

### 1.1 Đăng ký
- [x] Đăng ký tài khoản mới với email/password ✅
- [x] Validate email format ✅
- [x] Validate password strength (min 8 ký tự) ✅
- [ ] Kiểm tra email đã tồn tại (chưa test)
- [ ] Gửi email xác nhận (nếu có) - N/A
- [ ] Đăng ký qua Google OAuth (UI có, chưa test)
- [ ] Đăng ký qua Facebook OAuth (UI có, chưa test)

### 1.2 Đăng nhập
- [x] Đăng nhập với email/password đúng ✅
- [x] Đăng nhập với email/password sai → hiển thị lỗi ✅
- [ ] Đăng nhập qua Google OAuth (UI có, chưa test)
- [ ] Đăng nhập qua Facebook OAuth (UI có, chưa test)
- [ ] Remember me (ghi nhớ đăng nhập) - N/A
- [x] Redirect về trang trước đó sau đăng nhập ✅

### 1.3 Quên mật khẩu
- [x] Gửi email reset password ✅
- [ ] Link reset password hoạt động (cần test email thực)
- [ ] Đặt mật khẩu mới thành công (cần test email thực)
- [ ] Link hết hạn sau X phút (cần test email thực)

### 1.4 Đăng xuất
- [x] Đăng xuất thành công ✅
- [x] Clear session/token ✅
- [x] Redirect về trang login ✅

---

## 2. 👥 Candidates (Ứng viên)

### 2.1 Danh sách ứng viên
- [x] Hiển thị danh sách ứng viên
- [x] Hiển thị thống kê (Tổng số, Hoạt động, Tháng này, Danh sách đen)
- [ ] Phân trang (pagination)
- [ ] Tìm kiếm theo tên/email/SĐT
- [ ] Lọc theo nguồn (Zalo, Thủ công, Import, Giới thiệu)
- [ ] Lọc theo trạng thái (Hoạt động, Lưu trữ, Danh sách đen)

### 2.2 Thêm ứng viên (CREATE)
- [x] Mở modal thêm ứng viên
- [x] Nhập họ tên (bắt buộc)
- [x] Nhập số điện thoại
- [x] Nhập email
- [x] Chọn nguồn
- [x] Nhập tags (phân cách dấu phẩy)
- [x] Nhập ghi chú
- [x] Lưu thành công → cập nhật danh sách
- [ ] Validate form (email format, SĐT format)
- [ ] Hiển thị thông báo thành công

### 2.3 Sửa ứng viên (UPDATE)
- [x] Mở modal sửa với dữ liệu có sẵn
- [ ] Sửa họ tên
- [ ] Sửa số điện thoại
- [ ] Sửa email
- [ ] Thay đổi nguồn
- [ ] Thay đổi trạng thái
- [ ] Sửa tags
- [ ] Sửa ghi chú
- [ ] Lưu thành công → cập nhật danh sách
- [ ] Hiển thị thông báo thành công

### 2.4 Xoá ứng viên (DELETE)
- [x] Hiển thị dialog xác nhận
- [x] Xoá thành công (via API)
- [ ] Cập nhật danh sách sau khi xoá
- [ ] Hiển thị thông báo thành công

### 2.5 Chi tiết ứng viên
- [ ] Xem thông tin chi tiết
- [ ] Xem lịch sử tương tác
- [ ] Xem CV/Resume
- [ ] Đánh giá (rating stars)

### 2.6 Tính năng nâng cao
- [ ] Import ứng viên từ file Excel/CSV
- [ ] Export danh sách ứng viên
- [ ] Gán ứng viên cho nhân viên
- [ ] Bulk actions (xoá nhiều, đổi trạng thái nhiều)

---

## 3. 📬 Inbox (Hộp thư)

### 3.1 Danh sách tin nhắn
- [ ] Hiển thị danh sách conversations
- [ ] Hiển thị số tin nhắn chưa đọc (badge)
- [ ] Tìm kiếm conversation
- [ ] Lọc theo platform (Zalo, etc.)

### 3.2 Chi tiết conversation
- [ ] Hiển thị lịch sử tin nhắn
- [ ] Gửi tin nhắn mới
- [ ] Đánh dấu đã đọc
- [ ] Hiển thị thông tin ứng viên liên kết

### 3.3 Tính năng nâng cao
- [ ] Quick replies (tin nhắn mẫu)
- [ ] Gắn tag conversation
- [ ] Assign conversation cho nhân viên

---

## 4. 💼 Recruiting (Tuyển dụng)

### 4.1 Quản lý Jobs
- [ ] Danh sách jobs
- [ ] Tạo job mới
- [ ] Sửa job
- [ ] Xoá job
- [ ] Đăng/Huỷ đăng job

### 4.2 Chi tiết Job
- [ ] Xem thông tin job
- [ ] Danh sách ứng viên apply
- [ ] Pipeline stages (Kanban)
- [ ] Di chuyển ứng viên giữa stages

### 4.3 Job Alerts
- [ ] Tạo job alert
- [ ] Quản lý job alerts
- [ ] Gửi thông báo tự động

---

## 5. 📅 Calendar (Lịch)

### 5.1 Xem lịch
- [ ] Hiển thị lịch tháng
- [ ] Hiển thị lịch tuần
- [ ] Hiển thị lịch ngày
- [ ] Hiển thị các sự kiện

### 5.2 Quản lý sự kiện
- [ ] Tạo sự kiện mới (phỏng vấn, meeting)
- [ ] Sửa sự kiện
- [ ] Xoá sự kiện
- [ ] Gửi thông báo nhắc nhở

### 5.3 Tích hợp
- [ ] Sync với Google Calendar
- [ ] Gửi lời mời calendar

---

## 6. 📊 Dashboard (Tổng quan)

### 6.1 Thống kê
- [ ] Số ứng viên mới
- [ ] Số tin nhắn chưa đọc
- [ ] Số job đang mở
- [ ] Số phỏng vấn sắp tới

### 6.2 Charts
- [ ] Biểu đồ ứng viên theo thời gian
- [ ] Biểu đồ nguồn ứng viên
- [ ] Biểu đồ conversion rate

### 6.3 Quick Actions
- [ ] Thêm ứng viên nhanh
- [ ] Tạo job nhanh
- [ ] Xem tin nhắn mới

---

## 7. 🏢 Company (Doanh nghiệp)

### 7.1 Thông tin công ty
- [ ] Xem thông tin công ty
- [ ] Cập nhật thông tin công ty
- [ ] Upload logo công ty

### 7.2 Quản lý thành viên
- [ ] Danh sách thành viên
- [ ] Mời thành viên mới
- [ ] Thay đổi vai trò (Owner, Admin, Member)
- [ ] Xoá thành viên

### 7.3 Seats & Subscription
- [ ] Xem số seats hiện tại
- [ ] Mua thêm seats
- [ ] Xem gói subscription
- [ ] Nâng cấp/Hạ cấp gói

---

## 8. 🔗 Zalo Integration

### 8.1 Kết nối Zalo OA
- [ ] Liên kết Zalo OA
- [ ] Hiển thị trạng thái kết nối
- [ ] Huỷ liên kết

### 8.2 Nhận tin nhắn
- [ ] Webhook nhận tin nhắn từ Zalo
- [ ] Tự động tạo ứng viên từ tin nhắn
- [ ] Hiển thị tin nhắn trong Inbox

### 8.3 Gửi tin nhắn
- [ ] Gửi tin nhắn qua Zalo OA
- [ ] Gửi tin nhắn template
- [ ] Gửi hình ảnh/file

---

## 9. 🔒 Permissions (Phân quyền)

### 9.1 Vai trò
- [ ] Xem danh sách vai trò
- [ ] Tạo vai trò mới
- [ ] Sửa quyền của vai trò
- [ ] Xoá vai trò

### 9.2 Phân quyền
- [ ] Gán quyền cho user
- [ ] Kiểm tra quyền truy cập trang
- [ ] Kiểm tra quyền thao tác (CRUD)

---

## 10. ⚙️ Settings (Cài đặt)

### 10.1 Cài đặt tài khoản
- [ ] Đổi thông tin cá nhân
- [ ] Đổi mật khẩu
- [ ] Upload avatar

### 10.2 Cài đặt thông báo
- [ ] Bật/tắt email notifications
- [ ] Bật/tắt push notifications
- [ ] Tuỳ chỉnh loại thông báo

### 10.3 Cài đặt giao diện
- [ ] Đổi theme (Light/Dark)
- [ ] Đổi ngôn ngữ

---

## 11. 🔔 Notifications (Thông báo)

### 11.1 Hiển thị thông báo
- [ ] Danh sách thông báo
- [ ] Badge số thông báo chưa đọc
- [ ] Đánh dấu đã đọc
- [ ] Đánh dấu tất cả đã đọc

### 11.2 Loại thông báo
- [ ] Tin nhắn mới
- [ ] Ứng viên mới
- [ ] Phỏng vấn sắp tới
- [ ] Thông báo hệ thống

---

## 📝 Ghi chú Test

### API Base URL
- Development: `http://localhost:9000/api`
- Frontend: `http://localhost:5201`

### Test Account
- Email: `test@example.com`
- Password: `password123`

### Commands
```bash
# Start Docker
docker-compose up -d

# Start Frontend
cd frontend && npm run dev

# Run migrations
docker exec recruitment_app php artisan migrate

# Check logs
docker logs recruitment_app -f
```

---

**Cập nhật lần cuối:** 2026-02-04
