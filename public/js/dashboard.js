let currentCardType = null;
let updateInterval = null;
let latestSensorData = null;

// WebSocket for sending commands
let socket = null;

let lastMotionTime = null;

// Update Last Motion
function updateMotionLastTime() {
  const lastTimeEl = document.getElementById("card-motion-last-time");
  if (!lastTimeEl) return;
  lastTimeEl.textContent = lastMotionTime || "--";
}

// Handle Motion
function handleMotionData(motionDetected) {
  if (motionDetected) {
    lastMotionTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }).toLowerCase();
  }
  updateMotionLastTime();
}

window.onload = function () {
  // Establish WebSocket connection
  socket = new WebSocket("ws://" + window.location.hostname + ":8080");

  socket.onopen = function () {
    console.log("✅ WebSocket connection established.");
  };

// Telegram Alerts
function sendAlertToServer(type, value) {
  fetch("/api/alerts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, value }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Alert sent to server:", data);
    })
    .catch((err) => {
      console.error("Failed to send alert to server:", err);
    });
}

socket.onmessage = function (event) {
  console.log("📩 WebSocket message received:", event.data);
  try {
    const data = JSON.parse(event.data.trim());
    console.log("✅ Parsed data:", data);

    if (data.readings.motion) {
      lastMotionTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }).toLowerCase();
    }

    if (data.readings) {
      latestSensorData = data.readings;

      // تحديث الكروت الخارجية
      const tempEl = document.getElementById("card-temp");
      const humidityEl = document.getElementById("card-humidity");
      const gasEl = document.getElementById("card-gas");
      const flameEl = document.getElementById("card-flame");
      const motionEl = document.getElementById("card-motion");
      const fireEl = document.getElementById("card-fire");
      const lastTimeEl = document.getElementById("card-motion-last-time");

      if (tempEl) tempEl.textContent = data.readings.temperature + "°C";
      if (humidityEl) humidityEl.textContent = data.readings.humidity + "%";
      if (gasEl) {
        gasEl.textContent = data.readings.gas + " ppm";
        gasEl.style.color = data.readings.gas > 400 ? "red" : "#00ff00";
      }
      if (flameEl) flameEl.textContent = data.readings.flame;
      if (motionEl) {
        motionEl.textContent = data.readings.motion ? "Motion Detected" : "No Motion";
        motionEl.style.color = data.readings.motion ? "red" : "#00ff00";
      }
      if (lastTimeEl) {
        lastTimeEl.textContent = lastMotionTime || "--";
        lastTimeEl.style.color = data.readings.motion ? "red" : "#00ff00";
      }

      if (fireEl) {
        const flameValue = parseInt(data.readings.flame || 4095);
        if (flameValue < 3000) {
          fireEl.textContent = "Detected";
          fireEl.style.color = "red";
        } else {
          fireEl.textContent = "Safe";
          fireEl.style.color = "#00ff00";
        }
      }

      // تحديث الكروت المصغرة
      updateCardPreview("temperature", data.readings);
      updateCardPreview("doors", data.readings);
      updateCardPreview("security", data.readings);
      updateCardPreview("motion", data.readings);

      // تحديث الكارد المفتوح (Real-time)
      if (currentCardType) {
        updateOpenCard(currentCardType, data.readings);
      }

      // تشغيل التكييف تلقائيًا عند ارتفاع الحرارة
      if (data.readings.temperature > 30 && !window.acAutoSent) {
        const acCommand = {
          ac: true,
          ac_temperature: 24
        };
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(acCommand));
          window.acAutoSent = true;
          console.log("🔥 Temperature high! Sent AC ON command");
      
          // ✅ تحديث الكارد الداخلي بحالة التكييف كرقم درجة الحرارة
          const acDisplay = document.querySelector("#ac-control .central-display");
          if (acDisplay) {
            acDisplay.textContent = "AC Temperature: 24°C (Auto)";
            acDisplay.style.color = "green";
          }
      
          // حفظ القيمة في localStorage لاستخدامها لاحقًا
          localStorage.setItem("ac_temperature", "24");
        }
      } else if (data.readings.temperature <= 30) {
        window.acAutoSent = false;
      
        const acDisplay = document.querySelector("#ac-control .central-display");
        if (acDisplay) {
          acDisplay.textContent = "AC Status: OFF";
          acDisplay.style.color = "red";
        }
      
        // مسح القيمة المخزنة إن أردت
        localStorage.removeItem("ac_temperature");
      }

      // إرسال تنبيهات عند الحاجة
      if (data.readings.gas > 400) {
        sendAlertToServer("gas", data.readings.gas);
      }

      const flameVal = parseInt(data.readings.flame || 4095);
      if (flameVal < 3000) {
        sendAlertToServer("fire", flameVal);
      }

      console.log("✅ UI updated with new sensor data.");
    } else {
      console.log("ℹ️ Received JSON without readings, skipping update.");
    }
  } catch (err) {
    console.warn("⚠️ Error parsing JSON or updating UI:", err);
    console.log("Raw message:", event.data);
  }
};
  
  socket.onclose = function () {
    console.log("❌ WebSocket connection closed.");
    socket = null;
  };

  socket.onerror = function (err) {
    console.error("❌ WebSocket error:", err);
  };
};


// Send command through WebSocket
function sendCommand(commandObj) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(commandObj));
    console.log("✅ Sent command:", commandObj);
  } else {
    console.error("❌ WebSocket not connected. Command not sent:", commandObj);
  }
}

window.adjustTemperature = (delta) => {
  let current = localStorage.getItem("ac_temperature");
  if (!current || current === "-") {
    current = 24; 
    sendCommand({ ac: true }); 
  }

  let newTemp = parseInt(current) + delta;
  if (newTemp < 16) newTemp = 16;
  if (newTemp > 30) newTemp = 30;

  localStorage.setItem("ac_temperature", newTemp);
  const acDisplay = document.getElementById("ac-display");
  if (acDisplay) acDisplay.innerText = `${newTemp}°C`;
  sendCommand({ ac_temperature: newTemp });
};

function controlAC(action) {
  const acDisplay = document.getElementById("ac-display");

  if (action === "off") {
    localStorage.setItem("ac_temperature", "-");
    if (acDisplay) acDisplay.innerText = "OFF";
    sendCommand({ ac: false });
  } else if (action === "cool") {
    let temp = localStorage.getItem("ac_temperature");
    if (!temp || temp === "-") temp = 24;
    localStorage.setItem("ac_temperature", temp);
    if (acDisplay) acDisplay.innerText = `${temp}°C`;
    sendCommand({ ac: true, ac_temperature: parseInt(temp) }); 
  }
}

function controlDoorsAndWindows(type, action) {
  sendCommand({ [type]: action });
  localStorage.setItem(`${type}_status`, action);
  const preview = document.querySelector(`#card-${type}s`);
  if (preview) preview.textContent = `${capitalize(type)}s: ${action}`;
  const statusEl = document.getElementById(`${type}-status`);
  if (statusEl) statusEl.innerText = action;
}

// مساعدة لتحسين الشكل
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function openCard(cardType, sensorData = null) {
  sensorData = latestSensorData;
  currentCardType = cardType;

  document.getElementById("overlay").style.display = "flex";

  const cardTitle = document.getElementById("central-card-title");
  const temperature = document.getElementById("central-card-temperature");
  const humidity = document.getElementById("central-card-humidity");
  const door = document.getElementById("central-card-door");
  const window = document.getElementById("central-card-window");
  const fire = document.getElementById("central-card-fire");
  const gas = document.getElementById("central-card-gas");
  const motion = document.getElementById("central-card-motion");
  const last_time = document.getElementById("central-card-last_time");
  const lightingControl = document.getElementById("lighting-control");
  const acControl = document.getElementById("ac-control");
  const centralDisplay = document.getElementById("central-display");
  const doorControl = document.getElementById("door-control");
  const windowControl = document.getElementById("window-control");
  const fireControl = document.getElementById("fire-control");
  const gasControl = document.getElementById("gas-control");
  const motionControl = document.getElementById("motion-control");
  const last_timeControl = document.getElementById("last_time-control");

  if (cardTitle) {
    cardTitle.innerText = "";
  }
  if (temperature) {
    temperature.innerText = "";
  }
  if (humidity) {
    humidity.innerText = "";
  }
  if (door) {
    door.innerText = "";
  }
  if (window) {
    window.innerText = "";
  }
  if (fire) {
    fire.innerText = "";
  }
  if (gas) {
    gas.innerText = "";
  }
  if (motion) {
    motion.innerText = "";
  }
  if (last_time) {
    last_time.innerText = "";
  }
  if (lightingControl) {
    lightingControl.innerHTML = "";
  }
  if (acControl) {
    acControl.innerHTML = "";
  }
  if (centralDisplay) {
    centralDisplay.innerHTML = "";
  }
  if (doorControl) {
    doorControl.innerHTML = "";
  }
  if (windowControl) {
    windowControl.innerHTML = "";
  }
  if (fireControl) {
    fireControl.innerHTML = "";
  }
  if (gasControl) {
    gasControl.innerHTML = "";
  }
  if (motionControl) {
    motionControl.innerHTML = "";
  }
  if (last_timeControl) {
    last_timeControl.innerHTML = "";
  }

  const infoBoxes = document.querySelectorAll(".info-box");
  infoBoxes.forEach((box) => (box.style.display = "none"));

  lightingControl.style.display = "none";
  acControl.style.display = "none";
  doorControl.style.display = "none";
  windowControl.style.display = "none";
  fireControl.style.display = "none";
  gasControl.style.display = "none";
  motionControl.style.display = "none";
  last_timeControl.style.display = "none";

  switch (cardType) {
    case "temperature":
      if (cardTitle) {
        cardTitle.innerText = "Temperature & Lighting";
      }
      if (temperature) {
        temperature.innerText = `Temperature: ${sensorData.temperature}°C`;
      }
      if (humidity) {
        humidity.innerText = `Humidity Level: ${sensorData.humidity}%`;
      }

      if (lightingControl) {
        const temperatureLevel = sensorData.temperature;
        temperature.innerText = ` ${temperatureLevel}`;
        temperature.style.color = temperatureLevel > 30 ? "red" : "#00ff00";
      
        const lightLevelRaw = sensorData.light || 0;
      
        // تحويل القيمة إلى نسبة مئوية عادية بدون عكس
        let lightingPercentage = Math.round((lightLevelRaw / 4095) * 100);
        if (lightingPercentage < 0) lightingPercentage = 0;
        if (lightingPercentage > 100) lightingPercentage = 100;
      
        const lightingDisplayValue = `${lightingPercentage}%`;
      
        lightingControl.innerHTML = `
            <h3>Lighting</h3>
            <button onclick="controlLighting('on')">Turn On</button>
            <button onclick="controlLighting('off')">Turn Off</button>
            <div class="control-box">
                <button class="control-button" onclick="adjustLighting(-10)">-</button>
                <div class="display-screen" id="lighting-display">${lightingDisplayValue}</div>
                <button class="control-button" onclick="adjustLighting(10)">+</button>
            </div>
        `;
      }
      
      // دالة لتحويل القيمة من مدى لآخر
      function mapRange(value, in_min, in_max, out_min, out_max) {
        return Math.min(Math.max(
          (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min,
          out_min
        ), out_max);
      }

      if (acControl) {
        const humidityLevel = sensorData.humidity;
        humidity.innerText = ` ${humidityLevel}`;
        humidity.style.color = humidityLevel > 70 ? "red" : " #00ff00";

        // ✅ LocalHost قراءة درجة التكييف من 
        let currentTemp = localStorage.getItem("ac_temperature");
        if (!currentTemp) currentTemp = "-";

        acControl.innerHTML = `
          <h3>Air Conditioners</h3>
          <button onclick="controlAC('cool')">Cool Mode</button>
          <button onclick="controlAC('off')">Turn Off</button>
          <div class="control-box">
              <button class="control-button" onclick="adjustTemperature(-1)">-</button>
              <div class="display-screen" id="ac-display">
              ${currentTemp === "-" ? "OFF" : currentTemp + "°C"}</div>
              <button class="control-button" onclick="adjustTemperature(1)">+</button>
          </div>
        `;
      }
      temperature.parentElement.style.display = "block";
      humidity.parentElement.style.display = "block";
      lightingControl.style.display = "block";
      acControl.style.display = "block";
      updateCardPreview(cardType, sensorData);
      window.latestSensorData = sensorData;
      break;
    
    case "doors":
        if (cardTitle) {
          cardTitle.innerText = "Doors & Windows";
        }
  
        // قراءة الحالة من readings مباشرة
        const doorSensor = sensorData.door;     // 0 = مقفول, 1 = مفتوح
        const windowSensor = sensorData.window; // 0 = مقفول, 1 = مفتوح
  
        const doorStatus = doorSensor === 0 ? "close" : "Opened";
        const windowStatus = windowSensor === 0 ? "close" : "Opened";
  
        // حفظ الحالة في localStorage لتحديث الكروت الخارجية
        localStorage.setItem("door_status", doorStatus);
        localStorage.setItem("window_status", windowStatus);
  
        if (door) {
          door.innerText = doorStatus === "open" ? "Opened" : "Closed";
          door.style.color = doorStatus === "open" ? "red" : " #00ff00";
        }
  
        if (window) {
          window.innerText = windowStatus === "open" ? "Opened" : "Closed";
          window.style.color = windowStatus === "open" ? "red" : " #00ff00";
        }
  
        if (doorControl) {
          doorControl.innerHTML = `
            <h3>Door</h3>
            <button onclick="controlDoorsAndWindows('door', 'open')">Open</button>
            <button onclick="controlDoorsAndWindows('door', 'close')">Close</button>
            <button onclick="controlDoorsAndWindows('door', 'closeAll')">Close All Doors</button>
          `;
        }
  
        if (windowControl) {
          windowControl.innerHTML = `
            <h3>Window</h3>
            <button onclick="controlDoorsAndWindows('window', 'open')">Open</button>
            <button onclick="controlDoorsAndWindows('window', 'close')">Close</button>
            <button onclick="controlDoorsAndWindows('window', 'closeAll')">Close All Windows</button>
          `;
        }
  
        door.parentElement.style.display = "block";
        window.parentElement.style.display = "block";
        doorControl.style.display = "block";
        windowControl.style.display = "block";
  
        updateCardPreview(cardType, sensorData);
        window.latestSensorData = sensorData;
        break;
    
    case "security":
        if (cardTitle) {
          cardTitle.innerText = "Security";
        }
        if (fire) {
          fire.innerText = latestSensorData.fire ? "Fire Detected!" : "Safe";
        }
        if (gas) {
          gas.innerText = `${latestSensorData.gas}`;
        }
      
        if (fireControl) {
          const flameValue = parseInt(latestSensorData.flame || 4095);
          const isFireDetected = flameValue < 3000;
      
          fire.innerText = isFireDetected ? "Fire Detected!" : "Safe";
          fire.style.color = isFireDetected ? "red" : " #00ff00";
      
          fireControl.innerHTML = `
            <h3>Fire</h3>
            <button onclick="fireControl('open')">Turn On</button>
            <button onclick="fireControl('close')">Turn Off</button>
            <button onclick="fireControl('restart')">Restart</button>
          `;
        }
        if (gasControl) {
          const gasLevel = sensorData.gas;
          gas.innerText = `${gasLevel}`;
          gas.style.color = gasLevel > 400 ? "red" : " #00ff00";
          gasControl.innerHTML = `
            <h3>Gas</h3>
            <button onclick="gasControl('open')">Turn On</button>
            <button onclick="gasControl('close')">Turn Off</button> 
            <button onclick="gasControl('restart')">Restart</button>  
          `;
        }
      
        fire.parentElement.style.display = "block";
        gas.parentElement.style.display = "block";
        fireControl.style.display = "block";
        gasControl.style.display = "block";
      
        updateCardPreview(cardType, latestSensorData);
        break;
    
    case "motion":
          if (cardTitle) {
            cardTitle.innerText = "Motion Detection";
          }
        
          if (sensorData.motion) {
            window.lastMotionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
          }
        
          if (last_time) {
            last_time.innerText = window.lastMotionTime || "-";
            last_time.style.color = sensorData.motion ? "red" : " #00ff00";
          }
        
          const isMotionDetected = sensorData.motion;
        
          if (motionControl) {
            motion.innerText = isMotionDetected ? "Motion Detected" : "No Motion";
            motion.style.color = isMotionDetected ? "red" : " #00ff00";
            motionControl.innerHTML = `
                <h3>Motion</h3>
                <button onclick="motionControl('open')">Turn On</button>
                <button onclick="motionControl('close')">Turn Off</button> 
                <button onclick="motionControl('restart')">Restart</button>    
            `;
          }
        
          if (last_timeControl) {
            last_timeControl.innerHTML = `
                <h3>Last Time</h3>
                <button onclick="last_timeControl('open')">Save</button>
                <button onclick="last_timeControl('close')">Delete</button>             
                <button onclick="last_timeControl('restart')">Restart</button>     
            `;
          }
        
          // عرض الأقسام
          motion.parentElement.style.display = "block";
          last_time.parentElement.style.display = "block";
          motionControl.style.display = "block";
          last_timeControl.style.display = "block";
        
          updateCardPreview(cardType, sensorData);
          window.latestSensorData = sensorData;
          break;
    
    default:
      console.warn("Unknown card type:", cardType);
      closeCard();
      break;
  }
}

function updateCardPreview(cardType, sensorData) {
  const preview = document.querySelector(`[data-card="${cardType}"]`);
  if (!preview) return;

  switch (cardType) {
    case "temperature":
      preview.querySelector(".preview-value").innerText = `${sensorData.temperature}°C`;
      // if (sensorData.temperature > 30 && !window.acAutoSent) {
      //   const acCommand = {
      //     ac: true,
      //     ac_temperature: 24
      //   };
      //   socket.send(JSON.stringify(acCommand));
      //   window.acAutoSent = true; // علامة تمنع التكرار
      //   console.log("🔥 Temperature high! AC turned ON automatically.");
      // }
      
      // if (sensorData.temperature <= 30) {
      //   window.acAutoSent = false; // نسمح بالإرسال لو الحرارة نزلت
      // }
      break;

    case "doors":
      const doorVal = sensorData.isDoorClosed ? "Opened" : "Closed";
      const windowVal = sensorData.isWindowClosed ? "Opened" : "Closed";
    
      const doorStatusPreview = preview.querySelector("#door-status");
      const windowStatusPreview = preview.querySelector("#window-status");
    
      if (doorStatusPreview) {
        doorStatusPreview.innerText = doorVal;
        doorStatusPreview.style.color = doorVal === "Opened" ? "red" : " #00ff00";
      }
    
      if (windowStatusPreview) {
        windowStatusPreview.innerText = windowVal;
        windowStatusPreview.style.color = windowVal === "Opened" ? "red" : " #00ff00";
      }
      break;

    case "security":
      preview.querySelector(".preview-value").innerText = sensorData.fire ? "🔥" : "✅";
      break;

    case "motion":
      preview.querySelector(".preview-value").innerText = sensorData.motion ? "Detected" : "None";
      break;
  }

  if (currentCardType === cardType) {
    updateOpenCard(cardType, sensorData);
  }
}
function updateOpenCard(cardType, sensorData) {
  switch (cardType) {
    case "temperature":
      const temperature = document.getElementById("central-card-temperature");
      const humidity = document.getElementById("central-card-humidity");
      const lightingDisplay = document.getElementById("lighting-display");

      if (lightingDisplay && typeof sensorData.light !== "undefined") {
        let lightingPercentage = Math.round((sensorData.light / 4095) * 100);
        if (lightingPercentage < 0) lightingPercentage = 0;
        if (lightingPercentage > 100) lightingPercentage = 100;

        lightingDisplay.innerText = `${lightingPercentage}%`;
      }
      if (temperature) {
        temperature.innerText = ` ${sensorData.temperature}°C`;
        temperature.style.color = sensorData.temperature > 30 ? "red" : " #00ff00";
      }
      if (humidity) {
        humidity.innerText = ` ${sensorData.humidity}%`;
        humidity.style.color = sensorData.humidity > 70 ? "red" : " #00ff00";
      }
      break;

    case "doors":
        const door = document.getElementById("central-card-door");
        const windowEl = document.getElementById("central-card-window");
        const doorControl = document.getElementById("door-control");
        const windowControl = document.getElementById("window-control");
      
        if (door && typeof sensorData.isDoorClosed !== "undefined") {
          const isDoorClosed = sensorData.isDoorClosed;
          door.innerText = isDoorClosed ? "Opened" : "Closed";
          door.style.color = isDoorClosed ? "red" : "#00ff00";
        }
      
        if (windowEl && typeof sensorData.isWindowClosed !== "undefined") {
          const isWindowClosed = sensorData.isWindowClosed;
          windowEl.innerText = isWindowClosed ? "Opened" : "Closed";
          windowEl.style.color = isWindowClosed ? "red" : "#00ff00"; 
        }
      
        if (doorControl) doorControl.style.display = "block";
        if (windowControl) windowControl.style.display = "block";
        break;
    
    case "security":
      const fire = document.getElementById("central-card-fire");
      const gas = document.getElementById("central-card-gas");
      const fireControl = document.getElementById("fire-control");
      const gasControl = document.getElementById("gas-control");

      if (fire) {
        const flameValue = parseInt(sensorData.flame || 4095);
        const isFireDetected = flameValue < 3000;
        fire.innerText = isFireDetected ? "Fire Detected!" : "Safe";
        fire.style.color = isFireDetected ? "red" : " #00ff00";
      }
      if (gas) {
        gas.innerText = `${sensorData.gas}`;
        gas.style.color = sensorData.gas > 400 ? "red" : " #00ff00";
      }

      if (fireControl) fireControl.style.display = "block";
      if (gasControl) gasControl.style.display = "block";
      break;

    case "motion":
      const motion = document.getElementById("central-card-motion");
      const last_time = document.getElementById("central-card-last_time");

      if (sensorData.motion) {
        window.lastMotionTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }).toLowerCase();
      }

      if (motion) {
        motion.innerText = sensorData.motion ? "Motion Detected" : "No Motion";
        motion.style.color = sensorData.motion ? "red" : " #00ff00";
      }

      if (last_time) {
        last_time.innerText = window.lastMotionTime || "-";
        last_time.style.color = sensorData.motion ? "red" : " #00ff00";
      }
      break;

    default:
      console.warn("updateOpenCard: Unknown card type:", cardType);
      break;
  }
}
function closeCard() {
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

window.adjustLighting = (change) => {
  let lightingDisplay = document.getElementById("lighting-display");
  if (!lightingDisplay) return;

  let lightingLevel = parseInt(lightingDisplay.innerText.replace("%", ""));
  if (isNaN(lightingLevel)) {
    lightingLevel = 50; // قيمة مبدئية
    sendCommand({ light: true }); // ✅ شغّل الإضاءة تلقائيًا
  }

  lightingLevel = Math.max(0, Math.min(100, lightingLevel + change));
  lightingDisplay.innerText = `${lightingLevel}%`;

  // حفظ القيمة في localStorage
  localStorage.setItem("lighting_level", lightingLevel);

  sendCommand({ lightLevel: lightingLevel });
};

function controlLighting(action) {
  if (action === "off") {
    localStorage.setItem("lighting_level", -1);
    const lightingDisplay = document.getElementById("lighting-display");
    if (lightingDisplay) lightingDisplay.innerText = "OFF";
  } else {
    let saved = localStorage.getItem("lighting_level");
    if (!saved || saved == -1) saved = 100;
    localStorage.setItem("lighting_level", saved);
    const lightingDisplay = document.getElementById("lighting-display");
    if (lightingDisplay) lightingDisplay.innerText = `${saved}%`;
  }
  sendCommand({ light: action === "on" });
}

// function doorControl(action) {
//   if (action === "open") sendCommand({ door: "open" });
//   else if (action === "close") sendCommand({ door: "close" });
//   else if (action === "closeAll") sendCommand({ door: "closeAll" });
// }

// function windowControl(action) {
//   if (action === "open") sendCommand({ window: "open" });
//   else if (action === "close") sendCommand({ window: "close" });
//   else if (action === "closeAll") sendCommand({ window: "closeAll" });
// }

function fireControl(action) {
  sendCommand({ fire: action });
}

function gasControl(action) {
  sendCommand({ gas: action });
}

function motionControl(action) {
  sendCommand({ motion: action });
}

function last_timeControl(action) {
  sendCommand({ last_time: action });
}