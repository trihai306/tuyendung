/// Task Form Screen
/// Screen for creating and editing tasks

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../theme/app_theme.dart';
import '../../data/models/task_model.dart';
import '../../data/providers/task_provider.dart';

class TaskFormScreen extends ConsumerStatefulWidget {
  final Task? task; // null for create, non-null for edit

  const TaskFormScreen({super.key, this.task});

  @override
  ConsumerState<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends ConsumerState<TaskFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  TaskPriority _priority = TaskPriority.medium;
  DateTime _dueDate = DateTime.now().add(const Duration(days: 1));
  TaskUser? _selectedAssignee;
  bool _isLoading = false;

  bool get isEditing => widget.task != null;

  @override
  void initState() {
    super.initState();
    if (widget.task != null) {
      _titleController.text = widget.task!.title;
      _descriptionController.text = widget.task!.description ?? '';
      _priority = widget.task!.priority;
      _dueDate = widget.task!.dueDate;
      _selectedAssignee = widget.task!.assignedTo;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final employeesAsync = ref.watch(employeeListProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Chỉnh sửa công việc' : 'Giao việc mới'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Title Field
            _buildLabel('Tiêu đề công việc'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'Nhập tiêu đề...',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Vui lòng nhập tiêu đề';
                }
                if (value.length > 200) {
                  return 'Tiêu đề không quá 200 ký tự';
                }
                return null;
              },
              textInputAction: TextInputAction.next,
            ),

            const SizedBox(height: 20),

            // Description Field
            _buildLabel('Mô tả chi tiết'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                hintText: 'Thêm mô tả...',
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              textInputAction: TextInputAction.newline,
            ),

            const SizedBox(height: 20),

            // Assignee Selection
            _buildLabel('Người thực hiện'),
            const SizedBox(height: 8),
            employeesAsync.when(
              data: (employees) => _buildAssigneeSelector(employees, isDark),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Lỗi: $e'),
            ),

            const SizedBox(height: 20),

            // Priority Selection
            _buildLabel('Độ ưu tiên'),
            const SizedBox(height: 8),
            _buildPrioritySelector(isDark),

            const SizedBox(height: 20),

            // Due Date
            _buildLabel('Hạn hoàn thành'),
            const SizedBox(height: 8),
            _buildDateSelector(context, isDark),

            const SizedBox(height: 20),

            // Attachments (placeholder)
            _buildLabel('Tệp đính kèm'),
            const SizedBox(height: 8),
            _buildAttachmentSection(isDark),

            const SizedBox(height: 32),

            // Submit Button
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submitForm,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        isEditing ? 'Cập nhật' : 'Giao việc',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Theme.of(context).colorScheme.onSurface,
      ),
    );
  }

  Widget _buildAssigneeSelector(List<TaskUser> employees, bool isDark) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: employees.map((employee) {
        final isSelected = _selectedAssignee?.id == employee.id;
        return FilterChip(
          avatar: CircleAvatar(
            backgroundImage: employee.avatarUrl != null
                ? NetworkImage(employee.avatarUrl!)
                : null,
            backgroundColor: AppTheme.primary.withValues(alpha: 0.2),
            child: employee.avatarUrl == null
                ? Text(
                    employee.name[0].toUpperCase(),
                    style: const TextStyle(fontSize: 12),
                  )
                : null,
          ),
          label: Text(employee.name),
          selected: isSelected,
          onSelected: (_) {
            setState(() {
              _selectedAssignee = isSelected ? null : employee;
            });
          },
          selectedColor: AppTheme.primary.withValues(alpha: 0.2),
          checkmarkColor: AppTheme.primary,
          side: BorderSide(
            color: isSelected
                ? AppTheme.primary
                : (isDark ? AppTheme.borderDark : AppTheme.border),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPrioritySelector(bool isDark) {
    return Row(
      children: TaskPriority.values.map((priority) {
        final isSelected = _priority == priority;
        Color chipColor;
        switch (priority) {
          case TaskPriority.high:
            chipColor = Colors.red;
            break;
          case TaskPriority.medium:
            chipColor = Colors.amber;
            break;
          case TaskPriority.low:
            chipColor = Colors.green;
            break;
        }

        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: FilterChip(
            avatar: Icon(
              priority == TaskPriority.high
                  ? Icons.priority_high
                  : priority == TaskPriority.medium
                      ? Icons.remove
                      : Icons.keyboard_arrow_down,
              size: 18,
              color: isSelected ? Colors.white : chipColor,
            ),
            label: Text(
              priority.displayName,
              style: TextStyle(
                color: isSelected ? Colors.white : chipColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            selected: isSelected,
            onSelected: (_) {
              setState(() => _priority = priority);
            },
            backgroundColor: chipColor.withValues(alpha: 0.1),
            selectedColor: chipColor,
            showCheckmark: false,
            side: BorderSide(color: chipColor),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDateSelector(BuildContext context, bool isDark) {
    return InkWell(
      onTap: () => _selectDate(context),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppTheme.borderDark : AppTheme.border,
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.calendar_today,
              size: 20,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                DateFormat('dd/MM/yyyy, HH:mm').format(_dueDate),
                style: TextStyle(
                  fontSize: 16,
                  color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimary,
                ),
              ),
            ),
            Icon(
              Icons.arrow_drop_down,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttachmentSection(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.border,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.cloud_upload_outlined,
                color: AppTheme.primary,
                size: 32,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Kéo thả file hoặc nhấn để tải lên',
            style: TextStyle(
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {
              // TODO: Implement file picker
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tính năng đang phát triển')),
              );
            },
            icon: const Icon(Icons.attach_file),
            label: const Text('Chọn file'),
          ),
        ],
      ),
    );
  }

  Future<void> _selectDate(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: _dueDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_dueDate),
      );

      if (time != null) {
        setState(() {
          _dueDate = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedAssignee == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn người thực hiện'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final actions = ref.read(taskActionsProvider.notifier);
      final result = await actions.createTask(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        assignedTo: _selectedAssignee!,
        priority: _priority,
        dueDate: _dueDate,
      );

      if (mounted) {
        if (result != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(isEditing
                  ? 'Đã cập nhật công việc'
                  : 'Đã giao việc thành công'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Có lỗi xảy ra, vui lòng thử lại'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}
