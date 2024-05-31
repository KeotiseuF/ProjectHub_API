const express = require('express');
const excelRouter = express.Router();

const excel = require('../../controllers/nsm/excel');

excelRouter.post('/create', excel.createExcel);

module.exports = excelRouter;