
function openCard(cardType) {
    document.getElementById('overlay').style.display = 'flex';
    
    const cardTitle = document.getElementById('central-card-title');
    const temperature = document.getElementById('central-card-temperature');
    const humidity = document.getElementById('central-card-humidity');
    const door = document.getElementById('central-card-door');
    const window = document.getElementById('central-card-window');
    const fire = document.getElementById('central-card-fire');
    const rain = document.getElementById('central-card-rain');
    const gas = document.getElementById('central-card-gas');
    const motion = document.getElementById('central-card-motion');
    const last_time = document.getElementById('central-card-last_time');
    const lightingControl = document.getElementById('lighting-control');
    const acControl = document.getElementById('ac-control');
    const centralDisplay = document.getElementById('central-display');
    const doorControl = document.getElementById('door-control');
    const windowControl = document.getElementById('window-control');
    const fireControl = document.getElementById('fire-control');
    const rainControl = document.getElementById('rain-control');
    const gasControl = document.getElementById('gas-control');
    const motionControl = document.getElementById('motion-control');
    const last_timeControl = document.getElementById('last_time-control');

    if (cardTitle) cardTitle.innerText = '';
    if (temperature) temperature.innerText = '';
    if (humidity) humidity.innerText = '';
    if (door) door.innerText = '';
    if (window) window.innerText = '';
    if (fire) fire.innerText = '';
    if (rain) rain.innerText = '';
    if (gas) gas.innerText = '';
    if (motion) motion.innerText = '';
    if (last_time) last_time.innerText = '';
    if (lightingControl) lightingControl.innerHTML = '';
    if (acControl) acControl.innerHTML = '';
    if (centralDisplay) centralDisplay.innerHTML = '';
    if (doorControl) doorControl.innerHTML = '';
    if (windowControl) windowControl.innerHTML = '';
    if (fireControl) fireControl.innerHTML = '';
    if (rainControl) rainControl.innerHTML = '';
    if (gasControl) gasControl.innerHTML = '';
    if (motionControl) motionControl.innerHTML = '';
    if (last_timeControl) last_timeControl.innerHTML = '';

    
    const infoBoxes = document.querySelectorAll('.info-box');
    infoBoxes.forEach(box => box.style.display = 'none');
    
    lightingControl.style.display = 'none';
    acControl.style.display = 'none';
    doorControl.style.display = 'none';
    windowControl.style.display = 'none';
    fireControl.style.display = 'none';
    rainControl.style.display = 'none';
    gasControl.style.display = 'none';
    motionControl.style.display = 'none';
    last_timeControl.style.display = 'none';

    switch (cardType) {
        case 'temperature':
            if (cardTitle) cardTitle.innerText = 'Temperature & Lighting';
            if (temperature) temperature.innerText = 'Temperature: 24°C';
            if (humidity) humidity.innerText = 'Humidity Level: 60%';


            if (lightingControl) {
                const temperatureLevel = 24; 
                temperature.innerText = ` ${temperatureLevel}`;
                temperature.style.color = temperatureLevel > 30 ? 'red' : 'green';
                lightingControl.innerHTML = `
                    <h3>Lighting</h3>
                    <button onclick="controlDevice('on')">Turn On</button>
                    <button onclick="controlDevice('off')">Turn Off</button>
                    <div class="control-box">
                        <button class="control-button" onclick="adjustLighting(-10)">-</button>
                        <div class="display-screen" id="lighting-display">50%</div>
                        <button class="control-button" onclick="adjustLighting(10)">+</button>
                    </div>
                `;
            }

            if (acControl) {
                const humidityLevel = 60; 
                humidity.innerText = ` ${humidityLevel}`;
                humidity.style.color = humidityLevel > 70 ? 'red' : 'green';
                acControl.innerHTML = `
                    <h3>Air Conditioners</h3>
                    <button onclick="controlAC('cool')">Cool Mode</button>
                    <button onclick="controlAC('off')">Turn Off</button>
                    <div class="control-box">
                        <button class="control-button" onclick="adjustTemperature(-1)">-</button>
                        <div class="display-screen" id="ac-display">24°C</div>
                        <button class="control-button" onclick="adjustTemperature(1)">+</button>
                    </div>
                `;
            }
            temperature.parentElement.style.display = 'block';
            humidity.parentElement.style.display = 'block';
            lightingControl.style.display = 'block';
            acControl.style.display = 'block';
            break;
;

        case 'doors':
            if (cardTitle) cardTitle.innerText = 'Doors & Windows';
            if (door) door.innerText = 'Front Door: 🔒 Locked';
            if (window) window.innerText = 'Windows: 📏 Active';

            if (doorControl) {
                const isDoorClosed = false;
                door.innerText = isDoorClosed ? 'Door Status!' : 'Closed';
                door.style.color = isDoorClosed ? 'red' : 'green';
                doorControl.innerHTML = `
                    <h3>Door</h3>
                    <button onclick="doorControl('open')">Open</button>
                    <button onclick="doorControl('close')">Close</button>
                    <button onclick="doorControl('closeAll')">Close All Doors</button>
                `;
            }

            if (windowControl) {
                const isWindowClosed = false; 
                window.innerText = isWindowClosed ? 'Door Status!' : 'Closed';
                window.style.color = isWindowClosed ? 'red' : 'green';
                windowControl.innerHTML = `
                    <h3>Window</h3>
                    <button onclick="windowControl('open')">Open</button>
                    <button onclick="windowControl('close')">Close</button>
                    <button onclick="windowControl('closeAll')">Close All Windows</button>
                `;
            }
            door.parentElement.style.display = 'block';
            window.parentElement.style.display = 'block';
            doorControl.style.display = 'block';
            windowControl.style.display = 'block';
            break;

        case 'security':
            if (cardTitle) cardTitle.innerText = 'security';
            if (fire) fire.innerText = 'Safe';
            if (rain) rain.innerText = 'Normal';
            if (gas) gas.innerText = 'Safe';


            if (fireControl) {
                const isFireDetected = false;
                fire.innerText = isFireDetected ? 'Fire Detected! 🔥' : 'No Fire';
                fire.style.color = isFireDetected ? 'red' : 'green';
                fireControl.innerHTML = `
                <h3>Fire</h3>
                <button onclick="fireControl('open')">Turn On</button>
                <button onclick="fireControl('close')">Turn Off</button>
                <button onclick="fireControl('restart')">Restart</button>
                `;
            }

            if (rainControl) {
                const isRaining = false; 
                rain.innerText = isRaining ? 'Rain Detected 🌧️' : 'No Rain';
                rain.style.color = isRaining ? 'blue' : 'green';
                rainControl.innerHTML = `
                <h3>Rain</h3>
                <button onclick="rainControl('open')">Turn On</button>
                <button onclick="rainControl('close')">Turn Off</button> 
                <button onclick="rainControl('restart')">Restart</button>  
                `;
            }

            if (gasControl) {
                const gasLevel = 300; 
                gas.innerText = ` ${gasLevel}`;
                gas.style.color = gasLevel > 400 ? 'red' : 'green';
                gasControl.innerHTML = `
                <h3>Gas</h3>
                <button onclick="gasControl('open')">Turn On</button>
                <button onclick="gasControl('close')">Turn Off</button> 
                <button onclick="gasControl('restart')">Restart</button>  
                `;
            }
            fire.parentElement.style.display = 'block';
            rain.parentElement.style.display = 'block';
            gas.parentElement.style.display = 'block';
            fireControl.style.display = 'block';
            rainControl.style.display = 'block';
            gasControl.style.display = 'block';

            break;

        case 'motion':
            if (cardTitle) cardTitle.innerText = 'Motion Detection';
            if (last_time) last_time.innerText = '10:32 PM';
            const isMotionDetected = true; 
            
            if (motionControl) {
                motion.innerText = isMotionDetected 
                motion.style.color = isMotionDetected ? 'orange' : 'green';
                motionControl.innerHTML = `
                <h3>Motion</h3>
                <button onclick="motionControl('open')">Turn On</button>
                <button onclick="motionControl('close')">Turn Off</button> 
                <button onclick="motionControl('restart')">Restart</button>    
                `;
            }

            if (last_timeControl) {
                last_time.style.color = isMotionDetected ? 'orange' : 'green';
                last_timeControl.innerHTML = `
                <h3>Last Time</h3>
                <button onclick="last_timeControl('open')">Save</button>
                <button onclick="last_timeControl('close')">Delete</button>             
                <button onclick="last_timeControl('restart')">Restart</button>     
                `;
            }
            motion.parentElement.style.display = 'block';
            last_time.parentElement.style.display = 'block';
            motionControl.style.display = 'block';
            last_timeControl.style.display = 'block';
            break;

        default:
            console.warn('Unknown card type:', cardType);
            closeCard();
            break;
    }
}

function closeCard() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

window.adjustLighting = (change) => {
    let lightingDisplay = document.getElementById('lighting-display');
    if (lightingDisplay) {
        let lightingLevel = parseInt(lightingDisplay.innerText);
        lightingLevel = Math.max(0, Math.min(100, lightingLevel + change));
        lightingDisplay.innerText = `${lightingLevel}%`;
    }
};

window.adjustTemperature = (change) => {
    let acDisplay = document.getElementById('ac-display');
    if (acDisplay) {
        let acTemperature = parseInt(acDisplay.innerText);
        acTemperature = Math.max(16, Math.min(30, acTemperature + change));
        acDisplay.innerText = `${acTemperature}°C`;
    }
};

window.controlDevice = (status) => {
    alert(`Lighting turned ${status}`);
};

window.controlAC = (status) => {
    alert(`Air Conditioner set to ${status}`);
};

window.doorControl = () => {
    alert('Door control action executed.');
};

window.windowControl = () => {
    alert('Window control action executed.');
};

window.fireControl = () => {
    alert('fire control is executed.');
};

window.rainControl = () => {
    alert('rain control action executed.');
};

window.gasControl = () => {
    alert('gas control action executed.');
};

window.motionControl = () => {
    alert('Motion control action executed.');
};

window.last_timeControl = () => {
    alert('Last motion control action executed.');
};
