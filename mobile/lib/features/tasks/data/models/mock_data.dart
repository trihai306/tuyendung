/// Mock data for task management
/// Provides sample data for development and testing

import 'task_model.dart';

class MockTaskData {
  static final TaskUser currentUser = TaskUser(
    id: 'user_1',
    name: 'Nguyễn Văn A',
    avatarUrl: 'https://i.pravatar.cc/150?u=user_1',
    email: 'nguyenvana@company.com',
  );

  static final TaskUser manager = TaskUser(
    id: 'manager_1',
    name: 'Trần Thị B',
    avatarUrl: 'https://i.pravatar.cc/150?u=manager_1',
    email: 'tranthib@company.com',
  );

  static final List<TaskUser> employees = [
    currentUser,
    manager,
    const TaskUser(
      id: 'user_2',
      name: 'Lê Hoàng C',
      avatarUrl: 'https://i.pravatar.cc/150?u=user_2',
      email: 'lehoangc@company.com',
    ),
    const TaskUser(
      id: 'user_3',
      name: 'Phạm Minh D',
      avatarUrl: 'https://i.pravatar.cc/150?u=user_3',
      email: 'phamminhd@company.com',
    ),
    const TaskUser(
      id: 'user_4',
      name: 'Hoàng Thu E',
      avatarUrl: 'https://i.pravatar.cc/150?u=user_4',
      email: 'hoangthue@company.com',
    ),
  ];

  static List<Task> get tasks {
    final now = DateTime.now();
    
    return [
      Task(
        id: 'task_1',
        title: 'Phát triển tính năng mới cho app',
        description: 'Xây dựng module quản lý công việc với đầy đủ tính năng CRUD',
        assignedBy: manager,
        assignedTo: currentUser,
        priority: TaskPriority.high,
        status: TaskStatus.inProgress,
        dueDate: now.add(const Duration(days: 3)),
        progress: 60,
        createdAt: now.subtract(const Duration(days: 5)),
        updatedAt: now.subtract(const Duration(hours: 2)),
        activities: [
          TaskActivity(
            id: 'act_1',
            type: 'progress_update',
            description: 'Cập nhật tiến độ: 60%',
            user: currentUser,
            createdAt: now.subtract(const Duration(hours: 2)),
          ),
          TaskActivity(
            id: 'act_2',
            type: 'comment',
            description: 'Nhớ check kỹ UI nhé',
            user: manager,
            createdAt: now.subtract(const Duration(hours: 5)),
          ),
        ],
        comments: [
          TaskComment(
            id: 'cmt_1',
            content: 'Nhớ check kỹ UI nhé',
            author: manager,
            createdAt: now.subtract(const Duration(hours: 5)),
          ),
        ],
      ),
      Task(
        id: 'task_2',
        title: 'Họp báo cáo tiến độ tuần',
        description: 'Chuẩn bị slide và báo cáo cho cuộc họp hàng tuần',
        assignedBy: manager,
        assignedTo: currentUser,
        priority: TaskPriority.medium,
        status: TaskStatus.pending,
        dueDate: now.add(const Duration(days: 1)),
        progress: 20,
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
      Task(
        id: 'task_3',
        title: 'Kiểm tra lỗi và sửa chữa',
        description: 'Fix các bug được report từ QA team',
        assignedBy: manager,
        assignedTo: currentUser,
        priority: TaskPriority.low,
        status: TaskStatus.completed,
        dueDate: now.subtract(const Duration(days: 1)),
        progress: 100,
        createdAt: now.subtract(const Duration(days: 7)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
      Task(
        id: 'task_4',
        title: 'Cập nhật tài liệu hướng dẫn',
        description: 'Viết documentation cho các API mới',
        assignedBy: manager,
        assignedTo: employees[2],
        priority: TaskPriority.medium,
        status: TaskStatus.inProgress,
        dueDate: now.add(const Duration(days: 5)),
        progress: 40,
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now.subtract(const Duration(hours: 8)),
      ),
      Task(
        id: 'task_5',
        title: 'Thiết kế giao diện trang chủ',
        description: 'Redesign home screen theo yêu cầu mới',
        assignedBy: currentUser,
        assignedTo: employees[3],
        priority: TaskPriority.high,
        status: TaskStatus.pending,
        dueDate: now.add(const Duration(days: 2)),
        progress: 0,
        createdAt: now.subtract(const Duration(days: 1)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
      Task(
        id: 'task_6',
        title: 'Báo cáo doanh thu quý 1',
        description: 'Tổng hợp và phân tích doanh thu Q1/2026',
        assignedBy: manager,
        assignedTo: employees[4],
        priority: TaskPriority.high,
        status: TaskStatus.overdue,
        dueDate: now.subtract(const Duration(days: 2)),
        progress: 80,
        createdAt: now.subtract(const Duration(days: 10)),
        updatedAt: now.subtract(const Duration(days: 2)),
      ),
      Task(
        id: 'task_7',
        title: 'Kiểm thử ứng dụng',
        description: 'Thực hiện kiểm thử toàn bộ app trước khi release',
        assignedBy: manager,
        assignedTo: employees[2],
        priority: TaskPriority.medium,
        status: TaskStatus.completed,
        dueDate: now.subtract(const Duration(days: 3)),
        progress: 100,
        createdAt: now.subtract(const Duration(days: 8)),
        updatedAt: now.subtract(const Duration(days: 3)),
      ),
      Task(
        id: 'task_8',
        title: 'Chuẩn bị tài liệu phỏng vấn',
        description: 'Chuẩn bị câu hỏi và đánh giá cho ứng viên mới',
        assignedBy: manager,
        assignedTo: currentUser,
        priority: TaskPriority.high,
        status: TaskStatus.inProgress,
        dueDate: now.add(const Duration(hours: 6)),
        progress: 75,
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(hours: 1)),
        activities: [
          TaskActivity(
            id: 'act_3',
            type: 'progress_update',
            description: 'Cập nhật tiến độ: 75%',
            user: currentUser,
            createdAt: now.subtract(const Duration(hours: 1)),
          ),
          TaskActivity(
            id: 'act_4',
            type: 'comment',
            description: 'Nhớ check kỹ CV nhé',
            user: manager,
            createdAt: now.subtract(const Duration(hours: 3)),
          ),
          TaskActivity(
            id: 'act_5',
            type: 'status_change',
            description: 'Chuyển trạng thái: Đang thực hiện',
            user: currentUser,
            createdAt: now.subtract(const Duration(days: 1)),
          ),
        ],
        comments: [
          TaskComment(
            id: 'cmt_2',
            content: 'Nhớ check kỹ CV nhé',
            author: manager,
            createdAt: now.subtract(const Duration(hours: 3)),
          ),
        ],
      ),
    ];
  }

  /// Get tasks assigned to current user
  static List<Task> getMyTasks() {
    return tasks.where((t) => t.assignedTo.id == currentUser.id).toList();
  }

  /// Get tasks created by current user (for managers)
  static List<Task> getCreatedTasks() {
    return tasks.where((t) => t.assignedBy.id == currentUser.id).toList();
  }

  /// Get all tasks (for manager dashboard)
  static List<Task> getAllTasks() {
    return tasks;
  }

  /// Get tasks by status
  static List<Task> getTasksByStatus(TaskStatus status) {
    return tasks.where((t) => t.status == status).toList();
  }

  /// Get employee stats
  static Map<TaskUser, TaskStats> getEmployeeStats() {
    final Map<TaskUser, List<Task>> employeeTasks = {};
    
    for (final task in tasks) {
      employeeTasks.putIfAbsent(task.assignedTo, () => []).add(task);
    }
    
    return employeeTasks.map((user, tasks) => 
      MapEntry(user, TaskStats.fromTasks(tasks))
    );
  }
}
