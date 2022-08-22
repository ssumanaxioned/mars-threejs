gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const body = document.querySelector("body");
const container = body.querySelector(".container")
const canvas = body.querySelector('#mars');

let scroll = true;
let scrollPercent = 0;

const onScroll = (args) => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || body.scrollTop) /
      ((document.documentElement.scrollHeight ||
        body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100;

  if(args.direction == "down") {
    scroll = true;
  } else if(args.direction == "up") {
    scroll = false;
  }
}

const locoScroll = new LocomotiveScroll({
  el: container,
  smooth: true,
  getDirection: true
});

locoScroll.on("scroll", ScrollTrigger.update);
locoScroll.on("scroll", onScroll);

ScrollTrigger.scrollerProxy(".container", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, 
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  pinType: container.style.transform ? "transform" : "fixed"
});

let meteorDefaultRotationSpeed; // 'true' for default rotation speed of Meteor
let meteorClockwiseRotation; // contains the current direction the Meteor is rotating
const rotation = gsap.timeline(); // GSAP timeline for Meteor rotation

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

    // Initialize 'rotation' timeline and give default values for Meteor rotation speed & direction
    clearRotationAndGiveDefaultRotation();
    meteorClockwiseRotation = true;
    meteorDefaultRotationSpeed = true;

    // Main timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".container",
        scroller: ".container",
        start: `top ${container.getBoundingClientRect().top}`,
        end: "bottom bottom",
        scrub: 1.5
      },
      ease: "power4.out"
    });

    // give Meteor path
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
    // increase/decrease Meteor size on scroll
    .to(model.scale, {x: "+=0.03", y: "+=0.03", z: "+=0.03"}, "<");
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
);

// Prints passed value/Message in console.log. pass 'showLog' => true to display
const showInConsoleLog = (showLog, value) => {
  if(showLog) {
    console.log(value);
  }
}

// Update 'Models' position on path onscroll
let timer;
const setModelCoordinates = () => {
  // The default model position coordinates are in 'Screen coordinate'
  const screenX = model.position.x;
  const screenY = model.position.y;
  const canvasBoundingRect = canvas.getBoundingClientRect();

  // Convert 'Screen coordinate' values to 'World coordinate' values, as Three.js uses 'World coordinate system'.
  model.position.x = ((screenX / canvasBoundingRect.width) * 2 - 1) * 8;
  model.position.y = (-(screenY / canvasBoundingRect.height) * 2 + 1) * (8 / (canvasBoundingRect.width / canvasBoundingRect.height));

  fastRotationOnScroll();

  // Timer for detecting page scrolling stop to change the Meteor speed back to normal
  clearTimeout(timer);
  timer = setTimeout(defaultRotation, 500);
}

// Gives Default Rotation speed to Meteor
const defaultRotation = () => {
  if(!meteorDefaultRotationSpeed) {
    rotation.clear();
    showInConsoleLog(false, "In defaultRotation(): Rotation timeline cleared");
    setRotationSpeedAndDirectionForObject(true);
    meteorDefaultRotationSpeed = true;
  }
}

// Gives faster Rotation speed to Meteor onscroll
const fastRotationOnScroll = () => {
  if(meteorDefaultRotationSpeed) {
    showInConsoleLog(false, "In fastRotationOnScroll(): Rotation timeline cleared");
    setRotationSpeedAndDirectionForObject(false);
    meteorDefaultRotationSpeed = false;
  } else {
    if(scroll != meteorClockwiseRotation) {
      setRotationSpeedAndDirectionForObject(false);
    }
  }
}

// sets Rotation Speed & Direction for Meteor
const setRotationSpeedAndDirectionForObject = (defaultRotationSpeed) => {
  rotation.clear();
  if(scroll) {
    if(defaultRotationSpeed) {
      showInConsoleLog(false, "Default Rotation: Clockwise");
      rotation.to(model.rotation, {y: "+=0.5236", ease: 'none', duration: 0.5})
        .to(model.rotation, {y: "+=0.418879", ease: 'none', duration: 0.5}, ">")
        .to(model.rotation, {y: "+=0.349066", ease: 'none', duration: 0.5}, ">")
        .to(model.rotation, {y: "+=0.3141595", ease: 'none', duration: 0.5}, ">")
        .to(model.rotation, {y: "+=0.2617995", ease: 'none', duration: 0.5, onComplete: clearRotationAndGiveDefaultRotation}, ">");
    } else {
      showInConsoleLog(false, "Fast Rotation: Clockwise");
      rotation.to(model.rotation, {y: "+=6.28318531", ease: 'none', repeat: -1, duration: 5});
    }
    meteorClockwiseRotation = true;
  } else {
    if(defaultRotationSpeed) {
      showInConsoleLog(false, "Default Rotation: AntiClockwise");
      rotation.to(model.rotation, {y: "-=0.5236", ease: 'none', duration: 0.5})
        .to(model.rotation, {y: "-=0.418879", ease: 'none', duration: 0.5}, ">")
        .to(model.rotation, {y: "-=0.349066", ease: 'none', duration: 0.5}, ">")
        .to(model.rotation, {y: "-=0.3141595", ease: 'none', duration: 0.5}, ">")
        .to(model.rotation, {y: "-=0.2617995", ease: 'none', duration: 0.5, onComplete: clearRotationAndGiveDefaultRotation}, ">");
    } else {
      showInConsoleLog(false, "Fast Rotation: AntiClockwise");
      rotation.to(model.rotation, {y: "-=6.28318531", ease: 'none', repeat: -1, duration: 5});
    }
    meteorClockwiseRotation = false;
  }
}

// Clears 'rotation timeline' and gives default rotation speed to Meteor
const clearRotationAndGiveDefaultRotation = () => {
  if(scroll) {
    rotation.clear();
    rotation.to(model.rotation, {y: "+=6.28318531", ease: 'none', repeat: -1, duration: 15});
  } else {
    rotation.clear();
    rotation.to(model.rotation, {y: "-=6.28318531", ease: 'none', repeat: -1, duration: 15});
  }
}

const galaxyImg = new THREE.TextureLoader().load('assets/galaxy.jpg');

scene.background = galaxyImg;

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

locoScroll.scrollTo({ target: "top" });

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

docElem.forEach(elem => observer.observe(elem));

ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

ScrollTrigger.refresh();