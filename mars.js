const container = document.querySelector(".container")
const canvas = document.getElementById('mars');
const scene = new THREE.Scene();
let model = null;

// paramters color and intensity
const light = new THREE.AmbientLight(0xffffff, 1)
light.position.z = 5.0;
scene.add(light);

const light1 = new THREE.PointLight(0xffffff, 0.5)
light1.position.z = 5.0;
scene.add(light1);


// perpectve we see closer object bigger and far object smaller.
//1. perpective angle
//2. aspect ratio innnerwidth/innerheight
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);

//rendering engine
//anitalias smoothing the corners
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

//set the size of the renderer
renderer.setSize(window.innerWidth, window.innerHeight);

// const targetRotation = null;
//we have to reposition the camera as both the scene and camera at origin.
camera.position.set(0, 0, 6);

const controls = new THREE.TrackballControls(camera, container);
controls.maxDistance = 6;
controls.minDistance = 1.5;
controls.zoomSpeed = 0.5;
controls.noRotate = true;

// controls.radius = 1;
// controls.target.set(1, 0, 0);
// controls.update();

// const loader = new THREE.GLTFLoader()

// const dracoLoader = new THREE.DRACOLoader();
// dracoLoader.setDecoderPath('/examples/js/libs/draco/gltf');
// loader.setDRACOLoader(dracoLoader);

// loader.load(
//   'models/mars.gltf',
//   (gltf) => {
//     model = gltf.scene
//     model.position.set(0, 0, 0);
//     model.scale.set(1.0, 1.0, 1.0);
//     // model.quaternion.copy(targetRotation);
//     scene.add(model);
//     render();
//   },
//   (xhr) => {
//     console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//   },
//   (error) => {
//     console.log(error)
//   }
// )

const radius = 0.5;
const segments = 32;
const rotation = 6;

const diffuse = new THREE.TextureLoader().load('assets/mars_1k_color.jpg');
const bump = new THREE.TextureLoader().load('assets/marsbump1k.jpg');
const dust = new THREE.TextureLoader().load('assets/mars_1k_topo.jpg');

const geometry = new THREE.SphereGeometry(radius, segments, segments);
// const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({
  map: diffuse,
  bumpMap: bump,
  bumpScale: 0.015,
  specularMap: dust,
  // specular: new THREE.Color('grey')
})

const mars = new THREE.Mesh(geometry, material);

mars.position.set(0, 0, 0);
scene.add(mars);

const galaxyImg = new THREE.TextureLoader().load('assets/galaxy.jpg');
console.log(galaxyImg);

scene.background = galaxyImg;

// scene.add(stars);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}
let scrollPercent = 0
function onScrollWheel(e) {
  mars.rotation.y += 0.01;
  let distance = camera.position.distanceTo(controls.target)
  scrollPercent = Math.floor(((distance - 1.5) / 4.5) * 100);
  if (e.deltaY < 0 && distance > 1.5) {
    mars.position.x += 0.03;
  }

  else if (e.deltaY > 0 && distance < 6) {
    // scrolling down
    mars.position.x -= 0.03;
    if (90 < scrollPercent && scrollPercent < 100) {
      mars.position.x = 0;
    }
  }

  console.log(scrollPercent, "scrollPercent");
  console.log(95 <= scrollPercent <= 100);
  console.log("mars", mars.position);
  console.log(distance);
}



// document.body.onscroll = () => {
//   //calculate the current scroll progress as a percentage
//   scrollPercent =
//     (camera.position.distanceTo(controls.target) / controls.minDistance) * 100;

//   console.log(scrollPercent, "scrollPercent");
// }

window.addEventListener('resize', onWindowResize);
//animating the object
function render() {
  controls.update();
  mars.rotation.y += 0.001;
  window.addEventListener("wheel", onScrollWheel);
  // model.rotateOnAxis(axis, 0.001);
  // model.setRotationFromQuaternion(model.quaternion);
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();

window.scrollTo({ top: 0, behavior: 'smooth' })
