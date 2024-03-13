const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const { DbConnect } = require('./connection');
const User = require('./model/user');
const path = require("path");
const http = require('http');
const app = express();
const server = http.createServer(app);
const PORT = 3000;
const url = 'mongodb+srv://Mobzway:xzmcbG3xlM2u6KeY@webservice.iee4s4a.mongodb.net/';
DbConnect(url);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.resolve("./public")));
let loginId = {};
let socketID;
//socket
const io = require('socket.io')(server);
let signedInUsers = {
    firstName: '',
    userDetail:'',
};
let UserInRoom = {};
let loginFirstName;
let sendUserDetails;

async function UserName(id) {
    for (let key in UserInRoom) {
        if (key === id) {
            console.log("Starting Key Found:", key);
            let currentUser = UserInRoom[key].firstName;
            console.log("Current User:", currentUser);
            loginFirstName = currentUser;
            break;
        }
    }
}
async function UserDetail(name) {
   
    let socket;
    for (const socketID in UserInRoom) {
        if (UserInRoom.hasOwnProperty(socketID)) {
            const user = UserInRoom[socketID];
            if (user.firstName === name) {
                socket= socketID;
                break;
            }
        }
    }

    for (let key in UserInRoom) {
        if (key === socket) {
            console.log("Starting Key Found:", key);
            currentUser = UserInRoom[key].userDetail;
            console.log("Current User:", currentUser);
            sendUserDetails = currentUser;
            break;
        }
    }

}
io.on('connection', async (socket) => {
    console.log("Data",signedInUsers)
    socketID = socket.id;
    signedInUsers.socketID = socket.id;
    if (!(UserInRoom.hasOwnProperty(socket.id))) {
        UserInRoom[`${socket.id}`] = signedInUsers;
    }
    // UserInRoom[`${socket.id}`] = signedInUsers;
    console.log("user Room ", UserInRoom)
    console.log('User connected', socketID);
    signedInUsers={};
    let name = await UserName(socket.id);
    socket.emit('socketConnected', `${loginFirstName}`);

    io.emit("Welcome", `${loginFirstName}`);

    socket.on('chat message', (msg) => {
        console.log('Message: ' + msg);
        UserName(socket.id);
        io.emit('chat message', { msg: msg, from: loginFirstName });
    });
    socket.on('UserDetails',async (msg) => {
        console.log('user clicked: ' + msg);
        await UserDetail(msg);
        console.log("userDeail",sendUserDetails)
        socket.emit('UserDetails', sendUserDetails);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        delete UserInRoom[`${socket.id}`];
        console.log(UserInRoom)
    });
});
// Serve the chat room HTML page
app.get('/chatroom', (req, res) => {
    // console.log("hyy")
    res.redirect('/chatroom.html');
});

//All Users
app.get('/api/user', async (req, res) => {
    try {
        const users = await User.find();

        let htmlResponse = '<html><head><title>User Data</title></head><body><h1>User Data</h1><table border="1"><thead><tr><th>Login ID</th><th>Name</th><th>Email</th><th>Mobile Number</th><th>Address</th></tr></thead><tbody>';

        users.forEach(user => {
            htmlResponse += `<tr><td>${user.loginId}</td><td>${user.firstName} ${user.lastName}</td><td>${user.emailId}</td><td>${user.mobileNumber}</td><td>${user.street} ${user.city} ${user.state}, ${user.country}</td></tr>`
        });

        htmlResponse += '</tbody></table></body></html>';

        res.send(htmlResponse);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Sign-up endpoint
app.post('/api/user', async (req, res) => {
    try {
        const { firstName, lastName, mobileNumber, emailId, street, city, state, country, loginId, password } = req.body;
        const newUser = new User({ firstName, lastName, mobileNumber, emailId, street, city, state, country, loginId, password });
        await newUser.save();
        console.log("Record Created Successfully");
        res.status(201).send("Created")
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Sign-in endpoint
app.post('/api/signin', async (req, res) => {
    try {
        // const { loginId, password } = req.body;
        const user = await User.findOne({ loginId: req.body.username, password: req.body.password });
        console.log(user)
        if (!user) {
            return res.status(401).send('Invalid login credentials');
        }
        res.status(200).send('Login successful');
        loginId = req.body.username;

        // io.to(socket.id).emit('userSignedIn', { user, socketId: socket.id });
        // signedInUsers[req.socket.id] = { user :user, socketId: req.socket.id };
        // console.log(user, " ", req.socket.id)
        console.log("signapi id", socketID)
        signedInUsers.firstName = user.firstName;
        signedInUsers.userDetail = user;
        // io.emit('signedInUsers', Object.values(signedInUsers));
    } catch (error) {
        console.error('Error signing in:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});