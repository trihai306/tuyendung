/// Task Card Widget
/// Reusable card component for displaying task in list

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/task_model.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback? onTap;

  const TaskCard({
    super.key,
    required this.task,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: isDark ? AppColors.surfaceDark : AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title and Priority
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      task.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildPriorityBadge(task.priority),
                ],
              ),

              const SizedBox(height: 12),

              // Assignee and Due Date
              Row(
                children: [
                  // Assignee Avatar
                  CircleAvatar(
                    radius: 14,
                    backgroundImage: task.assignedTo.avatarUrl != null
                        ? NetworkImage(task.assignedTo.avatarUrl!)
                        : null,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                    child: task.assignedTo.avatarUrl == null
                        ? Text(
                            task.assignedTo.name[0].toUpperCase(),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      task.assignedTo.name,
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    Icons.access_time,
                    size: 14,
                    color: task.isOverdue
                        ? Colors.red
                        : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondary),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _formatDueDate(task.dueDate),
                    style: TextStyle(
                      fontSize: 13,
                      color: task.isOverdue
                          ? Colors.red
                          : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondary),
                      fontWeight: task.isOverdue ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Progress Bar
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: task.progress / 100,
                        backgroundColor: isDark
                            ? Colors.grey[800]
                            : Colors.grey[200],
                        valueColor: AlwaysStoppedAnimation<Color>(
                          _getProgressColor(task.progress, task.status),
                        ),
                        minHeight: 6,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getProgressColor(task.progress, task.status).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${task.progress}%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _getProgressColor(task.progress, task.status),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(TaskPriority priority) {
    Color bgColor;
    Color textColor;
    IconData icon;

    switch (priority) {
      case TaskPriority.high:
        bgColor = Colors.red.withValues(alpha: 0.1);
        textColor = Colors.red;
        icon = Icons.priority_high;
        break;
      case TaskPriority.medium:
        bgColor = Colors.amber.withValues(alpha: 0.1);
        textColor = Colors.amber[700]!;
        icon = Icons.remove;
        break;
      case TaskPriority.low:
        bgColor = Colors.green.withValues(alpha: 0.1);
        textColor = Colors.green;
        icon = Icons.keyboard_arrow_down;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          const SizedBox(width: 4),
          Text(
            priority.displayName,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDueDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    final dateOnly = DateTime(date.year, date.month, date.day);

    if (dateOnly == today) {
      return 'Hôm nay, ${DateFormat('HH:mm').format(date)}';
    } else if (dateOnly == tomorrow) {
      return 'Ngày mai, ${DateFormat('HH:mm').format(date)}';
    } else {
      return DateFormat('dd/MM/yyyy').format(date);
    }
  }

  Color _getProgressColor(int progress, TaskStatus status) {
    if (status == TaskStatus.overdue) return Colors.red;
    if (status == TaskStatus.completed) return Colors.green;
    if (progress >= 75) return Colors.green;
    if (progress >= 50) return Colors.blue;
    if (progress >= 25) return Colors.amber[700]!;
    return Colors.grey;
  }
}
