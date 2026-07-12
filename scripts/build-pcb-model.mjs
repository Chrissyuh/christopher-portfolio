import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import occtImport from "occt-import-js";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const smartPlanterRoot =
  process.env.SMART_PLANTER_ROOT ??
  "C:/Users/chesk/OneDrive/Documents/KiCad/9.0/projects/SmartWateringFlowerPot";
const sourceStep =
  process.argv[2] ?? path.join(smartPlanterRoot, "mechanical", "Self-Watering_Flower_Pot_Board_A_cost_down.step");
const sourcePoster =
  process.argv[3] ??
  path.join(smartPlanterRoot, "outputs", "Self-Watering_Flower_Pot_Board_A_cost_down_render_angle_1_top_left.png");
const outputDir = path.join(repoRoot, "public", "portfolio-media", "smart-planter");
const outputModel = path.join(outputDir, "board-a-cost-down.glb");
const outputPoster = path.join(outputDir, "board-a-cost-down-poster.webp");

const componentMaterials = {
  board: { color: [0.075, 0.22, 0.145, 1], roughness: 0.66, metallic: 0.04 },
  metal: { color: [0.64, 0.67, 0.68, 1], roughness: 0.35, metallic: 0.74 },
  brass: { color: [0.72, 0.51, 0.2, 1], roughness: 0.35, metallic: 0.6 },
  white: { color: [0.82, 0.82, 0.77, 1], roughness: 0.7, metallic: 0.02 },
  dark: { color: [0.075, 0.08, 0.085, 1], roughness: 0.56, metallic: 0.1 },
  charcoal: { color: [0.16, 0.17, 0.18, 1], roughness: 0.52, metallic: 0.12 },
  silver: { color: [0.72, 0.74, 0.73, 1], roughness: 0.3, metallic: 0.82 },
  red: { color: [0.68, 0.05, 0.04, 1], roughness: 0.48, metallic: 0.02 },
  green: { color: [0.05, 0.55, 0.19, 1], roughness: 0.48, metallic: 0.02 },
};

function materialForComponent(componentName, partIndex, partCount) {
  const name = componentName.toLowerCase();

  if (name.includes("smartwateringflowerpot_pcb")) return "board";
  if (name.includes("jst_xh")) return partIndex === partCount - 1 ? "white" : partIndex % 3 === 0 ? "brass" : "white";
  if (name.includes("pinheader")) return partIndex % 2 === 0 ? "dark" : "brass";
  if (name.includes("usb_c")) return partIndex < Math.ceil(partCount * 0.58) ? "metal" : partIndex % 3 === 0 ? "brass" : "dark";
  if (name.includes("esp32")) return partIndex < Math.ceil(partCount * 0.28) ? "silver" : partIndex % 7 === 0 ? "brass" : "dark";
  if (name.includes("led")) return partIndex % 2 === 0 ? "green" : "red";
  if (name.includes("cp_radial")) return partIndex % 3 === 0 ? "silver" : "charcoal";
  if (name.includes("bourns") || name.includes("tsot") || name.includes("sot-23") || name.includes("d_sma")) return "dark";
  if (name.startsWith("r_") || name.startsWith("c_")) return partIndex % 3 === 0 ? "silver" : "charcoal";
  return "charcoal";
}

function collectMeshOwners(node, owners = new Map()) {
  for (const meshIndex of node.meshes ?? []) {
    const entry = owners.get(meshIndex) ?? { name: node.name || "component", position: 0, count: node.meshes.length };
    entry.position = node.meshes.indexOf(meshIndex);
    owners.set(meshIndex, entry);
  }

  for (const child of node.children ?? []) collectMeshOwners(child, owners);
  return owners;
}

function typedIndices(values, vertexCount) {
  return vertexCount > 65_535 ? Uint32Array.from(values) : Uint16Array.from(values);
}

async function buildModel() {
  const source = await fs.readFile(sourceStep);
  const occt = await occtImport();
  const result = occt.ReadStepFile(source, {
    linearUnit: "millimeter",
    linearDeflectionType: "bounding_box_ratio",
    linearDeflection: 0.001,
    angularDeflection: 0.35,
  });

  if (!result.success || !result.meshes?.length) {
    throw new Error(`Could not import STEP model: ${sourceStep}`);
  }

  const owners = collectMeshOwners(result.root);
  const document = new Document();
  const buffer = document.createBuffer("Smart Planter geometry");
  const scene = document.createScene("Board A cost-down PCB");
  const root = document.createNode("Board A cost-down PCB");
  const materials = new Map();

  scene.addChild(root);

  function getMaterial(materialName) {
    if (materials.has(materialName)) return materials.get(materialName);
    const settings = componentMaterials[materialName] ?? componentMaterials.charcoal;
    const material = document
      .createMaterial(materialName)
      .setBaseColorFactor(settings.color)
      .setMetallicFactor(settings.metallic)
      .setRoughnessFactor(settings.roughness);
    materials.set(materialName, material);
    return material;
  }

  result.meshes.forEach((sourceMesh, meshIndex) => {
    const owner = owners.get(meshIndex) ?? { name: sourceMesh.name || `Component ${meshIndex + 1}`, position: 0, count: 1 };
    const vertexCount = sourceMesh.attributes.position.array.length / 3;
    const positions = document
      .createAccessor(`${owner.name} positions`, buffer)
      .setType("VEC3")
      .setArray(Float32Array.from(sourceMesh.attributes.position.array));
    const indices = document
      .createAccessor(`${owner.name} indices`, buffer)
      .setType("SCALAR")
      .setArray(typedIndices(sourceMesh.index.array, vertexCount));
    const primitive = document.createPrimitive().setAttribute("POSITION", positions).setIndices(indices);

    if (sourceMesh.attributes.normal?.array?.length) {
      const normals = document
        .createAccessor(`${owner.name} normals`, buffer)
        .setType("VEC3")
        .setArray(Float32Array.from(sourceMesh.attributes.normal.array));
      primitive.setAttribute("NORMAL", normals);
    }

    const materialName = sourceMesh.color
      ? "board"
      : materialForComponent(owner.name, owner.position, owner.count);
    primitive.setMaterial(getMaterial(materialName));

    const mesh = document.createMesh(sourceMesh.name || owner.name).addPrimitive(primitive);
    root.addChild(document.createNode(`${owner.name} ${meshIndex + 1}`).setMesh(mesh));
  });

  document.getRoot().getAsset().generator = "Christopher Heskett portfolio PCB model builder";
  await MeshoptEncoder.ready;
  await document.transform(dedup(), weld(), prune(), meshopt({ encoder: MeshoptEncoder, level: "high" }));

  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

  await fs.mkdir(outputDir, { recursive: true });
  await io.write(outputModel, document);
}

async function buildPoster() {
  await fs.mkdir(outputDir, { recursive: true });
  await sharp(sourcePoster)
    .resize({ width: 1280, height: 720, fit: "contain", background: "#e7e1d8", withoutEnlargement: true })
    .webp({ quality: 82, smartSubsample: true })
    .toFile(outputPoster);
}

await Promise.all([buildModel(), buildPoster()]);

const [modelStats, posterStats] = await Promise.all([fs.stat(outputModel), fs.stat(outputPoster)]);
console.log(`Wrote ${path.relative(repoRoot, outputModel)} (${Math.round(modelStats.size / 1024)} KiB)`);
console.log(`Wrote ${path.relative(repoRoot, outputPoster)} (${Math.round(posterStats.size / 1024)} KiB)`);
