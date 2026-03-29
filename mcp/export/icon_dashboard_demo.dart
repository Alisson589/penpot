import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class AppTokens {
  const AppTokens._();

  static const double radiusMd = 12;
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const Color colorSurface = Color(0xFFFFFFFF);
  static const Color colorTextPrimary = Color(0xFF111827);
  static const Color colorTextMuted = Color(0xFF6B7280);
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const double fontSizeTitle = 20;
  static const double fontSizeBody = 14;
  static const double radiusLg = 16;
  static const Color colorSurfaceCard = Color(0xFFFFFFFF);
  static const Color colorSurfaceSidebar = Color(0xFFE5E7EB);
  static const String fontFamilyBase = 'Work Sans';
  static const double fontSizeWeightDemo = 20;
  static const Color colorBorderSubtle = Color(0xFFD1D5DB);
  static const double radiusCard = 12;
}

class IconDashboardDemo extends StatelessWidget {
  const IconDashboardDemo({super.key});

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
            Padding(padding: const EdgeInsets.all(16), child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  Text(
                        'Navigation',
                        style: TextStyle(fontSize: AppTokens.fontSizeTitle, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightBold),
                      ),
                  const SizedBox(height: 16),
                  Padding(padding: const EdgeInsets.all(12), child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Container(
                                  width: 24,
                                  height: 24,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                    Icon(
                                              LucideIcons.home,
                                              size: 20,
                                            )
                                    ],
                                  ),
                                ),
                          const SizedBox(width: 12),
                          Text(
                                  'Overview',
                                  style: TextStyle(fontSize: AppTokens.fontSizeBody, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                )
                        ],
                      )),
                  const SizedBox(height: 16),
                  Padding(padding: const EdgeInsets.all(12), child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Container(
                                  width: 24,
                                  height: 24,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                    Icon(
                                              LucideIcons.barChart3,
                                              size: 20,
                                            )
                                    ],
                                  ),
                                ),
                          const SizedBox(width: 12),
                          Text(
                                  'Analytics',
                                  style: TextStyle(fontSize: AppTokens.fontSizeBody, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                )
                        ],
                      )),
                  const SizedBox(height: 16),
                  Padding(padding: const EdgeInsets.all(12), child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Container(
                                  width: 24,
                                  height: 24,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                    Icon(
                                              LucideIcons.usersRound,
                                              size: 20,
                                            )
                                    ],
                                  ),
                                ),
                          const SizedBox(width: 12),
                          Text(
                                  'Customers',
                                  style: TextStyle(fontSize: AppTokens.fontSizeBody, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                )
                        ],
                      )),
                  const SizedBox(height: 16),
                  Padding(padding: const EdgeInsets.all(12), child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Container(
                                  width: 24,
                                  height: 24,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                    Icon(
                                              LucideIcons.settings,
                                              size: 20,
                                            )
                                    ],
                                  ),
                                ),
                          const SizedBox(width: 12),
                          Text(
                                  'Settings',
                                  style: TextStyle(fontSize: AppTokens.fontSizeBody, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                )
                        ],
                      ))
                  ],
                )),
            Padding(padding: const EdgeInsets.all(16), child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  Padding(padding: const EdgeInsets.all(16), child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildVariantCard(title: 'Operations Overview', subtitle: 'Dashboard com sidebar, header, body e icons de library', fontFamily: 'sourcesanspro', titleWeight: FontWeight.w400),
                          const SizedBox(width: 16),
                          Padding(padding: const EdgeInsets.all(16), child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    Container(
                                              width: 24,
                                              height: 24,
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                Icon(
                                                            LucideIcons.bell,
                                                            size: 20,
                                                          )
                                                ],
                                              ),
                                            ),
                                    const SizedBox(width: 12),
                                    Container(
                                              height: 24,
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                Icon(
                                                            LucideIcons.layoutDashboard,
                                                            size: 20,
                                                          )
                                                ],
                                              ),
                                            ),
                                    const SizedBox(width: 12),
                                    Container(
                                              width: 24,
                                              height: 24,
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                Icon(
                                                            LucideIcons.usersRound,
                                                            size: 20,
                                                          )
                                                ],
                                              ),
                                            )
                                  ],
                                ))
                        ],
                      )),
                  const SizedBox(height: 24),
                  Padding(padding: const EdgeInsets.all(16), child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                          Padding(padding: const EdgeInsets.all(16), child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    Padding(padding: const EdgeInsets.all(16), child: Container(
                                              height: 120,
                                              decoration: BoxDecoration(color: AppTokens.colorSurfaceCard, borderRadius: BorderRadius.circular(AppTokens.radiusMd)),child: const SizedBox.shrink(),
                                            )),
                                    const SizedBox(width: 16),
                                    Padding(padding: const EdgeInsets.all(16), child: Container(
                                              height: 120,
                                              decoration: BoxDecoration(color: AppTokens.colorSurfaceCard, borderRadius: BorderRadius.circular(AppTokens.radiusMd)),child: const SizedBox.shrink(),
                                            )),
                                    const SizedBox(width: 16),
                                    Padding(padding: const EdgeInsets.all(16), child: Container(
                                              height: 120,
                                              decoration: BoxDecoration(color: AppTokens.colorSurfaceCard, borderRadius: BorderRadius.circular(AppTokens.radiusMd)),child: const SizedBox.shrink(),
                                            ))
                                  ],
                                )),
                          const SizedBox(height: 24),
                          Padding(padding: const EdgeInsets.all(16), child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    Padding(padding: const EdgeInsets.all(16), child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                Padding(padding: const EdgeInsets.all(16), child: Row(
                                                            crossAxisAlignment: CrossAxisAlignment.center,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            children: [
                                                              Container(
                                                                            width: 24,
                                                                            height: 24,
                                                                            child: Column(
                                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                                              children: [
                                                                              Icon(
                                                                                              LucideIcons.barChartHorizontalBig,
                                                                                              size: 20,
                                                                                            )
                                                                              ],
                                                                            ),
                                                                          ),
                                                              const SizedBox(width: 12),
                                                              Text(
                                                                            'Performance Trend',
                                                                            style: TextStyle(fontSize: AppTokens.fontSizeTitle, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                                                          )
                                                            ],
                                                          )),
                                                const SizedBox(height: 12),
                                                Container(
                                                            height: 260,
                                                            decoration: BoxDecoration(color: AppTokens.colorSurfaceSidebar, borderRadius: BorderRadius.circular(AppTokens.radiusMd)),child: const SizedBox.shrink(),
                                                          )
                                                ],
                                              )),
                                    const SizedBox(width: 16),
                                    Padding(padding: const EdgeInsets.all(16), child: ConstrainedBox(
                                              constraints: const BoxConstraints(maxWidth: 300),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                Padding(padding: const EdgeInsets.all(16), child: Row(
                                                            crossAxisAlignment: CrossAxisAlignment.center,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            children: [
                                                              Container(
                                                                            width: 24,
                                                                            height: 24,
                                                                            child: Column(
                                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                                              children: [
                                                                              Icon(
                                                                                              LucideIcons.activitySquare,
                                                                                              size: 20,
                                                                                            )
                                                                              ],
                                                                            ),
                                                                          ),
                                                              const SizedBox(width: 12),
                                                              Text(
                                                                            'Recent Activity',
                                                                            style: TextStyle(fontSize: AppTokens.fontSizeTitle, fontFamily: 'sourcesanspro', fontWeight: AppTokens.fontWeightMedium),
                                                                          )
                                                            ],
                                                          )),
                                                const SizedBox(height: 12),
                                                Text(
                                                            'Sidebar com ícones reais da Lucide e estrutura pronta para export.',
                                                            style: TextStyle(fontSize: AppTokens.fontSizeBody, fontFamily: 'sourcesanspro', fontWeight: FontWeight.w400),
                                                          )
                                                ],
                                              ),
                                            ))
                                  ],
                                ))
                          ],
                        ))
                  ],
                ))
            ],
          ),
        ),
      ),
    );
  }
}
