import 'package:flutter/material.dart';

class AppTokens {
  const AppTokens._();

  static const double radiusMd = 0;
  static const FontWeight fontWeightBold = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w400;
  static const double spacingMd = 0;
  static const double fontSizeTitle = 0;
  static const double fontSizeBody = 0;
  static const double radiusLg = 0;
  static const String fontFamilyBase = 'Work Sans';
  static const double fontSizeWeightDemo = 20;
  static const Color colorBorderSubtle = Color(0xFFD1D5DB);
  static const double radiusCard = 12;
}

class PhaseFiveComplexDashboard extends StatelessWidget {
  const PhaseFiveComplexDashboard({super.key});

  Widget _buildVariantCard({
    required String title,
    required String subtitle,
    String fontFamily = AppTokens.fontFamilyBase,
    FontWeight titleWeight = AppTokens.fontWeightBold,
    Color titleColor = AppTokens.colorTextPrimary,
    Color bodyColor = AppTokens.colorTextMuted,
    Color surfaceColor = AppTokens.colorSurface,
    Color borderColor = AppTokens.colorBorderSubtle,
    double titleSize = AppTokens.fontSizeTitle,
    double bodySize = AppTokens.fontSizeBody,
    double radius = AppTokens.radiusCard,
  }) {
    return Container(
      width: 220,
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: titleSize,
                fontFamily: fontFamily,
                fontWeight: titleWeight,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: bodySize,
                fontFamily: fontFamily,
                fontWeight: FontWeight.w400,
                color: bodyColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Padding(padding: const EdgeInsets.all(16), child: Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  _buildVariantCard(title: 'Revenue Dashboard', subtitle: 'Complex smoke for token-first export', fontFamily: 'sourcesanspro', titleWeight: FontWeight.w400),
                  _buildVariantCard(title: 'Title', subtitle: 'Subtitle', surfaceColor: AppTokens.colorBrandPrimary, borderColor: AppTokens.radiusMd, radius: AppTokens.radiusMd)
                ],
              )),
            Padding(padding: const EdgeInsets.all(16), child: Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  _buildVariantCard(title: 'Title', subtitle: 'Subtitle', surfaceColor: AppTokens.colorSurfaceCard, borderColor: AppTokens.radiusMd, radius: AppTokens.radiusMd),
                  _buildVariantCard(title: 'Title', subtitle: 'Subtitle', surfaceColor: AppTokens.colorSurfaceCard, borderColor: AppTokens.radiusMd, radius: AppTokens.radiusMd),
                  _buildVariantCard(title: 'Title', subtitle: 'Subtitle', surfaceColor: AppTokens.colorSurfaceCard, borderColor: AppTokens.radiusMd, radius: AppTokens.radiusMd)
                ],
              )),
            Padding(padding: const EdgeInsets.all(16), child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Padding(padding: const EdgeInsets.all(16), child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                          Text(
                                  'Weekly Revenue',
                                  style: TextStyle(fontSize: AppTokens.fontSizeTitle, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                ),
                          const SizedBox(height: 12),
                          _buildVariantCard(title: 'Title', subtitle: 'Subtitle', surfaceColor: AppTokens.colorSurfaceSidebar, borderColor: AppTokens.radiusMd, radius: AppTokens.radiusMd)
                          ],
                        )),
                  const SizedBox(width: 16),
                  _buildVariantCard(title: 'Highlights', subtitle: 'Tokenized sidebar with semantic colors and spacing.', fontFamily: 'sourcesanspro', titleWeight: FontWeight.w400, surfaceColor: AppTokens.colorSurfaceSidebar, borderColor: AppTokens.radiusMd, radius: AppTokens.radiusMd)
                ],
              ))
            ],
          ),
        ),
      ),
    );
  }
}
