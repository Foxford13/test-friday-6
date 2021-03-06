'use strict';
const express = require('express');
const router = express.Router();
const { storeRequestData, requestData, processWords, getData, sortData } = require('./services');


router.post('/', async (req, res) => {
	const data = req.body;
	const { url, words, sort } = data;

	let countedWords;
	const userIp = req.connection.remoteAddress;
	// simple if statement to avoid the process in case no relevant data is sent. Will see if il have enough time to do it one the frontend
	if (!words || !url) return res.send({ message: 'Please provide words to process' });

	try {
		const pageContent = await requestData(url);
		console.log(pageContent);
		console.log(data);

		countedWords = processWords(words, pageContent);

		// usually i would sort using mongo db aggregate query for that
		if (sort) countedWords = sortData(sort, countedWords);

		// set a response here,  before 'storeRequestData', for performance
		res.send(countedWords);

		await storeRequestData(userIp, countedWords);
	} catch (err) {
		console.log(err);
	}
});


router.get('/', async (req, res) => {
	const userIp = req.connection.remoteAddress;
	let response;
	try {
		const data = await getData('sessionsData');
		response = data[userIp] ? data[userIp] : { message: 'You dont have any previosus sessions stored' };
	} catch (err) {
		console.log(err);
	}
	res.send(response);
});

module.exports = router;
