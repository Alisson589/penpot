import 'package:flutter/material.dart';

import 'pencil_dashboard_demo.dart';

void main() {
  runApp(const PencilDashboardDemoApp());
}

class PencilDashboardDemoApp extends StatelessWidget {
  const PencilDashboardDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Pencil Dashboard Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2F6BFF)),
        scaffoldBackgroundColor: const Color(0xFFF3F6FB),
        useMaterial3: true,
      ),
      home: const PencilDashboardDemo(),
    );
  }
}
