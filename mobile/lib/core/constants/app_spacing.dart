import 'package:flutter/material.dart';

/// Consistent spacing system for Viecly
class AppSpacing {
  // ═══════════════════════════════════════════════════════════════════
  // BASE SPACING SCALE (4px grid system)
  // ═══════════════════════════════════════════════════════════════════
  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double base = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
  static const double huge = 64;

  // ═══════════════════════════════════════════════════════════════════
  // PADDING PRESETS
  // ═══════════════════════════════════════════════════════════════════
  static const EdgeInsets paddingXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingMd = EdgeInsets.all(md);
  static const EdgeInsets paddingBase = EdgeInsets.all(base);
  static const EdgeInsets paddingLg = EdgeInsets.all(lg);
  static const EdgeInsets paddingXl = EdgeInsets.all(xl);
  static const EdgeInsets paddingXxl = EdgeInsets.all(xxl);

  // Screen padding
  static const EdgeInsets screenPadding = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: base,
  );

  static const EdgeInsets screenPaddingHorizontal = EdgeInsets.symmetric(
    horizontal: lg,
  );

  // ═══════════════════════════════════════════════════════════════════
  // CARD PADDING
  // ═══════════════════════════════════════════════════════════════════
  static const EdgeInsets cardPadding = EdgeInsets.all(base);
  static const EdgeInsets cardPaddingLarge = EdgeInsets.all(lg);

  // ═══════════════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════════════════════
  static const double radiusXs = 4;
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusBase = 16;
  static const double radiusLg = 20;
  static const double radiusXl = 24;
  static const double radiusXxl = 32;
  static const double radiusFull = 9999;

  static BorderRadius get borderRadiusSm => BorderRadius.circular(radiusSm);
  static BorderRadius get borderRadiusMd => BorderRadius.circular(radiusMd);
  static BorderRadius get borderRadiusBase => BorderRadius.circular(radiusBase);
  static BorderRadius get borderRadiusLg => BorderRadius.circular(radiusLg);
  static BorderRadius get borderRadiusXl => BorderRadius.circular(radiusXl);

  // ═══════════════════════════════════════════════════════════════════
  // RESPONSIVE HELPERS
  // ═══════════════════════════════════════════════════════════════════
  static EdgeInsets responsiveScreen(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < 375) return const EdgeInsets.symmetric(horizontal: base);
    if (width < 428) return const EdgeInsets.symmetric(horizontal: lg);
    return const EdgeInsets.symmetric(horizontal: xl);
  }

  // ═══════════════════════════════════════════════════════════════════
  // GAPS (for Row/Column spacing)
  // ═══════════════════════════════════════════════════════════════════
  static const SizedBox gapXs = SizedBox(width: xs, height: xs);
  static const SizedBox gapSm = SizedBox(width: sm, height: sm);
  static const SizedBox gapMd = SizedBox(width: md, height: md);
  static const SizedBox gapBase = SizedBox(width: base, height: base);
  static const SizedBox gapLg = SizedBox(width: lg, height: lg);
  static const SizedBox gapXl = SizedBox(width: xl, height: xl);
  static const SizedBox gapXxl = SizedBox(width: xxl, height: xxl);

  // Horizontal gaps
  static const SizedBox hGapXs = SizedBox(width: xs);
  static const SizedBox hGapSm = SizedBox(width: sm);
  static const SizedBox hGapMd = SizedBox(width: md);
  static const SizedBox hGapBase = SizedBox(width: base);
  static const SizedBox hGapLg = SizedBox(width: lg);

  // Vertical gaps
  static const SizedBox vGapXs = SizedBox(height: xs);
  static const SizedBox vGapSm = SizedBox(height: sm);
  static const SizedBox vGapMd = SizedBox(height: md);
  static const SizedBox vGapBase = SizedBox(height: base);
  static const SizedBox vGapLg = SizedBox(height: lg);
  static const SizedBox vGapXl = SizedBox(height: xl);
  static const SizedBox vGapXxl = SizedBox(height: xxl);
}
