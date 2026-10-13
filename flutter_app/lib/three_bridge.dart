import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';

class ThreeBridge extends StatefulWidget {
  const ThreeBridge({ super.key });

  @override
  State<ThreeBridge> createState() => _ThreeBridgeState();
}

class _ThreeBridgeState extends State<ThreeBridge> {
  static const String viewType = 'babylon-canvas';

  @override
  void initState() {
    super.initState();
    ui_web.PlatformViewRegistry.registerViewFactory(
      viewType,
      (int viewId) {
        final element = html.DivElement()
          ..id = 'threejs-canvas'
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.display = 'block';
        return element;
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return const HtmlElementView(viewType: viewType);
  }
}
