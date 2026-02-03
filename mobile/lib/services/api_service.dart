import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:io' show Platform;

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // Use 10.0.2.2 for Android emulator (maps to host's localhost)
  // Use localhost for iOS simulator
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api';
    }
    return 'http://localhost:8000/api';
  }
  
  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token if available
        final token = await _storage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 - Unauthorized
        if (error.response?.statusCode == 401) {
          await _storage.delete(key: 'auth_token');
          // TODO: Navigate to login
        }
        return handler.next(error);
      },
    ));
  }
  
  // Auth
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await _dio.post('/auth/register', data: data);
    return response.data;
  }
  
  Future<void> logout() async {
    await _dio.post('/auth/logout');
    await _storage.delete(key: 'auth_token');
  }
  
  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/auth/me');
    return response.data;
  }
  
  // Jobs
  Future<List<dynamic>> getJobs({int page = 1, String? search}) async {
    final response = await _dio.get('/jobs', queryParameters: {
      'page': page,
      if (search != null) 'search': search,
    });
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> getJob(int id) async {
    final response = await _dio.get('/jobs/$id');
    return response.data['data'];
  }
  
  Future<void> applyJob(int jobId, {String? coverLetter}) async {
    await _dio.post('/jobs/$jobId/apply', data: {
      if (coverLetter != null) 'cover_letter': coverLetter,
    });
  }
  
  // Company
  Future<Map<String, dynamic>> getCompany() async {
    final response = await _dio.get('/company');
    return response.data['data'];
  }
  
  Future<List<dynamic>> getCompanyMembers() async {
    final response = await _dio.get('/company/members');
    return response.data['data'];
  }
  
  // Messages
  Future<List<dynamic>> getConversations() async {
    final response = await _dio.get('/conversations');
    return response.data['data'];
  }
  
  Future<List<dynamic>> getMessages(int conversationId) async {
    final response = await _dio.get('/conversations/$conversationId/messages');
    return response.data['data'];
  }
  
  Future<void> sendMessage(int conversationId, String content) async {
    await _dio.post('/conversations/$conversationId/messages', data: {
      'content': content,
    });
  }
  
  // Storage helpers
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
  
  Future<void> clearToken() async {
    await _storage.delete(key: 'auth_token');
  }
  
  // Tasks
  Future<List<dynamic>> getTasks({String? status, bool myTasks = false}) async {
    final response = await _dio.get('/tasks', queryParameters: {
      if (status != null) 'status': status,
      if (myTasks) 'my_tasks': true,
    });
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> getTask(int id) async {
    final response = await _dio.get('/tasks/$id');
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> createTask(Map<String, dynamic> data) async {
    final response = await _dio.post('/tasks', data: data);
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> updateTask(int id, Map<String, dynamic> data) async {
    final response = await _dio.put('/tasks/$id', data: data);
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> updateTaskProgress(int id, int progress) async {
    final response = await _dio.patch('/tasks/$id/progress', data: {
      'progress': progress,
    });
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> addTaskComment(int id, String content) async {
    final response = await _dio.post('/tasks/$id/comments', data: {
      'content': content,
    });
    return response.data['data'];
  }
  
  Future<void> deleteTask(int id) async {
    await _dio.delete('/tasks/$id');
  }
  
  Future<Map<String, dynamic>> getTaskStats({bool myStats = false}) async {
    final response = await _dio.get('/tasks/stats', queryParameters: {
      if (myStats) 'my_stats': true,
    });
    return response.data['data'];
  }
  
  Future<List<dynamic>> getTaskEmployees() async {
    final response = await _dio.get('/tasks/employees');
    return response.data['data'];
  }
}
