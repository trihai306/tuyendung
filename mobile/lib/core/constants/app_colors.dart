import 'package:flutter/material.dart';

/// Professional color palette for Viecly - Premium Recruitment App
class AppColors {
  // ═══════════════════════════════════════════════════════════════════
  // PRIMARY BRAND COLORS - Modern Emerald/Teal gradient
  // ═══════════════════════════════════════════════════════════════════
  static const Color primary = Color(0xFF059669);        // Emerald-600
  static const Color primaryLight = Color(0xFF34D399);   // Emerald-400
  static const Color primaryDark = Color(0xFF047857);    // Emerald-700
  static const Color primarySoft = Color(0xFFD1FAE5);    // Emerald-100

  // ═══════════════════════════════════════════════════════════════════
  // SECONDARY ACCENT COLORS
  // ═══════════════════════════════════════════════════════════════════
  static const Color accent = Color(0xFF8B5CF6);         // Violet-500
  static const Color accentLight = Color(0xFFA78BFA);    // Violet-400
  static const Color accentDark = Color(0xFF7C3AED);     // Violet-600
  static const Color accentSoft = Color(0xFFEDE9FE);     // Violet-100

  // ═══════════════════════════════════════════════════════════════════
  // NEUTRAL COLORS - Modern Slate palette
  // ═══════════════════════════════════════════════════════════════════
  static const Color background = Color(0xFFF8FAFC);     // Slate-50
  static const Color surface = Color(0xFFFFFFFF);        // Pure white
  static const Color surfaceVariant = Color(0xFFF1F5F9); // Slate-100
  static const Color surfaceElevated = Color(0xFFF8FAFC);

  // ═══════════════════════════════════════════════════════════════════
  // TEXT COLORS - High contrast for readability
  // ═══════════════════════════════════════════════════════════════════
  static const Color textPrimary = Color(0xFF0F172A);    // Slate-900
  static const Color textSecondary = Color(0xFF475569);  // Slate-600
  static const Color textTertiary = Color(0xFF94A3B8);   // Slate-400
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnDark = Color(0xFFF1F5F9);

  // ═══════════════════════════════════════════════════════════════════
  // SEMANTIC STATUS COLORS
  // ═══════════════════════════════════════════════════════════════════
  static const Color success = Color(0xFF22C55E);        // Green-500
  static const Color successLight = Color(0xFFDCFCE7);   // Green-100
  static const Color warning = Color(0xFFF59E0B);        // Amber-500
  static const Color warningLight = Color(0xFFFEF3C7);   // Amber-100
  static const Color error = Color(0xFFEF4444);          // Red-500
  static const Color errorLight = Color(0xFFFEE2E2);     // Red-100
  static const Color info = Color(0xFF3B82F6);           // Blue-500
  static const Color infoLight = Color(0xFFDBEAFE);      // Blue-100

  // ═══════════════════════════════════════════════════════════════════
  // BORDER COLORS
  // ═══════════════════════════════════════════════════════════════════
  static const Color border = Color(0xFFE2E8F0);         // Slate-200
  static const Color borderLight = Color(0xFFF1F5F9);    // Slate-100
  static const Color borderFocus = Color(0xFF059669);    // Primary

  // ═══════════════════════════════════════════════════════════════════
  // DARK MODE COLORS
  // ═══════════════════════════════════════════════════════════════════
  static const Color backgroundDark = Color(0xFF0F172A); // Slate-900
  static const Color surfaceDark = Color(0xFF1E293B);    // Slate-800
  static const Color surfaceVariantDark = Color(0xFF334155); // Slate-700
  static const Color borderDark = Color(0xFF475569);     // Slate-600
  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);

  // ═══════════════════════════════════════════════════════════════════
  // GRADIENTS - Premium visual effects
  // ═══════════════════════════════════════════════════════════════════
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF0D9488)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF0891B2)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient glassGradient = LinearGradient(
    colors: [Color(0x20FFFFFF), Color(0x10FFFFFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ═══════════════════════════════════════════════════════════════════
  // SHADOWS
  // ═══════════════════════════════════════════════════════════════════
  static List<BoxShadow> get shadowSm => [
    BoxShadow(
      color: const Color(0xFF0F172A).withOpacity(0.04),
      blurRadius: 4,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> get shadowMd => [
    BoxShadow(
      color: const Color(0xFF0F172A).withOpacity(0.06),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get shadowLg => [
    BoxShadow(
      color: const Color(0xFF0F172A).withOpacity(0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> get shadowPrimary => [
    BoxShadow(
      color: primary.withOpacity(0.3),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];

  static List<BoxShadow> get shadowAccent => [
    BoxShadow(
      color: accent.withOpacity(0.3),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];
}
