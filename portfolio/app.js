import * as THREE from 'three';

// Make it globally accessible
window.portfolio = null;

class CyberCubePortfolio {
  constructor() {
    this.currentFace = 'name';
    this.currentRotation = 0;
    this.isRotating = false;
    this.mainCube = document.getElementById('main-cube');
    this.mouse3D = new THREE.Vector3();
    this.ripples = [];
    this.trailPoints = [];
    
    this.init();
  }

  init() {
    this.setupCustomCursor();
    this.setupCursorTrail();
    this.setupMatrixBackground();
    this.setupNeuralNetwork();
    this.setupNavigation();
    this.setupTouchControls();
    this.setupHoverEffects();
    this.setupHeaderNavigation();
  }

  setupCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursorFollower.style.left = e.clientX + 'px';
      cursorFollower.style.top = e.clientY + 'px';
    });

    const interactiveElements = document.querySelectorAll('.cube-face, .project-card, .skill-item, .contact-link, .project-btn, .nav-arrow, .nav-link');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = '#00ffff';
      });
      
      element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = '#00ff41';
      });
    });
  }

  setupCursorTrail() {
    const canvas = document.getElementById('cursor-trail');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    document.addEventListener('mousemove', (e) => {
      this.trailPoints.push({
        x: e.clientX,
        y: e.clientY,
        life: 1
      });

      if (this.trailPoints.length > 20) {
        this.trailPoints.shift();
      }
    });

    const animateTrail = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < this.trailPoints.length; i++) {
        const point = this.trailPoints[i];
        const size = 3 * point.life;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 65, ${point.life * 0.5})`;
        ctx.fill();

        point.life -= 0.05;
        if (point.life <= 0) {
          this.trailPoints.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(animateTrail);
    };

    animateTrail();
  }

  setupMatrixBackground() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('matrix-bg').appendChild(renderer.domElement);

    // Particle system
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const originalPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 100 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];

      velocities.push({ x: 0, y: 0, z: 0 });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      color: 0x00ff41,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    camera.position.z = 50;

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.mouse3D.set(x * 50, y * 50, 0);
    });

    // Click ripples
    document.addEventListener('click', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this.ripples.push({
        position: new THREE.Vector3(x * 50, y * 50, 0),
        radius: 0,
        maxRadius: 80
      });
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      const positions = particleSystem.geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        
        // Mouse repulsion
        const distToMouse = particlePos.distanceTo(this.mouse3D);
        if (distToMouse < 30) {
          const force = (30 - distToMouse) / 30;
          const direction = new THREE.Vector3().subVectors(particlePos, this.mouse3D).normalize();
          velocities[i].x += direction.x * force * 0.5;
          velocities[i].y += direction.y * force * 0.5;
          velocities[i].z += direction.z * force * 0.5;
        }

        // Ripple effects
        for (let j = 0; j < this.ripples.length; j++) {
          const ripple = this.ripples[j];
          const distToRipple = particlePos.distanceTo(ripple.position);
          const rippleEdge = Math.abs(distToRipple - ripple.radius);
          
          if (rippleEdge < 5) {
            const force = (5 - rippleEdge) / 5 * 20;
            const direction = new THREE.Vector3().subVectors(particlePos, ripple.position).normalize();
            velocities[i].x += direction.x * force * 0.1;
            velocities[i].y += direction.y * force * 0.1;
            velocities[i].z += direction.z * force * 0.1;
          }
        }

        // Apply velocities
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        // Return to original position
        velocities[i].x += (originalPositions[i3] - positions[i3]) * 0.01;
        velocities[i].y += (originalPositions[i3 + 1] - positions[i3 + 1]) * 0.01;
        velocities[i].z += (originalPositions[i3 + 2] - positions[i3 + 2]) * 0.01;

        // Friction
        velocities[i].x *= 0.95;
        velocities[i].y *= 0.95;
        velocities[i].z *= 0.95;
      }

      // Update ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        this.ripples[i].radius += 2;
        if (this.ripples[i].radius >= this.ripples[i].maxRadius) {
          this.ripples.splice(i, 1);
        }
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupNeuralNetwork() {
    const canvas = document.querySelector('.neural-network-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;

    const nodes = [];
    for (let i = 0; i < 20; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 3,
        active: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 120) {
          connections.push({ from: i, to: j, flow: Math.random() });
        }
      }
    }

    let sequenceIndex = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sequential activation
      if (Date.now() % 200 < 16) {
        nodes.forEach(n => n.active = false);
        nodes[sequenceIndex % nodes.length].active = true;
        sequenceIndex++;
      }

      // Draw connections
      connections.forEach(conn => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Flow packet
        conn.flow += 0.01;
        if (conn.flow > 1) conn.flow = 0;
        
        const flowX = from.x + (to.x - from.x) * conn.flow;
        const flowY = from.y + (to.y - from.y) * conn.flow;
        
        ctx.beginPath();
        ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.active ? 'rgba(0, 255, 65, 1)' : 'rgba(0, 255, 65, 0.5)';
        ctx.fill();

        if (node.active) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  setupHeaderNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navIndicator = document.querySelector('.nav-indicator');
    
    // Initial header setup
    this.updateHeaderNavigation();
    
    // Add click handlers to nav links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetFace = link.getAttribute('data-face');
        this.rotateToFace(targetFace);
      });
    });

    // Add hover effects to nav links
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, {
          scale: 1.05,
          duration: 0.2,
          ease: "power2.out"
        });
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(link, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    });
  }

  updateHeaderNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navIndicator = document.querySelector('.nav-indicator');
    const activeLink = document.querySelector(`.nav-link[data-face="${this.currentFace}"]`);
    
    // Update active states
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    if (activeLink) {
      activeLink.classList.add('active');
      
      // Update indicator position with animation
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = activeLink.parentElement.getBoundingClientRect();
      
      if (navIndicator) {
        gsap.to(navIndicator, {
          left: `${linkRect.left - navRect.left}px`,
          width: `${linkRect.width}px`,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }

  setupTouchControls() {
    const cubeScene = document.getElementById('cube-scene');
    
    // Use Hammer.js for better touch handling
    const hammer = new Hammer(cubeScene);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    
    hammer.on('swipeleft', () => {
      this.rotateCube(60);
    });
    
    hammer.on('swiperight', () => {
      this.rotateCube(-60);
    });

    // Mouse drag for desktop
    let mouseDown = false;
    let startX = 0;

    cubeScene.addEventListener('mousedown', (e) => {
      mouseDown = true;
      startX = e.clientX;
    });

    cubeScene.addEventListener('mousemove', (e) => {
      if (!mouseDown) return;
      const currentX = e.clientX;
      const diff = startX - currentX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.rotateCube(60);
        } else {
          this.rotateCube(-60);
        }
        mouseDown = false;
      }
    });

    cubeScene.addEventListener('mouseup', () => {
      mouseDown = false;
    });

    // Prevent default touch behavior
    cubeScene.addEventListener('touchstart', (e) => {
      e.preventDefault();
    });

    cubeScene.addEventListener('touchmove', (e) => {
      e.preventDefault();
    });
  }

  setupNavigation() {
    document.addEventListener('keydown', (e) => {
      // Don't rotate if user is typing in a form input
      const isTypingInForm = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (this.isRotating || isTypingInForm) return;
      
      if (e.key === 'ArrowRight' || e.key === 'd') {
        this.rotateCube(-60);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.rotateCube(60);
      }
    });

    const cubeFaces = document.querySelectorAll('.cube-face');
    cubeFaces.forEach(face => {
      face.addEventListener('click', (e) => {
        // Don't rotate if clicking on form elements
        if (e.target.closest('.project-card') || e.target.closest('.contact-link') || e.target.closest('.project-btn') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('.nav-link')) return;
        
        const faces = ['name', 'about', 'skills', 'projects', 'experience', 'contact'];
        const currentIndex = faces.indexOf(e.currentTarget.dataset.face);
        const nextIndex = (currentIndex + 1) % faces.length;
        this.rotateToFace(faces[nextIndex]);
      });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Message transmitted! (This is a demo - in a real portfolio, this would connect to a backend)');
        contactForm.reset();
      });
    }
  }

  setupHoverEffects() {
    const faces = document.querySelectorAll('.cube-face');
    faces.forEach(face => {
      face.addEventListener('mouseenter', () => {
        gsap.to(face, { 
          scale: 1.02, 
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      });
      face.addEventListener('mouseleave', () => {
        gsap.to(face, { 
          scale: 1, 
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // Smooth arrow hover effects
    const arrows = document.querySelectorAll('.nav-arrow');
    arrows.forEach(arrow => {
      arrow.addEventListener('mouseenter', () => {
        gsap.to(arrow, {
          scale: 1.1,
          duration: 0.2,
          ease: "power2.out"
        });
      });
      arrow.addEventListener('mouseleave', () => {
        gsap.to(arrow, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    });
  }

  rotateCube(angle) {
    if (this.isRotating) return;
    this.isRotating = true;
    
    const faces = ['name', 'about', 'skills', 'projects', 'experience', 'contact'];
    const currentIndex = faces.indexOf(this.currentFace);
    const newIndex = (currentIndex + (angle > 0 ? -1 : 1) + faces.length) % faces.length;
    this.currentFace = faces[newIndex];
    
    this.animateRotation(angle);
  }

  rotateToFace(faceName) {
    if (this.isRotating || this.currentFace === faceName) return;
    this.isRotating = true;
    
    const faces = ['name', 'about', 'skills', 'projects', 'experience', 'contact'];
    const currentIndex = faces.indexOf(this.currentFace);
    const targetIndex = faces.indexOf(faceName);
    const angleDiff = (targetIndex - currentIndex) * -60;
    
    this.currentRotation += angleDiff;
    this.currentFace = faceName;
    this.animateRotation(angleDiff);
  }

  animateRotation(angle) {
    // Calculate the new rotation
    this.currentRotation += angle;
    
    // Set rotating to false immediately so next click can happen
    this.isRotating = true;
    
    // Use a faster, more responsive animation
    gsap.to(this.mainCube, {
      rotateY: this.currentRotation,
      duration: 0.8, // Faster duration
      ease: "power2.inOut",
      onComplete: () => {
        this.isRotating = false;
        this.updateHeaderNavigation(); // Update header after rotation
      }
    });

    // Quick arrow pulse (non-blocking)
    const arrowDirection = angle > 0 ? '.nav-arrow-left' : '.nav-arrow-right';
    const arrow = document.querySelector(arrowDirection);
    if (arrow) {
      gsap.fromTo(arrow,
        {
          scale: 1.2
        },
        {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }

    // Quick face glow (non-blocking)
    const activeFace = document.querySelector(`[data-face="${this.currentFace}"]`);
    if (activeFace) {
      gsap.fromTo(activeFace, 
        {
          boxShadow: "0 0 30px rgba(0, 255, 65, 0.4)"
        },
        {
          boxShadow: "0 0 50px rgba(0, 255, 65, 0.3)",
          duration: 0.4,
          ease: "power2.out"
        }
      );
    }

    // Add a subtle pulse effect to the header when rotating
    const header = document.querySelector('.cyber-header');
    if (header) {
      gsap.fromTo(header,
        {
          boxShadow: "0 0 40px rgba(0, 255, 65, 0.5)"
        },
        {
          boxShadow: "0 0 30px rgba(0, 255, 65, 0.3)",
          duration: 0.5,
          ease: "power2.out"
        }
      );
    }
  }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.portfolio = new CyberCubePortfolio();
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.portfolio) {
    window.portfolio.updateHeaderNavigation();
  }
});