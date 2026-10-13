(function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.49, 0.79, 1.0, 1.0);
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogColor = new BABYLON.Color3(0.5, 0.8, 1.0);
  scene.fogStart = 25;
  scene.fogEnd = 120;

  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 3,
    18,
    new BABYLON.Vector3(0, 2, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 8;
  camera.upperRadiusLimit = 40;

  const light = new BABYLON.HemisphericLight('hLight', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 1.2;

  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-5, 10, -2), scene);
  sun.intensity = 0.7;

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 140, height: 140 }, scene);
  ground.material = new BABYLON.StandardMaterial('groundMat', scene);
  ground.material.diffuseColor = new BABYLON.Color3(0.42, 0.77, 0.38);

  const grid = BABYLON.MeshBuilder.CreateGround('grid', { width: 100, height: 100, subdivisions: 20 }, scene);
  grid.position.y = 0.02;
  grid.material = new BABYLON.StandardMaterial('gridMat', scene);
  grid.material.wireframe = true;
  grid.material.alpha = 0.3;

  const houses = [];
  const enterables = new Map();

  function buildVilla(id, x, z, options = {}) {
    const villa = new BABYLON.TransformNode(`${id}-root`);
    villa.position = new BABYLON.Vector3(x, 0, z);

    const floors = options.floors || 3;
    const footprint = options.footprint || { w: 9, d: 7 };
    const wallColor = new BABYLON.Color3(1, 1, 1);
    const floorColor = new BABYLON.Color3(0.96, 0.95, 0.92);
    const glassColor = new BABYLON.Color3(0.55, 0.9, 1.0);

    const shell = new BABYLON.TransformNode(`${id}-shell`);
    shell.parent = villa;

    for (let f = 0; f < floors; f++) {
      const floorY = 0.8 + (f * 2.8);
      const floorPlate = BABYLON.MeshBuilder.CreateBox(`${id}-floor-${f}`, { width: footprint.w, height: 0.12, depth: footprint.d }, scene);
      floorPlate.position = new BABYLON.Vector3(0, floorY, 0);
      floorPlate.parent = shell;
      floorPlate.material = new BABYLON.StandardMaterial(`${id}-floorMat-${f}`, scene);
      floorPlate.material.diffuseColor = floorColor;

      const wallMat = new BABYLON.StandardMaterial(`${id}-wallMat-${f}`, scene);
      wallMat.diffuseColor = wallColor;

      const north = BABYLON.MeshBuilder.CreateBox(`${id}-wallN-${f}`, { width: footprint.w, height: 2.4, depth: 0.2 }, scene);
      north.position = new BABYLON.Vector3(0, floorY + 1.1, -footprint.d / 2 + 0.1);
      north.parent = shell;
      north.material = wallMat;

      const south = north.clone(`${id}-wallS-${f}`);
      south.position.z = footprint.d / 2 - 0.1;
      south.parent = shell;

      const east = BABYLON.MeshBuilder.CreateBox(`${id}-wallE-${f}`, { width: 0.2, height: 2.4, depth: footprint.d }, scene);
      east.position = new BABYLON.Vector3(footprint.w / 2 - 0.1, floorY + 1.1, 0);
      east.parent = shell;
      east.material = wallMat;

      const west = east.clone(`${id}-wallW-${f}`);
      west.position.x = -footprint.w / 2 + 0.1;
      west.parent = shell;
    }

    const door = BABYLON.MeshBuilder.CreateBox(`${id}-door`, { width: 1.2, height: 2.2, depth: 0.12 }, scene);
    door.position = new BABYLON.Vector3(0, 1.1, footprint.d / 2 + 0.06);
    door.parent = villa;
    door.material = new BABYLON.StandardMaterial(`${id}-doorMat`, scene);
    door.material.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.15);

    const interiorRoot = new BABYLON.TransformNode(`${id}-interior`);
    interiorRoot.parent = villa;
    interiorRoot.position = new BABYLON.Vector3(0, 0, 0);
    interiorRoot.setEnabled(false);

    const elevator = new BABYLON.TransformNode(`${id}-elevator`);
    elevator.parent = interiorRoot;
    const cabin = BABYLON.MeshBuilder.CreateBox(`${id}-cabin`, { width: 1.3, height: 2, depth: 1.3 }, scene);
    cabin.position = new BABYLON.Vector3(-2.9, 1.0, 0);
    cabin.parent = elevator;
    cabin.material = new BABYLON.StandardMaterial(`${id}-cabinMat`, scene);
    cabin.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.55);
    cabin.metadata = { isElevatorCabin: true };

    const shaft = BABYLON.MeshBuilder.CreateBox(`${id}-shaft`, { width: 1.5, height: floors * 2.8 + 1.2, depth: 1.5 }, scene);
    shaft.position = new BABYLON.Vector3(-2.9, (floors * 2.8) / 2, 0);
    shaft.parent = interiorRoot;
    shaft.material = new BABYLON.StandardMaterial(`${id}-shaftMat`, scene);
    shaft.material.alpha = 0.25;
    shaft.material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Simple interior floors and furniture
    for (let f = 0; f < floors; f++) {
      const floorY = f * 2.8;
      const floor = BABYLON.MeshBuilder.CreateBox(`${id}-roomFloor-${f}`, { width: 6.5, height: 0.12, depth: 5.6 }, scene);
      floor.position = new BABYLON.Vector3(0, floorY + 0.06, 0);
      floor.parent = interiorRoot;
      floor.material = new BABYLON.StandardMaterial(`${id}-roomFloorMat-${f}`, scene);
      floor.material.diffuseColor = new BABYLON.Color3(0.95, 0.94, 0.9);

      const sofa = BABYLON.MeshBuilder.CreateBox(`${id}-sofa-${f}`, { width: 2.0, height: 0.5, depth: 0.9 }, scene);
      sofa.position = new BABYLON.Vector3(2, floorY + 0.3, -1.4);
      sofa.parent = interiorRoot;
      sofa.material = new BABYLON.StandardMaterial(`${id}-sofaMat-${f}`, scene);
      sofa.material.diffuseColor = new BABYLON.Color3(0.2, 0.45, 0.55);
    }

    const entry = { id, villa, shell, interiorRoot, door, elevator, currentFloor: 0, targetFloor: 0 };
    enterables.set(id, entry);
    houses.push(entry);
    return entry;
  }

  buildVilla('villa-1', -18, -12, { floors: 3, name: 'Seaside Villa' });
  buildVilla('villa-2', 18, -10, { floors: 4, name: 'Sky Villa' });

  // quick UI overlay for elevator and prompt
  const ui = document.createElement('div');
  ui.style.position = 'fixed';
  ui.style.left = '20px';
  ui.style.top = '20px';
  ui.style.background = 'rgba(12, 18, 28, 0.7)';
  ui.style.padding = '10px 14px';
  ui.style.borderRadius = '12px';
  ui.style.color = '#fff';
  ui.style.fontFamily = 'sans-serif';
  ui.style.border = '1px solid rgba(255,255,255,0.12)';
  ui.style.zIndex = '10';
  ui.textContent = 'Click a villa door to enter';
  document.body.appendChild(ui);

  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.left = '50%';
  toast.style.top = '12%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'rgba(0,0,0,0.72)';
  toast.style.color = 'white';
  toast.style.padding = '8px 12px';
  toast.style.borderRadius = '10px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.2s';
  toast.style.zIndex = '11';
  document.body.appendChild(toast);

  function showToast(msg) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.style.opacity = '0'; }, 1500);
  }

  // current interior state
  let activeInteriorId = null;
  let activeElevatorPanel = null;

  function hideElevatorPanel() {
    if (activeElevatorPanel) {
      activeElevatorPanel.remove();
      activeElevatorPanel = null;
    }
  }

  function showElevatorPanel(entry) {
    hideElevatorPanel();
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '18px';
    panel.style.bottom = '18px';
    panel.style.background = 'rgba(0,0,0,0.58)';
    panel.style.padding = '10px';
    panel.style.borderRadius = '12px';
    panel.style.color = '#fff';
    panel.style.zIndex = '11';

    const title = document.createElement('div');
    title.textContent = 'Elevator'; title.style.marginBottom = '8px'; title.style.fontWeight = '700';
    panel.appendChild(title);

    for (let floor = 0; floor < 3; floor++) {
      const btn = document.createElement('button');
      btn.textContent = `Floor ${floor + 1}`;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.margin = '6px 0';
      btn.onclick = () => {
        entry.targetFloor = floor;
        showToast(`Elevator moving to floor ${floor + 1}`);
      };
      panel.appendChild(btn);
    }

    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit Villa';
    exitBtn.style.display = 'block';
    exitBtn.style.width = '100%';
    exitBtn.style.marginTop = '8px';
    exitBtn.onclick = () => {
      exitInterior();
    };
    panel.appendChild(exitBtn);

    activeElevatorPanel = panel;
    document.body.appendChild(panel);
  }

  function enterInterior(entry) {
    for (const e of enterables.values()) {
      e.interiorRoot.setEnabled(false);
      e.shell.setEnabled(true);
    }
    entry.interiorRoot.setEnabled(true);
    entry.shell.setEnabled(false);
    activeInteriorId = entry.id;
    player.position = new BABYLON.Vector3(entry.villa.position.x + 1, 1.1, entry.villa.position.z + 3.4);
    showElevatorPanel(entry);
    showToast('Entered villa interior');
  }

  function exitInterior() {
    if (!activeInteriorId) return;
    const entry = enterables.get(activeInteriorId);
    if (!entry) return;
    entry.interiorRoot.setEnabled(false);
    entry.shell.setEnabled(true);
    player.position = new BABYLON.Vector3(entry.villa.position.x, 1.1, entry.villa.position.z + 7);
    activeInteriorId = null;
    hideElevatorPanel();
    showToast('Exited villa');
  }

  const player = BABYLON.MeshBuilder.CreateCapsule('player', { radius: 0.6, height: 1.8, capSubdivisions: 8 }, scene);
  player.position = new BABYLON.Vector3(0, 1.1, 0);
  player.material = new BABYLON.StandardMaterial('playerMat', scene);
  player.material.diffuseColor = new BABYLON.Color3(0.35, 0.75, 1.0);

  // movement keys
  const keys = {};
  window.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
    if (event.key === 'Escape' && activeInteriorId) exitInterior();
  });
  window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  // click detect doors
  const pointer = new BABYLON.Vector2();
  canvas.addEventListener('pointerdown', function (evt) {
    if (!evt) return;
    const pick = scene.pick(evt.clientX, evt.clientY);
    if (!pick || !pick.hit) return;
    const mesh = pick.pickedMesh;
    if (!mesh) return;
    const entry = Array.from(enterables.values()).find((e) => e.door === mesh || e.door === mesh.parent || e.door === pick.pickedMesh);
    if (entry) {
      enterInterior(entry);
      return;
    }

    // click on ground to move player
    if (pick.pickedPoint) {
      const point = pick.pickedPoint;
      player.position.x = point.x;
      player.position.z = point.z;
    }
  });

  const socket = new WebSocket('ws://localhost:8081');

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({
      type: 'join',
      id: 'babylon-user',
      kind: 'user',
      name: 'Babylon User',
      color: '#ffffff',
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      sessionTag: 'babylon-session',
      vpnLocation: 'local',
    }));
  });

  socket.addEventListener('message', (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data.type !== 'world-state') return;
      // remote NPC avatars are handled elsewhere in the Babylon scene if needed.
    } catch (err) {
      console.error('WebSocket parse error:', err);
    }
  });

  // animations
  const moveSpeed = 0.14;
  scene.onBeforeRenderObservable.add(() => {
    const moveX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
    const moveZ = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);

    if (moveX || moveZ) {
      const p = new BABYLON.Vector3(moveX, 0, moveZ);
      p.normalize();
      player.position.x += p.x * moveSpeed;
      player.position.z += p.z * moveSpeed;
      player.rotation.y = Math.atan2(p.x, p.z);
    }

    // elevator motion
    for (const entry of enterables.values()) {
      if (!entry.elevator) continue;
      const targetY = entry.targetFloor * 2.8;
      const currentY = entry.elevator.position.y;
      if (Math.abs(currentY - targetY) > 0.02) {
        const step = 0.12;
        entry.elevator.position.y += Math.sign(targetY - currentY) * Math.min(step, Math.abs(targetY - currentY));
      }
    }

    // camera follow
    if (activeInteriorId) {
      camera.target = new BABYLON.Vector3(player.position.x, 1.5, player.position.z);
      camera.radius = 8;
      camera.beta = Math.PI / 3.4;
      camera.alpha = -Math.PI / 2;
      camera.setTarget(player.position.clone());
    } else {
      camera.target = new BABYLON.Vector3(player.position.x, 1.5, player.position.z);
      camera.radius = 14;
      camera.beta = Math.PI / 3;
      camera.alpha = -Math.PI / 2;
    }

    // network send
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'move',
        id: 'babylon-user',
        kind: 'user',
        name: 'Babylon User',
        color: '#ffffff',
        x: player.position.x,
        y: 0,
        z: player.position.z,
        heading: player.rotation.y,
        sessionTag: 'babylon-session',
        vpnLocation: 'local',
      }));
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
})();
