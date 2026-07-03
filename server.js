const express = require('express');
const multer = require('multer');
const path = require('path');
const {PDFParse} = require('pdf-parse');
const fs = require('fs/promises');


const app = express();
const port = 3000;

const upload = multer({dest: 'uploads/'});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});//__dirname just means "the folder this script is in."

app.post('/upload', upload.single('lectureSlides'), async (req, res) =>{
    console.log('File received succesfully');
    console.log(req.file);
    const t = await parsePdf(req.file.path);
    console.log(t);
    res.send('File uploaded and parsed successfully');
    
})

async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}
app.listen(port, () => {
    console.log('Server running at http://localhost:${port}');

})