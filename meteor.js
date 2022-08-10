gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)

const body = document.querySelector("body");
const container = body.querySelector(".container")
const canvas = body.querySelector('#mars');

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

camera.position.set(0, 0, 10);

const loader = new THREE.GLTFLoader();

const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/gltf');
loader.setDRACOLoader(dracoLoader);

loader.load(
  'models/meteor.gltf',
  (gltf) => {
    model = gltf.scene;
    model.position.set(4.67717868228404, 1.994219033674963, 0);
    model.scale.set(0.02, 0.02, 0.02);
    // model.rotation.x = 0;
    // gui.add(model.position, 'x', -10, 10).name('X position')
    // gui.add(model.position, 'y', -10, 10).name('Y position')
    // gui.add(model.position, 'z', -10, 10).name('Z position')
    // gui.add(model.scale, 'x', 0, .1).name('X position')
    // gui.add(model.scale, 'y', 0, .1).name('Y position')
    // gui.add(model.scale, 'z', 0, .1).name('Z position')
    scene.add(model);
    render();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".container",
        start: `top ${container.getBoundingClientRect().top}`,
        end: "bottom bottom",
        scrub: true,
        onUpdate: setModelCoordinates
      }
    });

    tl.to(model.position, {
      motionPath: {
        path: "#path",
        align: "#path"
      },
      ease: "power1.inOut"
    });
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
  // console.log(`x: ${model.position.x}, y: ${model.position.y}`);
}

const galaxyImg = new THREE.TextureLoader().load('assets/galaxy.jpg');

scene.background = galaxyImg;

let scroll = true;
function onScrollWheel(e) {
  if (e.deltaY > 0 && scrollPercent < 99 && scrollPercent > 0) {
    // scrolling down
    model.rotation.y += 0.2;
    scroll = true;
  }
  else if (e.deltaY < 0 && scrollPercent < 100 && scrollPercent > 0) {
    model.rotation.y -= 0.2;
    scroll = false;
  }
}

function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start)
}

const animationScripts = [];

animationScripts.push({
  start: 0,
  end: 101,
  func: () => {
    model.scale.x = lerp(0.02, 0.06, scalePercent(0, 101));
    model.scale.y = lerp(0.02, 0.06, scalePercent(0, 101));
    model.scale.z = lerp(0.02, 0.06, scalePercent(0, 101));
    // if (scroll) {
    //   model.rotation.y += 0.05;
    // } else {
    //   model.rotation.y -= 0.05;
    // }
  }
})

// animationScripts.push({
//   start: 40,
//   end: 70,
//   func: () => {
//     if (scroll) {
//       model.rotation.y += 0.02;
//     } else {
//       model.rotation.y -= 0.02;
//     }
//   }
// })

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

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight ||
        document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100
    ;
  // console.log(model.rotation.x, "rotation");
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function render() {
  if (scroll || scrollPercent === 100 || scrollPercent === 0) {
    model.rotation.y += 0.02;
  } else {
    model.rotation.y -= 0.02;
  }
  // controls.update();
  // let axis = model.quaternion;
  // model.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.01);
  window.addEventListener("wheel", onScrollWheel);
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