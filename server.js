const express = require('express');
const multer = require('multer');
const path = require('path');
const {PDFParse} = require('pdf-parse');
const fs = require('fs/promises');
const ical = require('node-ical');
const Briefing = require('./generateBriefing');



const app = express();
const port = 3000;
const course_dates = new Map();
const date_courses = new Map();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
const upload = multer({dest: 'uploads/'});


app.post('/timetable', async (req, res) => {
    const url = req.body.iURL;
    if(!url){
        return res.status(400).json({status: 'error', message: 'URL is required'})
    }
    try{
        const events = await ical.async.fromURL(url);
        for (const event of Object.values(events)) {
            if(event.type == 'VEVENT'){
                if(course_dates.has(event.summary)){
                course_dates.get(event.summary).push(event.start.toISOString())
                }
                else{
                course_dates.set(event.summary, [event.start.toISOString()])
                }
                const dateOnly = event.start.toISOString().split('T')[0];
                const timeOnly = event.start.toISOString().split('T')[1].slice(0, 5); // "09:00"
                if(date_courses.has(dateOnly)){
                date_courses.get(dateOnly).push({ course: event.summary, time: timeOnly });
                }
                else{
                date_courses.set(dateOnly, [{ course: event.summary, time: timeOnly }]);
                }
        
            }
            for(const course of course_dates.keys()){
                course_dates.get(course).sort();
            }
    
        };
        res.json({          
            status:'success',
            eventsByDate: Object.fromEntries(date_courses)
        });


    }
    catch(err){
        console.error('Error fetching or parsing iCal:', err);
        res.status(500).json({status: 'error', message: 'Failed to fetch or parse iCal URL.'});
    }
    

   
    
})
app.get('/lectures-for-date', (req, res) => {
    const dateRequired = req.query.date;
    /*For a GET request, data travels in the URL itself as query parameters, appended after a ?, 
    like /lectures-for-date?date=2026-05-04. 
    Express automatically parses everything after the ? into req.query, 
    as an object — so req.query.date pulls out the value of the date parameter specifically. 
    This is the GET equivalent of what req.body is for POST.*/
    if(date_courses.has(dateRequired)){
        res.json(date_courses.get(dateRequired));
    }
    else{
        res.json([]);
    }
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