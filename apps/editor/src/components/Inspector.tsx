/**
 * 選択中のノード、マテリアル、パーティクル、またはシーン設定。
 */
import * as stylex from "@stylexjs/stylex";
import { getEditorApi } from "../babylon/editorApi";
import { readFileAsDataUrl } from "../export/download";
import { createId } from "../store/ids";
import { defaultPhysics, defaultPostProcesses } from "../store/document";
import { useEditorStore } from "../store/editorStore";
import type {
  CameraNode,
  LightNode,
  MaterialDef,
  MeshNode,
  ParticleDef,
  PostProcessesSettings,
  Vec3,
  Vec4,
} from "../store/types";
import {
  Button,
  CheckInput,
  ColorInput,
  Field,
  NumberInput,
  Section,
  SelectInput,
  TextInput,
  Vec3Input,
} from "./ui";
import { tokens } from "./tokens.stylex";

const styles = stylex.create({
  panel: {
    backgroundColor: tokens.panel,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: tokens.line,
    overflow: "auto",
    padding: "12px",
    minHeight: "0",
  },
  actions: {
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },
});

export function Inspector() {
  const selection = useEditorStore((state) => state.ui.selection);
  const document = useEditorStore((state) => state.document);
  let body = <SceneSettings />;
  if (selection.type === "node") {
    const node = document.nodes.find((item) => item.id === selection.id);
    if (node?.type === "mesh") body = <MeshSettings node={node} />;
    else if (node?.type === "light") body = <LightSettings node={node} />;
    else if (node?.type === "camera") body = <CameraSettings node={node} />;
  } else if (selection.type === "material") {
    const material = document.materials.find((item) => item.id === selection.id);
    if (material) body = <MaterialSettings material={material} />;
  } else if (selection.type === "particle") {
    const particle = document.particles.find((item) => item.id === selection.id);
    if (particle) body = <ParticleSettings particle={particle} />;
  }
  return <aside {...stylex.props(styles.panel)}>{body}</aside>;
}

function gesture() {
  return {
    onFocus: () => useEditorStore.getState().beginGesture(),
    onBlur: () => useEditorStore.getState().endGesture(),
  };
}

function SceneSettings() {
  const scene = useEditorStore((state) => state.document.scene);
  const snap = useEditorStore((state) => state.ui);
  const store = useEditorStore.getState();
  return (
    <>
      <Section title="Clear color">
        <Field label="Color">
          <ColorInput
            value={[scene.clearColor[0], scene.clearColor[1], scene.clearColor[2]]}
            {...gesture()}
            onChange={(color) =>
              useEditorStore
                .getState()
                .updateClearColor([color[0], color[1], color[2], scene.clearColor[3]])
            }
          />
        </Field>
      </Section>
      <Section title="Fog">
        <Field label="Mode">
          <SelectInput
            value={scene.fog.mode}
            options={[
              { value: "none", label: "None" },
              { value: "exp", label: "Exp" },
              { value: "exp2", label: "Exp2" },
              { value: "linear", label: "Linear" },
            ]}
            onChange={(mode) =>
              useEditorStore.getState().updateFog({
                mode: mode as typeof scene.fog.mode,
              })
            }
          />
        </Field>
        <Field label="Color">
          <ColorInput
            value={scene.fog.color}
            {...gesture()}
            onChange={(color) => useEditorStore.getState().updateFog({ color })}
          />
        </Field>
        <Field label="Density">
          <NumberInput
            value={scene.fog.density}
            step={0.005}
            {...gesture()}
            onChange={(density) => useEditorStore.getState().updateFog({ density })}
          />
        </Field>
        <Field label="Start">
          <NumberInput
            value={scene.fog.start}
            {...gesture()}
            onChange={(start) => useEditorStore.getState().updateFog({ start })}
          />
        </Field>
        <Field label="End">
          <NumberInput
            value={scene.fog.end}
            {...gesture()}
            onChange={(end) => useEditorStore.getState().updateFog({ end })}
          />
        </Field>
      </Section>
      <PostSection settings={scene.postProcesses} />
      <Section title="Physics">
        <CheckInput
          label="Enabled"
          checked={scene.physics.enabled}
          onChange={(enabled) => {
            useEditorStore.getState().updatePhysicsWorld({ enabled });
            if (!enabled) useEditorStore.getState().setSimulatePhysics(false);
          }}
        />
        <Field label="Gravity">
          <Vec3Input
            value={scene.physics.gravity}
            {...gesture()}
            onChange={(gravity) => useEditorStore.getState().updatePhysicsWorld({ gravity })}
          />
        </Field>
      </Section>
      <Section title="Snap">
        <Field label="Move">
          <NumberInput
            value={snap.snapTranslate}
            onChange={(value) => store.setSnapTranslate(value)}
          />
        </Field>
        <Field label="Rotate °">
          <NumberInput
            value={snap.snapRotateDegrees}
            step={1}
            onChange={(value) => store.setSnapRotateDegrees(value)}
          />
        </Field>
        <Field label="Scale">
          <NumberInput value={snap.snapScale} onChange={(value) => store.setSnapScale(value)} />
        </Field>
      </Section>
    </>
  );
}

function PostSection(props: { settings: PostProcessesSettings | null }) {
  if (!props.settings) {
    return (
      <Section title="Post process">
        <Button
          label="Add Default Rendering Pipeline"
          onClick={() => useEditorStore.getState().setPostProcesses(defaultPostProcesses())}
        />
      </Section>
    );
  }
  const settings = props.settings;
  const update = (recipe: (current: PostProcessesSettings) => PostProcessesSettings) =>
    useEditorStore.getState().updatePostProcesses(recipe);
  return (
    <Section title="Default Rendering Pipeline">
      <Button
        label="Remove"
        danger
        onClick={() => useEditorStore.getState().setPostProcesses(null)}
      />
      <CheckInput
        label="Bloom"
        checked={settings.bloom.enabled}
        onChange={(enabled) =>
          update((current) => ({
            ...current,
            bloom: { ...current.bloom, enabled },
          }))
        }
      />
      <Field label="Threshold">
        <NumberInput
          value={settings.bloom.threshold}
          {...gesture()}
          onChange={(threshold) =>
            update((current) => ({
              ...current,
              bloom: { ...current.bloom, threshold },
            }))
          }
        />
      </Field>
      <Field label="Weight">
        <NumberInput
          value={settings.bloom.weight}
          {...gesture()}
          onChange={(weight) =>
            update((current) => ({
              ...current,
              bloom: { ...current.bloom, weight },
            }))
          }
        />
      </Field>
      <Field label="Kernel">
        <NumberInput
          value={settings.bloom.kernel}
          step={1}
          {...gesture()}
          onChange={(kernel) =>
            update((current) => ({
              ...current,
              bloom: { ...current.bloom, kernel },
            }))
          }
        />
      </Field>
      <Field label="Scale">
        <NumberInput
          value={settings.bloom.scale}
          {...gesture()}
          onChange={(scale) =>
            update((current) => ({
              ...current,
              bloom: { ...current.bloom, scale },
            }))
          }
        />
      </Field>
      <CheckInput
        label="FXAA"
        checked={settings.fxaa.enabled}
        onChange={(enabled) => update((current) => ({ ...current, fxaa: { enabled } }))}
      />
      <CheckInput
        label="Image"
        checked={settings.imageProcessing.enabled}
        onChange={(enabled) =>
          update((current) => ({
            ...current,
            imageProcessing: { ...current.imageProcessing, enabled },
          }))
        }
      />
      <Field label="Exposure">
        <NumberInput
          value={settings.imageProcessing.exposure}
          {...gesture()}
          onChange={(exposure) =>
            update((current) => ({
              ...current,
              imageProcessing: { ...current.imageProcessing, exposure },
            }))
          }
        />
      </Field>
      <Field label="Contrast">
        <NumberInput
          value={settings.imageProcessing.contrast}
          {...gesture()}
          onChange={(contrast) =>
            update((current) => ({
              ...current,
              imageProcessing: { ...current.imageProcessing, contrast },
            }))
          }
        />
      </Field>
      <CheckInput
        label="Vignette"
        checked={settings.vignette.enabled}
        onChange={(enabled) =>
          update((current) => ({
            ...current,
            vignette: { ...current.vignette, enabled },
          }))
        }
      />
      <Field label="Weight">
        <NumberInput
          value={settings.vignette.weight}
          {...gesture()}
          onChange={(weight) =>
            update((current) => ({
              ...current,
              vignette: { ...current.vignette, weight },
            }))
          }
        />
      </Field>
      <Field label="Vignette">
        <ColorInput
          value={settings.vignette.color}
          {...gesture()}
          onChange={(color) =>
            update((current) => ({
              ...current,
              vignette: { ...current.vignette, color },
            }))
          }
        />
      </Field>
      <CheckInput
        label="Chroma"
        checked={settings.chromaticAberration.enabled}
        onChange={(enabled) =>
          update((current) => ({
            ...current,
            chromaticAberration: { ...current.chromaticAberration, enabled },
          }))
        }
      />
      <Field label="Amount">
        <NumberInput
          value={settings.chromaticAberration.aberrationAmount}
          {...gesture()}
          onChange={(aberrationAmount) =>
            update((current) => ({
              ...current,
              chromaticAberration: {
                ...current.chromaticAberration,
                aberrationAmount,
              },
            }))
          }
        />
      </Field>
      <CheckInput
        label="Grain"
        checked={settings.grain.enabled}
        onChange={(enabled) =>
          update((current) => ({
            ...current,
            grain: { ...current.grain, enabled },
          }))
        }
      />
      <Field label="Intensity">
        <NumberInput
          value={settings.grain.intensity}
          {...gesture()}
          onChange={(intensity) =>
            update((current) => ({
              ...current,
              grain: { ...current.grain, intensity },
            }))
          }
        />
      </Field>
      <CheckInput
        label="Animated"
        checked={settings.grain.animated}
        onChange={(animated) =>
          update((current) => ({
            ...current,
            grain: { ...current.grain, animated },
          }))
        }
      />
    </Section>
  );
}

function NodeActions() {
  return (
    <div {...stylex.props(styles.actions)}>
      <Button label="Duplicate" onClick={() => useEditorStore.getState().duplicateSelection()} />
      <Button label="Delete" danger onClick={() => useEditorStore.getState().deleteSelection()} />
    </div>
  );
}

function TransformFields(props: {
  position: Vec3;
  rotation: Vec3;
  scaling: Vec3;
  onPosition: (value: Vec3) => void;
  onRotation: (value: Vec3) => void;
  onScale: (value: Vec3) => void;
}) {
  return (
    <Section title="Transform">
      <Field label="Position">
        <Vec3Input value={props.position} {...gesture()} onChange={props.onPosition} />
      </Field>
      <Field label="Rotation">
        <Vec3Input value={props.rotation} step={0.05} {...gesture()} onChange={props.onRotation} />
      </Field>
      <Field label="Scale">
        <Vec3Input value={props.scaling} {...gesture()} onChange={props.onScale} />
      </Field>
    </Section>
  );
}

function ParentField(props: { id: string; parentId: string | null }) {
  const nodes = useEditorStore((state) => state.document.nodes);
  return (
    <Field label="Parent">
      <SelectInput
        value={props.parentId ?? ""}
        options={[
          { value: "", label: "Scene" },
          ...nodes
            .filter((node) => node.id !== props.id)
            .map((node) => ({ value: node.id, label: node.name })),
        ]}
        onChange={(value) => {
          const parentId = value === "" ? null : value;
          const api = getEditorApi();
          if (api) api.reparent(props.id, parentId);
          else useEditorStore.getState().setParent(props.id, parentId);
        }}
      />
    </Field>
  );
}

function MeshSettings(props: { node: MeshNode }) {
  const node = props.node;
  const materials = useEditorStore((state) => state.document.materials);
  const update = (patch: Partial<MeshNode["mesh"]>) =>
    useEditorStore.getState().updateMesh(node.id, patch);
  return (
    <>
      <NodeActions />
      <Section title="Mesh">
        <Field label="Name">
          <TextInput
            value={node.name}
            onCommit={(name) => useEditorStore.getState().renameNode(node.id, name)}
          />
        </Field>
        <ParentField id={node.id} parentId={node.parentId} />
        <Field label="Kind">{node.mesh.kind}</Field>
        {node.mesh.kind !== "sphere" && node.mesh.kind !== "cylinder" ? (
          <Field label="Width">
            <NumberInput
              value={node.mesh.size.width}
              {...gesture()}
              onChange={(width) => update({ size: { ...node.mesh.size, width } })}
            />
          </Field>
        ) : null}
        <Field label="Height">
          <NumberInput
            value={node.mesh.size.height}
            {...gesture()}
            onChange={(height) => update({ size: { ...node.mesh.size, height } })}
          />
        </Field>
        {node.mesh.kind === "box" ? (
          <Field label="Depth">
            <NumberInput
              value={node.mesh.size.depth}
              {...gesture()}
              onChange={(depth) => update({ size: { ...node.mesh.size, depth } })}
            />
          </Field>
        ) : null}
        {node.mesh.kind === "sphere" || node.mesh.kind === "cylinder" ? (
          <Field label="Diameter">
            <NumberInput
              value={node.mesh.size.diameter}
              {...gesture()}
              onChange={(diameter) => update({ size: { ...node.mesh.size, diameter } })}
            />
          </Field>
        ) : null}
        <Field label="Material">
          <SelectInput
            value={node.mesh.materialId ?? ""}
            options={[
              { value: "", label: "None" },
              ...materials.map((material) => ({
                value: material.id,
                label: material.name,
              })),
            ]}
            onChange={(value) => update({ materialId: value === "" ? null : value })}
          />
        </Field>
      </Section>
      <TransformFields
        position={node.transform.position}
        rotation={node.transform.rotation}
        scaling={node.transform.scaling}
        onPosition={(position) =>
          useEditorStore.getState().updateTransform(node.id, {
            ...node.transform,
            position,
          })
        }
        onRotation={(rotation) =>
          useEditorStore.getState().updateTransform(node.id, {
            ...node.transform,
            rotation,
          })
        }
        onScale={(scaling) =>
          useEditorStore.getState().updateTransform(node.id, {
            ...node.transform,
            scaling,
          })
        }
      />
      <Section title="Physics body">
        <CheckInput
          label="Body"
          checked={node.mesh.physics?.enabled ?? false}
          onChange={(enabled) =>
            update({
              physics: {
                ...(node.mesh.physics ?? defaultPhysics()),
                enabled,
              },
            })
          }
        />
        <Field label="Shape">
          <SelectInput
            value={node.mesh.physics?.shape ?? "box"}
            options={["box", "sphere", "cylinder", "capsule", "convexHull", "mesh"].map(
              (shape) => ({ value: shape, label: shape }),
            )}
            onChange={(shape) =>
              update({
                physics: {
                  ...(node.mesh.physics ?? defaultPhysics()),
                  shape: shape as NonNullable<MeshNode["mesh"]["physics"]>["shape"],
                },
              })
            }
          />
        </Field>
        <Field label="Mass">
          <NumberInput
            value={node.mesh.physics?.mass ?? 1}
            {...gesture()}
            onChange={(mass) =>
              update({
                physics: { ...(node.mesh.physics ?? defaultPhysics()), mass },
              })
            }
          />
        </Field>
      </Section>
    </>
  );
}

function LightSettings(props: { node: LightNode }) {
  const node = props.node;
  const update = (patch: Partial<LightNode["light"]>) =>
    useEditorStore.getState().updateLight(node.id, patch);
  return (
    <>
      <NodeActions />
      <Section title="Light">
        <Field label="Name">
          <TextInput
            value={node.name}
            onCommit={(name) => useEditorStore.getState().renameNode(node.id, name)}
          />
        </Field>
        <ParentField id={node.id} parentId={node.parentId} />
        <Field label="Kind">{node.light.kind}</Field>
        <Field label="Color">
          <ColorInput
            value={node.light.color}
            {...gesture()}
            onChange={(color) => update({ color })}
          />
        </Field>
        {node.light.kind === "hemispheric" ? (
          <Field label="Ground">
            <ColorInput
              value={node.light.groundColor}
              {...gesture()}
              onChange={(groundColor) => update({ groundColor })}
            />
          </Field>
        ) : null}
        <Field label="Intensity">
          <NumberInput
            value={node.light.intensity}
            {...gesture()}
            onChange={(intensity) => update({ intensity })}
          />
        </Field>
        {node.light.kind === "point" || node.light.kind === "spot" ? (
          <Field label="Range">
            <NumberInput
              value={node.light.range}
              {...gesture()}
              onChange={(range) => update({ range })}
            />
          </Field>
        ) : null}
        {node.light.kind === "spot" ? (
          <>
            <Field label="Angle">
              <NumberInput
                value={node.light.angle}
                step={0.05}
                {...gesture()}
                onChange={(angle) => update({ angle })}
              />
            </Field>
            <Field label="Exponent">
              <NumberInput
                value={node.light.exponent}
                {...gesture()}
                onChange={(exponent) => update({ exponent })}
              />
            </Field>
          </>
        ) : null}
        {node.light.kind !== "point" ? (
          <Field label="Direction">
            <Vec3Input
              value={node.light.direction}
              {...gesture()}
              onChange={(direction) => {
                const api = getEditorApi();
                if (api) api.setLightDirection(node.id, direction);
                else update({ direction });
              }}
            />
          </Field>
        ) : null}
        {node.light.kind !== "hemispheric" ? (
          <CheckInput
            label="Shadows"
            checked={node.light.shadows}
            onChange={(shadows) => update({ shadows })}
          />
        ) : null}
      </Section>
      <TransformFields
        position={node.transform.position}
        rotation={node.transform.rotation}
        scaling={node.transform.scaling}
        onPosition={(position) =>
          useEditorStore.getState().updateTransform(node.id, {
            ...node.transform,
            position,
          })
        }
        onRotation={(rotation) =>
          useEditorStore.getState().updateTransform(node.id, {
            ...node.transform,
            rotation,
          })
        }
        onScale={(scaling) =>
          useEditorStore.getState().updateTransform(node.id, {
            ...node.transform,
            scaling,
          })
        }
      />
    </>
  );
}

function CameraSettings(props: { node: CameraNode }) {
  const node = props.node;
  const update = (patch: Partial<CameraNode["camera"]>) =>
    useEditorStore.getState().updateCamera(node.id, patch);
  return (
    <>
      <NodeActions />
      <Section title="Camera">
        <Field label="Name">
          <TextInput
            value={node.name}
            onCommit={(name) => useEditorStore.getState().renameNode(node.id, name)}
          />
        </Field>
        <ParentField id={node.id} parentId={node.parentId} />
        <Field label="Kind">{node.camera.kind}</Field>
        <CheckInput
          label="Active"
          checked={node.camera.active}
          onChange={(active) => {
            if (active) useEditorStore.getState().setActiveCamera(node.id);
            else update({ active: false });
          }}
        />
        <Field label="FOV">
          <NumberInput
            value={node.camera.fov}
            step={0.05}
            {...gesture()}
            onChange={(fov) => update({ fov })}
          />
        </Field>
        <Field label="Near">
          <NumberInput
            value={node.camera.minZ}
            {...gesture()}
            onChange={(minZ) => update({ minZ })}
          />
        </Field>
        <Field label="Far">
          <NumberInput
            value={node.camera.maxZ}
            {...gesture()}
            onChange={(maxZ) => update({ maxZ })}
          />
        </Field>
        {node.camera.kind === "arcRotate" ? (
          <>
            <Field label="Alpha">
              <NumberInput
                value={node.camera.alpha}
                step={0.05}
                {...gesture()}
                onChange={(alpha) => update({ alpha })}
              />
            </Field>
            <Field label="Beta">
              <NumberInput
                value={node.camera.beta}
                step={0.05}
                {...gesture()}
                onChange={(beta) => update({ beta })}
              />
            </Field>
            <Field label="Radius">
              <NumberInput
                value={node.camera.radius}
                {...gesture()}
                onChange={(radius) => update({ radius })}
              />
            </Field>
            <Field label="Target">
              <Vec3Input
                value={node.camera.target}
                {...gesture()}
                onChange={(target) => {
                  update({ target });
                  useEditorStore.getState().updateTransform(node.id, {
                    ...node.transform,
                    position: target,
                  });
                }}
              />
            </Field>
          </>
        ) : null}
      </Section>
      {node.camera.kind === "universal" ? (
        <TransformFields
          position={node.transform.position}
          rotation={node.transform.rotation}
          scaling={node.transform.scaling}
          onPosition={(position) =>
            useEditorStore.getState().updateTransform(node.id, {
              ...node.transform,
              position,
            })
          }
          onRotation={(rotation) =>
            useEditorStore.getState().updateTransform(node.id, {
              ...node.transform,
              rotation,
            })
          }
          onScale={(scaling) =>
            useEditorStore.getState().updateTransform(node.id, {
              ...node.transform,
              scaling,
            })
          }
        />
      ) : null}
    </>
  );
}

function MaterialSettings(props: { material: MaterialDef }) {
  const material = props.material;
  const update = (patch: Partial<MaterialDef>) =>
    useEditorStore.getState().updateMaterial(material.id, patch);
  return (
    <>
      <div {...stylex.props(styles.actions)}>
        <Button label="Delete" danger onClick={() => useEditorStore.getState().deleteSelection()} />
      </div>
      <Section title="Material">
        <Field label="Name">
          <TextInput
            value={material.name}
            onCommit={(name) => useEditorStore.getState().renameMaterial(material.id, name)}
          />
        </Field>
        <Field label="Kind">{material.kind}</Field>
        <Field label="Color">
          <ColorInput
            value={material.albedoColor}
            {...gesture()}
            onChange={(albedoColor) => update({ albedoColor })}
          />
        </Field>
        <Field label="Metallic">
          <NumberInput
            value={material.metallic}
            {...gesture()}
            onChange={(metallic) => update({ metallic })}
          />
        </Field>
        <Field label="Roughness">
          <NumberInput
            value={material.roughness}
            {...gesture()}
            onChange={(roughness) => update({ roughness })}
          />
        </Field>
        <Field label="Emissive">
          <ColorInput
            value={material.emissive}
            {...gesture()}
            onChange={(emissive) => update({ emissive })}
          />
        </Field>
        <Field label="Alpha">
          <NumberInput
            value={material.alpha}
            step={0.05}
            {...gesture()}
            onChange={(alpha) => update({ alpha })}
          />
        </Field>
        <TextureSlot
          label="Albedo"
          assetId={material.textures.albedo}
          onChange={(albedo) => update({ textures: { ...material.textures, albedo } })}
        />
        <TextureSlot
          label="Normal"
          assetId={material.textures.normal}
          onChange={(normal) => update({ textures: { ...material.textures, normal } })}
        />
        <TextureSlot
          label="Metal/Rough"
          assetId={material.textures.metallicRoughness}
          onChange={(metallicRoughness) =>
            update({ textures: { ...material.textures, metallicRoughness } })
          }
        />
        <TextureSlot
          label="Emissive map"
          assetId={material.textures.emissive}
          onChange={(emissive) => update({ textures: { ...material.textures, emissive } })}
        />
      </Section>
    </>
  );
}

function TextureSlot(props: {
  label: string;
  assetId: string | null;
  onChange: (assetId: string | null) => void;
}) {
  const assetName = useEditorStore((state) =>
    props.assetId ? state.document.assets[props.assetId]?.name : null,
  );
  return (
    <Field label={props.label}>
      <span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void readFileAsDataUrl(file).then((dataUrl) => {
              const id = createId();
              useEditorStore.getState().addAsset({
                id,
                name: file.name,
                mime: file.type || "image/png",
                dataUrl,
              });
              props.onChange(id);
            });
          }}
        />
        {assetName ? <span> {assetName}</span> : null}
        {props.assetId ? <Button label="Clear" onClick={() => props.onChange(null)} /> : null}
      </span>
    </Field>
  );
}

function ParticleSettings(props: { particle: ParticleDef }) {
  const particle = props.particle;
  const nodes = useEditorStore((state) => state.document.nodes);
  const update = (patch: Partial<ParticleDef>) =>
    useEditorStore.getState().updateParticle(particle.id, patch);
  return (
    <>
      <div {...stylex.props(styles.actions)}>
        <Button label="Delete" danger onClick={() => useEditorStore.getState().deleteSelection()} />
      </div>
      <Section title="Particles">
        <Field label="Name">
          <TextInput
            value={particle.name}
            onCommit={(name) => useEditorStore.getState().renameParticle(particle.id, name)}
          />
        </Field>
        <CheckInput
          label="Playing"
          checked={particle.playing}
          onChange={(playing) => update({ playing })}
        />
        <Field label="Emitter">
          <SelectInput
            value={particle.emitterNodeId ?? ""}
            options={[
              { value: "", label: "World position" },
              ...nodes.map((node) => ({ value: node.id, label: node.name })),
            ]}
            onChange={(value) => update({ emitterNodeId: value === "" ? null : value })}
          />
        </Field>
        <Field label="Position">
          <Vec3Input
            value={particle.position}
            {...gesture()}
            onChange={(position) => update({ position })}
          />
        </Field>
        <Field label="Rate">
          <NumberInput
            value={particle.emitRate}
            step={1}
            {...gesture()}
            onChange={(emitRate) => update({ emitRate })}
          />
        </Field>
        <Field label="Color">
          <ColorInput
            value={[particle.color[0], particle.color[1], particle.color[2]]}
            {...gesture()}
            onChange={(color) => update({ color: withAlpha(color, particle.color[3]) })}
          />
        </Field>
        <Field label="Alpha">
          <NumberInput
            value={particle.color[3]}
            step={0.05}
            {...gesture()}
            onChange={(alpha) => update({ color: withAlpha(rgbOf(particle.color), alpha) })}
          />
        </Field>
        <Field label="Min size">
          <NumberInput
            value={particle.minSize}
            {...gesture()}
            onChange={(minSize) => update({ minSize })}
          />
        </Field>
        <Field label="Max size">
          <NumberInput
            value={particle.maxSize}
            {...gesture()}
            onChange={(maxSize) => update({ maxSize })}
          />
        </Field>
        <Field label="Min life">
          <NumberInput
            value={particle.minLifeTime}
            {...gesture()}
            onChange={(minLifeTime) => update({ minLifeTime })}
          />
        </Field>
        <Field label="Max life">
          <NumberInput
            value={particle.maxLifeTime}
            {...gesture()}
            onChange={(maxLifeTime) => update({ maxLifeTime })}
          />
        </Field>
        <Field label="Dir A">
          <Vec3Input
            value={particle.direction1}
            {...gesture()}
            onChange={(direction1) => update({ direction1 })}
          />
        </Field>
        <Field label="Dir B">
          <Vec3Input
            value={particle.direction2}
            {...gesture()}
            onChange={(direction2) => update({ direction2 })}
          />
        </Field>
        <Field label="Power">
          <NumberInput
            value={particle.emitPower}
            {...gesture()}
            onChange={(emitPower) => update({ emitPower })}
          />
        </Field>
        <TextureSlot
          label="Texture"
          assetId={particle.textureAssetId}
          onChange={(textureAssetId) => update({ textureAssetId })}
        />
      </Section>
    </>
  );
}

function rgbOf(color: Vec4): Vec3 {
  return [color[0], color[1], color[2]];
}

function withAlpha(color: Vec3, alpha: number): Vec4 {
  return [color[0], color[1], color[2], alpha];
}
