import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../data/repositories/job_repository.dart';
import '../data/models/job_model.dart';

/// Job List Screen for managing recruitment jobs
class JobListScreen extends StatefulWidget {
  const JobListScreen({super.key});

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JobRepository>().fetchJobs();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Quản lý Tin tuyển dụng'),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Đang mở'),
            Tab(text: 'Nháp'),
            Tab(text: 'Đã đóng'),
          ],
        ),
      ),
      body: Consumer<JobRepository>(
        builder: (context, repo, child) {
          if (repo.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildJobList(repo.openJobs, 'Chưa có tin đang tuyển'),
              _buildJobList(repo.draftJobs, 'Chưa có tin nháp'),
              _buildJobList(repo.closedJobs, 'Chưa có tin đã đóng'),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateJobDialog(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add),
        label: const Text('Tạo tin mới'),
      ),
    );
  }

  Widget _buildJobList(List<Job> jobs, String emptyMessage) {
    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.work_off_outlined, size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            Text(
              emptyMessage,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => context.read<JobRepository>().fetchJobs(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: jobs.length,
        itemBuilder: (context, index) => _JobCard(
          job: jobs[index],
          onTap: () => _showJobDetail(context, jobs[index]),
          onPublish: () => _publishJob(jobs[index].id),
          onClose: () => _closeJob(jobs[index].id),
          onDelete: () => _deleteJob(jobs[index].id),
        ),
      ),
    );
  }

  void _showCreateJobDialog(BuildContext context) {
    final titleController = TextEditingController();
    final locationController = TextEditingController();
    
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
              'Tạo tin tuyển dụng mới',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Tiêu đề *',
                hintText: 'VD: Nhân viên phục vụ',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: locationController,
              decoration: const InputDecoration(
                labelText: 'Địa điểm',
                hintText: 'VD: Quận 1, TP.HCM',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (titleController.text.isEmpty) return;
                  try {
                    await context.read<JobRepository>().createJob({
                      'title': titleController.text,
                      'location': locationController.text,
                    });
                    if (context.mounted) Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Đã tạo tin tuyển dụng')),
                    );
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.toString())),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Tạo tin'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showJobDetail(BuildContext context, Job job) {
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
            Text(job.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (job.location != null)
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(job.location!, style: const TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            const SizedBox(height: 16),
            Row(
              children: [
                _InfoChip(label: job.jobTypeDisplay, icon: Icons.work_outline),
                const SizedBox(width: 8),
                _InfoChip(label: job.salaryDisplay, icon: Icons.attach_money),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.people_outline, size: 20, color: AppColors.info),
                const SizedBox(width: 8),
                Text('${job.applicationsCount} ứng viên'),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Future<void> _publishJob(int id) async {
    try {
      await context.read<JobRepository>().publishJob(id);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã đăng tin tuyển dụng')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  Future<void> _closeJob(int id) async {
    try {
      await context.read<JobRepository>().closeJob(id);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã đóng tin tuyển dụng')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  Future<void> _deleteJob(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa tin tuyển dụng?'),
        content: const Text('Bạn có chắc muốn xóa tin này? Hành động này không thể hoàn tác.'),
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
        await context.read<JobRepository>().deleteJob(id);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa tin tuyển dụng')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }
}

class _JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback onTap;
  final VoidCallback onPublish;
  final VoidCallback onClose;
  final VoidCallback onDelete;

  const _JobCard({
    required this.job,
    required this.onTap,
    required this.onPublish,
    required this.onClose,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      job.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  _StatusBadge(status: job.status),
                ],
              ),
              const SizedBox(height: 8),
              if (job.location != null)
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(job.location!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _InfoChip(label: job.salaryDisplay, icon: Icons.attach_money),
                  const SizedBox(width: 8),
                  _InfoChip(label: '${job.applicationsCount} ứng viên', icon: Icons.people_outline),
                ],
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (job.status == 'draft')
                    TextButton.icon(
                      onPressed: onPublish,
                      icon: const Icon(Icons.publish, size: 18),
                      label: const Text('Đăng'),
                      style: TextButton.styleFrom(foregroundColor: AppColors.success),
                    ),
                  if (job.status == 'open')
                    TextButton.icon(
                      onPressed: onClose,
                      icon: const Icon(Icons.close, size: 18),
                      label: const Text('Đóng'),
                      style: TextButton.styleFrom(foregroundColor: AppColors.warning),
                    ),
                  TextButton.icon(
                    onPressed: onDelete,
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Xóa'),
                    style: TextButton.styleFrom(foregroundColor: AppColors.error),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String text;
    
    switch (status) {
      case 'open':
        color = AppColors.success;
        text = 'Đang tuyển';
        break;
      case 'draft':
        color = AppColors.textSecondary;
        text = 'Nháp';
        break;
      case 'closed':
        color = AppColors.error;
        text = 'Đã đóng';
        break;
      default:
        color = AppColors.textSecondary;
        text = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final IconData icon;

  const _InfoChip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
