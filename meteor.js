const container = document.querySelector(".container")
const canvas = document.getElementById('mars');
const scene = new THREE.Scene();
let model = null;
const gui = new dat.GUI();


console.log(gui)
// const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
// scene.add(gridHelper);

// const color = new THREE.Color('white', 0);
// scene.background = null;

const light = new THREE.AmbientLight(0xffffff, 1)
light.position.z = 5.0;
scene.add(light);

const light1 = new THREE.DirectionalLight(0xffffff, 0.5)
light1.position.z = 5;
// light1.castShadow = true;
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
    model = gltf.scene
    model.position.set(0, -3, 0);
    model.scale.set(0.02, 0.02, 0.02);
    model.rotation.x = 0;
    scene.add(model);
    render();
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)

const galaxyImg = new THREE.TextureLoader().load('assets/galaxy.jpg');

scene.background = galaxyImg;

let scroll = false;
function onScrollWheel(e) {
  // console.log(e.deltaY, "scroll");
  if (e.deltaY > 0) {
    // scrolling down
    scroll = true;
  }
  else if (e.deltaY < 0) {
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
  end: 100,
  func: () => {
    // camera.lookAt(model.position)
    model.position.x = lerp(0, 1, scalePercent(0, 100))
    model.position.y = lerp(-3, 0, scalePercent(0, 100))
    model.position.z = lerp(0, 7.21, scalePercent(0, 100))
    if (scroll) {
      model.rotation.y += 0.01;
    } else {
      model.rotation.y -= 0.01;
    }
  }
})

animationScripts.push({
  start: 40,
  end: 70,
  func: () => {
    if (scroll) {
      model.rotation.y += 0.008;
    } else {
      model.rotation.y -= 0.008;
    }
  }
})


function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent > a.start && scrollPercent < a.end) {
      a.func()
    }
    else if (scrollPercent === a.end || scrollPercent === a.start) {
      model.rotation.y += 0.005;
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
  // console.log(scrollPercent.toFixed(2), "scrollPercent");
  // console.log(model.rotation.x, "rotation");
}

window.addEventListener("wheel", onScrollWheel);


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
