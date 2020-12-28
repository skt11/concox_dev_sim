const { data } = require("./shared/Constants");
const socket = require('socket.io-client')(process.env.ADAPTER_URL);

let heartBeatinterval, loginInterval;
let loginAttempts = 0, heartBeatAttempts = 0

console.log("Device online, attempting connection to adapter...")

socket.on('connect', () => {
    
    console.log(`Connected to Adapter on ${process.env.ADAPTER_URL}`)
    
    // Try logging in for 3 times in 5 sec intervals,
    // clear the counters and repeat the process if device is not logged in
    loginInterval = setInterval(() => {
        
        if (loginAttempts >= 3) {
            console.log("Server Timeout, terminal rebooting...")
            clearCounters()
        }
        
        socket.emit("login", data.login)
        loginAttempts += 1
        console.log(`login attempt #${loginAttempts}`)
    }, 5000)
});


//If login response is received, stop trying to login by clearing the interval
//and start sending heartbeat packets untill acknowledgement is received
socket.on("loginResponse", (response) => {

    if (response) {
        console.log(`Successfully logged in.`)

        loginAttempts = 0
        clearInterval(loginInterval)

        // Try heart Beat for 3 times in 5 sec intervals,
        // clear the counters and repeat the process if acknowledgement not received
        heartBeatinterval = setInterval(() => {
            if (heartBeatAttempts >= 3) {
                console.log("Server Timeout, terminal rebooting...")
                clearCounters()
            }
            socket.emit("heartBeat", data.heartBeat)
            heartBeatAttempts += 1
            console.log(`login attempt #${heartBeatAttempts}`)
        }, 5000)

        //Send gps data on successful login
        socket.emit('gpsData', data.gps)
    }

})

//On heartbeat response clear the heartbeat interval
socket.on('heartBeatResponse', (response) => {  
   
    if (response) {
        console.log(`Heartbeat acknowledged.`)
        
        heartBeatAttempts = 0
        clearInterval(heartBeatinterval)
    }
})

socket.on('disconnect', () => {
    console.log("Server disconnected")
    clearCounters()
    clearInterval(loginInterval)
    clearInterval(heartBeatinterval)
})

const clearCounters = () => {
    loginAttempts = 0
    heartBeatAttempts = 0
}
