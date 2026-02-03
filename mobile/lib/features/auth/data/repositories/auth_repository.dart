import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import 'models/user_model.dart';

/// Repository for authentication operations
class AuthRepository extends ChangeNotifier {
  final ApiClient _apiClient;
  
  bool _isLoggedIn = false;
  User? _user;
  
  bool get isLoggedIn => _isLoggedIn;
  User? get user => _user;
  String? get userName => _user?.name;
  String? get userEmail => _user?.email;
  String? get userRole => _user?.companyRole;
  
  AuthRepository(this._apiClient);

  /// Check if user is authenticated
  Future<bool> checkAuth() async {
    final hasToken = await _apiClient.hasToken();
    if (!hasToken) {
      _isLoggedIn = false;
      return false;
    }
    
    try {
      final response = await _apiClient.get(ApiEndpoints.me);
      final userData = response.data['data'];
      _user = User.fromJson(userData);
      _isLoggedIn = true;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoggedIn = false;
      await _apiClient.clearToken();
      return false;
    }
  }

  /// Login with email and password
  Future<void> login(String email, String password) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );
      
      final token = response.data['data']?['token'];
      if (token != null) {
        await _apiClient.saveToken(token);
        final userData = response.data['data']['user'];
        _user = User.fromJson(userData);
        _isLoggedIn = true;
        notifyListeners();
      } else {
        throw Exception(response.data['message'] ?? 'Đăng nhập thất bại');
      }
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout) {
        throw Exception('Kết nối timeout. Kiểm tra server.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Không thể kết nối tới server');
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

  /// Register new user
  Future<void> register(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.register, data: data);
      
      final token = response.data['data']?['token'];
      if (token != null) {
        await _apiClient.saveToken(token);
        final userData = response.data['data']['user'];
        _user = User.fromJson(userData);
        _isLoggedIn = true;
        notifyListeners();
      } else {
        throw Exception(response.data['message'] ?? 'Đăng ký thất bại');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 422) {
        final errors = e.response?.data['errors'];
        if (errors != null && errors is Map) {
          final firstError = errors.values.first;
          if (firstError is List && firstError.isNotEmpty) {
            throw Exception(firstError.first);
          }
        }
        throw Exception(e.response?.data['message'] ?? 'Thông tin không hợp lệ');
      }
      throw Exception('Có lỗi xảy ra. Vui lòng thử lại.');
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Có lỗi xảy ra: $e');
    }
  }

  /// Logout current user
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout);
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _apiClient.clearToken();
      _user = null;
      _isLoggedIn = false;
      notifyListeners();
    }
  }

  /// Refresh user data
  Future<void> refreshUser() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.me);
      final userData = response.data['data'];
      _user = User.fromJson(userData);
      notifyListeners();
    } catch (e) {
      // Ignore refresh errors  
    }
  }
}
