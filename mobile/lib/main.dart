import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'package:provider/provider.dart' as provider_pkg;
import 'features/tasks/tasks.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set status bar style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(const ProviderScope(child: TuyenDungApp()));
}

class TuyenDungApp extends StatelessWidget {
  const TuyenDungApp({super.key});

  @override
  Widget build(BuildContext context) {
    return provider_pkg.MultiProvider(
      providers: [
        provider_pkg.Provider<ApiService>(create: (_) => ApiService()),
        provider_pkg.ChangeNotifierProvider<AuthService>(
          create: (context) => AuthService(context.read<ApiService>()),
        ),
      ],
      child: MaterialApp(
        title: 'Tuyển dụng thời vụ',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/home': (context) => const HomeScreen(),
          '/tasks': (context) => const TaskDashboardScreen(),
          '/tasks/manager': (context) => const ManagerDashboardScreen(),
        },
      ),
    );
  }
}
