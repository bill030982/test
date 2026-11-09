/**
 * 地球觀測站 (Planet Earth Observatory)
 * 核心交互邏輯與視覺動態引擎
 */

document.addEventListener("DOMContentLoaded", () => {
  initStarfield();
  initEarthParallax();
  initHotspots();
  initFilterControls();
  initActionToggles();
  initZoomModal();
  initCosmicAudio();
  initFullscreen();
});

/* ==========================================================================
   1. 背景動態星空引擎 (Starfield Engine)
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let stars = [];
  let width, height;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    generateStars();
  }

  function generateStars() {
    stars = [];
    const starCount = Math.floor((width * height) / 3800); // 密度適中
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.35 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.alpha += star.twinkleSpeed * star.twinkleDirection;
      if (star.alpha > 0.95) {
        star.alpha = 0.95;
        star.twinkleDirection = -1;
      } else if (star.alpha < 0.2) {
        star.alpha = 0.2;
        star.twinkleDirection = 1;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(drawStars);
}

/* ==========================================================================
   2. 地球 3D 視差與懸浮響應 (3D Parallax Tilt & Mobile Gyroscope)
   ========================================================================== */
function initEarthParallax() {
  const stage = document.getElementById("earth-stage");
  const frame = document.getElementById("earth-frame");
  if (!stage || !frame) return;

  let isHovered = false;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // 電腦端滑鼠懸浮
  stage.addEventListener("mouseenter", () => {
    isHovered = true;
  });

  stage.addEventListener("mouseleave", () => {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    targetTiltY = (mouseX / (rect.width / 2)) * 14;
    targetTiltX = -(mouseY / (rect.height / 2)) * 14;
  });

  // 手機端單指滑動 3D 傾斜 (Touch Drag Parallax)
  stage.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1) {
        const rect = stage.getBoundingClientRect();
        const touch = e.touches[0];
        const mouseX = touch.clientX - (rect.left + rect.width / 2);
        const mouseY = touch.clientY - (rect.top + rect.height / 2);

        targetTiltY = (mouseX / (rect.width / 2)) * 16;
        targetTiltX = -(mouseY / (rect.height / 2)) * 16;
        isHovered = true;
      }
    },
    { passive: true }
  );

  stage.addEventListener("touchend", () => {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  // 手機端陀螺儀體感傾斜 (DeviceOrientation Gyroscope)
  if (window.DeviceOrientationEvent) {
    window.addEventListener(
      "deviceorientation",
      (event) => {
        // 當使用者沒有主動按住滑動時，啟用體感晃動
        if (!isHovered && event.gamma !== null && event.beta !== null) {
          // gamma: 左右傾斜 (-90 ~ 90)
          // beta: 前後傾斜 (-180 ~ 180)，一般手持視角約 45 度
          const clampedGamma = Math.max(Math.min(event.gamma, 35), -35);
          const clampedBeta = Math.max(Math.min(event.beta - 45, 35), -35);

          targetTiltY = (clampedGamma / 35) * 12;
          targetTiltX = -(clampedBeta / 35) * 12;
        }
      },
      { passive: true }
    );
  }

  // 平滑插值動畫循環 (Lerp)
  function updateTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;

    if (Math.abs(currentTiltX) > 0.01 || Math.abs(currentTiltY) > 0.01 || isHovered) {
      frame.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
    } else {
      frame.style.transform = "";
    }

    requestAnimationFrame(updateTilt);
  }

  requestAnimationFrame(updateTilt);
}

/* ==========================================================================
   3. 地表熱點與詳細資料彈窗 (Hotspots & Info Modal)
   ========================================================================== */
function initHotspots() {
  const modal = document.getElementById("info-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalClose = document.getElementById("modal-close");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const hotspots = document.querySelectorAll(".hotspot");

  function openModal(title, desc) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  hotspots.forEach((spot) => {
    spot.addEventListener("click", (e) => {
      e.stopPropagation();
      const title = spot.dataset.title;
      const desc = spot.dataset.desc;
      openModal(title, desc);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

/* ==========================================================================
   4. 光學濾鏡控制 (Filter Controls)
   ========================================================================== */
function initFilterControls() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const earthImg = document.getElementById("earth-image");
  if (!earthImg || !filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 清除舊有的濾鏡類別
      earthImg.className = "earth-img";
      const targetFilter = btn.dataset.filter;
      if (targetFilter) {
        earthImg.classList.add(targetFilter);
      }
    });
  });
}

/* ==========================================================================
   5. 輔助切換開關 (Hotspots & Rotation Toggles)
   ========================================================================== */
function initActionToggles() {
  const toggleHotspotsBtn = document.getElementById("toggle-hotspots");
  const hotspotsContainer = document.getElementById("hotspots-container");
  const toggleRotationBtn = document.getElementById("toggle-rotation");
  const earthFrame = document.getElementById("earth-frame");

  if (toggleHotspotsBtn && hotspotsContainer) {
    toggleHotspotsBtn.addEventListener("click", () => {
      const isHidden = hotspotsContainer.classList.toggle("hidden");
      toggleHotspotsBtn.classList.toggle("active", !isHidden);
    });
  }

  if (toggleRotationBtn && earthFrame) {
    toggleRotationBtn.addEventListener("click", () => {
      const isRotating = earthFrame.classList.toggle("rotating");
      toggleRotationBtn.classList.toggle("active", isRotating);
    });
  }
}

/* ==========================================================================
   6. 高倍率影像檢視器 (Zoom Modal with Pan & Wheel Zoom)
   ========================================================================== */
function initZoomModal() {
  const openBtn = document.getElementById("open-zoom-modal");
  const zoomModal = document.getElementById("zoom-modal");
  const closeBtn = document.getElementById("zoom-close-btn");
  const resetBtn = document.getElementById("zoom-reset-btn");
  const viewport = document.getElementById("zoom-viewport");
  const zoomImg = document.getElementById("zoom-img");

  if (!zoomModal || !viewport || !zoomImg) return;

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    zoomImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    panX = 0;
    panY = 0;
    updateTransform();
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      zoomModal.classList.add("active");
      zoomModal.setAttribute("aria-hidden", "false");
      resetZoom();
    });
  }

  function closeZoom() {
    zoomModal.classList.remove("active");
    zoomModal.setAttribute("aria-hidden", "true");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeZoom);
  if (resetBtn) resetBtn.addEventListener("click", resetZoom);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && zoomModal.classList.contains("active")) {
      closeZoom();
    }
  });

  // 滾輪縮放
  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.75), 5.0);
      scale = newScale;
      updateTransform();
    },
    { passive: false }
  );

  // 拖曳平移
  viewport.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // 觸控支援 (Touch support: 支援單指拖曳平移與雙指手勢捏合縮放 Pinch-to-Zoom)
  let initialPinchDistance = 0;
  let initialPinchScale = 1;

  function getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - panX;
      startY = e.touches[0].clientY - panY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
      initialPinchScale = scale;
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      updateTransform();
    } else if (e.touches.length === 2 && initialPinchDistance > 0) {
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const pinchFactor = currentDistance / initialPinchDistance;
      scale = Math.min(Math.max(initialPinchScale * pinchFactor, 0.75), 5.0);
      updateTransform();
    }
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    isDragging = false;
    initialPinchDistance = 0;
  });
}

/* ==========================================================================
   7. 深空環境音合成器 (Web Audio API Cosmic Ambient Drone)
   ========================================================================== */
function initCosmicAudio() {
  const toggleBtn = document.getElementById("audio-toggle");
  if (!toggleBtn) return;

  const iconOff = toggleBtn.querySelector(".sound-off");
  const iconOn = toggleBtn.querySelector(".sound-on");

  let audioCtx = null;
  let isPlaying = false;
  let masterGain = null;
  let osc1 = null;
  let osc2 = null;

  function startDrone() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 2.5);

    // 主音頻 (55Hz / A1 沉靜深空基頻)
    osc1 = audioCtx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

    // 副音頻 (110Hz / A2 諧波，略帶顫音)
    osc2 = audioCtx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(110.3, audioCtx.currentTime);

    // 低通共振濾波器
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, audioCtx.currentTime);
    filter.Q.setValueAtTime(2, audioCtx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();

    isPlaying = true;
    updateUI();
  }

  function stopDrone() {
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      setTimeout(() => {
        if (osc1) { osc1.stop(); osc1.disconnect(); }
        if (osc2) { osc2.stop(); osc2.disconnect(); }
        isPlaying = false;
        updateUI();
      }, 1250);
    } else {
      isPlaying = false;
      updateUI();
    }
  }

  function updateUI() {
    if (isPlaying) {
      toggleBtn.classList.add("active");
      if (iconOff) iconOff.style.display = "none";
      if (iconOn) iconOn.style.display = "block";
    } else {
      toggleBtn.classList.remove("active");
      if (iconOff) iconOff.style.display = "block";
      if (iconOn) iconOn.style.display = "none";
    }
  }

  toggleBtn.addEventListener("click", () => {
    if (!isPlaying) {
      startDrone();
    } else {
      stopDrone();
    }
  });
}

/* ==========================================================================
   8. 全螢幕切換 (Fullscreen API)
   ========================================================================== */
function initFullscreen() {
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (!fullscreenBtn) return;

  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      fullscreenBtn.classList.add("active");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        fullscreenBtn.classList.remove("active");
      }
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.classList.remove("active");
    } else {
      fullscreenBtn.classList.add("active");
    }
  });
}
