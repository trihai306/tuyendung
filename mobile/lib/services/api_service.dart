import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // TODO: Update with your actual API URL
  static const String baseUrl = 'http://localhost:8000/api';
  
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
    final response = await _dio.post('/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await _dio.post('/register', data: data);
    return response.data;
  }
  
  Future<void> logout() async {
    await _dio.post('/logout');
    await _storage.delete(key: 'auth_token');
  }
  
  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/user');
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
}
