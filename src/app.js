const { data } = require("./shared/Constants");
const socket = require('socket.io-client')('http://localhost:3001');

let heartBeatinterval, loginInterval;
let loginAttempts = 0, heartBeatAttempts = 0

socket.on('connect', () => {
    
    console.log("Connected to Adapter")
    
    loginInterval = setInterval(() => {
        
        if (loginAttempts >= 3) {
            console.log("Server Timeout, terminal rebooting")
            clearCounters()
        }
        
        socket.emit("login", data.login)
        loginAttempts += 1
        console.log(`login attempt #${loginAttempts}`)
    }, 5000)
});



socket.on("loginResponse", (response) => {

    if (response) {
        console.log(`Successfully logged in. Response:${response}`)

        loginAttempts = 0
        clearInterval(loginInterval)

        heartBeatinterval = setInterval(() => {
            if (heartBeatAttempts >= 3) {
                console.log("Server Timeout, terminal rebooting")
                clearCounters()
            }
            socket.emit("heartBeat", data.heartBeat)
            heartBeatAttempts += 1
        }, 5000)

        socket.emit('gpsData', data.gps)
    }

})

socket.on('heartBeatResponse', (response) => {
    
    if (response) {
        console.log(`Heartbeat acknowledged. Response:${response}`)
        
        heartBeatAttempts = 0
        clearInterval(heartBeatinterval)

    } else {       
        socket.emit("heartBeat", data.heartBeat)
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
