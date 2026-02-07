---
trigger: always_on
glob: mobile/**/*.dart
description: Flutter Mobile Development Standards - Responsive design và code patterns cho Viecly mobile app
---

# Rules: Flutter Mobile Development Standards

## 1. Cấu trúc thư mục

```
mobile/lib/
├── core/
│   ├── constants/        # app_colors.dart, app_strings.dart, api_endpoints.dart
│   ├── theme/            # app_theme.dart
│   ├── network/          # api_client.dart
│   └── permissions/      # permissions.dart
├── features/             # auth/, home/, tasks/, management/
├── services/             # Shared services
├── widgets/              # Reusable widgets
└── main.dart
```

## 2. Responsive Design

### ResponsiveHelper & Breakpoints
```dart
class ResponsiveHelper {
  static double screenWidth(BuildContext context) => MediaQuery.of(context).size.width;
  static bool isMobile(BuildContext context) => screenWidth(context) < 600;
  static bool isTablet(BuildContext context) => screenWidth(context) >= 600 && screenWidth(context) < 900;
  static bool isDesktop(BuildContext context) => screenWidth(context) >= 900;
}

// ✅ LayoutBuilder cho responsive
Widget build(BuildContext context) {
  return LayoutBuilder(builder: (context, constraints) {
    if (constraints.maxWidth < 600) return _buildMobileLayout();
    if (constraints.maxWidth < 900) return _buildTabletLayout();
    return _buildDesktopLayout();
  });
}

// ✅ Flexible: Row(children: [Expanded(flex: 2, child: Left()), Expanded(flex: 3, child: Right())])
```

### AppSpacing & AppTextStyles
```dart
class AppSpacing {
  static EdgeInsets screenPadding(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    if (w < 600) return const EdgeInsets.all(16);
    if (w < 900) return const EdgeInsets.all(24);
    return const EdgeInsets.all(32);
  }
  static const double xs = 4, sm = 8, md = 16, lg = 24, xl = 32, xxl = 48;
}

class AppTextStyles {
  static TextStyle heading1(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    return TextStyle(fontSize: w < 600 ? 24 : (w < 900 ? 28 : 32), fontWeight: FontWeight.bold);
  }
  static TextStyle body(BuildContext context) =>
    TextStyle(fontSize: MediaQuery.of(context).size.width < 600 ? 14 : 16);
}
```

## 3. Widget Templates

### StatelessWidget
```dart
class MyWidget extends StatelessWidget {
  const MyWidget({super.key, required this.title, this.onTap});
  final String title;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface, borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Text(title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w500)),
      ),
    );
  }
}
```

### StatefulWidget (with async pattern)
```dart
class _MyWidgetState extends State<MyWidget> {
  bool _isLoading = false;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try { /* Load data */ }
    finally { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    return Container();
  }
}
```

## 4. Screen Template

```dart
class _MyScreenState extends State<MyScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Tiêu đề'), actions: [IconButton(icon: const Icon(Icons.settings), onPressed: () {})]),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _onRefresh,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: AppSpacing.screenPadding(context),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_buildHeader(), const SizedBox(height: 24), _buildContent()]),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(onPressed: () {}, child: const Icon(Icons.add)),
    );
  }
  Widget _buildHeader() => const SizedBox.shrink();
  Widget _buildContent() => const SizedBox.shrink();
  Future<void> _onRefresh() async {}
}
```

## 5. Button Styles

```dart
// Primary
ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(
  backgroundColor: AppColors.primary, foregroundColor: Colors.white,
  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
), child: const Text('Primary'))

// Outline
OutlinedButton(onPressed: () {}, style: OutlinedButton.styleFrom(
  foregroundColor: AppColors.primary, side: const BorderSide(color: AppColors.primary),
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
), child: const Text('Outline'))

// Full-width: SizedBox(width: double.infinity, child: ElevatedButton(...))
```

## 6. Form Patterns

```dart
// TextField với decoration chuẩn
TextFormField(
  controller: _controller,
  decoration: InputDecoration(
    labelText: 'Email', hintText: 'Nhập email',
    prefixIcon: const Icon(Icons.email_outlined),
    filled: true, fillColor: AppColors.surfaceVariant,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
  ),
  validator: (v) => (v == null || v.isEmpty) ? 'Không được để trống' : (!v.contains('@') ? 'Email không hợp lệ' : null),
)

// Form validation pattern
class _MyFormState extends State<MyForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();

  @override void dispose() { _emailCtrl.dispose(); super.dispose(); }
  void _submit() { if (_formKey.currentState!.validate()) { /* proceed */ } }

  @override
  Widget build(BuildContext context) => Form(key: _formKey, child: Column(children: [
    TextFormField(controller: _emailCtrl),
    const SizedBox(height: 24),
    ElevatedButton(onPressed: _submit, child: const Text('Submit')),
  ]));
}
```

## 7. Card & ListView Patterns

```dart
// Standard Card
Card(elevation: 0, shape: RoundedRectangleBorder(
  borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.border)),
  child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text('Title', style: Theme.of(context).textTheme.titleMedium),
    const SizedBox(height: 8),
    Text('Desc', style: TextStyle(color: AppColors.textSecondary)),
])))

// Tappable Card: InkWell(onTap: (){}, borderRadius: ..., child: Container(decoration: BoxDecoration(...)))

// ListView with states
if (isLoading) return const Center(child: CircularProgressIndicator());
if (items.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
  Icon(Icons.inbox_outlined, size: 64, color: AppColors.textTertiary),
  const SizedBox(height: 16),
  Text('Không có dữ liệu', style: TextStyle(color: AppColors.textSecondary)),
]));
return ListView.separated(padding: const EdgeInsets.all(16), itemCount: items.length,
  separatorBuilder: (_, __) => const SizedBox(height: 12),
  itemBuilder: (context, i) => ItemCard(item: items[i]));
```

## 8. Navigation

```dart
Navigator.push(context, MaterialPageRoute(builder: (_) => const NextScreen()));
Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const NextScreen()));
Navigator.pop(context);
Navigator.popUntil(context, (route) => route.isFirst);

// Named Routes
MaterialApp(routes: {'/': (_) => const SplashScreen(), '/login': (_) => const LoginScreen(), '/home': (_) => const HomeScreen()})
Navigator.pushNamed(context, '/home');
```

## 9. API Calls

```dart
class ApiService {
  final Dio _dio;
  ApiService(this._dio);

  Future<List<Job>> getJobs() async {
    try {
      final res = await _dio.get('/api/jobs');
      if (res.data['success'] == true) return (res.data['data'] as List).map((j) => Job.fromJson(j)).toList();
      throw ApiException(res.data['error']['message']);
    } on DioException catch (e) { throw ApiException(e.message ?? 'Network error'); }
  }
}

// Widget usage
Future<void> _loadJobs() async {
  setState(() => _isLoading = true);
  try { _jobs = await apiService.getJobs(); setState(() {}); }
  catch (e) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()))); }
  finally { if (mounted) setState(() => _isLoading = false); }
}
```

## 10. Coding Conventions

```dart
// Classes: PascalCase | Files: snake_case | Vars/Functions: camelCase | Private: _prefix
// Constants: camelCase hoặc SCREAMING_SNAKE_CASE

// Import Order: 1.dart:* → 2.package:flutter/* → 3.package:third_party/* → 4.project imports

// ✅ Tách widget nhỏ: _buildHeader(), _buildBody(), _buildFooter()
// ❌ SAI: Widget quá lớn không tách
```

## Checklist

```
[ ] const cho widget không thay đổi
[ ] Dispose controllers trong StatefulWidget
[ ] Check mounted trước setState trong async
[ ] SafeArea cho edge-to-edge screens
[ ] Responsive padding và text size
[ ] Handle loading, empty, error states
[ ] Form validation đúng cách
[ ] Colors từ AppColors, spacing từ AppSpacing
[ ] Proper import order
```
