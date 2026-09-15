"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Shape() {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    mesh.current.rotation.x += delta * .09;
    mesh.current.rotation.y += delta * .14;
    const p = state.pointer;
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, p.x * .35, .035);
    mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, p.y * .25, .035);
  });
  return <Float speed={1.4} rotationIntensity={.3} floatIntensity={.7}>
    <mesh ref={mesh} scale={2.05}>
      <icosahedronGeometry args={[1, 5]} />
      <MeshTransmissionMaterial backside thickness={.7} roughness={.18} transmission={1} chromaticAberration={.035} anisotropy={.25} distortion={.16} distortionScale={.3} temporalDistortion={.05} color="#e9ebdf" />
    </mesh>
  </Float>;
}

export function Orb() {
  return <Canvas className="canvas" camera={{ position: [0, 0, 5], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={1.8} /><directionalLight position={[3, 4, 5]} intensity={3} />
    <Shape /><Environment preset="city" />
  </Canvas>;
}
