const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let scoreboard = {
    home: 0,
    away: 0
};

// API za posodabljanje točk preko HTTP POST (če želiš)
app.post('/update', (req, res) => {
    const { team, points } = req.body;
    if (team && typeof points === 'number') {
        scoreboard[team] = points;
        io.emit('updateScore', scoreboard);
        res.send({ success: true, scoreboard });
    } else {
        res.status(400).send({ success: false });
    }
});

io.on('connection', (socket) => {
    socket.emit('updateScore', scoreboard);
    socket.on('updateScore', (data) => {
        scoreboard = data;
        io.emit('updateScore', scoreboard);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
