import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";

const initialRotation = { x: -0.58, y: 0.34, z: -0.05 };
const slowRenderLimitMs = 42;
const fallbackStorageKey = "portfolio-pcb-model-fallback";

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
    else child.material?.dispose();
  });
}

export default function PcbModelViewer({ src, label, onReady, onFallback, onInteractionChange }) {
  const hostRef = useRef(null);
  const readyRef = useRef(onReady);
  const fallbackRef = useRef(onFallback);
  const interactionRef = useRef(onInteractionChange);

  useEffect(() => {
    readyRef.current = onReady;
    fallbackRef.current = onFallback;
    interactionRef.current = onInteractionChange;
  }, [onFallback, onInteractionChange, onReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    let model;
    let resizeObserver;
    let resetFrame;
    let keyboardTimer;
    let disposed = false;
    let dragging = false;
    let dragged = false;
    let locked = false;
    let slowFrames = 0;
    let reducedDpr = false;
    let interactionActive = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e7e1d8");
    const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 100);
    camera.position.set(0, 0, 4.1);
    camera.lookAt(0, 0, 0);
    const pivot = new THREE.Group();
    pivot.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
    scene.add(pivot);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x80766c, 2.25));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
    keyLight.position.set(-2.4, 3.2, 4.8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xbfd4ff, 1.15);
    fillLight.position.set(3.5, -1.5, 2.8);
    scene.add(fillLight);

    function setInteraction(active) {
      if (interactionActive === active) return;
      interactionActive = active;
      interactionRef.current?.(active);
    }

    function failToPoster(reason) {
      if (disposed) return;
      if (import.meta.env.DEV) {
        console.warn("PCB model viewer fell back to its poster.", reason);
      }
      try {
        window.sessionStorage.setItem(fallbackStorageKey, "1");
      } catch {
        // Session storage can be unavailable in privacy modes.
      }
      setInteraction(false);
      fallbackRef.current?.();
    }

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      failToPoster(error);
      return undefined;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("role", "application");
    renderer.domElement.setAttribute("aria-label", label);
    renderer.domElement.setAttribute(
      "aria-description",
      "Drag or use the arrow keys to rotate. Click without dragging to capture the pointer when supported; click again or press Escape to release it.",
    );
    renderer.domElement.className = "block h-full w-full cursor-grab touch-none outline-none focus:ring-2 focus:ring-inset focus:ring-[#244fd6]";
    host.appendChild(renderer.domElement);

    function resize() {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render(false);
    }

    function render(measure = true) {
      if (disposed) return;
      const startedAt = measure ? window.performance.now() : 0;
      renderer.render(scene, camera);
      if (!measure) return;

      const renderTime = window.performance.now() - startedAt;
      slowFrames = renderTime > slowRenderLimitMs ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames >= 4 && !reducedDpr) {
        reducedDpr = true;
        renderer.setPixelRatio(0.75);
        resize();
      }
      if (slowFrames >= 9) failToPoster(new Error("Sustained render time exceeded the viewer budget."));
    }

    function rotateBy(deltaX, deltaY) {
      window.cancelAnimationFrame(resetFrame);
      pivot.rotation.y += deltaX * 0.008;
      pivot.rotation.x = THREE.MathUtils.clamp(pivot.rotation.x + deltaY * 0.008, -1.35, 0.35);
      render();
    }

    function resetRotation() {
      window.cancelAnimationFrame(resetFrame);
      const from = { x: pivot.rotation.x, y: pivot.rotation.y, z: pivot.rotation.z };
      const startedAt = window.performance.now();

      function step(now) {
        const progress = Math.min((now - startedAt) / 220, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        pivot.rotation.set(
          THREE.MathUtils.lerp(from.x, initialRotation.x, eased),
          THREE.MathUtils.lerp(from.y, initialRotation.y, eased),
          THREE.MathUtils.lerp(from.z, initialRotation.z, eased),
        );
        render(false);
        if (progress < 1) resetFrame = window.requestAnimationFrame(step);
      }

      resetFrame = window.requestAnimationFrame(step);
    }

    function handlePointerDown(event) {
      if (event.button !== 0 || locked) return;
      dragging = true;
      dragged = false;
      startX = lastX = event.clientX;
      startY = lastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
      renderer.domElement.classList.replace("cursor-grab", "cursor-grabbing");
      setInteraction(true);
    }

    function handlePointerMove(event) {
      if (!dragging || locked) return;
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 4) dragged = true;
      if (dragged) rotateBy(deltaX, deltaY);
    }

    function handlePointerUp(event) {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
      renderer.domElement.classList.replace("cursor-grabbing", "cursor-grab");
      setInteraction(false);
    }

    function handleClick() {
      if (locked) {
        document.exitPointerLock?.();
        return;
      }
      if (dragged || !renderer.domElement.requestPointerLock) return;
      renderer.domElement.requestPointerLock().catch?.(() => {});
    }

    function handleLockedMove(event) {
      if (locked) rotateBy(event.movementX, event.movementY);
    }

    function handlePointerLockChange() {
      const nextLocked = document.pointerLockElement === renderer.domElement;
      locked = nextLocked;
      renderer.domElement.style.cursor = nextLocked ? "none" : "";
      setInteraction(nextLocked);
      if (!nextLocked) resetRotation();
    }

    function handlePointerLockError() {
      locked = false;
      renderer.domElement.style.cursor = "";
      setInteraction(false);
    }

    function handlePointerLeave() {
      if (locked) return;
      dragging = false;
      renderer.domElement.classList.replace("cursor-grabbing", "cursor-grab");
      setInteraction(false);
      resetRotation();
    }

    function handleKeyDown(event) {
      const rotationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"];
      if (!rotationKeys.includes(event.key)) return;
      event.preventDefault();
      setInteraction(true);
      if (event.key === "Home") resetRotation();
      if (event.key === "ArrowLeft") rotateBy(-10, 0);
      if (event.key === "ArrowRight") rotateBy(10, 0);
      if (event.key === "ArrowUp") rotateBy(0, -10);
      if (event.key === "ArrowDown") rotateBy(0, 10);
      window.clearTimeout(keyboardTimer);
      keyboardTimer = window.setTimeout(() => setInteraction(false), 120);
    }

    function handleContextLost(event) {
      event.preventDefault();
      failToPoster(new Error("The WebGL context was lost."));
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);
    renderer.domElement.addEventListener("keydown", handleKeyDown);
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    document.addEventListener("mousemove", handleLockedMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockError);

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      src,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.2 / maxDimension;
        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);
        pivot.add(model);
        render(false);
        readyRef.current?.();
      },
      undefined,
      failToPoster,
    );

    return () => {
      disposed = true;
      setInteraction(false);
      window.cancelAnimationFrame(resetFrame);
      window.clearTimeout(keyboardTimer);
      resizeObserver?.disconnect();
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock?.();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("keydown", handleKeyDown);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      document.removeEventListener("mousemove", handleLockedMove);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockError);
      if (model) disposeObject(model);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [label, src]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
