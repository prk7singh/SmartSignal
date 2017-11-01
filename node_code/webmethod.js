var express = require("express");
// spawn_python.js
var util = require("util");

var spawn = require("child_process").spawn;
var cors = require('cors')
const fileUpload = require('express-fileupload');
const csv = require('csvtojson')
var app = express()
app.use(cors());
app.use(fileUpload());
app.post('/upload', function (req, res) {
	if (!req.files)
		return res.status(400).send('No files were uploaded.');

	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let sampleFile = req.files.file;

	// Use the mv() method to place the file somewhere on your server
	sampleFile.mv(__dirname + "/" + sampleFile.name, function (err) {
		if (err)
			return res.status(500).send(err);

		// res.send('File uploaded!');
		callcsvfile(res, __dirname + "\\" + sampleFile.name);
	});
});
function callcsvfile(res, path) {
	//res.send('File uploaded!');
	let py = spawn('python', ['compute_input_file.py']),
		data = path,
		dataString = '';
	py.stdout.on('data', function (data) {
		dataString += data.toString();
		//console.log(dataString, data);
	});
	py.stdout.on('end', function () {
		//s.send('Sum of numbers python=' + dataString);
		var jsonarr=[];
		//path="D:/mantu/node_py/train.csv";//dataString.replace("\n","");
		path=dataString.replace(/\s+/g, '');
		//console.log(path,path2,path==path2);
		csv()
		.fromFile(path)
		.on('json', (jsonObj) => {
			jsonarr.push(jsonObj)
		})
		.on('done', (error) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(jsonarr));
		})

	});
	py.stdin.write(JSON.stringify(data));
	py.stdin.end();
}
app.get("/timernew", function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	let resp={horizontal:7,vertical:13};
	res.send(JSON.stringify(resp));
});
/* serves main page */
app.get("/", function (req, res) {
	let py = spawn('python', ['compute_input.py']),
		data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		dataString = '';
	py.stdout.on('data', function (data) {
		dataString += data.toString();
		console.log(dataString, data);
	});
	py.stdout.on('end', function () {
		res.send('Sum of numbers python=' + dataString);
	});
	py.stdin.write(JSON.stringify(data));
	py.stdin.end();
});

app.post("/user/add", function (req, res) {
	var py = spawn('python', ['compute_input.py']),
		data = [1, 2, 3, 4, 5, 6, 7, 8, 9],
		dataString = '';
	py.stdout.on('data', function (data) {
		dataString += data.toString();
		console.log(dataString, data);
	});
	py.stdout.on('end', function () {
		res.send('Sum of numbers from python=' + dataString);
	});
	py.stdin.write(JSON.stringify(data));
	py.stdin.end();
});

/* serves all the static files */
app.get(/^(.+)$/, function (req, res) {
	console.log('static file request : ' + req.params);
	res.sendfile(__dirname + req.params[0]);
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
	console.log("Listening on " + port);
});