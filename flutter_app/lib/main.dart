import 'package:flutter/material.dart';
import 'three_bridge.dart';

void main() {
  runApp(const MetaverseApp());
}

class MetaverseApp extends StatelessWidget {
  const MetaverseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Metaverse Web',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF7FE9FF)),
      ),
      home: const Scaffold(
        body: MetaverseShell(),
      ),
    );
  }
}

class MetaverseShell extends StatelessWidget {
  const MetaverseShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const Positioned.fill(child: ThreeBridge()),
        Positioned(
          top: 20,
          left: 20,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.35),
              border: Border.all(color: Colors.white.withOpacity(0.15)),
              borderRadius: BorderRadius.circular(14),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: const Text(
              'Metaverse prototype',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
