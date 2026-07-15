const express = require('express');
const multer = require('multer');
const path = require('path');
const {PDFParse} = require('pdf-parse');
const fs = require('fs/promises');
const ical = require('node-ical');
const Briefing = require('./generateBriefing');



const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }))
const upload = multer({dest: 'uploads/'});


app.post('/timetable', async (req, res) => {
    const url = req.body.iURL;
    const events = await ical.async.fromURL(url);
    const lectures = new Map();
    for (const event of Object.values(events)) {
        if(event.type == 'VEVENT'){
            if(lectures.has(event.summary)){
            lectures.get(event.summary).push(event.start.toISOString())
            }
            else{
            lectures.set(event.summary, [event.start.toISOString()])
            }
        
        }
    
    };

    for(const course of lectures.keys()){
        lectures.get(course).sort();
    }
    res.send('Timetable processed successfully');

})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});//__dirname just means "the folder this script is in."
app.get('/timetable-upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'index2.html'))
})
app.post('/upload', upload.single('lectureSlides'), async (req, res) =>{
    console.log('File received succesfully');
    console.log(req.file);
    const t = await parsePdf(req.file.path);
    const geminiResponse = await Briefing(t);
    
    res.send(geminiResponse);
    
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