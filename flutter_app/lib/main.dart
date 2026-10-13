import 'package:flutter/material.dart';

void main() {
  runApp(const MetaverseApp());
}

class MetaverseApp extends StatelessWidget {
  const MetaverseApp({ super.key });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true),
      home: const Scaffold(
        body: BabylonView(),
      ),
    );
  }
}

class BabylonView extends StatelessWidget {
  const BabylonView({ super.key });

  @override
  Widget build(BuildContext context) {
    return const Stack(
      children: [
        Positioned.fill(child: ThreeBridge()),
        Positioned(
          top: 18,
          left: 18,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.all(Radius.circular(12)),
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              child: Text(
                'Babylon Metaverse',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
