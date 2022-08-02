const container = document.querySelector(".container")
const canvas = document.getElementById('mars');
const scene = new THREE.Scene();
let model = null;

// const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
// scene.add(gridHelper);

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
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

//rendering engine
//anitalias smoothing the corners
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

//set the size of the renderer
renderer.setSize(window.innerWidth, window.innerHeight);

// const targetRotation = null;
//we have to reposition the camera as both the scene and camera at origin.
camera.position.set(0, 0, 10);

// const controls = new THREE.TrackballControls(camera, container);
// controls.maxDistance = 6;
// controls.minDistance = 1.5;
// controls.zoomSpeed = 0.8;
// controls.noRotate = true;
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
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
mars.anisotropy = 16;

mars.position.set(0, 0, 0);
scene.add(mars);

const galaxyImg = new THREE.TextureLoader().load('assets/galaxy.jpg');

scene.background = galaxyImg;

// scene.add(stars);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

/* Liner Interpolation
 * lerp(min, max, ratio)
 * eg,
 * lerp(20, 60, .5)) = 40
 * lerp(-20, 60, .5)) = 20
 * lerp(20, 60, .75)) = 50
 * lerp(-20, -10, .1)) = -.19
 */
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start)
}

let scroll = true;

function onScrollWheel(e) {
  // mars.rotation.y += 0.05;
  // let distance = camera.position.distanceTo(controls.target)
  // scrollPercent = Math.floor(((distance - 1.5) / 4.5) * 100);
  console.log(e.deltaY, "scroll");
  if (e.deltaY > 0) {
    // scrolling down
    scroll = true;
  }
  else if (e.deltaY < 0) {
    scroll = false;
  }
}

// console.log(scrollPercent, "scrollPercent");
// console.log(95 <= scrollPercent <= 100);
// console.log("mars", mars.position);

// }

const animationScripts = [];

animationScripts.push({
  start: 0,
  end: 100,
  func: () => {
    // camera.lookAt(mars.position)
    mars.position.x = lerp(0, .5, scalePercent(0, 100))
    mars.position.z = lerp(0, 8.5, scalePercent(0, 100))
    if (scroll) {
      mars.rotation.y += 0.01;
    } else {
      mars.rotation.y -= 0.01;
    }
  }
})

animationScripts.push({
  start: 40,
  end: 70,
  func: () => {
    if (scroll) {
      mars.rotation.y += 0.008;
    } else {
      mars.rotation.y -= 0.008;
    }
  }
})


function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent > a.start && scrollPercent < a.end) {
      // mars.rotation.y += 0.005;
      a.func()
    }
    else if (scrollPercent === a.end || scrollPercent === a.start) {
      mars.rotation.y += 0.005;
    }
  })
}

let scrollPercent = 0;

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight ||
        document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100
    ;

  console.log(scrollPercent.toFixed(2), "scrollPercent");
}

window.addEventListener('resize', onWindowResize);
//animating the object
function render() {
  // controls.update();

  window.addEventListener("wheel", onScrollWheel);
  // model.rotateOnAxis(axis, 0.001);
  // model.setRotationFromQuaternion(model.quaternion);
  playScrollAnimations();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();

window.scrollTo({ top: 0, behavior: 'smooth' });

// JS functionality for text animation

const banner = document.querySelector('.banner');
const client = document.querySelectorAll('.client')

const docElem = [banner, ...client]

console.log(docElem)

const options =  { 
  rootMargin: '10px',
  threshold: .4
}

const handleIntersect = (entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('reveal', entry.isIntersecting)
  })
}

let observer = new IntersectionObserver(handleIntersect, options)

docElem.forEach(elem => observer.observe(elem))

