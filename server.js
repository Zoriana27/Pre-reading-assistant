const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

const upload = multer({dest: 'uploads/'});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});//__dirname just means "the folder this script is in."

app.post('/upload', upload.single('lectureSlides'), (req, res) =>{
    console.log('File received succesfully');
    console.log(req.file);
    res.send('File uploaded successfully');
})
app.listen(port, () => {
    console.log('Server running at http://localhost:${port}');

})