import 'package:flutter/material.dart';

class PencilDashboardDemo extends StatelessWidget {
  const PencilDashboardDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final isCompact = width < 900;
    final isMedium = width < 1240;

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: SafeArea(
        child: Center(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final maxWidth = constraints.maxWidth.clamp(0, 1440).toDouble();
              return ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxWidth),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _DashboardHeader(),
                      const SizedBox(height: 24),
                      _ToolbarRow(isCompact: isCompact),
                      const SizedBox(height: 20),
                      _MetricsGrid(isCompact: isCompact, isMedium: isMedium),
                      const SizedBox(height: 20),
                      _ContentGrid(isCompact: isCompact),
                      const SizedBox(height: 20),
                      _BottomGrid(isCompact: isCompact),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Revenue command center',
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Hybrid Pencil + MCP composition for product and growth teams',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }
}

class _ToolbarRow extends StatelessWidget {
  const _ToolbarRow({required this.isCompact});

  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    return _SurfaceCard(
      padding: const EdgeInsets.all(16),
      child: isCompact
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _PillTabs(),
                const SizedBox(height: 12),
                const _SearchBox(),
                const SizedBox(height: 12),
                Row(
                  children: const [
                    Expanded(child: _GhostButton()),
                    SizedBox(width: 12),
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Color(0xFF1E293B),
                      child: Text(
                        'S',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            )
          : Row(
              children: const [
                _PillTabs(),
                SizedBox(width: 16),
                Expanded(child: _SearchBox()),
                SizedBox(width: 16),
                _GhostButton(),
                SizedBox(width: 16),
                CircleAvatar(
                  radius: 24,
                  backgroundColor: Color(0xFF1E293B),
                  child: Text(
                    'S',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

class _PillTabs extends StatelessWidget {
  const _PillTabs();

  @override
  Widget build(BuildContext context) {
    Widget tab(String label, bool selected) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF0F172A) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : const Color(0xFF334155),
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          tab('Overview', true),
          tab('Pipeline', false),
          tab('Ops', false),
        ],
      ),
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: const Row(
        children: [
          Icon(Icons.search_rounded, color: Color(0xFF64748B)),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Search accounts, campaigns, or owners',
              style: TextStyle(color: Color(0xFF94A3B8)),
            ),
          ),
        ],
      ),
    );
  }
}

class _GhostButton extends StatelessWidget {
  const _GhostButton();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 18),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: Text(
          'Share snapshot',
          style: TextStyle(
            color: Color(0xFF1D4ED8),
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _MetricsGrid extends StatelessWidget {
  const _MetricsGrid({required this.isCompact, required this.isMedium});

  final bool isCompact;
  final bool isMedium;

  @override
  Widget build(BuildContext context) {
    const items = [
      _MetricData('MRR', '\$128K', Color(0xFF2F6BFF)),
      _MetricData('Growth', '+18.4%', Color(0xFF19A974)),
      _MetricData('Expansion', '\$24K', Color(0xFF7C3AED)),
      _MetricData('Churn', '1.9%', Color(0xFFF97316)),
    ];

    final crossAxisCount = isCompact ? 1 : (isMedium ? 2 : 4);
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        mainAxisSpacing: 18,
        crossAxisSpacing: 18,
        childAspectRatio: isCompact ? 3.4 : 1.7,
      ),
      itemBuilder: (context, index) => _MetricCard(data: items[index]),
    );
  }
}

class _MetricData {
  const _MetricData(this.label, this.value, this.accent);

  final String label;
  final String value;
  final Color accent;
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.data});

  final _MetricData data;

  @override
  Widget build(BuildContext context) {
    return _SurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 6,
            decoration: BoxDecoration(
              color: data.accent,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const Spacer(),
          Text(
            data.label,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            data.value,
            style: const TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 30,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _ContentGrid extends StatelessWidget {
  const _ContentGrid({required this.isCompact});

  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    if (isCompact) {
      return const Column(
        children: [
          _PerformancePanel(),
          SizedBox(height: 20),
          _InsightsPanel(),
        ],
      );
    }

    return const Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 7, child: _PerformancePanel()),
        SizedBox(width: 20),
        Expanded(flex: 3, child: _InsightsPanel()),
      ],
    );
  }
}

class _PerformancePanel extends StatelessWidget {
  const _PerformancePanel();

  @override
  Widget build(BuildContext context) {
    const values = [0.38, 0.54, 0.48, 0.7, 0.64, 0.84];
    const colors = [
      Color(0xFFDBEAFE),
      Color(0xFFBFDBFE),
      Color(0xFF93C5FD),
      Color(0xFF60A5FA),
      Color(0xFF3B82F6),
      Color(0xFF1D4ED8),
    ];

    return _SurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Weekly revenue performance',
            style: TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Current quarter trend against target trajectory',
            style: TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 28),
          SizedBox(
            height: 280,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(values.length, (index) {
                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: index == values.length - 1 ? 0 : 14),
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: FractionallySizedBox(
                        heightFactor: values[index],
                        child: Container(
                          decoration: BoxDecoration(
                            color: colors[index],
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _InsightsPanel extends StatelessWidget {
  const _InsightsPanel();

  @override
  Widget build(BuildContext context) {
    const items = [
      'MRR is 12% above the expected weekly trajectory.',
      'Expansion revenue increased after pricing page cleanup.',
      'Churn remains controlled despite larger enterprise rollout.',
      'Pencil controls are now available for real design-system orchestration.',
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Signals',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          for (final item in items) ...[
            Text(
              item,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 14),
          ],
        ],
      ),
    );
  }
}

class _BottomGrid extends StatelessWidget {
  const _BottomGrid({required this.isCompact});

  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    if (isCompact) {
      return const Column(
        children: [
          _ActivityPanel(),
          SizedBox(height: 20),
          _ProgressPanel(),
        ],
      );
    }

    return const Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: _ActivityPanel()),
        SizedBox(width: 20),
        Expanded(child: _ProgressPanel()),
      ],
    );
  }
}

class _ActivityPanel extends StatelessWidget {
  const _ActivityPanel();

  @override
  Widget build(BuildContext context) {
    const entries = [
      'Pricing update deployed to 100% of traffic',
      'Sales ops completed enterprise migration checklist',
      'Growth team shipped onboarding iteration B',
    ];

    return _SurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Recent operational activity',
            style: TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 18),
          for (final entry in entries) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 6),
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF3B82F6),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    entry,
                    style: const TextStyle(
                      color: Color(0xFF475569),
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

class _ProgressPanel extends StatelessWidget {
  const _ProgressPanel();

  @override
  Widget build(BuildContext context) {
    const bars = [
      ('Launch readiness', 0.92, Color(0xFF2563EB)),
      ('Enterprise rollout', 0.74, Color(0xFF22C55E)),
      ('Lifecycle clean-up', 0.61, Color(0xFFF59E0B)),
    ];

    return _SurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Execution progress',
            style: TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 20),
          for (final bar in bars) ...[
            Text(
              bar.$1,
              style: const TextStyle(
                color: Color(0xFF475569),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                minHeight: 16,
                value: bar.$2,
                color: bar.$3,
                backgroundColor: const Color(0xFFE2E8F0),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ],
      ),
    );
  }
}

class _SurfaceCard extends StatelessWidget {
  const _SurfaceCard({
    required this.child,
    this.padding = const EdgeInsets.all(24),
  });

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(15, 23, 42, 0.08),
            blurRadius: 36,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}
