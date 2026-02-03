/// Task Dashboard Screen
/// Main screen showing task list with stats and filters

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../theme/app_theme.dart';
import '../../data/models/task_model.dart';
import '../../data/providers/task_provider.dart';
import 'task_detail_screen.dart';
import 'task_form_screen.dart';
import '../widgets/task_card.dart';
import '../widgets/stat_card.dart';
import '../widgets/filter_chips.dart';

class TaskDashboardScreen extends ConsumerWidget {
  const TaskDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedFilter = ref.watch(selectedStatusFilterProvider);
    final tasksAsync = selectedFilter == null
        ? ref.watch(tasksProvider)
        : ref.watch(filteredTasksProvider(selectedFilter));
    final statsAsync = ref.watch(taskStatsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Công việc hôm nay'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implement search
            },
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              // TODO: Show options menu
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(tasksProvider);
          ref.invalidate(taskStatsProvider);
        },
        child: CustomScrollView(
          slivers: [
            // Stats Section
            SliverToBoxAdapter(
              child: statsAsync.when(
                data: (stats) => _buildStatsSection(context, stats),
                loading: () => _buildStatsLoading(),
                error: (e, _) => _buildStatsError(e.toString()),
              ),
            ),

            // Filter Chips
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TaskFilterChips(
                  selectedFilter: selectedFilter,
                  onFilterChanged: (filter) {
                    ref.read(selectedStatusFilterProvider.notifier).setFilter(filter);
                  },
                ),
              ),
            ),

            // Section Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Text(
                  'Danh sách công việc',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
              ),
            ),

            // Task List
            tasksAsync.when(
              data: (tasks) => tasks.isEmpty
                  ? SliverFillRemaining(
                      child: _buildEmptyState(context, selectedFilter),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final task = tasks[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: TaskCard(
                                task: task,
                                onTap: () => _openTaskDetail(context, task),
                              ),
                            );
                          },
                          childCount: tasks.length,
                        ),
                      ),
                    ),
              loading: () => SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.primary,
                  ),
                ),
              ),
              error: (e, _) => SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Text('Có lỗi xảy ra: $e'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref.invalidate(tasksProvider),
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom padding
            const SliverToBoxAdapter(
              child: SizedBox(height: 80),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openCreateTask(context),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Giao việc'),
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context, TaskStats stats) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, AppTheme.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Tổng quan nhóm',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: StatCard(
                  value: stats.pending.toString(),
                  label: 'Việc mới',
                  icon: Icons.add_task,
                  color: Colors.white,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StatCard(
                  value: stats.inProgress.toString(),
                  label: 'Đang thực hiện',
                  icon: Icons.pending_actions,
                  color: Colors.white,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StatCard(
                  value: stats.completed.toString(),
                  label: 'Hoàn thành',
                  icon: Icons.check_circle,
                  color: Colors.white,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                ),
              ),
            ],
          ),
          if (stats.overdue > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    '${stats.overdue} việc quá hạn',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatsLoading() {
    return Container(
      margin: const EdgeInsets.all(16),
      height: 140,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  Widget _buildStatsError(String error) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.red[200]!),
      ),
      child: Row(
        children: [
          Icon(Icons.error, color: Colors.red[400]),
          const SizedBox(width: 12),
          Expanded(child: Text('Không thể tải thống kê: $error')),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, TaskStatus? filter) {
    String message;
    IconData icon;
    
    if (filter == null) {
      message = 'Chưa có công việc nào';
      icon = Icons.task_alt;
    } else {
      message = 'Không có công việc ${filter.displayName.toLowerCase()}';
      icon = Icons.search_off;
    }
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _openCreateTask(context),
            icon: const Icon(Icons.add),
            label: const Text('Tạo công việc mới'),
          ),
        ],
      ),
    );
  }

  void _openTaskDetail(BuildContext context, Task task) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TaskDetailScreen(taskId: task.id),
      ),
    );
  }

  void _openCreateTask(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const TaskFormScreen(),
      ),
    );
  }
}
