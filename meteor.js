gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)

const container = document.querySelector(".container")
const canvas = document.getElementById('mars');
const scene = new THREE.Scene();
let model = null;
// const gui = new dat.GUI();

const light = new THREE.AmbientLight(0xffffff, 1)
light.position.z = 5.0;
scene.add(light);

const light1 = new THREE.DirectionalLight(0xffffff, 0.5)
light1.position.z = 5;
scene.add(light1);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xffffff, 0);

camera.position.set(0, 0, 100);

const loader = new THREE.GLTFLoader();

const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/gltf');
loader.setDRACOLoader(dracoLoader);

loader.load(
  'models/meteor.gltf',
  (gltf) => {
    model = gltf.scene
    model.position.set(4.5, 1.2, 0);
    model.scale.set(0.1, 0.1, 0.1);
    model.rotation.x = 0;
    // gui.add(model.position, 'x', -10, 10).name('X position')
    // gui.add(model.position, 'y', -10, 10).name('Y position')
    // gui.add(model.position, 'z', -10, 10).name('Z position')
    // gui.add(model.scale, 'x', 0, .1).name('X position')
    // gui.add(model.scale, 'y', 0, .1).name('Y position')
    // gui.add(model.scale, 'z', 0, .1).name('Z position')
    scene.add(model);
    render();

    var action = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        markers: true
      },
      onUpdate: () => { {console.log(model.position); } }
    });
      
    action.to(model.position, {
      motionPath: {
        path: "M 1 115 C -492 128 -663 288 -880 529 C -849 611 -702 640 -576 609 C -372 551 -207 486 0 343",
        align: "#path"
      }
    });
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
  // console.log(model.position)

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
  return scalePercentVal = (scrollPercent - start) / (end - start)
}

const animationScripts = [];

animationScripts.push({
  start: 0,
  end: 100,
  func: () => {
    // const oldX = model.position.x;
    // const oldY = model.position.y;
    // const oldZ = model.position.z;

    // let newX;
    // let newY;
    // let newZ;

    // if (scrollPercent < 50) {
    //   newX = lerp(4.5, -.5, scalePercent(0, 50));
    //   newY = lerp(1.2, -1, scalePercent(0, 50))
    //   newZ = lerp(0, 4.8, scalePercent(0, 50))
    //   console.log('left')
    // } else {
    //   newX = lerp(-.5, 1, scalePercent(50, 100));
    //   newY = lerp(-1, 0, scalePercent(50, 100))
    //   newZ = lerp(4.8, 7.2, scalePercent(50, 100))
    // }
   
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
