import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

/// Premium Button Widget with gradient support
class PremiumButton extends StatelessWidget {
  const PremiumButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.fullWidth = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final padding = _getPadding();
    final fontSize = _getFontSize();
    final iconSize = _getIconSize();

    Widget child = Row(
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading)
          SizedBox(
            width: iconSize,
            height: iconSize,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(
                variant == ButtonVariant.primary ? Colors.white : AppColors.primary,
              ),
            ),
          )
        else if (icon != null) ...[
          Icon(icon, size: iconSize),
          const SizedBox(width: 8),
        ],
        Text(
          label,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.2,
          ),
        ),
      ],
    );

    switch (variant) {
      case ButtonVariant.primary:
        return Container(
          width: fullWidth ? double.infinity : null,
          decoration: BoxDecoration(
            gradient: onPressed != null ? AppColors.primaryGradient : null,
            color: onPressed == null ? AppColors.textTertiary : null,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            boxShadow: onPressed != null ? AppColors.shadowPrimary : null,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: isLoading ? null : onPressed,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              child: Padding(
                padding: padding,
                child: DefaultTextStyle(
                  style: const TextStyle(color: Colors.white),
                  child: IconTheme(
                    data: const IconThemeData(color: Colors.white),
                    child: child,
                  ),
                ),
              ),
            ),
          ),
        );

      case ButtonVariant.secondary:
        return Container(
          width: fullWidth ? double.infinity : null,
          decoration: BoxDecoration(
            color: AppColors.primarySoft,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: isLoading ? null : onPressed,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              child: Padding(
                padding: padding,
                child: DefaultTextStyle(
                  style: const TextStyle(color: AppColors.primary),
                  child: IconTheme(
                    data: const IconThemeData(color: AppColors.primary),
                    child: child,
                  ),
                ),
              ),
            ),
          ),
        );

      case ButtonVariant.outline:
        return Container(
          width: fullWidth ? double.infinity : null,
          decoration: BoxDecoration(
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.border,
              width: 1.5,
            ),
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: isLoading ? null : onPressed,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              child: Padding(
                padding: padding,
                child: DefaultTextStyle(
                  style: TextStyle(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                  ),
                  child: IconTheme(
                    data: IconThemeData(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                    ),
                    child: child,
                  ),
                ),
              ),
            ),
          ),
        );

      case ButtonVariant.ghost:
        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isLoading ? null : onPressed,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            child: Padding(
              padding: padding,
              child: DefaultTextStyle(
                style: const TextStyle(color: AppColors.primary),
                child: IconTheme(
                  data: const IconThemeData(color: AppColors.primary),
                  child: child,
                ),
              ),
            ),
          ),
        );
    }
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case ButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 10);
      case ButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 14);
      case ButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 18);
    }
  }

  double _getFontSize() {
    switch (size) {
      case ButtonSize.small:
        return 14;
      case ButtonSize.medium:
        return 16;
      case ButtonSize.large:
        return 18;
    }
  }

  double _getIconSize() {
    switch (size) {
      case ButtonSize.small:
        return 18;
      case ButtonSize.medium:
        return 20;
      case ButtonSize.large:
        return 24;
    }
  }
}

enum ButtonVariant { primary, secondary, outline, ghost }
enum ButtonSize { small, medium, large }

/// Premium Card Widget with optional gradient header
class PremiumCard extends StatelessWidget {
  const PremiumCard({
    super.key,
    required this.child,
    this.padding,
    this.gradient,
    this.onTap,
    this.elevation = 0,
  });

  final Widget child;
  final EdgeInsets? padding;
  final Gradient? gradient;
  final VoidCallback? onTap;
  final double elevation;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        color: gradient == null
            ? (isDark ? AppColors.surfaceDark : AppColors.surface)
            : null,
        borderRadius: BorderRadius.circular(AppSpacing.radiusBase),
        border: gradient == null
            ? Border.all(
                color: isDark ? AppColors.borderDark : AppColors.border,
              )
            : null,
        boxShadow: elevation > 0 ? AppColors.shadowMd : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppSpacing.radiusBase),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(AppSpacing.base),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Glass morphism card
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
  });

  final Widget child;
  final EdgeInsets? padding;
  final double? borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        gradient: AppColors.glassGradient,
        borderRadius: BorderRadius.circular(borderRadius ?? AppSpacing.radiusBase),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
        ),
      ),
      child: child,
    );
  }
}

/// Status Badge Widget
class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    this.status = BadgeStatus.neutral,
    this.size = BadgeSize.medium,
  });

  final String label;
  final BadgeStatus status;
  final BadgeSize size;

  @override
  Widget build(BuildContext context) {
    final colors = _getColors();
    final padding = size == BadgeSize.small
        ? const EdgeInsets.symmetric(horizontal: 8, vertical: 4)
        : const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
    final fontSize = size == BadgeSize.small ? 11.0 : 13.0;

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: colors.text,
          height: 1.2,
        ),
      ),
    );
  }

  ({Color background, Color text}) _getColors() {
    switch (status) {
      case BadgeStatus.success:
        return (background: AppColors.successLight, text: AppColors.success);
      case BadgeStatus.warning:
        return (background: AppColors.warningLight, text: AppColors.warning);
      case BadgeStatus.error:
        return (background: AppColors.errorLight, text: AppColors.error);
      case BadgeStatus.info:
        return (background: AppColors.infoLight, text: AppColors.info);
      case BadgeStatus.primary:
        return (background: AppColors.primarySoft, text: AppColors.primary);
      case BadgeStatus.neutral:
        return (background: AppColors.surfaceVariant, text: AppColors.textSecondary);
    }
  }
}

enum BadgeStatus { success, warning, error, info, primary, neutral }
enum BadgeSize { small, medium }

/// Avatar Widget with gradient border
class PremiumAvatar extends StatelessWidget {
  const PremiumAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.size = 48,
    this.showBorder = false,
  });

  final String? imageUrl;
  final String? name;
  final double size;
  final bool showBorder;

  @override
  Widget build(BuildContext context) {
    final initials = name != null && name!.isNotEmpty
        ? name!.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join()
        : '?';

    Widget avatar;
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      avatar = ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: Image.network(
          imageUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildPlaceholder(initials),
        ),
      );
    } else {
      avatar = _buildPlaceholder(initials);
    }

    if (showBorder) {
      return Container(
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          shape: BoxShape.circle,
        ),
        child: avatar,
      );
    }

    return avatar;
  }

  Widget _buildPlaceholder(String initials) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          initials.toUpperCase(),
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.4,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

/// Empty State Widget
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.description,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? description;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceVariantDark : AppColors.surfaceVariant,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 40,
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              const SizedBox(height: 8),
              Text(
                description!,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Loading Shimmer Widget
class ShimmerBox extends StatefulWidget {
  const ShimmerBox({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
  });

  final double? width;
  final double? height;
  final double? borderRadius;

  @override
  State<ShimmerBox> createState() => _ShimmerBoxState();
}

class _ShimmerBoxState extends State<ShimmerBox>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
    _animation = Tween<double>(begin: -1, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? AppColors.surfaceVariantDark : AppColors.surfaceVariant;
    final highlightColor = isDark ? AppColors.borderDark : AppColors.border;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(
              widget.borderRadius ?? AppSpacing.radiusSm,
            ),
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              stops: [
                _animation.value - 0.3,
                _animation.value,
                _animation.value + 0.3,
              ].map((e) => e.clamp(0.0, 1.0)).toList(),
            ),
          ),
        );
      },
    );
  }
}
