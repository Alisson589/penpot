import 'package:flutter/material.dart';

void main() {
  runApp(
    const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: PenpotTokenDemo(),
    ),
  );
}

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

  Widget _buildSectionTitle(
    String text, {
    double fontSize = 24,
    String fontFamily = AppTokens.fontFamilyBase,
    FontWeight fontWeight = AppTokens.fontWeightBold,
    Color color = AppTokens.colorTextPrimary,
  }) {
    return Text(
      text,
      style: TextStyle(
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        color: color,
      ),
    );
  }

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
              _buildSectionTitle('Font Weights'),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFontWeightText('bold', FontWeight.w700),
                    SizedBox(height: 12),
                    _buildFontWeightText('semibold', FontWeight.w600),
                    SizedBox(height: 12),
                    _buildFontWeightText('500', FontWeight.w500),
                    SizedBox(height: 12),
                    _buildFontWeightText('700', FontWeight.w700),
                  ],
                ),
              ),
              _buildSectionTitle('State Variants'),
              Wrap(
                spacing: 24,
                runSpacing: 24,
                children: [
                  _buildVariantCard(
                    title: 'Hover',
                    subtitle: 'Hover state',
                    fontFamily: 'sourcesanspro',
                    titleWeight: FontWeight.w700,
                  ),
                  _buildVariantCard(
                    title: 'Hover',
                    subtitle: 'Hover state',
                    titleWeight: FontWeight.w700,
                  ),
                  _buildVariantCard(
                    title: 'Default',
                    subtitle: 'Base state',
                    titleWeight: FontWeight.w500,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
