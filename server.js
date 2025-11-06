// Import Express
const express = require('express');
const token = require('./token.js');
const app = express();
const PORT = 3000; // You can change the port

// Middleware to parse JSON
app.use(express.json());

// token.generateToken(1);


async function aa() {
    await token.generateQRCode("123456789");
    await token.verifyToken("123456789", "985189");

    setInterval(async () => {
    const otp = await token.generateToken("123456789");
     await token.verifyToken("123456789", "229255");
    console.log("Current OTP:", otp);
}, 3000);  // every 30 seconds

}

aa();




// Routes
app.get('/', (req, res) => {
    res.send('Hello World from Node.js server!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
