import 'package:flutter/material.dart';

class PenpotVariantDemo extends StatelessWidget {
  const PenpotVariantDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
        const SizedBox.shrink(),
        Container(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text(
            'bold',
            style: TextStyle(fontSize: 20, fontFamily: 'Work Sans', fontWeight: FontWeight.w700),
          ),
          Text(
            'semibold',
            style: TextStyle(fontSize: 20, fontFamily: 'Work Sans', fontWeight: FontWeight.w600),
          ),
          Text(
            '500',
            style: TextStyle(fontSize: 20, fontFamily: 'Work Sans', fontWeight: FontWeight.w500),
          ),
          Text(
            '700',
            style: TextStyle(fontSize: 20, fontFamily: 'Work Sans', fontWeight: FontWeight.w700),
          )
            ],
          ),
        ),
        Padding(padding: const EdgeInsets.all(16), child: Container(
          width: 220,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text(
            'Hover',
            style: TextStyle(fontSize: 18, fontFamily: 'sourcesanspro', fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 8),
          Text(
            'Hover state',
            style: TextStyle(fontSize: 14, fontFamily: 'sourcesanspro', fontWeight: FontWeight.w400),
          )
            ],
          ),
        )),
        Container(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Padding(padding: const EdgeInsets.all(16), child: Container(
            width: 220,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Text(
              'Hover',
              style: TextStyle(fontSize: 18, fontFamily: 'Work Sans', fontWeight: FontWeight.w700),
            ),
            SizedBox(height: 8),
            Text(
              'Hover state',
              style: TextStyle(fontSize: 14, fontFamily: 'Work Sans', fontWeight: FontWeight.w400),
            )
              ],
            ),
          )),
          Padding(padding: const EdgeInsets.all(16), child: Container(
            width: 220,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Text(
              'Default',
              style: TextStyle(fontSize: 18, fontFamily: 'Work Sans', fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 8),
            Text(
              'Base state',
              style: TextStyle(fontSize: 14, fontFamily: 'Work Sans', fontWeight: FontWeight.w400),
            )
              ],
            ),
          ))
            ],
          ),
        )
          ],
        ),
      ),
      ),
    );
  }
}
