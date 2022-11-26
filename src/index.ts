import { EffectComposer, RenderPass } from "postprocessing";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GodraysPass } from "three-good-godrays";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("game_view")!.appendChild(renderer.domElement);

// shadowmaps are needed for this effect
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(40, 4, 40),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.position.set(0, 10, 0);
scene.add(cube);

// Make sure to set applicable objects in your scene to cast + receive shadows
// so that this effect will work
scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
    }
});

// setup contrrols
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
// controls.update() must be called after any manual changes to the camera's transform
camera.updateProjectionMatrix();
controls.update();

const lightPos = new THREE.Vector3(0, 20, 0);
const pointLight = new THREE.PointLight(0xffffff, 1, 10000);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.autoUpdate = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 1000;
pointLight.shadow.camera.updateProjectionMatrix();
pointLight.position.copy(lightPos);
scene.add(pointLight);

// axis helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
renderPass.renderToScreen = false;
composer.addPass(renderPass);

const godraysPass = new GodraysPass(pointLight, camera);

godraysPass.renderToScreen = true;
composer.addPass(godraysPass);

function animate(): void {
    requestAnimationFrame(animate);
    composer.render();
}
requestAnimationFrame(animate);
