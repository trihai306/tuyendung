import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import '../models/seat_model.dart';
import '../models/stats_model.dart';

/// Repository for dashboard and seat management operations
class ManagementRepository extends ChangeNotifier {
  final ApiClient _apiClient;
  
  DashboardStats _stats = DashboardStats.empty();
  List<DashboardTask> _tasks = [];
  List<Interview> _interviews = [];
  CompanySeats _companySeats = CompanySeats.empty();
  bool _isLoading = false;
  String? _error;
  
  DashboardStats get stats => _stats;
  List<DashboardTask> get tasks => _tasks;
  List<Interview> get interviews => _interviews;
  CompanySeats get companySeats => _companySeats;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  ManagementRepository(this._apiClient);

  /// Fetch dashboard stats
  Future<void> fetchDashboardStats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiClient.get('/dashboard/my-stats');
      final data = response.data['data'] as Map<String, dynamic>? ?? {};
      _stats = DashboardStats.fromJson(data);
    } on DioException catch (e) {
      _error = 'Không thể tải thống kê';
      debugPrint('ManagementRepository.fetchDashboardStats error: ${e.message}');
    } catch (e) {
      _error = 'Có lỗi xảy ra: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch pending tasks
  Future<void> fetchTasks() async {
    try {
      final response = await _apiClient.get('/dashboard/tasks');
      final data = response.data['data'] as List? ?? [];
      _tasks = data.map((json) => DashboardTask.fromJson(json as Map<String, dynamic>)).toList();
      notifyListeners();
    } on DioException catch (e) {
      debugPrint('ManagementRepository.fetchTasks error: ${e.message}');
    }
  }

  /// Fetch upcoming interviews
  Future<void> fetchInterviews() async {
    try {
      final response = await _apiClient.get('/dashboard/interviews');
      final data = response.data['data'] as List? ?? [];
      _interviews = data.map((json) => Interview.fromJson(json as Map<String, dynamic>)).toList();
      notifyListeners();
    } on DioException catch (e) {
      debugPrint('ManagementRepository.fetchInterviews error: ${e.message}');
    }
  }

  /// Fetch all dashboard data at once
  Future<void> fetchDashboard() async {
    await Future.wait([
      fetchDashboardStats(),
      fetchTasks(),
      fetchInterviews(),
    ]);
  }

  /// Fetch company seats/employees
  Future<void> fetchCompanySeats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiClient.get('/seats/company');
      final data = response.data['data'] as Map<String, dynamic>? ?? {};
      _companySeats = CompanySeats.fromJson(data);
    } on DioException catch (e) {
      _error = 'Không thể tải danh sách nhân viên';
      debugPrint('ManagementRepository.fetchCompanySeats error: ${e.message}');
    } catch (e) {
      _error = 'Có lỗi xảy ra: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Assign seat to user
  Future<bool> assignSeat(int userId, String role) async {
    try {
      await _apiClient.post('/seats/assign', data: {
        'user_id': userId,
        'role': role,
      });
      await fetchCompanySeats();
      return true;
    } on DioException catch (e) {
      if (e.response?.statusCode == 422) {
        final message = e.response?.data['message'] as String?;
        throw Exception(message ?? 'Không thể gán quyền');
      }
      throw Exception('Không thể gán quyền cho nhân viên');
    }
  }

  /// Unassign seat from user
  Future<bool> unassignSeat(int userId) async {
    try {
      await _apiClient.post('/seats/unassign', data: {
        'user_id': userId,
      });
      await fetchCompanySeats();
      return true;
    } on DioException catch (e) {
      throw Exception('Không thể hủy quyền: ${e.message}');
    }
  }
}
