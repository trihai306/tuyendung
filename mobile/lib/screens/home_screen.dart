import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../features/tasks/tasks.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tuyển dụng thời vụ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Trang chủ',
          ),
          NavigationDestination(
            icon: Icon(Icons.work_outline),
            selectedIcon: Icon(Icons.work),
            label: 'Việc làm',
          ),
          NavigationDestination(
            icon: Icon(Icons.task_outlined),
            selectedIcon: Icon(Icons.task),
            label: 'Công việc',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_outlined),
            selectedIcon: Icon(Icons.chat),
            label: 'Tin nhắn',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu),
            label: 'Menu',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return _buildJobsTab();
      case 2:
        return const TaskDashboardScreen();
      case 3:
        return _buildMessagesTab();
      case 4:
        return _buildMenuTab();
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildHomeTab() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, AppTheme.secondary],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Xin chào! 👋',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Tìm việc làm thời vụ phù hợp với bạn',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const TextField(
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm việc làm...',
                      border: InputBorder.none,
                      icon: Icon(Icons.search, color: AppTheme.textSecondary),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Stats
          Row(
            children: [
              _buildStatCard('12', 'Việc đã ứng tuyển', Icons.send, Colors.blue),
              const SizedBox(width: 12),
              _buildStatCard('3', 'Đang chờ phỏng vấn', Icons.schedule, Colors.orange),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Recent Jobs Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Việc làm mới nhất',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {},
                child: const Text('Xem tất cả'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          // Job Cards
          ...List.generate(3, (index) => _buildJobCard(index)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String value, String label, IconData icon, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppTheme.borderDark : AppTheme.border,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobCard(int index) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final jobs = [
      {'title': 'Nhân viên phục vụ', 'company': 'Nhà hàng ABC', 'salary': '150k/giờ', 'location': 'Quận 1'},
      {'title': 'PG sự kiện', 'company': 'Event Pro', 'salary': '200k/giờ', 'location': 'Quận 7'},
      {'title': 'Shipper', 'company': 'Grab Express', 'salary': '5tr/tháng', 'location': 'Toàn TP.HCM'},
    ];
    final job = jobs[index];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.border,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.business, color: AppTheme.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job['title']!,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  job['company']!,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildTag(job['salary']!, AppTheme.primary),
                    const SizedBox(width: 8),
                    _buildTag(job['location']!, Colors.blue),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  Widget _buildJobsTab() {
    return const Center(child: Text('Việc làm'));
  }

  Widget _buildMessagesTab() {
    return const Center(child: Text('Tin nhắn'));
  }

  Widget _buildMenuTab() {
    return const Center(child: Text('Menu'));
  }
}
