import 'dart:io';

/// API endpoints constants for Viecly app
/// Synced from Laravel backend routes/api.php
class ApiEndpoints {
  ApiEndpoints._();

  /// Base URL - switches based on platform
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api'; // Android emulator
    }
    return 'http://localhost:8000/api'; // iOS/Web/Desktop
  }

  // ============================================================
  // AUTH ENDPOINTS
  // ============================================================
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String forgotPassword = '/auth/forgot-password';
  static const String me = '/auth/me';
  static const String logout = '/auth/logout';
  static const String logoutAll = '/auth/logout-all';
  static const String updateProfile = '/auth/profile';
  static const String updatePassword = '/auth/password';

  // ============================================================
  // DASHBOARD ENDPOINTS
  // ============================================================
  static const String dashboardMyStats = '/dashboard/my-stats';
  static const String dashboardTasks = '/dashboard/tasks';
  static const String dashboardInterviews = '/dashboard/interviews';

  // ============================================================
  // JOBS ENDPOINTS
  // ============================================================
  static const String jobs = '/jobs';
  static String jobDetail(int id) => '/jobs/$id';
  static String jobPublish(int id) => '/jobs/$id/publish';
  static String jobClose(int id) => '/jobs/$id/close';
  static String jobPipeline(int id) => '/jobs/$id/pipeline';

  // Job Assignments
  static String jobAssignments(int jobId) => '/jobs/$jobId/assignments';
  static const String myAssignments = '/my-assignments';
  static String updateAssignment(int id) => '/assignments/$id';
  static String deleteAssignment(int id) => '/assignments/$id';

  // Applications
  static String moveApplicationStage(int id) => '/applications/$id/move-stage';

  // ============================================================
  // CANDIDATES ENDPOINTS
  // ============================================================
  static const String candidates = '/candidates';
  static String candidateDetail(int id) => '/candidates/$id';
  static String candidateApply(int id) => '/candidates/$id/apply';

  // ============================================================
  // COMPANY ENDPOINTS
  // ============================================================
  static const String company = '/company';
  static const String companyStats = '/company/stats';
  static const String companyActivities = '/company/activities';
  static const String companyMembers = '/company/members';
  static String companyMemberUpdate(int id) => '/company/members/$id';
  static String companyMemberRemove(int id) => '/company/members/$id';

  // ============================================================
  // SEATS ENDPOINTS (Employee Pricing)
  // ============================================================
  static const String seatsPricing = '/seats/pricing';
  static const String seatsCompany = '/seats';
  static const String seatsPurchase = '/seats/purchase';
  static const String seatsAssign = '/seats/assign';
  static const String seatsUnassign = '/seats/unassign';

  // ============================================================
  // SUBSCRIPTION ENDPOINTS
  // ============================================================
  static const String subscription = '/subscription';
  static const String subscriptionCancel = '/subscription/cancel';

  // ============================================================
  // PACKAGES ENDPOINTS (Public)
  // ============================================================
  static const String packages = '/packages';
  static String packageDetail(String slug) => '/packages/$slug';

  // ============================================================
  // INBOX ENDPOINTS
  // ============================================================
  static const String inboxConversations = '/inbox/conversations';
  static String inboxConversation(int id) => '/inbox/conversations/$id';
  static String inboxConversationAssign(int id) => '/inbox/conversations/$id/assign';
  static String inboxMessages(int id) => '/inbox/conversations/$id/messages';
  static String inboxSendMessage(int id) => '/inbox/conversations/$id/messages';
  static String inboxCreateCandidate(int id) => '/inbox/conversations/$id/candidate';

  // ============================================================
  // PLATFORM ACCOUNTS ENDPOINTS
  // ============================================================
  static const String platformAccounts = '/platform-accounts';
  static String platformAccountDetail(int id) => '/platform-accounts/$id';
  static String platformAccountSync(int id) => '/platform-accounts/$id/sync-channels';
  static String platformAccountRefreshToken(int id) => '/platform-accounts/$id/refresh-token';
  static String oauthCallback(String platform) => '/oauth/$platform/callback';

  // ============================================================
  // ZALO ENDPOINTS
  // ============================================================
  static const String zaloAccounts = '/zalo';
  static const String zaloStatus = '/zalo/status';
  static const String zaloLogin = '/zalo/login';
  static const String zaloSync = '/zalo/sync';
  static String zaloAccount(int id) => '/zalo/$id';
  static String zaloSyncGroups(int id) => '/zalo/$id/sync-groups';
  static String zaloSendMessage(int id) => '/zalo/$id/send-message';
  static String zaloConfigureWebhook(int id) => '/zalo/$id/webhook';
  static String zaloAssignUser(int id) => '/zalo/$id/assign-user';
  static String zaloDisconnect(int id) => '/zalo/$id/disconnect';

  // Zalo Inbox
  static const String zaloInboxConversations = '/zalo/inbox/conversations';
  static String zaloInboxMessages(String threadId) => '/zalo/inbox/messages/$threadId';

  // Zalo Extended APIs
  static String zaloFindUser(int id) => '/zalo/$id/find-user';
  static String zaloFriends(int id) => '/zalo/$id/friends';
  static String zaloAddFriend(int id) => '/zalo/$id/friends/add';
  static String zaloAcceptFriend(int id) => '/zalo/$id/friends/accept';
  static String zaloCreateGroup(int id) => '/zalo/$id/groups/create';
  static String zaloLeaveGroup(int id) => '/zalo/$id/groups/leave';
  static String zaloGroupAddMember(int id, String groupId) => '/zalo/$id/groups/$groupId/add';
  static String zaloGroupRemoveMember(int id, String groupId) => '/zalo/$id/groups/$groupId/remove';
  static String zaloBlockUser(int id, String userId) => '/zalo/$id/users/$userId/block';
  static String zaloUnblockUser(int id, String userId) => '/zalo/$id/users/$userId/unblock';
  static String zaloReact(int id) => '/zalo/$id/react';
  static String zaloDeleteMessage(int id) => '/zalo/$id/delete-message';
  static String zaloSendSticker(int id) => '/zalo/$id/send-sticker';
  static String zaloSendVoice(int id) => '/zalo/$id/send-voice';
  static String zaloSendCard(int id) => '/zalo/$id/send-card';
  static String zaloUserInfo(int id) => '/zalo/$id/user-info';
  static String zaloAccountInfo(int id) => '/zalo/$id/account-info';
  static String zaloStickers(int id) => '/zalo/$id/stickers';
  static String zaloGroupInfo(int id, String groupId) => '/zalo/$id/groups/$groupId/info';
  static String zaloGroupRename(int id, String groupId) => '/zalo/$id/groups/$groupId/rename';
  static String zaloGroupDelete(int id, String groupId) => '/zalo/$id/groups/$groupId/delete';
  static String zaloGroupPromote(int id, String groupId) => '/zalo/$id/groups/$groupId/promote';
  static String zaloGroupDemote(int id, String groupId) => '/zalo/$id/groups/$groupId/demote';
  static String zaloGroupTransfer(int id, String groupId) => '/zalo/$id/groups/$groupId/transfer';
  static String zaloGroupPoll(int id, String groupId) => '/zalo/$id/groups/$groupId/poll';
  static String zaloGroupNote(int id, String groupId) => '/zalo/$id/groups/$groupId/note';
  static String zaloPollLock(int id, String pollId) => '/zalo/$id/polls/$pollId/lock';
  static String zaloNoteEdit(int id, String noteId) => '/zalo/$id/notes/$noteId';
  static String zaloUserAlias(int id, String userId) => '/zalo/$id/users/$userId/alias';
  static String zaloPinConversation(int id, String threadId) => '/zalo/$id/conversations/$threadId/pin';

  // ============================================================
  // WEBHOOKS (Public - No auth required)
  // ============================================================
  static const String webhookZaloVerify = '/webhooks/zalo';
  static const String webhookZalo = '/webhooks/zalo';
  static const String webhookFacebookVerify = '/webhooks/facebook';
  static const String webhookFacebook = '/webhooks/facebook';
  
  // Zalo Personal Webhooks
  static const String zaloWebhook = '/zalo-webhook';
  static const String zaloWebhookMessage = '/zalo-webhook/message';
  static const String zaloWebhookGroupEvent = '/zalo-webhook/group-event';
  static const String zaloWebhookReaction = '/zalo-webhook/reaction';
  static const String zaloWebhookStatus = '/zalo-webhook/status';

  // ============================================================
  // BROADCASTING
  // ============================================================
  static const String broadcastingAuth = '/broadcasting/auth';
}
