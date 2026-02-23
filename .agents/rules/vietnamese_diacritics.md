# Vietnamese Diacritics Rule

**CRITICAL RULE: ALL user-facing text in the application MUST be written with full and correct Vietnamese diacritics (dấu tiếng Việt).**

This applies to ALL files across the project including but not limited to:

## Scope

- **Frontend components** (`.tsx`, `.jsx`): All visible text, labels, placeholders, button text, headings, descriptions, tooltips
- **Backend** (`.php`): All validation messages, flash messages, email content, notification text
- **Blade templates** (`.blade.php`): All rendered text
- **Database seeders** (`.php`): All seeded display text (names, descriptions, etc.)
- **Config files**: Any user-facing strings

## Examples

| WRONG (no diacritics) | CORRECT (full diacritics) |
|---|---|
| Dang nhap | Đăng nhập |
| Mat khau | Mật khẩu |
| Tuyen dung | Tuyển dụng |
| Phong tro | Phòng trọ |
| Chua co tai khoan? | Chưa có tài khoản? |
| Dang ky ngay | Đăng ký ngay |
| Tim kiem | Tìm kiếm |
| Xem tat ca | Xem tất cả |
| Viec lam chat luong | Việc làm chất lượng |
| Quan ly don ung tuyen | Quản lý đơn ứng tuyển |
| Nha tuyen dung | Nhà tuyển dụng |
| Nguoi dung | Người dùng |
| Thong bao | Thông báo |
| Cai dat | Cài đặt |
| Trang chu | Trang chủ |

## Rules

1. **Never commit text without diacritics.** Every Vietnamese string must include its proper tone marks and vowel marks.
2. **Check all new files** before finalizing. Scan for any Vietnamese word missing diacritics.
3. **Common diacritics reference:**
   - Tone marks: sắc (`'`), huyền (`` ` ``), hỏi (`?`), ngã (`~`), nặng (`.`)
   - Vowel marks: ă/â/ơ/ư/ô/ê/đ
4. **Placeholders and variable names** (code-level) can remain in English or ASCII, but any **rendered/displayed text** must have full diacritics.
5. **This rule has NO exceptions.** Even temporary or placeholder text should use correct diacritics if it will be visible to users.
