import 'package:flutter/material.dart';

class AppTokens {
  const AppTokens._();

  static const FontWeight fontWeightBold = FontWeight.w700;
  static const Color colorSurface = Color(0xFFFFFFFF);
  static const Color colorTextPrimary = Color(0xFF111827);
  static const Color colorTextMuted = Color(0xFF6B7280);
  static const Color colorBorderSubtle = Color(0xFFD1D5DB);
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const double radiusCard = 12;
  static const double fontSizeTitle = 18;
  static const double fontSizeBody = 14;
  static const double fontSizeWeightDemo = 20;
  static const String fontFamilyBase = 'Work Sans';
}

class PenpotTokenDemo extends StatelessWidget {
  const PenpotTokenDemo({super.key});

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

  Widget _buildFontWeightText(String label, FontWeight weight) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Text(
        label,
        style: TextStyle(
          fontSize: AppTokens.fontSizeWeightDemo,
          fontFamily: AppTokens.fontFamilyBase,
          fontWeight: weight,
          color: AppTokens.colorTextPrimary,
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
        Padding(padding: const EdgeInsets.all(24), child: Container(
          width: 760,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text(
            'Font Weights',
            style: const TextStyle(fontSize: 24, fontFamily: 'Work Sans', fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 24),
          Padding(padding: const EdgeInsets.all(16), child: Container(
            width: 320,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            _buildFontWeightText('bold', FontWeight.w700),
            SizedBox(height: 12),
            _buildFontWeightText('semibold', FontWeight.w600),
            SizedBox(height: 12),
            _buildFontWeightText('500', FontWeight.w500),
            SizedBox(height: 12),
            _buildFontWeightText('700', FontWeight.w700)
              ],
            ),
          )),
          SizedBox(height: 24),
          Text(
            'State Variants',
            style: const TextStyle(fontSize: 24, fontFamily: 'Work Sans', fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 24),
          Padding(padding: const EdgeInsets.all(16), child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
            Padding(padding: const EdgeInsets.all(16), child: _buildVariantCard(title: 'Hover', subtitle: 'Hover state', fontFamily: 'sourcesanspro', titleWeight: FontWeight.w700, titleColor: AppTokens.colorTextPrimary, bodyColor: AppTokens.colorTextMuted, surfaceColor: AppTokens.colorSurface, borderColor: AppTokens.colorBorderSubtle, radius: AppTokens.radiusCard)),
            SizedBox(width: 24),
            Padding(padding: const EdgeInsets.all(16), child: _buildVariantCard(title: 'Hover', subtitle: 'Hover state', fontFamily: AppTokens.fontFamilyBase, titleWeight: FontWeight.w700, titleColor: AppTokens.colorTextPrimary, bodyColor: AppTokens.colorTextMuted, titleSize: AppTokens.fontSizeTitle, bodySize: AppTokens.fontSizeBody, surfaceColor: AppTokens.colorSurface, borderColor: AppTokens.colorBorderSubtle, radius: AppTokens.radiusCard)),
            SizedBox(width: 24),
            Padding(padding: const EdgeInsets.all(16), child: _buildVariantCard(title: 'Default', subtitle: 'Base state', fontFamily: AppTokens.fontFamilyBase, titleWeight: FontWeight.w500, titleColor: AppTokens.colorTextPrimary, bodyColor: AppTokens.colorTextMuted, titleSize: AppTokens.fontSizeTitle, bodySize: AppTokens.fontSizeBody, surfaceColor: AppTokens.colorSurface, borderColor: AppTokens.colorBorderSubtle, radius: AppTokens.radiusCard))
            ],
          ))
            ],
          ),
        ))
          ],
        ),
      ),
      ),
    );
  }
}
