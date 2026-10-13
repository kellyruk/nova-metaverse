function buildNpcBehavior(index, sessionTag = 'session-default', vpnLocation = 'local') {
  const state = {
    x: (Math.random() - 0.5) * 18,
    y: 0,
    z: (Math.random() - 0.5) * 18,
    heading: Math.random() * Math.PI * 2,
    color: ['#65d6ff', '#7ef7a3', '#f9c784', '#ff9ecb'][index % 4],
    target: {
      x: (Math.random() - 0.5) * 28,
      y: 0,
      z: (Math.random() - 0.5) * 28,
    },
    seed: `${sessionTag}-${vpnLocation}-${index}`,
  };

  return {
    color: state.color,
    x: state.x,
    y: state.y,
    z: state.z,
    heading: state.heading,
    step() {
      const dx = state.target.x - state.x;
      const dz = state.target.z - state.z;
      const dist = Math.hypot(dx, dz) || 1;

      if (dist < 1.6) {
        state.target.x = (Math.random() - 0.5) * 28;
        state.target.z = (Math.random() - 0.5) * 28;
      } else {
        const step = 0.38 + ((index % 5) * 0.03);
        state.x += (dx / dist) * step;
        state.z += (dz / dist) * step;
      }

      state.heading = Math.atan2(state.target.x - state.x, state.target.z - state.z);

      return {
        x: state.x,
        y: state.y,
        z: state.z,
        heading: state.heading,
      };
    },
  };
}

module.exports = { buildNpcBehavior };
