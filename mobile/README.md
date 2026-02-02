# Tuyển dụng thời vụ - Mobile App

Ứng dụng di động Flutter cho nền tảng tuyển dụng thời vụ.

## Yêu cầu

- Flutter SDK >= 3.0.0
- Dart >= 3.0.0
- Android Studio / Xcode

## Cài đặt Flutter

### macOS
```bash
# Sử dụng Homebrew
brew install flutter

# Hoặc download từ flutter.dev
# https://docs.flutter.dev/get-started/install/macos
```

### Kiểm tra cài đặt
```bash
flutter doctor
```

## Chạy ứng dụng

### 1. Cài đặt dependencies
```bash
cd mobile
flutter pub get
```

### 2. Chạy trên simulator/emulator
```bash
# iOS Simulator
flutter run -d ios

# Android Emulator
flutter run -d android

# Tất cả thiết bị
flutter run
```

### 3. Build APK (Android)
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### 4. Build iOS
```bash
flutter build ios --release
# Mở Xcode để archive và upload App Store
```

## Cấu trúc thư mục

```
mobile/
├── lib/
│   ├── main.dart              # Entry point
│   ├── screens/               # UI Screens
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   └── home_screen.dart
│   ├── widgets/               # Reusable widgets
│   ├── services/              # API & business logic
│   │   ├── api_service.dart
│   │   └── auth_service.dart
│   ├── models/                # Data models
│   ├── providers/             # State management
│   ├── theme/                 # Theme & styling
│   │   └── app_theme.dart
│   └── utils/                 # Utilities
├── assets/
│   ├── images/
│   └── fonts/
├── android/                   # Android native code
├── ios/                       # iOS native code
└── pubspec.yaml              # Dependencies
```

## API Configuration

Cập nhật `baseUrl` trong `lib/services/api_service.dart`:

```dart
// Development
static const String baseUrl = 'http://localhost:8000/api';

// Production
static const String baseUrl = 'https://api.tuyendungthoivu.vn/api';
```

## Tính năng

- ✅ Splash screen với animation
- ✅ Login/Register
- ✅ Home với job listing
- ✅ Dark mode support
- ✅ API integration
- 🔲 Push notifications
- 🔲 Chat/Messaging
- 🔲 Job search & filter
- 🔲 Profile management

## Design System

- **Primary Color**: #10B981 (Emerald)
- **Secondary Color**: #14B8A6 (Teal)
- **Font**: Inter

Theme giống với frontend web để đảm bảo consistency.
