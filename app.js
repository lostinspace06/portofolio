import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Global variables
let model, promptPlane;
let messageIndex = 0;
let modelProgress = 0;
let videoProgress = 0;
let progressLine;
let isMusicPlaying = false;

// DOM elements
const container = document.getElementById('model-container');
const loadingScreen = document.getElementById('loading-screen');
const terminalOutput = document.getElementById('terminal-output');
const bgVideo = document.getElementById('bg-video');
const glitchOverlay = document.getElementById('glitch-overlay');
const timeDisplay = document.getElementById('time-display');
const musicToggle = document.getElementById('music-toggle');

// Audio elements
const bgMusic = document.getElementById('bg-music');
const clickSound = document.getElementById('click-sound');

// Boot messages
const bootMessages = [
  '[    0.000000] Initializing cgroup subsys cpuset',
  '[    0.000000] Initializing cgroup subsys cpu',
  '[    0.000000] Linux version 5.15.0-portfolio',
  '[    0.234521] Command line: BOOT_IMAGE=/boot/vmlinuz root=/dev/sda1',
  '[    0.456782] Kernel command line: quiet splash',
  '[    0.678234] PCI: Using configuration type 1 for base access',
  '[    0.892341] Memory: 16384MB available',
  '[    1.123456] CPU: Physical Processor ID: 0',
  '[    1.345678] ACPI: Core revision 20210730',
  '[    1.567890] clocksource: refined-jiffies',
  '[    1.789012] NET: Registered protocol family 16',
  '[    2.012345] PCI: Using ACPI for IRQ routing',
  '[    2.234567] Freeing unused kernel memory: 2048K',
  '[    2.456789] Write protecting the kernel read-only data',
  '[    2.678901] <span class="ok">[ OK ]</span> Started System Logging Service',
  '[    2.890123] <span class="ok">[ OK ]</span> Started Network Manager',
  '[    3.012345] <span class="ok">[ OK ]</span> Started Authorization Manager',
  '[    3.234567] <span class="ok">[ OK ]</span> Reached target Network',
  '[    3.456789] <span class="ok">[ OK ]</span> Started D-Bus System Message Bus',
  '[    3.678901] Loading 3D model assets...',
  '[    3.890123] Loading background video...',
];

// Three.js setup
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 1.5, 4);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);
controls.update();

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Cyberpunk colored lights
const pointLight1 = new THREE.PointLight(0x00ff00, 0.5, 10);
pointLight1.position.set(2, 3, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff00ff, 0.3, 10);
pointLight2.position.set(-2, 2, -2);
scene.add(pointLight2);

// Time display function
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Update time immediately and then every second
updateTime();
setInterval(updateTime, 1000);

// Music control function
function setupMusicControls() {
  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      musicToggle.textContent = 'MUSIC: OFF';
      musicToggle.classList.remove('music-on');
    } else {
      bgMusic.play().catch(e => console.log('Audio play failed:', e));
      musicToggle.textContent = 'MUSIC: ON';
      musicToggle.classList.add('music-on');
    }
    isMusicPlaying = !isMusicPlaying;
  });
}

// Particle system for cyberpunk atmosphere
function createParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 800;
  const posArray = new Float32Array(particleCount * 3);

  for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x00ff00,
    transparent: true,
    opacity: 0.4
  });

  const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particlesMesh);

  // Animate particles
  gsap.to(particlesMesh.rotation, {
    y: Math.PI * 2,
    duration: 25,
    repeat: -1,
    ease: "none"
  });
}

// Boot sequence functions
function addBootMessage() {
  if (messageIndex < bootMessages.length) {
    const line = document.createElement('div');
    line.className = 'loading-line';
    line.innerHTML = bootMessages[messageIndex];
    terminalOutput.appendChild(line);
    
    setTimeout(() => {
      line.style.opacity = 1;
    }, 10);
    
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    messageIndex++;
    setTimeout(addBootMessage, Math.random() * 80 + 40);
  } else {
    updateProgressBar();
  }
}

function updateProgressBar() {
  const totalProgress = Math.min(100, Math.floor((modelProgress + videoProgress) / 2));
  const barLength = 50;
  const filled = Math.floor(totalProgress / 100 * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  if (!progressLine) {
    progressLine = document.createElement('div');
    progressLine.className = 'loading-line progress-bar';
    terminalOutput.appendChild(progressLine);
    setTimeout(() => {
      progressLine.style.opacity = 1;
    }, 10);
  }
  
  progressLine.textContent = `[    4.${String(Date.now()).slice(-6)}] Loading: [${bar}] ${totalProgress}%`;
  terminalOutput.scrollTop = terminalOutput.scrollHeight;

  if (totalProgress >= 100) {
    setTimeout(() => {
      const completeLine = document.createElement('div');
      completeLine.className = 'loading-line ok';
      completeLine.innerHTML = '[    4.999999] <span class="ok">[ OK ]</span> Gateway initialized successfully';
      terminalOutput.appendChild(completeLine);
      
      setTimeout(() => {
        completeLine.style.opacity = 1;
      }, 10);
      
      setTimeout(startTransition, 800);
    }, 300);
  } else {
    requestAnimationFrame(updateProgressBar);
  }
}

function startTransition() {
  const tl = gsap.timeline();
  
  tl.to(glitchOverlay, {
    opacity: 1,
    duration: 0.2
  })
  .to(terminalOutput, {
    scaleY: 0.1,
    scaleX: 0.98,
    duration: 0.4,
    ease: "power2.inOut"
  }, "-=0.1")
  .to(loadingScreen, {
    opacity: 0,
    duration: 0.1
  })
  .to(loadingScreen, {
    opacity: 1,
    duration: 0.1
  })
  .to(loadingScreen, {
    opacity: 0,
    duration: 0.1
  })
  .to(loadingScreen, {
    opacity: 1,
    duration: 0.1
  })
  .to(loadingScreen, {
    opacity: 0,
    scaleY: 0.01,
    duration: 0.6,
    ease: "power3.inOut",
    transformOrigin: "center center"
  })
  .to(bgVideo, {
    opacity: 0.5,
    scale: 1,
    duration: 1.2,
    ease: "power2.out"
  }, "-=0.8")
  .to(container, {
    opacity: 1,
    y: 0,
    duration: 1.5,
    ease: "power3.out"
  }, "-=1")
  .to(glitchOverlay, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.5")
  .call(() => {
    loadingScreen.style.display = 'none';
    createParticles();
    // Show time and music controls after transition
    gsap.to([timeDisplay, musicToggle], {
      opacity: 1,
      duration: 1,
      ease: "power2.out"
    });
  });
}

function playSound(audioElement) {
  audioElement.currentTime = 0;
  audioElement.play().catch(e => console.log('Sound play failed:', e));
}

function createPortalEffect() {
  // Create portal overlay
  const portalOverlay = document.createElement('div');
  portalOverlay.className = 'portal-overlay';
  document.body.appendChild(portalOverlay);

  // Create Linux-style portal messages
  const portalMessages = document.createElement('div');
  portalMessages.className = 'portal-messages';
  
  // Linux-style portal sequence messages
  const messages = [
    { text: '[    5.123456] SECURITY: Scanning visitor credentials...', class: 'portal-line' },
    { text: '[    5.234567] SECURITY: Detecting sarcasm levels... 87%', class: 'portal-line' },
    { text: '[    5.345678] SECURITY: <span class="portal-ok">[ OK ]</span> Is it the recruiter or stalker?', class: 'portal-line' },
    { text: '[    5.456789] NETWORK: Checking if you skipped the boot sequence...', class: 'portal-line' },
    { text: '[    5.567890] NETWORK: <span class="portal-ok">[ OK ]</span> Impressed by loading screen: true', class: 'portal-line' },
    { text: '[    5.678901] SYSTEM: Calculating how many times you clicked EXIT by mistake', class: 'portal-line' },
    { text: '[    5.789012] QUANTUM: Stabilizing impatience parameters...', class: 'portal-line' },
    { text: '[    5.890123] QUANTUM: <span class="portal-ok">[ OK ]</span> Coffee levels adequate', class: 'portal-line' },
    { text: '[    6.012345] AI: Predicting if you\'ll actually hire me...', class: 'portal-line' },
    { text: '[    6.123456] AI: <span class="portal-warning">Probability: "We\'ll keep your resume on file"</span>', class: 'portal-line portal-warning' },
    { text: '[    6.234567] MEME: Loading appropriate reaction gif...', class: 'portal-line' },
    { text: '[    6.345678] MEME: <span class="portal-ok">[ OK ]</span> "Ah shit, here we go again" ready', class: 'portal-line' },
    { text: '[    6.456789] SECURITY: <span class="portal-success">ACCESS GRANTED</span>', class: 'portal-line portal-success' },
    { text: '[    6.567890] SYSTEM: <span class="portal-warning">WARNING: Resume contains actual skills</span>', class: 'portal-line portal-warning' },
    { text: '[    6.678901] PORTAL: Redirecting before you change your mind...', class: 'portal-line' },
    { text: '[    6.789012] FINAL: <span class="portal-success">Please don\'t judge my CSS too hard</span>', class: 'portal-line portal-success' }
  ];

  messages.forEach(msg => {
    const line = document.createElement('div');
    line.className = msg.class;
    line.innerHTML = msg.text;
    portalMessages.appendChild(line);
  });

  document.body.appendChild(portalMessages);

  // EPIC PORTAL TRANSITION WITH LINUX MESSAGES
  const tl = gsap.timeline();
  
  // Step 1: Fade in overlay and first messages
  tl.to(portalOverlay, {
    opacity: 0.3,
    duration: 0.5,
    ease: "power2.out"
  })
  .to(portalMessages, {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out"
  });

  // Step 2: Type out messages one by one with delays
  messages.forEach((_, index) => {
    tl.to(portalMessages.children[index], {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    }, `+=${index === 0 ? 0.2 : 0.1}`);
  });

  // Step 3: Build up intensity
  tl.to(portalOverlay, {
    opacity: 0.6,
    duration: 1,
    ease: "power2.out"
  }, "-=1")
  .to(portalMessages, {
    scale: 1.05,
    duration: 0.8,
    ease: "power2.inOut"
  }, "-=0.8")
  
  // Step 4: Final flash and redirect
  .to(portalOverlay, {
    opacity: 0.9,
    duration: 0.5,
    ease: "power2.out"
  })
  .to(portalMessages, {
    opacity: 0,
    duration: 0.3,
    ease: "power2.in"
  }, "-=0.2")
  .call(() => {
    // Redirect to main portfolio site
    setTimeout(() => {
      window.location.href = 'portfolio/index.html';
    }, 500);
  });
}

// Video loading progress
setTimeout(() => {
  videoProgress = 100;
}, 10000);

bgVideo.addEventListener('progress', () => {
  if (bgVideo.buffered.length > 0) {
    videoProgress = (bgVideo.buffered.end(0) / bgVideo.duration) * 100;
  }
});

bgVideo.oncanplaythrough = () => {
  videoProgress = 100;
};

// Model loading
const loader = new GLTFLoader();
loader.load(
  'models/computer.glb',
  (gltf) => {
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    model.position.y += 2.1;
    model.position.x += 0.7;
    model.rotation.y = Math.PI / 2;
    model.scale.set(0.7, 0.7, 0.7);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);
    modelProgress = 100;

    // Animate the model entrance
    gsap.from(model.scale, {
      x: 0, y: 0, z: 0,
      duration: 2,
      ease: "elastic.out(1, 0.75)",
      delay: 1.5
    });
    
    gsap.from(model.rotation, {
      y: model.rotation.y + Math.PI * 2,
      duration: 2,
      ease: "power3.out",
      delay: 1.5
    });

    createPromptPlane();
  },
  (xhr) => {
    if (xhr.lengthComputable) {
      modelProgress = (xhr.loaded / xhr.total) * 100;
    }
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

function createPromptPlane() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctxPrompt = canvas.getContext('2d');

  function drawPrompt() {
    ctxPrompt.clearRect(0, 0, canvas.width, canvas.height);

    ctxPrompt.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctxPrompt.fillRect(0, 0, canvas.width, canvas.height);

    ctxPrompt.fillStyle = '#00ff00';
    ctxPrompt.font = 'bold 28px monospace';
    ctxPrompt.textAlign = 'center';
    ctxPrompt.fillText('ACCESS PORTFOLIO DATABASE?', canvas.width / 2, 70);

    ctxPrompt.fillStyle = '#00ff00';
    ctxPrompt.fillRect(canvas.width / 4 - 60, 120, 120, 50);
    ctxPrompt.fillRect((canvas.width * 3) / 4 - 60, 120, 120, 50);

    ctxPrompt.fillStyle = '#000000';
    ctxPrompt.font = 'bold 24px monospace';
    ctxPrompt.fillText('ENTER', canvas.width / 4, 155);
    ctxPrompt.fillText('EXIT', (canvas.width * 3) / 4, 155);
  }
  drawPrompt();

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const planeGeometry = new THREE.PlaneGeometry(2.5, 1.5);
  promptPlane = new THREE.Mesh(planeGeometry, material);

  promptPlane.position.set(-0.1, 4.1, 0.1);
  promptPlane.rotation.set(-Math.PI / 2, -Math.PI / 2, -Math.PI / 2);

  model.add(promptPlane);

  // Animate the prompt plane with cyberpunk glow
  gsap.to(promptPlane.position, {
    y: promptPlane.position.y + 0.1,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "power2.inOut"
  });

  // Add pulsing glow effect
  gsap.to(promptPlane.material, {
    opacity: 0.8,
    duration: 1,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

  setupPromptInteraction(canvas);
}

function setupPromptInteraction(canvas) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let exitStage = 0;

  // Exit sequence functions
  function startExitSequence() {
    exitStage = 0;
    showExitDialog();
  }

  function showExitDialog() {
    const dialogs = [
      {
        title: "[ SECURITY ]: Termination sequence initiated.",
        message: "[ SYSTEM ]: Are you certain you wish to exit?\nThis action cannot be undone.",
        buttons: ["[FINE, I'LL ENTER]", "[CONFIRM EXIT]"]
      },
      {
        title: "[ SECURITY ]: Exit request logged.",
        message: "[ ME ]: But wait! Have you seen the projects section?\nI worked really hard on them yk..",
        buttons: ["[SHOW ME PROJECTS]", "[EXIT ANYWAY]"],
        projectsRedirect: true
      },
      {
        title: "[ AI ]: Scanning emotional patterns...\nDetecting.... 87% regret detected..",
        message: "[ ME ]: See the model said you're gonna regret.\nYou Sure??",
        buttons: ["[I'LL STAY]", "[BYE FOREVER]"]
      },
      {
        title: "[ QUANTUM ]: Reality distortion detected...",
        message: "[ ME ]: Wait! Atleast check skills section?\nI can do coding in MS word!",
        buttons: ["[VIEW SKILLS]", "[PERMANENT EXIT]"],
        skillsRedirect: true
      },
      {
        title: "[ FINAL ]: Initiating system shutdown...",
        message: "[ ME ]: *with puppy eyes* 'Aww man c'mon'\nI'm just a 3rd year CS student!",
        buttons: ["[FINE FINE]", "[I DON'T CARE]"]
      },
      {
        title: "[ SYSTEM ]: Fine. But you'll be back.",
        message: "Seriously though, atleast check my contact section, it has\nworking forms and everything!",
        buttons: ["[LET'S CHECK THEN]", "{PULL THE PLUG]"],
        contactRedirect: true
      },
      {
        title: "[ SYSTEM ]: Okay, okay... I get it.",
        message: "You really want to leave.\n\nBefore you go, just know:\n- I can make websites\n- I know JavaScript\n- I'm a quick learner\n- Don't go Mr. Recruiter",
        buttons: ["[OK YOU WIN]", "[I'M HEARTLESS]"]
      }
    ];

    if (exitStage >= dialogs.length) {
      actuallyExit();
      return;
    }

    const dialog = dialogs[exitStage];
    createExitDialog(dialog);
  }

  function createExitDialog(dialogData) {
    // Remove any existing dialog
    const existingDialog = document.getElementById('exit-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'exit-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 20, 0, 0.95);
      border: 2px solid #00ff00;
      border-radius: 10px;
      padding: 30px;
      z-index: 10000;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      text-align: center;
      min-width: 500px;
      box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
      backdrop-filter: blur(10px);
    `;

    const titleEl = document.createElement('div');
    titleEl.textContent = dialogData.title;
    titleEl.style.cssText = `
      font-weight: bold;
      margin-bottom: 15px;
      font-size: 1.1em;
      color: #00ff00;
    `;

    const messageEl = document.createElement('div');
    messageEl.textContent = dialogData.message;
    messageEl.style.cssText = `
      margin-bottom: 25px;
      line-height: 1.5;
      white-space: pre-line;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
    `;

    // Button 0 - Stay/Redirect options
    const stayButton = document.createElement('button');
    stayButton.textContent = dialogData.buttons[0];
    stayButton.style.cssText = `
      background: transparent;
      border: 1px solid #00ff00;
      color: #00ff00;
      padding: 10px 20px;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
    `;

    stayButton.addEventListener('mouseenter', () => {
      stayButton.style.background = '#00ff00';
      stayButton.style.color = '#000';
    });

    stayButton.addEventListener('mouseleave', () => {
      stayButton.style.background = 'transparent';
      stayButton.style.color = '#00ff00';
    });

    stayButton.addEventListener('click', () => {
      playSound(clickSound);
      dialog.remove();
      
      // Handle redirects for specific dialogs
      if (dialogData.projectsRedirect) {
        setTimeout(() => {
          window.location.href = 'portfolio/index.html#projects';
        }, 500);
        return;
      }
      
      if (dialogData.skillsRedirect) {
        setTimeout(() => {
          window.location.href = 'portfolio/index.html#skills';
        }, 500);
        return;
      }
      
      if (dialogData.contactRedirect) {
        setTimeout(() => {
          window.location.href = 'portfolio/index.html#contact';
        }, 500);
        return;
      }
      
      // Just staying - add feedback animation
      gsap.to(promptPlane.scale, {
        x: 1.1, y: 1.1, z: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    });

    // Button 1 - Continue exiting (this triggers next popup)
    const exitButton = document.createElement('button');
    exitButton.textContent = dialogData.buttons[1];
    exitButton.style.cssText = `
      background: transparent;
      border: 1px solid #ff0000;
      color: #ff0000;
      padding: 10px 20px;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
    `;

    exitButton.addEventListener('mouseenter', () => {
      exitButton.style.background = '#ff0000';
      exitButton.style.color = '#000';
    });

    exitButton.addEventListener('mouseleave', () => {
      exitButton.style.background = 'transparent';
      exitButton.style.color = '#ff0000';
    });

    exitButton.addEventListener('click', () => {
      playSound(clickSound);
      dialog.remove();
      
      // THIS IS KEY: Increment stage and show next dialog
      exitStage++;
      
      // Add dramatic pause before next dialog
      setTimeout(() => {
        showExitDialog();
      }, 600);
    });

    buttonContainer.appendChild(stayButton);
    buttonContainer.appendChild(exitButton);

    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonContainer);
    document.body.appendChild(dialog);

    // Animate in
    gsap.from(dialog, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)"
    });
  }

  function actuallyExit() {
    // Final exit - remove the prompt plane with drama
    gsap.to(promptPlane.scale, {
      x: 0, y: 0, z: 0,
      duration: 0.8,
      ease: "back.in(1.7)",
      onComplete: () => {
        model.remove(promptPlane);
        window.removeEventListener('click', onMouseClick);
        
        // Show one final message
        const finalMessage = document.createElement('div');
        finalMessage.textContent = "[ SYSTEM ]: Fine. I see how it is. \n*quietly sobs in binary*\n\n01010011 01100001 01100100";
        finalMessage.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 20, 0, 0.9);
          border: 1px solid #00ff00;
          padding: 20px;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          z-index: 10000;
          text-align: center;
          border-radius: 5px;
          white-space: pre-line;
        `;
        document.body.appendChild(finalMessage);

        // Remove final message after 3 seconds
        setTimeout(() => {
          gsap.to(finalMessage, {
            opacity: 0,
            duration: 1,
            onComplete: () => finalMessage.remove()
          });
        }, 3000);
      }
    });
  }

  // The actual click handler for the 3D prompt plane
  function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(promptPlane);

    if (intersects.length > 0) {
      playSound(clickSound);
      
      const uv = intersects[0].uv;
      const x = uv.x * canvas.width;
      const y = (1 - uv.y) * canvas.height;

      if (x > canvas.width / 4 - 60 && x < canvas.width / 4 + 60 && y > 120 && y < 170) {
        // ENTER button - Epic portal transition to portfolio
        gsap.to(promptPlane.scale, {
          x: 1.3, y: 1.3, z: 1.3,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            createPortalEffect();
          }
        });
      } else if (x > (canvas.width * 3) / 4 - 60 && x < (canvas.width * 3) / 4 + 60 && y > 120 && y < 170) {
        // EXIT button - Start the hilarious dialog sequence
        startExitSequence();
      }
    }
  }

  window.addEventListener('click', onMouseClick);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// Initialize everything
function init() {
  animate();
  addBootMessage();
  setupMusicControls();
}

// Start the application
init();