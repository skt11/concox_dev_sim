const socket = require('socket.io-client')('http://localhost:3001');

let heartBeatinterval, loginInterval;
let loginAttempts = 0, heartBeatAttempts = 0

socket.on('connect', () => {
    console.log("connected")
    loginInterval = setInterval(() => {
        if (loginAttempts >= 3) {
            console.log("Server Timeout, terminal rebooting")
            clearCounters()
        }
        socket.emit("login", "logindata")
        loginAttempts += 1
        console.log(`login attempt #${loginAttempts}`)
    }, 5000)
});



socket.on("loginResponse", (response) => {

    console.log(response)
    if (true) {
        loginAttempts = 0
        clearInterval(loginInterval)

        heartBeatinterval = setInterval(() => {
            if (heartBeatAttempts >= 3) {
                console.log("Server Timeout, terminal rebooting")
                clearCounters()
            }
            socket.emit("heartBeat", "heartBeat")
            heartBeatAttempts += 1
        }, 5000)

        socket.emit('gpsData', "gps data")
    }

})

socket.on('heartBeatResponse', (data) => {
    console.log(data)
    if (true) {
        heartBeatAttempts = 0
        clearInterval(heartBeatinterval)
        if (!data) {
            socket.emit("heartBeat", "heartBeatData")
        }
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
