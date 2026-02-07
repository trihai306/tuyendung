/// Filter Chips Widget
/// Horizontal scrollable filter chips for task status

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/task_model.dart';

class TaskFilterChips extends StatelessWidget {
  final TaskStatus? selectedFilter;
  final ValueChanged<TaskStatus?> onFilterChanged;

  const TaskFilterChips({
    super.key,
    required this.selectedFilter,
    required this.onFilterChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildChip(
            context: context,
            label: 'Tất cả',
            isSelected: selectedFilter == null,
            onTap: () => onFilterChanged(null),
            isDark: isDark,
          ),
          const SizedBox(width: 8),
          ...TaskStatus.values.map((status) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: _buildChip(
              context: context,
              label: status.displayName,
              isSelected: selectedFilter == status,
              onTap: () => onFilterChanged(status),
              isDark: isDark,
              statusColor: _getStatusColor(status),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildChip({
    required BuildContext context,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
    Color? statusColor,
  }) {
    final color = statusColor ?? AppColors.primary;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? color
                : (isDark ? AppColors.surfaceDark : AppColors.surface),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? color
                  : (isDark ? AppColors.borderDark : AppColors.border),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              color: isSelected
                  ? Colors.white
                  : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondary),
            ),
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(TaskStatus status) {
    switch (status) {
      case TaskStatus.pending:
        return Colors.grey[600]!;
      case TaskStatus.inProgress:
        return Colors.blue;
      case TaskStatus.completed:
        return Colors.green;
      case TaskStatus.overdue:
        return Colors.red;
    }
  }
}
