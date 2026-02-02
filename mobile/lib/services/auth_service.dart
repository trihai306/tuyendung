import 'package:flutter/foundation.dart';
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
      
      if (response['success'] == true && response['data']?['token'] != null) {
        await _apiService.saveToken(response['data']['token']);
        _user = response['data']['user'];
        _isLoggedIn = true;
        notifyListeners();
      } else {
        throw Exception(response['message'] ?? 'Đăng nhập thất bại');
      }
    } catch (e) {
      if (e.toString().contains('401')) {
        throw Exception('Email hoặc mật khẩu không đúng');
      }
      throw Exception('Có lỗi xảy ra. Vui lòng thử lại.');
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
