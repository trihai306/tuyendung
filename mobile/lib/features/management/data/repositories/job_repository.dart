import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import '../models/job_model.dart';

/// Repository for job management operations
class JobRepository extends ChangeNotifier {
  final ApiClient _apiClient;
  
  List<Job> _jobs = [];
  bool _isLoading = false;
  String? _error;
  
  List<Job> get jobs => _jobs;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Filtered lists
  List<Job> get openJobs => _jobs.where((j) => j.status == 'open').toList();
  List<Job> get draftJobs => _jobs.where((j) => j.status == 'draft').toList();
  List<Job> get closedJobs => _jobs.where((j) => j.status == 'closed').toList();
  
  JobRepository(this._apiClient);

  /// Fetch all jobs for current user
  Future<void> fetchJobs({String? status, String? search}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;
      if (search != null) queryParams['search'] = search;
      
      final response = await _apiClient.get('/jobs', queryParameters: queryParams);
      final data = response.data['data'] as List? ?? [];
      _jobs = data.map((json) => Job.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      _error = 'Không thể tải danh sách việc làm';
      debugPrint('JobRepository.fetchJobs error: ${e.message}');
    } catch (e) {
      _error = 'Có lỗi xảy ra: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get single job by ID
  Future<Job?> getJob(int id) async {
    try {
      final response = await _apiClient.get('/jobs/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return Job.fromJson(data);
    } on DioException catch (e) {
      debugPrint('JobRepository.getJob error: ${e.message}');
      return null;
    }
  }

  /// Create new job
  Future<Job?> createJob(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await _apiClient.post('/jobs', data: data);
      final job = Job.fromJson(response.data['data'] as Map<String, dynamic>);
      _jobs.insert(0, job);
      notifyListeners();
      return job;
    } on DioException catch (e) {
      if (e.response?.statusCode == 422) {
        final errors = e.response?.data['errors'];
        if (errors != null && errors is Map) {
          final firstError = errors.values.first;
          if (firstError is List && firstError.isNotEmpty) {
            throw Exception(firstError.first);
          }
        }
      }
      throw Exception('Không thể tạo việc làm mới');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update existing job
  Future<Job?> updateJob(int id, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.put('/jobs/$id', data: data);
      final job = Job.fromJson(response.data['data'] as Map<String, dynamic>);
      
      final index = _jobs.indexWhere((j) => j.id == id);
      if (index >= 0) {
        _jobs[index] = job;
        notifyListeners();
      }
      return job;
    } on DioException catch (e) {
      throw Exception('Không thể cập nhật việc làm: ${e.message}');
    }
  }

  /// Delete job
  Future<bool> deleteJob(int id) async {
    try {
      await _apiClient.delete('/jobs/$id');
      _jobs.removeWhere((j) => j.id == id);
      notifyListeners();
      return true;
    } on DioException catch (e) {
      throw Exception('Không thể xóa việc làm: ${e.message}');
    }
  }

  /// Publish job (change status to open)
  Future<Job?> publishJob(int id) async {
    try {
      final response = await _apiClient.post('/jobs/$id/publish');
      final job = Job.fromJson(response.data['data'] as Map<String, dynamic>);
      
      final index = _jobs.indexWhere((j) => j.id == id);
      if (index >= 0) {
        _jobs[index] = job;
        notifyListeners();
      }
      return job;
    } on DioException catch (e) {
      throw Exception('Không thể đăng tin: ${e.message}');
    }
  }

  /// Close job
  Future<Job?> closeJob(int id) async {
    try {
      final response = await _apiClient.post('/jobs/$id/close');
      final job = Job.fromJson(response.data['data'] as Map<String, dynamic>);
      
      final index = _jobs.indexWhere((j) => j.id == id);
      if (index >= 0) {
        _jobs[index] = job;
        notifyListeners();
      }
      return job;
    } on DioException catch (e) {
      throw Exception('Không thể đóng tin: ${e.message}');
    }
  }
}
