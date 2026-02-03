import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../data/repositories/management_repository.dart';
import '../data/models/seat_model.dart';

/// Employee List Screen for managing company employees
class EmployeeListScreen extends StatefulWidget {
  const EmployeeListScreen({super.key});

  @override
  State<EmployeeListScreen> createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends State<EmployeeListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ManagementRepository>().fetchCompanySeats();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Quản lý Nhân viên'),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined),
            onPressed: () => _showInviteDialog(context),
          ),
        ],
      ),
      body: Consumer<ManagementRepository>(
        builder: (context, repo, child) {
          if (repo.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (repo.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(repo.error!, style: const TextStyle(color: AppColors.error)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => repo.fetchCompanySeats(),
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }

          final seats = repo.companySeats;
          
          return RefreshIndicator(
            onRefresh: () => repo.fetchCompanySeats(),
            child: CustomScrollView(
              slivers: [
                // Seats info header
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _SeatInfo(
                          value: seats.usedSeats.toString(),
                          label: 'Đang dùng',
                        ),
                        Container(width: 1, height: 40, color: Colors.white24),
                        _SeatInfo(
                          value: seats.totalSeats.toString(),
                          label: 'Tổng slot',
                        ),
                        Container(width: 1, height: 40, color: Colors.white24),
                        _SeatInfo(
                          value: seats.availableSeats.toString(),
                          label: 'Còn trống',
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Employee list header
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Danh sách nhân viên',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
                
                // Employee list
                if (seats.members.isEmpty)
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline, size: 64, color: AppColors.textTertiary),
                          const SizedBox(height: 16),
                          const Text(
                            'Chưa có nhân viên nào',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 8),
                          TextButton.icon(
                            onPressed: () => _showInviteDialog(context),
                            icon: const Icon(Icons.person_add),
                            label: const Text('Mời nhân viên'),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _EmployeeTile(
                        seat: seats.members[index],
                        onChangeRole: () => _showChangeRoleDialog(context, seats.members[index]),
                        onRemove: () => _removeEmployee(seats.members[index]),
                      ),
                      childCount: seats.members.length,
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showInviteDialog(BuildContext context) {
    final emailController = TextEditingController();
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16, right: 16, top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Mời nhân viên',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Nhập email của nhân viên để mời họ tham gia công ty',
              style: TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                hintText: 'nhanvien@email.com',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email_outlined),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Implement invite API
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã gửi lời mời')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Gửi lời mời'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showChangeRoleDialog(BuildContext context, Seat seat) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Thay đổi quyền: ${seat.userName}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _RoleOption(
              title: 'Quản trị viên',
              subtitle: 'Có thể quản lý tuyển dụng và nhân viên',
              selected: seat.role == 'admin',
              onTap: () async {
                await context.read<ManagementRepository>().assignSeat(seat.userId, 'admin');
                if (context.mounted) Navigator.pop(context);
              },
            ),
            const SizedBox(height: 8),
            _RoleOption(
              title: 'Nhân viên',
              subtitle: 'Chỉ xử lý công việc được giao',
              selected: seat.role == 'member',
              onTap: () async {
                await context.read<ManagementRepository>().assignSeat(seat.userId, 'member');
                if (context.mounted) Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Future<void> _removeEmployee(Seat seat) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa nhân viên?'),
        content: Text('Bạn có chắc muốn xóa ${seat.userName} khỏi công ty?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await context.read<ManagementRepository>().unassignSeat(seat.userId);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa nhân viên')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }
}

class _SeatInfo extends StatelessWidget {
  final String value;
  final String label;

  const _SeatInfo({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }
}

class _EmployeeTile extends StatelessWidget {
  final Seat seat;
  final VoidCallback onChangeRole;
  final VoidCallback onRemove;

  const _EmployeeTile({
    required this.seat,
    required this.onChangeRole,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: CircleAvatar(
          backgroundColor: AppColors.primary.withOpacity(0.1),
          backgroundImage: seat.avatar != null ? NetworkImage(seat.avatar!) : null,
          child: seat.avatar == null
              ? Text(
                  seat.userName.isNotEmpty ? seat.userName[0].toUpperCase() : '?',
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                )
              : null,
        ),
        title: Text(
          seat.userName,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          seat.userEmail,
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _RoleBadge(role: seat.role),
            if (seat.role != 'owner') ...[
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: AppColors.textSecondary),
                onSelected: (value) {
                  if (value == 'change_role') onChangeRole();
                  if (value == 'remove') onRemove();
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'change_role',
                    child: Row(
                      children: [
                        Icon(Icons.swap_horiz, size: 20),
                        SizedBox(width: 8),
                        Text('Đổi quyền'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'remove',
                    child: Row(
                      children: [
                        Icon(Icons.person_remove, size: 20, color: AppColors.error),
                        SizedBox(width: 8),
                        Text('Xóa', style: TextStyle(color: AppColors.error)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String role;

  const _RoleBadge({required this.role});

  @override
  Widget build(BuildContext context) {
    Color color;
    String text;

    switch (role) {
      case 'owner':
        color = AppColors.primary;
        text = 'Chủ sở hữu';
        break;
      case 'admin':
        color = AppColors.warning;
        text = 'Admin';
        break;
      default:
        color = AppColors.info;
        text = 'Nhân viên';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500),
      ),
    );
  }
}

class _RoleOption extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  const _RoleOption({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text(subtitle, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            ),
            if (selected)
              const Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
