/// Task Detail Screen
/// Screen showing task details, progress, activity timeline, and comments

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../theme/app_theme.dart';
import '../../data/models/task_model.dart';
import '../../data/providers/task_provider.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  final String taskId;

  const TaskDetailScreen({super.key, required this.taskId});

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  final _commentController = TextEditingController();
  double _sliderValue = 0;
  bool _isUpdatingProgress = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final taskAsync = ref.watch(taskByIdProvider(widget.taskId));
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết công việc'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {
              // TODO: Navigate to edit
            },
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () => _showOptionsMenu(context),
          ),
        ],
      ),
      body: taskAsync.when(
        data: (task) {
          if (task == null) {
            return const Center(
              child: Text('Không tìm thấy công việc'),
            );
          }
          return _buildContent(context, task, isDark);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text('Có lỗi xảy ra: $e'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(taskByIdProvider(widget.taskId)),
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: taskAsync.maybeWhen(
        data: (task) => task != null ? _buildBottomBar(context, task, isDark) : null,
        orElse: () => null,
      ),
    );
  }

  Widget _buildContent(BuildContext context, Task task, bool isDark) {
    // Update slider value when task changes
    if (!_isUpdatingProgress) {
      _sliderValue = task.progress.toDouble();
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(taskByIdProvider(widget.taskId));
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title and Status Badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                _buildStatusBadge(task.status),
              ],
            ),

            const SizedBox(height: 20),

            // Task Info Card
            _buildInfoCard(context, task, isDark),

            const SizedBox(height: 20),

            // Progress Section
            _buildProgressSection(context, task, isDark),

            const SizedBox(height: 20),

            // Description
            if (task.description != null && task.description!.isNotEmpty) ...[
              _buildSectionHeader('Mô tả'),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? AppTheme.borderDark : AppTheme.border,
                  ),
                ),
                child: Text(
                  task.description!,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.5,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Activity Timeline
            _buildSectionHeader('Cập nhật & Hoạt động'),
            const SizedBox(height: 12),
            _buildActivityTimeline(context, task, isDark),

            const SizedBox(height: 100), // Space for bottom bar
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(TaskStatus status) {
    Color bgColor;
    Color textColor;
    
    switch (status) {
      case TaskStatus.pending:
        bgColor = Colors.grey.withValues(alpha: 0.2);
        textColor = Colors.grey[700]!;
        break;
      case TaskStatus.inProgress:
        bgColor = Colors.blue.withValues(alpha: 0.2);
        textColor = Colors.blue[700]!;
        break;
      case TaskStatus.completed:
        bgColor = Colors.green.withValues(alpha: 0.2);
        textColor = Colors.green[700]!;
        break;
      case TaskStatus.overdue:
        bgColor = Colors.red.withValues(alpha: 0.2);
        textColor = Colors.red[700]!;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, Task task, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.border,
        ),
      ),
      child: Column(
        children: [
          _buildInfoRow(
            icon: Icons.person_outline,
            label: 'Người giao',
            value: task.assignedBy.name,
            avatarUrl: task.assignedBy.avatarUrl,
            isDark: isDark,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            icon: Icons.person,
            label: 'Người nhận',
            value: task.assignedTo.name,
            avatarUrl: task.assignedTo.avatarUrl,
            isDark: isDark,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            icon: Icons.access_time,
            label: 'Hạn',
            value: DateFormat('dd/MM/yyyy, HH:mm').format(task.dueDate),
            isDark: isDark,
            isOverdue: task.isOverdue,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            icon: Icons.flag_outlined,
            label: 'Độ ưu tiên',
            value: task.priority.displayName,
            valueColor: _getPriorityColor(task.priority),
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    String? avatarUrl,
    Color? valueColor,
    bool isDark = false,
    bool isOverdue = false,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  if (avatarUrl != null) ...[
                    CircleAvatar(
                      radius: 12,
                      backgroundImage: NetworkImage(avatarUrl),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: Text(
                      value,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: isOverdue
                            ? Colors.red
                            : (valueColor ??
                                (isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildProgressSection(BuildContext context, Task task, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tiến độ công việc',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_sliderValue.round()}%',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: AppTheme.primary,
              inactiveTrackColor: AppTheme.primary.withValues(alpha: 0.2),
              thumbColor: AppTheme.primary,
              overlayColor: AppTheme.primary.withValues(alpha: 0.1),
              trackHeight: 8,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12),
            ),
            child: Slider(
              value: _sliderValue,
              min: 0,
              max: 100,
              divisions: 20,
              onChanged: task.status == TaskStatus.completed
                  ? null
                  : (value) {
                      setState(() {
                        _sliderValue = value;
                        _isUpdatingProgress = true;
                      });
                    },
              onChangeEnd: (value) async {
                final success = await ref
                    .read(taskActionsProvider.notifier)
                    .updateProgress(task.id, value.round());
                
                setState(() => _isUpdatingProgress = false);
                
                if (!success && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Không thể cập nhật tiến độ'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: Theme.of(context).colorScheme.onSurface,
      ),
    );
  }

  Widget _buildActivityTimeline(BuildContext context, Task task, bool isDark) {
    if (task.activities.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppTheme.borderDark : AppTheme.border,
          ),
        ),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.history, size: 40, color: Colors.grey[400]),
              const SizedBox(height: 8),
              Text(
                'Chưa có hoạt động nào',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.border,
        ),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: task.activities.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final activity = task.activities[index];
          return _buildActivityItem(activity, isDark);
        },
      ),
    );
  }

  Widget _buildActivityItem(TaskActivity activity, bool isDark) {
    IconData icon;
    Color iconColor;
    
    switch (activity.type) {
      case 'progress_update':
        icon = Icons.trending_up;
        iconColor = AppTheme.primary;
        break;
      case 'comment':
        icon = Icons.chat_bubble_outline;
        iconColor = Colors.blue;
        break;
      case 'status_change':
        icon = Icons.swap_horiz;
        iconColor = Colors.orange;
        break;
      default:
        icon = Icons.info_outline;
        iconColor = Colors.grey;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 16, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                DateFormat('HH:mm, dd/MM/yyyy').format(activity.createdAt),
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                  ),
                  children: [
                    TextSpan(
                      text: activity.user.name,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    TextSpan(
                      text: activity.type == 'comment'
                          ? ' đã comment: '
                          : activity.type == 'progress_update'
                              ? ' đã '
                              : ' đã ',
                    ),
                    TextSpan(
                      text: activity.description,
                      style: activity.type == 'comment'
                          ? const TextStyle(fontStyle: FontStyle.italic)
                          : null,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context, Task task, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : AppTheme.surface,
        border: Border(
          top: BorderSide(
            color: isDark ? AppTheme.borderDark : AppTheme.border,
          ),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Comment Input
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: 'Viết bình luận...',
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(
                          color: isDark ? AppTheme.borderDark : AppTheme.border,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(
                          color: isDark ? AppTheme.borderDark : AppTheme.border,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: () => _submitComment(task.id),
                  icon: const Icon(Icons.send),
                  style: IconButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: task.status == TaskStatus.completed
                        ? null
                        : () => _markAsCompleted(task.id),
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text('Hoàn thành'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.green,
                      side: const BorderSide(color: Colors.green),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Navigate to edit screen
                    },
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Chỉnh sửa'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getPriorityColor(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.high:
        return Colors.red;
      case TaskPriority.medium:
        return Colors.amber[700]!;
      case TaskPriority.low:
        return Colors.green;
    }
  }

  void _showOptionsMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.share_outlined),
              title: const Text('Chia sẻ'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.content_copy),
              title: const Text('Sao chép liên kết'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('Xóa', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(context);
                _confirmDelete();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa công việc?'),
        content: const Text('Bạn có chắc muốn xóa công việc này? Hành động này không thể hoàn tác.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await ref
                  .read(taskActionsProvider.notifier)
                  .deleteTask(widget.taskId);
              
              if (mounted) {
                if (success) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã xóa công việc')),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Không thể xóa công việc'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitComment(String taskId) async {
    final content = _commentController.text.trim();
    if (content.isEmpty) return;

    final success = await ref
        .read(taskActionsProvider.notifier)
        .addComment(taskId, content);

    if (mounted) {
      if (success) {
        _commentController.clear();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Không thể gửi bình luận'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _markAsCompleted(String taskId) async {
    final success = await ref
        .read(taskActionsProvider.notifier)
        .updateStatus(taskId, TaskStatus.completed);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã đánh dấu hoàn thành'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Không thể cập nhật trạng thái'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
