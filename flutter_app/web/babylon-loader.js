(function () {
  const target = document.getElementById('threejs-canvas');
  if (!target || !window.BABYLON) return;

  const engine = new BABYLON.Engine(target, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.48, 0.78, 1.0, 1.0);
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogColor = new BABYLON.Color3(0.48, 0.78, 1.0);
  scene.fogStart = 25;
  scene.fogEnd = 120;

  const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, 1.2, 20, new BABYLON.Vector3(0, 2, 0), scene);
  camera.attachControl(target, true);
  camera.lowerRadiusLimit = 8;
  camera.upperRadiusLimit = 40;

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 1.2;

  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-10, 20, -5), scene);
  sun.intensity = 0.75;

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 140, height: 140 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.42, 0.75, 0.38);
  ground.material = groundMat;

  const road = BABYLON.MeshBuilder.CreateGround('road', { width: 18, height: 140 }, scene);
  road.position = new BABYLON.Vector3(0, 0.03, 0);
  road.rotation.y = Math.PI / 2;
  road.material = new BABYLON.StandardMaterial('roadMat', scene);
  road.material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.42);

  const worldBounds = 56;
  const grid = BABYLON.MeshBuilder.CreateGround('grid', { width: 120, height: 120, subdivisions: 30 }, scene);
  grid.position.y = 0.02;
  const gridMat = new BABYLON.StandardMaterial('gridMat', scene);
  gridMat.wireframe = true;
  gridMat.alpha = 0.2;
  grid.material = gridMat;

  const world = new BABYLON.TransformNode('world');

  function buildVilla(id, x, z, options = {}) {
    const root = new BABYLON.TransformNode(`${id}-root`);
    root.position = new BABYLON.Vector3(x, 0, z);
    root.parent = world;

    const floors = options.floors || 3;
    const footprint = options.footprint || { w: 9, d: 7 };
    const interiorRoot = new BABYLON.TransformNode(`${id}-interior`);
    interiorRoot.parent = root;
    interiorRoot.position = new BABYLON.Vector3(0, 0, 0);
    interiorRoot.setEnabled(false);

    const shell = new BABYLON.TransformNode(`${id}-shell`);
    shell.parent = root;

    const wallMat = new BABYLON.StandardMaterial(`${id}-wallMat`, scene);
    wallMat.diffuseColor = new BABYLON.Color3(1, 1, 1);

    for (let f = 0; f < floors; f++) {
      const floorY = 0.8 + (f * 2.8);
      const floor = BABYLON.MeshBuilder.CreateBox(`${id}-floor-${f}`, { width: footprint.w, height: 0.12, depth: footprint.d }, scene);
      floor.position = new BABYLON.Vector3(0, floorY, 0);
      floor.parent = shell;
      const floorMat = new BABYLON.StandardMaterial(`${id}-floorMat-${f}`, scene);
      floorMat.diffuseColor = new BABYLON.Color3(0.96, 0.94, 0.9);
      floor.material = floorMat;

      const north = BABYLON.MeshBuilder.CreateBox(`${id}-north-${f}`, { width: footprint.w, height: 2.3, depth: 0.16 }, scene);
      north.position = new BABYLON.Vector3(0, floorY + 1.2, -footprint.d / 2 + 0.08);
      north.parent = shell; north.material = wallMat;
      const south = north.clone(`${id}-south-${f}`); south.position.z = footprint.d / 2 - 0.08;
      south.parent = shell;
      const east = BABYLON.MeshBuilder.CreateBox(`${id}-east-${f}`, { width: 0.16, height: 2.3, depth: footprint.d }, scene);
      east.position = new BABYLON.Vector3(footprint.w / 2 - 0.08, floorY + 1.2, 0);
      east.parent = shell; east.material = wallMat;
      const west = east.clone(`${id}-west-${f}`); west.position.x = -footprint.w / 2 + 0.08; west.parent = shell;

      const glass = BABYLON.MeshBuilder.CreateBox(`${id}-glass-${f}`, { width: 1.6, height: 1.2, depth: 0.08 }, scene);
      glass.position = new BABYLON.Vector3(0, floorY + 1.6, -footprint.d / 2 + 0.12);
      glass.parent = shell;
      const glassMat = new BABYLON.StandardMaterial(`${id}-glassMat-${f}`, scene);
      glassMat.diffuseColor = new BABYLON.Color3(0.5, 0.84, 1.0);
      glassMat.alpha = 0.8;
      glass.material = glassMat;
    }

    const roof = BABYLON.MeshBuilder.CreateBox(`${id}-roof`, { width: footprint.w + 0.8, height: 0.2, depth: footprint.d + 0.8 }, scene);
    roof.position = new BABYLON.Vector3(0, floors * 2.8 + 1.0, 0);
    roof.parent = shell;
    roof.material = new BABYLON.StandardMaterial(`${id}-roofMat`, scene);
    roof.material.diffuseColor = new BABYLON.Color3(0.9, 0.85, 0.7);

    const door = BABYLON.MeshBuilder.CreateBox(`${id}-door`, { width: 1.2, height: 2.2, depth: 0.12 }, scene);
    door.position = new BABYLON.Vector3(0, 1.1, footprint.d / 2 + 0.08);
    door.parent = root;
    door.material = new BABYLON.StandardMaterial(`${id}-doorMat`, scene);
    door.material.diffuseColor = new BABYLON.Color3(0.35, 0.22, 0.18);

    // interior setup: room + elevator + furniture
    const elevatorShaft = BABYLON.MeshBuilder.CreateBox(`${id}-shaft`, { width: 1.8, height: floors * 2.8 + 1.4, depth: 1.8 }, scene);
    elevatorShaft.position = new BABYLON.Vector3(-3.1, (floors * 2.8 + 1.4) / 2 - 0.6, 0);
    elevatorShaft.parent = interiorRoot;
    const shaftMat = new BABYLON.StandardMaterial(`${id}-shaftMat`, scene);
    shaftMat.alpha = 0.22; shaftMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.16);
    elevatorShaft.material = shaftMat;

    const lift = new BABYLON.TransformNode(`${id}-lift`);
    lift.parent = interiorRoot;
    lift.position = new BABYLON.Vector3(-3.1, 0, 0);
    lift.rotation = new BABYLON.Vector3(0, 0, 0);

    const cabin = BABYLON.MeshBuilder.CreateBox(`${id}-cabin`, { width: 1.4, height: 1.8, depth: 1.4 }, scene);
    cabin.position = new BABYLON.Vector3(0, 1.0, 0);
    cabin.parent = lift;
    cabin.material = new BABYLON.StandardMaterial(`${id}-cabinMat`, scene);
    cabin.material.diffuseColor = new BABYLON.Color3(0.55, 0.58, 0.6);
    cabin.metadata = { isElevatorCabin: true };

    // floor planes and simple furniture on floors
    for (let f = 0; f < floors; f++) {
      const floorY = f * 2.8;
      const roomFloor = BABYLON.MeshBuilder.CreateBox(`${id}-roomFloor-${f}`, { width: 6.2, height: 0.08, depth: 5.4 }, scene);
      roomFloor.position = new BABYLON.Vector3(0, floorY + 0.04, 0);
      roomFloor.parent = interiorRoot;
      roomFloor.material = new BABYLON.StandardMaterial(`${id}-roomFloorMat-${f}`, scene);
      roomFloor.material.diffuseColor = new BABYLON.Color3(0.93, 0.91, 0.85);

      const sofa = BABYLON.MeshBuilder.CreateBox(`${id}-sofa-${f}`, { width: 2.5, height: 0.5, depth: 0.9 }, scene);
      sofa.position = new BABYLON.Vector3(1.8, floorY + 0.3, -1.2);
      sofa.parent = interiorRoot;
      sofa.material = new BABYLON.StandardMaterial(`${id}-sofaMat-${f}`, scene);
      sofa.material.diffuseColor = new BABYLON.Color3(0.15, 0.32, 0.4);

      const table = BABYLON.MeshBuilder.CreateBox(`${id}-table-${f}`, { width: 1, height: 0.5, depth: 1 }, scene);
      table.position = new BABYLON.Vector3(-1.2, floorY + 0.22, 0.8);
      table.parent = interiorRoot;
      table.material = new BABYLON.StandardMaterial(`${id}-tableMat-${f}`, scene);
      table.material.diffuseColor = new BABYLON.Color3(0.52, 0.38, 0.28);
    }

    const entry = {
      id,
      root,
      shell,
      interiorRoot,
      door,
      lift,
      targetFloor: 0,
      currentFloor: 0,
    };
    shell.setEnabled(true);
    interiorRoot.setEnabled(false);
    return entry;
  }

  const villas = [
    buildVilla('villa-1', -18, -12, { floors: 3 }),
    buildVilla('villa-2', 18, -10, { floors: 4 }),
  ];

  const player = BABYLON.MeshBuilder.CreateCapsule('player', { radius: 0.55, height: 1.8, capSubdivisions: 8 }, scene);
  player.position = new BABYLON.Vector3(0, 1.1, 5);
  player.material = new BABYLON.StandardMaterial('playerMat', scene);
  player.material.diffuseColor = new BABYLON.Color3(0.3, 0.7, 1.0);

  const keys = {};
  let activeEnterable = null;
  let panel = null;

  function toast(message) {
    const el = document.getElementById('toast-message');
    if (!el) return;
    el.textContent = message;
    el.style.opacity = '1';
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.style.opacity = '0'; }, 1800);
  }

  function hidePanel() {
    if (panel) {
      panel.remove();
      panel = null;
    }
  }

  function showPanel(entry) {
    hidePanel();
    panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '20px';
    panel.style.bottom = '20px';
    panel.style.background = 'rgba(0,0,0,0.58)';
    panel.style.borderRadius = '12px';
    panel.style.padding = '12px';
    panel.style.color = 'white';
    panel.style.zIndex = '100';
    panel.style.fontFamily = 'sans-serif';

    const title = document.createElement('div');
    title.textContent = 'Elevator';
    title.style.fontWeight = '700';
    title.style.marginBottom = '8px';
    panel.appendChild(title);

    for (let floor = 0; floor < 4; floor++) {
      const btn = document.createElement('button');
      btn.textContent = `Floor ${floor + 1}`;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.margin = '6px 0';
      btn.onclick = () => {
        entry.targetFloor = floor;
        toast(`Elevator moving to floor ${floor + 1}`);
      };
      panel.appendChild(btn);
    }

    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit Villa';
    exitBtn.style.marginTop = '8px';
    exitBtn.style.width = '100%';
    exitBtn.onclick = () => exitInterior();
    panel.appendChild(exitBtn);

    document.body.appendChild(panel);
  }

  function enterInterior(entry) {
    for (const v of villas) {
      v.shell.setEnabled(true);
      v.interiorRoot.setEnabled(false);
    }
    entry.shell.setEnabled(false);
    entry.interiorRoot.setEnabled(true);
    activeEnterable = entry;
    player.position = new BABYLON.Vector3(entry.root.position.x + 1.5, 1.1, entry.root.position.z + 2.5);
    showPanel(entry);
    toast('Entered villa');
  }

  function exitInterior() {
    if (!activeEnterable) return;
    const entry = activeEnterable;
    entry.interiorRoot.setEnabled(false);
    entry.shell.setEnabled(true);
    player.position = new BABYLON.Vector3(entry.root.position.x, 1.1, entry.root.position.z + 7);
    activeEnterable = null;
    hidePanel();
    toast('Exited villa');
  }

  function findVillaFromMesh(mesh) {
    for (const entry of villas) {
      if (entry.door === mesh || entry.door === mesh.parent) return entry;
    }
    return null;
  }

  const toastEl = document.createElement('div');
  toastEl.id = 'toast-message';
  toastEl.style.position = 'fixed';
  toastEl.style.left = '50%';
  toastEl.style.top = '10%';
  toastEl.style.transform = 'translateX(-50%)';
  toastEl.style.background = 'rgba(0,0,0,0.7)';
  toastEl.style.color = 'white';
  toastEl.style.padding = '8px 12px';
  toastEl.style.borderRadius = '10px';
  toastEl.style.opacity = '0';
  toastEl.style.transition = 'opacity 0.2s';
  toastEl.style.zIndex = '101';
  document.body.appendChild(toastEl);

  target.addEventListener('pointerdown', (evt) => {
    const pick = scene.pick(evt.clientX, evt.clientY);
    if (!pick || !pick.hit) return;
    const doorEntry = findVillaFromMesh(pick.pickedMesh);
    if (doorEntry) {
      enterInterior(doorEntry);
      return;
    }

    if (pick.pickedPoint) {
      player.position.x = pick.pickedPoint.x;
      player.position.z = pick.pickedPoint.z;
    }
  });

  window.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
    if (event.key === 'Escape' && activeEnterable) exitInterior();
  });
  window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
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

  scene.onBeforeRenderObservable.add(() => {
    const moveX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
    const moveZ = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
    const moveLength = Math.hypot(moveX, moveZ) || 1;

    if (moveX || moveZ) {
      player.position.x += (moveX / moveLength) * 0.18;
      player.position.z += (moveZ / moveLength) * 0.18;
      player.rotation.y = Math.atan2(moveX, moveZ);
    }

    // Elevator animation
    for (const entry of villas) {
      const liftTarget = entry.targetFloor * 2.8;
      const liftCurrent = entry.lift.position.y;
      const diff = liftTarget - liftCurrent;
      if (Math.abs(diff) > 0.02) {
        entry.lift.position.y += Math.sign(diff) * Math.min(0.15, Math.abs(diff));
      }
    }

    // camera follow
    if (activeEnterable) {
      camera.target = new BABYLON.Vector3(player.position.x, 1.5, player.position.z);
      camera.radius = 8;
      camera.beta = 1.1;
      camera.alpha = -Math.PI / 2;
    } else {
      camera.target = new BABYLON.Vector3(player.position.x, 1.5, player.position.z);
      camera.radius = 16;
      camera.beta = 1.15;
      camera.alpha = -Math.PI / 2;
    }

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

  window.addEventListener('resize', () => engine.resize());
})();
