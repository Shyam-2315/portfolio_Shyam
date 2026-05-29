import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Rotating wireframe neural globe — sits behind the hero. */
export function NeuralGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = () => mount.clientWidth;
    const h = () => mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w() / h(), 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    mount.appendChild(renderer.domElement);

    // Cyan + purple wireframe icosahedron globe
    const geo = new THREE.IcosahedronGeometry(2, 3);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x6ee6ff, transparent: true, opacity: 0.35 }),
    );
    scene.add(wire);

    // Outer rotating sphere of nodes
    const pts = new THREE.BufferGeometry();
    const N = 320;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2.4;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    pts.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const nodes = new THREE.Points(
      pts,
      new THREE.PointsMaterial({ color: 0xb084ff, size: 0.04, transparent: true, opacity: 0.85 }),
    );
    scene.add(nodes);

    // Inner low-poly core
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x6ee6ff,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      }),
    );
    scene.add(core);

    // mouse-influenced rotation
    let mx = 0,
      my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      wire.rotation.y += 0.0015;
      wire.rotation.x += 0.0008;
      nodes.rotation.y -= 0.0007;
      core.rotation.y -= 0.002;

      // tilt toward cursor
      const targetX = my * 0.25;
      const targetY = mx * 0.4;
      wire.rotation.x += (targetX - wire.rotation.x) * 0.02;
      wire.rotation.y += (targetY - wire.rotation.y) * 0.02;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      pts.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-[1] opacity-90"
      aria-hidden
    />
  );
}
