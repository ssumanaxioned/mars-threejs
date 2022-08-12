gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)

const body = document.querySelector("body");
const container = body.querySelector(".container")
const canvas = body.querySelector('#mars');

let scroll = true;
window.addEventListener("wheel", onScrollWheel);

let oldX, oldY;
let newX, newY;

const rotation = gsap.timeline();

const scene = new THREE.Scene();
let model = null;
// const gui = new dat.GUI();

const light = new THREE.AmbientLight(0xffffff, 1)
light.position.z = 5;
scene.add(light);

const light1 = new THREE.DirectionalLight(0xffffff, .7)
light1.position.z = 5;
scene.add(light1);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xffffff, 0);

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;

const loader = new THREE.GLTFLoader();

const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/gltf');
loader.setDRACOLoader(dracoLoader);

loader.load(
  'models/meteor.gltf',
  (gltf) => {
    model = gltf.scene;
    model.position.x = 4.67717868228404;
    model.position.y = 1.994219033674963;
    model.position.z = 0;

    model.scale.x = 0.02;
    model.scale.y = 0.02;
    model.scale.z = 0.02;

    // model.rotation.x = 0;
    // gui.add(model.position, 'x', -10, 10).name('X position')
    // gui.add(model.position, 'y', -10, 10).name('Y position')
    // gui.add(model.position, 'z', -10, 10).name('Z position')
    // gui.add(model.scale, 'x', 0, .1).name('X position')
    // gui.add(model.scale, 'y', 0, .1).name('Y position')
    // gui.add(model.scale, 'z', 0, .1).name('Z position')
    scene.add(model);
    render();

    rotation.clear();
    rotation.to(model.rotation, {y: 6.28318531, repeat:-1, duration: 15});

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".container",
        start: `top ${container.getBoundingClientRect().top}`,
        end: "bottom bottom",
        scrub: 1.5
      },
      ease: "power4.out"
    });

    tl.to(model.position, {
      motionPath: {
        path: "#path",
        align: "#path"
      },
      ease: "none",
      onUpdate: () => {
        setModelCoordinates();
      }
    })
    .to(model.scale, {x: "+=0.03", y: "+=0.03", z: "+=0.03"}, "<");
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)

const setModelCoordinates = () => {
  const screenX = model.position.x;
  const screenY = model.position.y;
  const canvasBoundingRect = canvas.getBoundingClientRect();

  model.position.x = ((screenX / canvasBoundingRect.width) * 2 - 1) * 8;
  model.position.y = (-(screenY / canvasBoundingRect.height) * 2 + 1) * (8 / (canvasBoundingRect.width / canvasBoundingRect.height));
}

const galaxyImg = new THREE.TextureLoader().load('assets/galaxy.jpg');

scene.background = galaxyImg;

function onScrollWheel(e) {
  if (e.deltaY > 0 && scrollPercent < 99 && scrollPercent > 0) {
    // scrolling down
    rotation.clear();
    rotation.to(model.rotation, {y: 6.28318531, repeat: -1, duration: 10});
    scroll = true;
  }
  else if (e.deltaY < 0 && scrollPercent < 100 && scrollPercent > 0) {
    rotation.clear();
    rotation.to(model.rotation, {y: -6.28318531, repeat: -1, duration: 10});
    scroll = false;
  }
  // renderer.render(scene, camera);
}

function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start)
}

const animationScripts = [];

function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent > a.start && scrollPercent < a.end) {
      a.func()
    }
    // else if (scrollPercent === a.end || scrollPercent === a.start) {
    //   model.rotation.y += 0.005;
    // }
  })
}

let scrollPercent = 0;
let timer;

window.onscroll = () => {
  //calculate the current scroll progress as a percentage
  clearTimeout(timer);
  timer = setTimeout(defaultRotation, 250);
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight ||
        document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100
    ;
  // console.log(model.rotation.x, "rotation");
}

const defaultRotation = () => {
  rotation.clear();
  if(scroll) {
    rotation.to(model.rotation, {y: 6.28318531, repeat: -1, duration: 15});
  } else {
    rotation.to(model.rotation, {y: -6.28318531, repeat: -1, duration: 15});
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function render() {
  // controls.update();
  // let axis = model.quaternion;
  // model.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.01);
  playScrollAnimations();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

window.scrollTo({ top: 0, behavior: 'smooth' });

// JS functionality for text animation
const banner = document.querySelector('.banner');
const client = document.querySelectorAll('.client')

const docElem = [banner, ...client]

console.log(docElem)

const options = {
  rootMargin: '10px',
  threshold: .5
}

const handleIntersect = (entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('reveal', entry.isIntersecting)
  })
}

let observer = new IntersectionObserver(handleIntersect, options)

docElem.forEach(elem => observer.observe(elem))