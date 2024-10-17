document.addEventListener('DOMContentLoaded', function() {
    let devices = JSON.parse(localStorage.getItem('devices')) || [];

    function renderDevices() {
        const deviceList = document.getElementById('deviceList');
        const devicesContainer = document.getElementById('devices');
        const graph = document.getElementById('graph');
        deviceList.innerHTML = '';

        if (devices.length === 0) {
            devicesContainer.style.display = 'none';
            graph.style.display = 'none';
        } else {
            devicesContainer.style.display = 'block';
            graph.style.display = 'block';
    
            devices.forEach((device, index) => {
                const li = document.createElement('li');
                const cost = calculateCost(device).toFixed(2)
                li.textContent = `${device.name}: ${device.consumption} KW|${device.usageTime} hours|${cost}₪`;
                li.dataset.index = index; // שמירת אינדקס כנתון מותאם אישית באלמנט ה-li
                li.addEventListener('click', function() {
                    removeDevice(index); // כשנלחץ, נקרא לפונקציה למחיקת המכשיר
                });
                deviceList.appendChild(li);
            });
        }
    } // סגירת הפונקציה renderDevices במקום הנכון

    function removeDevice(index) {
        devices.splice(index, 1);
        localStorage.setItem('devices', JSON.stringify(devices));
        renderDevices();
        totalConsumption();
        renderChart();
        totalCost()
    }

    function totalConsumption() {
        const total = devices.reduce((sum, device) => sum + device.consumption, 0);
        document.getElementById("totalConsumption").textContent = ` ${total}KW`;
    }

    let chart; // משתנה גלובלי לאחסון הגרף

    function renderChart() {
        const ctx = document.getElementById('energyChart').getContext('2d');

        // אם כבר יש גרף, נעדכן אותו במקום ליצור חדש
        if (chart) {
            chart.data.datasets[0].data = devices.map(device => device.consumption);
            chart.data.labels = devices.map(device => device.name);
            chart.update(); // עדכון הגרף
        } else {
            chart = new Chart(ctx, {
                type: 'pie', // סוג הגרף (עוגה במקרה זה)
                data: {
                    labels: devices.map(device => device.name), // שמות המכשירים
                    datasets: [{
                        label: 'צריכת אנרגיה (וואט)',
                        data: devices.map(device => device.consumption), // צריכת האנרגיה של כל מכשיר
                        backgroundColor: ['#2c7e82', '#49abb0', '66ced3', '#0c2923', '#00ffcc', '#7ea39c'], // צבעים שונים לפריטים
                    }]
                },
                options: {
                    responsive: true,
                }
            });
        }
    }

    function calculateCost(device) {
        const pricePerKWH = 0.5252;
        const usageTime = device.usageTime;
        const consumptionKWH = device.consumption;
        return consumptionKWH * usageTime *pricePerKWH;
    }

    function totalCost() {
        const total = devices.reduce((sum, device) => sum + calculateCost(device), 0);
        document.getElementById("totalCost").textContent = `${total.toFixed(2)}₪`
    }

    document.getElementById('deviceForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const deviceName = document.getElementById('deviceName').value;
        const energyConsumption = document.getElementById('energyConsumption').value;
        const usageTime = document.getElementById('usageTime').value;
        devices.push({ name: deviceName, consumption: parseInt(energyConsumption), usageTime: parseInt(usageTime)});
        localStorage.setItem('devices', JSON.stringify(devices));
        renderDevices();
        totalConsumption();
        renderChart();
        totalCost()
        this.reset(); // לנקות את הטופס
    });

    renderDevices(); // הצג את המכשירים הקיימים
    totalConsumption();
    renderChart();
    totalCost()
});
