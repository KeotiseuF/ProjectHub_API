const Excel = require('exceljs');

exports.createExcel = async (req, res) => {
  const stocks = await req.body.data.stocks || [];
  const cryptos = await req.body.data.cryptos || [];
  const stockData = [];
  const cryptoData = [];

  // Redifine properties stock object
  stocks.forEach((stock, id) => {
    stockData.push(Object.defineProperties({}, {
      idStock: {
        value: id+1,
        enumerable: true
      },
      nameStock: {
        value: stock.name,
        enumerable: true
      },
      investStock: {
        value: stock.invest,
        enumerable: true
      },
      dateStock: {
        value: stock.date,
        enumerable: true
      }
    }));
  })

  // Redifine properties crypto object
  cryptos.forEach((stock, id) => {
    cryptoData.push(Object.defineProperties({}, {
      idCrypto: {
        value: id+1,
        enumerable: true
      },
      nameCrypto: {
        value: stock.name,
        enumerable: true
      },
      investCrypto: {
        value: stock.invest,
        enumerable: true
      },
      dateCrypto: {
        value: stock.date,
        enumerable: true
      }
    }));
  })

  const checkStockAlone = stockData.length > 0 && cryptoData.length === 0;
  const checkCryptoAlone = stockData.length === 0 && cryptoData.length > 0;
  const checkStockCrypto = stockData.length > 0 && cryptoData.length > 0;

  const indexTitleCrypto = stockData.length + 3;
  const titleCell = checkStockCrypto ?
    ['A2', 'B2', 'C2', 'D2', `A${indexTitleCrypto+1}`, `B${indexTitleCrypto+1}`, `C${indexTitleCrypto+1}`, `D${indexTitleCrypto+1}`] :
    ['A2', 'B2', 'C2', 'D2'];

  const checkValueToDisplay = checkStockCrypto ? stockData : checkStockAlone ? stockData : cryptoData;

  const date = new Date();
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Feuille1');

  worksheet.columns = [
    {header: 'ID', key: `${checkStockCrypto || checkStockAlone ? 'idStock' : 'idCrypto'}`, width: 5},
    {header: 'Name', key: `${checkStockCrypto || checkStockAlone ? 'nameStock' : 'nameCrypto'}`, width: 50},
    {header: 'Invest', key: `${checkStockCrypto || checkStockAlone ? 'investStock' : 'investCrypto'}`, width: 10},
    {header: 'Date', key: `${checkStockCrypto || checkStockAlone ? 'dateStock' : 'dateCrypto'}`, width: 15},
  ];

  worksheet.mergeCells('A1:D1');
  if(checkStockCrypto || checkStockAlone) worksheet.addRow({idStock: 'ID', nameStock: 'NAME', investStock: 'INVEST', dateStock: 'DATE'});
  if(checkCryptoAlone) worksheet.addRow({idCrypto: 'ID', nameCrypto: 'NAME', investCrypto: 'INVEST', dateCrypto: 'DATE'});
  
  if(checkStockAlone) worksheet.getCell('A1').value = 'Invest STOCK';
  if(checkCryptoAlone) worksheet.getCell('A1').value = 'Invest Crypto';
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getCell('A1').fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'FF789FEC'},
  };

  checkValueToDisplay.forEach(item => {
    worksheet.addRow(item);
  });

  if(checkStockCrypto) {
    worksheet.columns = [
      {header: 'ID', key: 'idCrypto', width: 5},
      {header: 'Name', key: 'nameCrypto', width: 50},
      {header: 'Invest', key: 'investCrypto', width: 10},
      {header: 'Date', key: 'dateCrypto', width: 15},
    ];
  }

  if(checkStockCrypto) worksheet.getCell('A1').value = 'Invest STOCK';
  if(checkStockCrypto) {
    worksheet.mergeCells(`A${indexTitleCrypto}:D${indexTitleCrypto}`);
    worksheet.getCell(`A${indexTitleCrypto}`).value = 'Invest Crypto';
    worksheet.getCell(`A${indexTitleCrypto}`).font = { size: 16, bold: true };
    worksheet.getCell(`A${indexTitleCrypto}`).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell(`A${indexTitleCrypto}`).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FF789FEC'},
    };
    worksheet.addRow({idCrypto: 'ID', nameCrypto: 'NAME', investCrypto: 'INVEST', dateCrypto: 'DATE'});
    cryptoData.forEach(item => {
      worksheet.addRow(item);
    });
  }

  titleCell.forEach( (cell) => {
    const indexColumn = cell.charAt(0);
    const column = worksheet.getColumn(indexColumn);
    
    worksheet.getCell(cell).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FFB4C0EB'},
    };
    worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };

    if(indexColumn !== ('B')) {
      column.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      })
    }
  })

  const buffer = await workbook.xlsx.writeBuffer();

  res.send(buffer);
};