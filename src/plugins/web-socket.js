export default function CustomWebSocket() {
    let socket = "ws://127.0.0.1:8000/ws/"

    console.log("Starting connetction");
    let connection = new WebSocket(socket);
    connection.onopen = function() {
        console.log("Success connection");
    }
    connection.onmessage = function(event) {
        console.log(event);
    }
    connection.onerror = function(event) {
        console.log(event);
        console.log("Error");
    }
}