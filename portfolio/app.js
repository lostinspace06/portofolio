// Portfolio Navigation with AWESOME Features (No Cityscape)
class CyberPortfolio {
  constructor() {
    this.currentSection = 'home';
    this.miningActive = false;
    this.miningInterval = null;
    this.hashRate = 0;
    this.blocksMined = 0;
    this.projectsFound = 0;
    this.totalProjects = 3;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupAnimations();
    this.setupMatrixRain();
    this.animateSkillBars();
    this.setupNeonSign();
    this.setupGitHubStream();
    this.setupMiningSimulator();
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-options button');
    
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const targetSection = e.target.dataset.section;
        this.navigateTo(targetSection);
        this.playSound('click');
      });
    });

    this.showSection('home');
  }

  navigateTo(section) {
    this.hideCurrentSection();
    this.showSection(section);
    this.currentSection = section;
  }

  hideCurrentSection() {
    const currentActive = document.querySelector('.section.active');
    if (currentActive) {
      currentActive.classList.remove('active');
    }
  }

  showSection(section) {
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.add('active');
      
      gsap.fromTo(targetSection, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }

  setupAnimations() {
    // Avatar glitch effect
    const avatar = document.querySelector('.avatar-glitch');
    setInterval(() => {
      gsap.to(avatar, {
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }, 3000);

    // Hologram pulse effect
    const holograms = document.querySelectorAll('.hologram-icon');
    holograms.forEach(hologram => {
      setInterval(() => {
        gsap.to(hologram, {
          scale: 1.1,
          duration: 0.5,
          yoyo: true,
          ease: "power2.inOut"
        });
      }, 2000);
    });
  }

  animateSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');
    
    skillLevels.forEach(level => {
      const targetWidth = level.dataset.level + '%';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(level, {
              width: targetWidth,
              duration: 1.5,
              ease: "power3.out",
              delay: Math.random() * 0.5
            });
            observer.unobserve(level);
          }
        });
      });

      observer.observe(level);
    });
  }

  setupMatrixRain() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const matrixContainer = document.querySelector('.matrix-rain');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    matrixContainer.appendChild(canvas);

    const chars = "01010101010101010101";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for(let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = fontSize + 'px monospace';

      for(let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 35);
  }

  /* 💡 NEON SIGN GENERATOR */
  setupNeonSign() {
    const neonInput = document.getElementById('neon-input');
    const neonSign = document.getElementById('neon-sign');
    
    // Load saved name
    const savedName = localStorage.getItem('neonName');
    if (savedName) {
      neonSign.textContent = savedName;
      neonInput.value = savedName;
    }
    
    neonInput.addEventListener('input', (e) => {
      const text = e.target.value.toUpperCase();
      neonSign.textContent = text || 'YOUR_NAME';
      localStorage.setItem('neonName', text);
      
      // Add glow effect
      gsap.to(neonSign, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    });
    
    // Random color flicker occasionally
    setInterval(() => {
      if (Math.random() > 0.7) {
        gsap.to(neonSign, {
          color: '#ff00ff',
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    }, 3000);
  }

  /* 📊 GITHUB ACTIVITY STREAM */
  async setupGitHubStream() {
    await this.fetchGitHubStats();
    this.createGitHubStream();
    this.simulateActivityFeed();
  }

  async fetchGitHubStats() {
    // Replace with your GitHub username
    const username = 'your-github-username';
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      
      document.getElementById('repo-count').textContent = data.public_repos || '42';
      document.getElementById('star-count').textContent = Math.floor(data.public_repos * 2.5) || '105';
      document.getElementById('commit-count').textContent = Math.floor(data.public_repos * 15) || '630';
      
    } catch (error) {
      // Fallback numbers if API fails
      document.getElementById('repo-count').textContent = '42';
      document.getElementById('commit-count').textContent = '630';
      document.getElementById('star-count').textContent = '105';
    }
  }

  createGitHubStream() {
    const canvas = document.getElementById('github-stream');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const points = [];
    const pointCount = 50;
    
    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1
      });
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      points.forEach(point => {
        point.y += point.speed;
        if (point.y > canvas.height) {
          point.y = 0;
          point.x = Math.random() * canvas.width;
        }
        
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connection lines
        points.forEach(otherPoint => {
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) + 
            Math.pow(point.y - otherPoint.y, 2)
          );
          
          if (distance < 100) {
            ctx.strokeStyle = `rgba(0, 255, 0, ${0.2 * (1 - distance/100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }

  simulateActivityFeed() {
    const activities = [
      'Pushed commit: "Fix critical bug in matrix rendering"',
      'Created repository: "neural-network-interface"',
      'Starred project: "threejs-cyberpunk-effects"',
      'Opened issue: "Quantum entanglement not working"',
      'Merged pull request: "Add blockchain integration"',
      'Updated README.md',
      'Deployed version 2.0.0',
      'Fixed security vulnerability',
      'Optimized rendering performance',
      'Added voice command support'
    ];
    
    const feed = document.getElementById('activity-feed');
    
    // Add initial activities
    for (let i = 0; i < 5; i++) {
      this.addActivity(activities[Math.floor(Math.random() * activities.length)]);
    }
    
    // Simulate new activity every few seconds
    setInterval(() => {
      if (Math.random() > 0.3) {
        this.addActivity(activities[Math.floor(Math.random() * activities.length)]);
      }
    }, 3000);
  }

  addActivity(text) {
    const feed = document.getElementById('activity-feed');
    const activity = document.createElement('div');
    activity.className = 'activity-item';
    activity.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    
    feed.insertBefore(activity, feed.firstChild);
    
    // Limit to 10 activities
    if (feed.children.length > 10) {
      feed.removeChild(feed.lastChild);
    }
  }

  /* ⛏️ CRYPTO MINING SIMULATOR */
  setupMiningSimulator() {
    const startBtn = document.getElementById('start-mining');
    const stopBtn = document.getElementById('stop-mining');
    
    startBtn.addEventListener('click', () => this.startMining());
    stopBtn.addEventListener('click', () => this.stopMining());
    
    this.setupMiningVisualization();
  }

  startMining() {
    if (this.miningActive) return;
    
    this.miningActive = true;
    this.hashRate = 1000;
    this.playSound('mining');
    
    this.miningInterval = setInterval(() => {
      this.hashRate += Math.random() * 100 - 50;
      this.hashRate = Math.max(500, Math.min(5000, this.hashRate));
      
      document.getElementById('hash-rate').textContent = 
        Math.floor(this.hashRate).toLocaleString() + ' H/s';
      
      // Mine a block occasionally
      if (Math.random() > 0.8) {
        this.mineBlock();
      }
      
    }, 100);
    
    this.addDiscovery('Mining rig activated...');
    this.addDiscovery('Initializing quantum processors...');
  }

  stopMining() {
    if (!this.miningActive) return;
    
    this.miningActive = false;
    clearInterval(this.miningInterval);
    this.hashRate = 0;
    
    document.getElementById('hash-rate').textContent = '0 H/s';
    this.addDiscovery('Mining operations ceased.');
  }

  mineBlock() {
    this.blocksMined++;
    document.getElementById('blocks-mined').textContent = this.blocksMined;
    
    this.addDiscovery(`Block #${this.blocksMined} mined successfully!`);
    
    // Discover projects occasionally
    if (this.blocksMined % 3 === 0 && this.projectsFound < this.totalProjects) {
      this.discoverProject();
    }
  }

  discoverProject() {
    this.projectsFound++;
    document.getElementById('projects-found').textContent = 
      `${this.projectsFound}/${this.totalProjects}`;
    
    const projects = [
      '3D Portfolio Gateway',
      'Neural Network API', 
      'Blockchain Explorer'
    ];
    
    this.addDiscovery(`🚀 PROJECT DISCOVERED: ${projects[this.projectsFound - 1]}`);
    
    // Visual celebration
    gsap.to('#projects-found', {
      scale: 1.5,
      duration: 0.3,
      yoyo: true,
      repeat: 2,
      ease: "power2.inOut"
    });
  }

  addDiscovery(text) {
    const log = document.getElementById('discovery-log');
    const discovery = document.createElement('div');
    discovery.className = 'discovery-item';
    discovery.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    
    log.insertBefore(discovery, log.firstChild);
    
    // Limit log size
    if (log.children.length > 8) {
      log.removeChild(log.lastChild);
    }
  }

  setupMiningVisualization() {
    const canvas = document.getElementById('mining-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles = [];
    
    function animateMining() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add new particles
      if (Math.random() > 0.7) {
        particles.push({
          x: Math.random() * canvas.width,
          y: 0,
          speed: Math.random() * 3 + 1,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? '#00ff00' : '#00cc00'
        });
      }
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.y += particle.speed;
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove particles that are off screen
        if (particle.y > canvas.height) {
          particles.splice(index, 1);
        }
      });
      
      requestAnimationFrame(animateMining);
    }
    
    animateMining();
  }

  playSound(type) {
    const sound = document.getElementById(type + '-sound');
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Audio play failed:', e));
    }
  }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  const portfolio = new CyberPortfolio();
  
  // Project card interactions
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.dataset.project;
      // Add your project detail logic here
    });

    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });

  // Form submission
  const contactForm = document.querySelector('.contact-form');
  const cyberButton = contactForm.querySelector('.cyber-button');
  
  cyberButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    gsap.to(cyberButton, {
      background: '#00cc00',
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });

    setTimeout(() => {
      alert('TRANSMISSION INITIATED\nMessage encrypted and sent through secure channels.');
    }, 1000);
  });

  // Window controls
  const windowControls = document.querySelectorAll('.window-controls button');
  windowControls.forEach(control => {
    control.addEventListener('click', (e) => {
      const window = e.target.closest('.terminal-window');
      if (e.target.classList.contains('minimize')) {
        gsap.to(window, {
          scale: 0.9,
          opacity: 0.7,
          duration: 0.3
        });
      } else if (e.target.classList.contains('close')) {
        gsap.to(window, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            window.style.display = 'none';
          }
        });
      }
    });
  });
});

// Handle window resize
window.addEventListener('resize', () => {
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    if (canvas.id !== 'github-stream' && canvas.id !== 'mining-canvas') {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  });
});