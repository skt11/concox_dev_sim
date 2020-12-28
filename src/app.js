const { data } = require("./shared/Constants");
const socket = require('socket.io-client')(process.env.ADAPTER_URL);

let heartBeatinterval, loginInterval;
let loginAttempts = 0, heartBeatAttempts = 0

console.log("Device online, attempting connection to adapter...")

socket.on('connect', () => {
    
    console.log(`Connected to Adapter on ${process.env.ADAPTER_URL}`)
    
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



socket.on("loginResponse", (response) => {

    if (response) {
        console.log(`Successfully logged in.`)

        loginAttempts = 0
        clearInterval(loginInterval)

        heartBeatinterval = setInterval(() => {
            if (heartBeatAttempts >= 3) {
                console.log("Server Timeout, terminal rebooting...")
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
