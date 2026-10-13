(function () {
  function bootThreeApp() {
    const target = document.getElementById('threejs-canvas');
    if (!target || !window.THREE) return;
    if (target.__threeBooted) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7ec8ff);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(target.clientWidth || window.innerWidth, target.clientHeight || window.innerHeight);
    target.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1f2d19, 1.4);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff4d7, 1.0);
    dir.position.set(8, 12, 6);
    scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(25, 60),
      new THREE.MeshStandardMaterial({ color: 0x4f9b52, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const avatar = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.7, 1.2, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0x59d0ff })
    );
    avatar.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xf4c7a1 })
    );
    head.position.y = 1.5;
    avatar.add(head);

    avatar.position.set(0, 0.8, 0);
    scene.add(avatar);

    const npcGroup = new THREE.Group();
    scene.add(npcGroup);

    const remotePlayers = new Map();

    function ensureNpc(id, color) {
      if (remotePlayers.has(id)) return remotePlayers.get(id);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.7, 1),
        new THREE.MeshStandardMaterial({ color })
      );
      mesh.position.y = 0.85;
      npcGroup.add(mesh);
      remotePlayers.set(id, mesh);
      return mesh;
    }

    const socket = new WebSocket('ws://localhost:8081');

    socket.addEventListener('open', function () {
      socket.send(JSON.stringify({
        type: 'join',
        id: 'web-user',
        kind: 'user',
        name: 'Web User',
        color: '#ffffff',
        x: 0,
        y: 0,
        z: 0,
        heading: 0,
      }));
    });

    socket.addEventListener('message', function (event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'world-state') return;
        for (const player of data.players) {
          if (player.id === 'web-user') continue;
          const mesh = ensureNpc(player.id, player.color || '#7fe9ff');
          mesh.position.set(player.x, player.y || 0.85, player.z);
          mesh.rotation.y = player.heading || 0;
        }
      } catch (error) {
        console.error('Three.js socket parse error:', error);
      }
    });

    const keys = {};
    window.addEventListener('keydown', (event) => {
      keys[event.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (event) => {
      keys[event.key.toLowerCase()] = false;
    });

    let lastSent = 0;

    function animate() {
      requestAnimationFrame(animate);

      const moveX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
      const moveZ = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
      const length = Math.hypot(moveX, moveZ) || 1;

      if (Math.abs(moveX) > 0 || Math.abs(moveZ) > 0) {
        avatar.position.x += (moveX / length) * 0.08;
        avatar.position.z += (moveZ / length) * 0.08;
        avatar.rotation.y = Math.atan2(moveX, moveZ);
      }

      camera.position.x = avatar.position.x + 2.5;
      camera.position.z = avatar.position.z + 7;
      camera.position.y = 4.5;
      camera.lookAt(avatar.position.x, 1.2, avatar.position.z);

      const now = Date.now();
      if (socket.readyState === WebSocket.OPEN && now - lastSent > 80) {
        socket.send(JSON.stringify({
          type: 'move',
          id: 'web-user',
          kind: 'user',
          name: 'Web User',
          color: '#ffffff',
          x: avatar.position.x,
          y: 0,
          z: avatar.position.z,
          heading: avatar.rotation.y,
        }));
        lastSent = now;
      }

      renderer.render(scene, camera);
    }

    target.__threeBooted = true;
    animate();
  }

  window.initThreeApp = function (target) {
    bootThreeApp();
  };

  document.addEventListener('DOMContentLoaded', function () {
    bootThreeApp();
  });
})();
