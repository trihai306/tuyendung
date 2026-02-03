import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final ApiService _apiService;
  
  bool _isLoggedIn = false;
  Map<String, dynamic>? _user;
  
  bool get isLoggedIn => _isLoggedIn;
  Map<String, dynamic>? get user => _user;
  String? get userName => _user?['name'];
  String? get userEmail => _user?['email'];
  String? get userRole => _user?['company_role'];
  
  AuthService(this._apiService);
  
  Future<bool> checkAuth() async {
    final token = await _apiService.getToken();
    if (token == null) {
      _isLoggedIn = false;
      return false;
    }
    
    try {
      final response = await _apiService.getProfile();
      _user = response['data'];
      _isLoggedIn = true;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoggedIn = false;
      await _apiService.clearToken();
      return false;
    }
  }
  
  Future<void> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);
      
      // Backend returns: { data: { user: {...}, token: "..." } }
      final token = response['data']?['token'];
      if (token != null) {
        await _apiService.saveToken(token);
        _user = response['data']['user'];
        _isLoggedIn = true;
        notifyListeners();
      } else {
        throw Exception(response['message'] ?? 'Đăng nhập thất bại');
      }
    } on DioException catch (e) {
      // Show detailed Dio errors for debugging
      if (e.type == DioExceptionType.connectionTimeout) {
        throw Exception('Kết nối timeout. Kiểm tra server.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Không thể kết nối tới server. URL: ${e.requestOptions.uri}');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Email hoặc mật khẩu không đúng');
      } else if (e.response?.statusCode == 422) {
        final errors = e.response?.data['errors'];
        if (errors != null && errors is Map) {
          final firstError = errors.values.first;
          if (firstError is List && firstError.isNotEmpty) {
            throw Exception(firstError.first);
          }
        }
        throw Exception(e.response?.data['message'] ?? 'Thông tin không hợp lệ');
      } else {
        throw Exception('Lỗi mạng: ${e.message}');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Có lỗi xảy ra: $e');
    }
  }
  
  Future<void> register(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.register(data);
      
      if (response['success'] == true && response['data']?['token'] != null) {
        await _apiService.saveToken(response['data']['token']);
        _user = response['data']['user'];
        _isLoggedIn = true;
        notifyListeners();
      } else {
        throw Exception(response['message'] ?? 'Đăng ký thất bại');
      }
    } catch (e) {
      if (e.toString().contains('email')) {
        throw Exception('Email đã được sử dụng');
      }
      throw Exception('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }
  
  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _apiService.clearToken();
      _user = null;
      _isLoggedIn = false;
      notifyListeners();
    }
  }
  
  Future<void> refreshUser() async {
    try {
      final response = await _apiService.getProfile();
      _user = response['data'];
      notifyListeners();
    } catch (e) {
      // Ignore refresh errors
    }
  }
}
