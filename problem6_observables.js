/*
    PROBLEM 6: OBSERVABLES
        A live analytics dashboard displays data about a medical operating room to doctors and nurses. It receives its data from three independent monitoring systems:
            - Temperature 
            - Air pressure 
            - Humidity
        Each system sends randomly data every 100-2000ms. TASK:
        Write an observable that, when subscribed to, emits a "display object" containing the latest value of all three systems, to be consumed by the dashboard.

        REQUIREMENTS:
            Display object should not be emitted more often than every 100ms
            Display object should only be emitted when one of the systems sends a new value
            If a value is not received from a specific system for more than 1000ms, its reading (in the display object) should be 'N/A'
            All 3 systems must emit at least one value before 1 display object is ever sent to the dashboard.
            For the purposes of this exercise, assume that the readings from each system are available as a 'data' event on a node EventEmitter. For example:
            temperature = new EventEmitter(); temperature.on('data', data => { // data = '24.2' })  

        DELIVERABLES:
            ● Implement the assignment using observer pattern
            ● Business logic should be inside an observable
            ● Share a github repo with your code
*/

// Solution
const EventEmitter = require('events');

// Observable class
class DashboardObservable {
    constructor(temperatureEmitter, pressureEmitter, humidityEmitter) {
        this.emitters = { 
            temperature: temperatureEmitter,
            pressure: pressureEmitter,
            humidity: humidityEmitter
        };
        
        // List of observers (subscribers)
        this.observers = [];
    }

    // Subscription method
    subscribe(observer) {
        this.observers.push(observer);
        
        // State states for each system
        const state = {
            values: { temperature: null, pressure: null, humidity: null }, // Latest values
            hasEmittedOnce: { temperature: false, pressure: false, humidity: false }, // Track whether a system has emitted at least once
            timeouts: { temperature: null, pressure: null, humidity: null } // Track 1000ms stale timeouts
        };

        // Throttling control variables
        let isThrottled = false;
        let updatePendingDuringThrottle = false;

        const notifyObservers = () => {
            // All 3 systems must emit at least once before sending anything
            const ready = state.hasEmittedOnce.temperature && state.hasEmittedOnce.pressure && state.hasEmittedOnce.humidity;
            if (!ready) return;

            // Build display object
            const displayObject = { ...state.values };
            this.observers.forEach(obs => {
                if (typeof obs === 'function') obs(displayObject);
                else if (obs.next) obs.next(displayObject);
            });
        };

        // Core business logic to handle incoming updates safely
        const handleSystemUpdate = (systemKey, newValue) => {
            // Only emit when a system sends a new value (or value changes to N/A)
            if (state.values[systemKey] === newValue) return;

            // Update state engine
            state.values[systemKey] = newValue;
            if (newValue !== 'N/A') {
                state.hasEmittedOnce[systemKey] = true;
            }

            // Handle 1000ms stale timeout logic
            if (state.timeouts[systemKey]) {
                clearTimeout(state.timeouts[systemKey]);
            }

            if (newValue !== 'N/A') {
                state.timeouts[systemKey] = setTimeout(() => {
                    handleSystemUpdate(systemKey, 'N/A'); // Stale value
                }, 1000);
            }

            // Throttle emissions to a maximum frequency of every 100ms
            if (isThrottled) {
                updatePendingDuringThrottle = true;
                return;
            }

            // Emit immediately if not throttled
            notifyObservers();
            isThrottled = true;

            const throttleTimer = setInterval(() => {
                if (updatePendingDuringThrottle) {
                    notifyObservers();
                    updatePendingDuringThrottle = false;
                } else {
                    clearInterval(throttleTimer);
                    isThrottled = false;
                }
            }, 100);
        };

        // Wire up Node EventEmitters to our internal system handler
        Object.keys(this.emitters).forEach(systemKey => {
            const listener = (data) => handleSystemUpdate(systemKey, data);
            this.emitters[systemKey].on('data', listener);
        });

        // Return an unsubscribe function to prevent memory leaks
        return {
            unsubscribe: () => {
                this.observers = this.observers.filter(obs => obs !== observer);
                Object.keys(this.emitters).forEach(systemKey => {
                    if (state.timeouts[systemKey]) clearTimeout(state.timeouts[systemKey]);
                });
            }
        };
    }
}

// Test

const temperature = new EventEmitter();
const airPressure = new EventEmitter();
const humidity = new EventEmitter();

// Create our observable
const dashboardPipeline = new DashboardObservable(temperature, airPressure, humidity);

// Subscribe our analytics dashboard component
const subscription = dashboardPipeline.subscribe((displayObject) => {
    console.log(`DISPLAY - ${new Date().toISOString().slice(11, 23)}]:`, displayObject);
});

// Mock sensor data
function mockSensor(emitter, name, minVal, maxVal) {
    const emit = () => {
        const value = (Math.random() * (maxVal - minVal) + minVal).toFixed(1);
        emitter.emit('data', value);
        
        // Random interval between 100ms and 2000ms
        const nextTick = Math.floor(Math.random() * (2000 - 100 + 1)) + 100;
        setTimeout(emit, nextTick);
    };
    emit();
}

// Start simulation
console.log("Starting Simulation.\n");
mockSensor(temperature, 'Temperature', 20, 25);
mockSensor(airPressure, 'Air Pressure', 980, 1020);
mockSensor(humidity, 'Humidity', 30, 60);

// Stop simulation
setTimeout(() => {
    console.log("\nStopping Simulation.");
    subscription.unsubscribe();
    process.exit(0);
}, 10000);
