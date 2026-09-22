import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrganizationProfile } from "../types";

type VehicleType = "voiture" | "moto";

type Props = {
  profile: OrganizationProfile;
  selectedId?: string | null;
  expectedId?: string | null;
  parcelLabel?: string;
  onPressSlot?: (sectionId: string) => void;
  disabled?: boolean;
  hideSectionNames?: boolean;
  vehicleType?: VehicleType;
};

type SceneApi = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  vehicleRoot: THREE.Group;
  slots: Map<string, THREE.Mesh>;
  labels: Map<string, THREE.Sprite>;
  packageMesh: THREE.Group;
  render: () => void;
};

const COLORS = {
  yellow: 0xffcc00,
  dark: 0x17181a,
  grey: 0x55616b,
  light: 0xe7eaec,
  green: 0x86efac,
  red: 0xfca5a5,
};

function box(
  size: [number, number, number],
  color: number,
  position: [number, number, number]
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.08 })
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function wheel(radius: number, position: [number, number, number]) {
  const group = new THREE.Group();
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.22, 20),
    new THREE.MeshStandardMaterial({ color: COLORS.dark, roughness: 0.88 })
  );
  tyre.rotation.x = Math.PI / 2;
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.38, radius * 0.38, 0.24, 16),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.45, roughness: 0.35 })
  );
  hub.rotation.x = Math.PI / 2;
  group.add(tyre, hub);
  group.position.set(...position);
  return group;
}

function cylinder(
  radius: number,
  length: number,
  color: number,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0]
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 20),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.35 })
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  return mesh;
}

function roundPart(radius: number, color: number, position: [number, number, number]) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 14),
    new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.15 })
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  return mesh;
}

function posteSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#17181a";
  ctx.font = "900 58px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(0.82, 0.28, 1);
  return sprite;
}

function labelTexture(title: string, subtitle: string, hidden: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 192;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  ctx.fillStyle = "#17181a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 68px Arial";
  ctx.fillText(title, canvas.width / 2, hidden ? 96 : 72);
  if (!hidden) {
    ctx.fillStyle = "#4b5563";
    ctx.font = "600 25px Arial";
    const short = subtitle.length > 27 ? `${subtitle.slice(0, 25)}…` : subtitle;
    ctx.fillText(short, canvas.width / 2, 135);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createVehicle(type: VehicleType) {
  const group = new THREE.Group();
  if (type === "voiture") {
    group.add(box([2.45, 1.35, 1.35], COLORS.yellow, [2.35, 1.08, 0]));
    group.add(box([1.15, 0.72, 1.28], 0xffd83d, [3.23, 1.82, 0]));
    group.add(box([0.62, 0.52, 1.31], 0x26343d, [3.5, 1.83, 0]));
    group.add(wheel(0.42, [1.65, 0.48, 0.72]), wheel(0.42, [3.13, 0.48, 0.72]));
    group.add(wheel(0.42, [1.65, 0.48, -0.72]), wheel(0.42, [3.13, 0.48, -0.72]));
  } else {
    // KYBURZ DXP 5: châssis trois roues, poste de conduite ouvert et grands
    // coffres de distribution. Les proportions suivent les 215 × 80 × 122 cm
    // du véhicule réel, adaptées à l'échelle de la scène.
    group.add(box([2.35, 0.17, 0.78], 0xdda900, [2.42, 0.68, 0]));
    group.add(box([1.42, 0.42, 0.72], COLORS.yellow, [2.27, 0.84, 0]));
    group.add(box([0.74, 0.66, 0.68], COLORS.yellow, [3.18, 1.05, 0]));
    group.add(box([0.8, 0.12, 0.66], 0x20272c, [2.62, 1.03, 0]));

    // Coffre arrière principal, couvercle et logo postal.
    group.add(box([0.98, 1.12, 1.12], 0x3f4a52, [1.45, 1.34, 0]));
    group.add(box([1.04, 0.12, 1.17], 0x69757d, [1.45, 1.96, 0]));
    const rearLogo = posteSprite("POSTE");
    rearLogo.position.set(1.45, 1.43, 0.575);
    rearLogo.scale.set(0.72, 0.24, 1);
    group.add(rearLogo);

    // Siège, dossier, repose-pieds et colonne de direction.
    group.add(box([0.64, 0.15, 0.58], 0x202428, [2.36, 1.27, 0]));
    const backrest = box([0.18, 0.64, 0.58], 0x202428, [2.08, 1.56, 0]);
    backrest.rotation.z = -0.12;
    group.add(backrest);
    group.add(box([0.74, 0.08, 0.62], 0x3a4248, [2.82, 0.94, 0]));
    const steering = cylinder(0.055, 0.9, 0x242b30, [2.97, 1.48, 0], [0, 0, -0.18]);
    group.add(steering);
    group.add(cylinder(0.05, 0.82, 0x202428, [3.05, 1.88, 0], [Math.PI / 2, 0, 0]));

    // Pare-brise teinté avec supports métalliques.
    const windscreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.72, 0.94),
      new THREE.MeshPhysicalMaterial({
        color: 0xb8d6df,
        transparent: true,
        opacity: 0.42,
        roughness: 0.08,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      })
    );
    windscreen.position.set(3.12, 1.74, 0);
    windscreen.rotation.z = -0.14;
    group.add(windscreen);
    group.add(cylinder(0.025, 0.82, 0x4b5563, [3.1, 1.72, 0.49], [0, 0, -0.14]));
    group.add(cylinder(0.025, 0.82, 0x4b5563, [3.1, 1.72, -0.49], [0, 0, -0.14]));

    // Coffre avant, phare, clignotants et rétroviseurs.
    group.add(box([0.68, 0.62, 0.82], COLORS.yellow, [3.42, 1.5, 0]));
    group.add(box([0.72, 0.1, 0.86], 0xffdc3f, [3.42, 1.84, 0]));
    const frontLogo = posteSprite("POSTE");
    frontLogo.position.set(3.765, 1.51, 0);
    frontLogo.scale.set(0.34, 0.15, 1);
    frontLogo.material.rotation = -Math.PI / 2;
    group.add(frontLogo);
    const headlight = roundPart(0.13, 0xf8fafc, [3.58, 1.02, 0]);
    (headlight.material as THREE.MeshStandardMaterial).emissive.setHex(0xfff4bf);
    (headlight.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.1;
    group.add(headlight);
    group.add(roundPart(0.055, 0xff8a00, [3.53, 1.19, 0.37]));
    group.add(roundPart(0.055, 0xff8a00, [3.53, 1.19, -0.37]));
    group.add(cylinder(0.025, 0.5, 0x252b30, [3.02, 2.08, 0.42], [0, 0, 0.55]));
    group.add(cylinder(0.025, 0.5, 0x252b30, [3.02, 2.08, -0.42], [0, 0, 0.55]));
    group.add(roundPart(0.095, 0x202428, [2.9, 2.25, 0.55]));
    group.add(roundPart(0.095, 0x202428, [2.9, 2.25, -0.55]));

    // Train roulant à trois roues: deux roues arrière pour la stabilité et une
    // roue directrice à l'avant, caractéristique du DXP.
    group.add(wheel(0.43, [1.77, 0.47, 0.5]));
    group.add(wheel(0.43, [1.77, 0.47, -0.5]));
    group.add(wheel(0.47, [3.36, 0.47, 0]));
    group.add(box([0.38, 0.13, 0.74], COLORS.yellow, [1.78, 0.82, 0]));
    group.add(box([0.48, 0.12, 0.3], COLORS.yellow, [3.34, 0.82, 0]));

    // Feux arrière et plaque, visibles en faisant tourner le modèle.
    group.add(box([0.08, 0.16, 0.2], 0xdc2626, [0.94, 0.9, 0.37]));
    group.add(box([0.08, 0.16, 0.2], 0xdc2626, [0.94, 0.9, -0.37]));
    group.add(box([0.07, 0.22, 0.38], 0xf8fafc, [0.92, 0.73, 0]));
  }
  return group;
}

function createTrailer(
  profile: OrganizationProfile,
  hidden: boolean,
  slots: Map<string, THREE.Mesh>,
  labels: Map<string, THREE.Sprite>
) {
  const group = new THREE.Group();
  group.position.x = -1.45;
  group.add(box([3.65, 0.24, 1.8], COLORS.dark, [0, 0.58, 0]));
  group.add(box([3.72, 0.12, 0.14], COLORS.grey, [0, 2.48, -0.84]));
  group.add(box([0.9, 0.13, 0.13], COLORS.dark, [2.28, 0.72, 0]));
  group.add(wheel(0.46, [-1.15, 0.44, 0.95]), wheel(0.46, [1.15, 0.44, 0.95]));
  group.add(wheel(0.46, [-1.15, 0.44, -0.95]), wheel(0.46, [1.15, 0.44, -0.95]));

  const sectionMap = new Map(profile.sections.map((section) => [section.id, section]));
  profile.slotOrder.slice(0, 6).forEach((id, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = -1.18 + col * 1.18;
    const y = 1.92 - row * 0.88;
    const slot = box([1.02, 0.72, 0.66], COLORS.light, [x, y, 0.55]);
    slot.userData.sectionId = id;
    group.add(slot);
    slots.set(id, slot);

    const material = new THREE.SpriteMaterial({
      map: labelTexture(id, sectionMap.get(id)?.name ?? "Secteur", hidden),
      transparent: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, 0.9);
    sprite.scale.set(0.9, 0.45, 1);
    group.add(sprite);
    labels.set(id, sprite);
  });
  return group;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material.dispose());
    }
    if (object instanceof THREE.Sprite) {
      object.material.map?.dispose();
      object.material.dispose();
    }
  });
}

export default function TrailerGame3D({
  profile,
  selectedId,
  expectedId,
  parcelLabel,
  onPressSlot,
  disabled = false,
  hideSectionNames = false,
  vehicleType = "moto",
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const pressRef = useRef({ x: 0, y: 0, rotation: 0, dragging: false });
  const callbackRef = useRef(onPressSlot);
  const disabledRef = useRef(disabled);
  const [webglFailed, setWebglFailed] = useState(false);

  callbackRef.current = onPressSlot;
  disabledRef.current = disabled;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let frame = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdfe7eb);
    scene.fog = new THREE.Fog(0xdfe7eb, 11, 20);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(6.8, 5.1, 8.7);
    camera.lookAt(0, 1.2, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 3.1);
    sun.position.set(4, 8, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xcbd5d9, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(24, 24, 0xffffff, 0xaeb8be);
    grid.position.y = 0.012;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    scene.add(grid);

    const vehicleRoot = new THREE.Group();
    const slots = new Map<string, THREE.Mesh>();
    const labels = new Map<string, THREE.Sprite>();
    vehicleRoot.add(createVehicle(vehicleType));
    vehicleRoot.add(createTrailer(profile, hideSectionNames, slots, labels));
    vehicleRoot.rotation.y = -0.18;
    scene.add(vehicleRoot);

    const packageMesh = new THREE.Group();
    packageMesh.add(box([0.42, 0.34, 0.35], 0xb7793f, [0, 0, 0]));
    packageMesh.visible = false;
    scene.add(packageMesh);

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitTest = (event: PointerEvent) => {
      if (disabledRef.current || !callbackRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...slots.values()], false)[0];
      const id = hit?.object.userData.sectionId as string | undefined;
      if (id) callbackRef.current(id);
    };
    const onPointerDown = (event: PointerEvent) => {
      renderer.domElement.setPointerCapture(event.pointerId);
      pressRef.current = { x: event.clientX, y: event.clientY, rotation: vehicleRoot.rotation.y, dragging: false };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!renderer.domElement.hasPointerCapture(event.pointerId)) return;
      const dx = event.clientX - pressRef.current.x;
      if (Math.abs(dx) > 6) pressRef.current.dragging = true;
      vehicleRoot.rotation.y = pressRef.current.rotation + dx * 0.008;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!pressRef.current.dragging) hitTest(event);
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const render = () => renderer.render(scene, camera);
    const animate = () => {
      packageMesh.rotation.y += 0.012;
      render();
      frame = requestAnimationFrame(animate);
    };
    apiRef.current = { renderer, camera, vehicleRoot, slots, labels, packageMesh, render };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      apiRef.current = null;
    };
  }, [profile, hideSectionNames, vehicleType]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.slots.forEach((mesh, id) => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      const correct = !!expectedId && expectedId === id;
      const wrong = selectedId === id && !!expectedId && expectedId !== id;
      material.color.setHex(correct ? COLORS.green : wrong ? COLORS.red : selectedId === id ? COLORS.yellow : COLORS.light);
    });
    const selected = selectedId ? api.slots.get(selectedId) : undefined;
    api.packageMesh.visible = !!selected && !!parcelLabel;
    if (selected) {
      selected.getWorldPosition(api.packageMesh.position);
      api.packageMesh.position.z += 0.58;
      api.packageMesh.position.y -= 0.18;
    }
    api.render();
  }, [selectedId, expectedId, parcelLabel]);

  const zoom = (delta: number) => {
    const api = apiRef.current;
    if (!api) return;
    api.camera.position.multiplyScalar(delta);
    const distance = api.camera.position.length();
    if (distance < 7.5) api.camera.position.setLength(7.5);
    if (distance > 14) api.camera.position.setLength(14);
    api.camera.lookAt(0, 1.2, 0);
    api.render();
  };

  if (webglFailed) {
    return <div style={fallbackStyle}>La vue 3D n'est pas disponible sur cet appareil.</div>;
  }

  return (
    <div style={rootStyle}>
      <div ref={hostRef} style={canvasHostStyle} aria-label="Simulateur 3D de chargement" />
      <div style={badgeStyle}>● SIMULATEUR 3D · {vehicleType === "moto" ? "KYBURZ DXP5" : "VOITURE"}</div>
      <div style={hintStyle}>Glissez pour tourner · touchez une case</div>
      <div style={zoomStyle}>
        <button type="button" aria-label="Rapprocher la caméra" onClick={() => zoom(0.88)} style={zoomButtonStyle}>＋</button>
        <button type="button" aria-label="Éloigner la caméra" onClick={() => zoom(1.12)} style={zoomButtonStyle}>−</button>
      </div>
    </div>
  );
}

const rootStyle: React.CSSProperties = {
  height: 410,
  position: "relative",
  overflow: "hidden",
  borderRadius: 20,
  border: "1px solid #cbd5e1",
  background: "#dfe7eb",
};
const canvasHostStyle: React.CSSProperties = { position: "absolute", inset: 0 };
const badgeStyle: React.CSSProperties = {
  position: "absolute", top: 12, left: 12, padding: "7px 10px", borderRadius: 14,
  color: "#fff", background: "rgba(23,24,26,.82)", font: "900 10px Arial", letterSpacing: ".6px",
};
const hintStyle: React.CSSProperties = {
  position: "absolute", left: 12, bottom: 12, padding: "7px 10px", borderRadius: 10,
  color: "#374151", background: "rgba(255,255,255,.82)", font: "700 11px Arial",
};
const zoomStyle: React.CSSProperties = { position: "absolute", top: 12, right: 12, display: "grid", gap: 7 };
const zoomButtonStyle: React.CSSProperties = {
  width: 40, height: 40, border: 0, borderRadius: 12, background: "#fff", color: "#17181a",
  fontSize: 24, fontWeight: 900, boxShadow: "0 3px 10px rgba(0,0,0,.18)", touchAction: "manipulation",
};
const fallbackStyle: React.CSSProperties = {
  height: 180, display: "grid", placeItems: "center", borderRadius: 16,
  background: "#e5e7eb", color: "#374151", fontWeight: 700, textAlign: "center", padding: 20,
};
