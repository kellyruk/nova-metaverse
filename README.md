# Metaverse Web NPC Starter

This project uses a Babylon.js web client with an enterable luxury villa scene and elevator floor controls.

## Local run steps

1. Server:
```bash
cd server && npm install && node src/index.js
```

2. NPC fleet:
```bash
cd npc && npm install && SERVER_URL=ws://localhost:8081 NPC_COUNT=10 node src/index.js
```

3. REST API:
```bash
cd server-rest && npm install && node index.js
```

4. Flutter web:
```bash
cd flutter_app && flutter pub get && flutter run -d chrome
```

## Controls

- Click a villa door to enter
- Use the elevator panel to move between floors
- Use WASD / arrow keys to move the avatar
- Press ESC to exit the villa
- Use the mouse to roam the camera (ArcRotate)

## Notes

- Windscribe per-NPC locations require a VPS or cloud VM, not standard shared cPanel hosting.
- Use environment variables for Windscribe credentials — never commit them into the repo.
- The NPC model is intentionally lightweight and extensible for more advanced building / room logic.

## License

MIT
