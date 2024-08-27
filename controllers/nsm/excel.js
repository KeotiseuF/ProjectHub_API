const Excel = require('exceljs');

exports.createExcel = async (req, res) => {
  const numberFormat = new Intl.NumberFormat('en-US');

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
  cryptos.forEach((crypto, id) => {
    let buyPrice = 0;
    let nbAsset = 0;
    const getValueInvest = crypto.buyPrice?.split('$')[1];

    const checkNumber = crypto.invest.split(' ').length > 2 ?
    takeOffEmptyOfNumber(crypto.invest) :
    Number(crypto.invest.split(' ')[0]);

    if(crypto.buyPrice) {
      buyPrice = Number(getValueInvest.replace(',', getValueInvest.includes(',') && getValueInvest.includes('.') ? '' : '.'));
      nbAsset = buyPrice * checkNumber;
    }

    cryptoData.push(Object.defineProperties({}, {
      idCrypto: {
        value: id+1,
        enumerable: true
      },
      nameCrypto: {
        value: crypto.name,
        enumerable: true
      },
      investCrypto: {
        value: crypto.invest,
        enumerable: true
      },
      dateCrypto: {
        value: crypto.date,
        enumerable: true
      },
      buyPriceCrypto: {
        value: numberFormat.format(buyPrice) + ' $',
        enumerable: true
      },
      assetNumberCrypto: {
        value: numberFormat.format(nbAsset),
        enumerable: true
      }
    }));
  })

  const checkStockAlone = stockData.length > 0 && cryptoData.length === 0;
  const checkCryptoAlone = stockData.length === 0 && cryptoData.length > 0;
  const checkStockCrypto = stockData.length > 0 && cryptoData.length > 0;

  const indexTitleCrypto = stockData.length + 3;
  const titleCell = ['A2', 'B2', 'C2', 'D2'];

  if(checkStockCrypto) {
    titleCell.push(
      `A${indexTitleCrypto+1}`,
      `B${indexTitleCrypto+1}`,
      `C${indexTitleCrypto+1}`,
      `D${indexTitleCrypto+1}`,
      `E${indexTitleCrypto+1}`,
      `F${indexTitleCrypto+1}`
    );
  } else if (checkCryptoAlone) {
    titleCell.push(`E2`, `F2`);
  }

  const checkValueToDisplay = checkStockCrypto ? stockData : checkStockAlone ? stockData : cryptoData;

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Feuille1');

  worksheet.columns = [
    {header: 'ID', key: `${checkStockCrypto || checkStockAlone ? 'idStock' : 'idCrypto'}`, width: 5},
    {header: 'Name', key: `${checkStockCrypto || checkStockAlone ? 'nameStock' : 'nameCrypto'}`, width: 50},
    {header: 'Invest', key: `${checkStockCrypto || checkStockAlone ? 'investStock' : 'investCrypto'}`, width: 10},
    {header: 'Date', key: `${checkStockCrypto || checkStockAlone ? 'dateStock' : 'dateCrypto'}`, width: 15},
    checkCryptoAlone && {header: 'Buy price', key:  'buyPriceCrypto', width: 15},
    checkCryptoAlone && {header: 'Asset number', key: 'assetNumberCrypto', width: 15},
  ];

  worksheet.mergeCells(`A1:${checkCryptoAlone ? 'F1' : 'D1'}`);
  if(checkStockCrypto || checkStockAlone) worksheet.addRow({idStock: 'ID', nameStock: 'NAME', investStock: 'INVEST', dateStock: 'DATE'});
  if(checkCryptoAlone) worksheet.addRow({idCrypto: 'ID', nameCrypto: 'NAME', investCrypto: 'INVEST', dateCrypto: 'DATE', buyPriceCrypto: 'BUY PRICE', assetNumberCrypto: 'ASSET NUMBER'});

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
      {header: 'Buy price', key:  'buyPriceCrypto', width: 15},
      {header: 'Asset number', key: 'assetNumberCrypto', width: 15},
    ];
    // Take off prop in excel file of side  
    worksheet.getCell('E1').value = '';
    worksheet.getCell('F1').value = '';
  }

  if(checkStockCrypto) worksheet.getCell('A1').value = 'Invest STOCK';
  if(checkStockCrypto) {
    worksheet.mergeCells(`A${indexTitleCrypto}:F${indexTitleCrypto}`);
    worksheet.getCell(`A${indexTitleCrypto}`).value = 'Invest Crypto';
    worksheet.getCell(`A${indexTitleCrypto}`).font = { size: 16, bold: true };
    worksheet.getCell(`A${indexTitleCrypto}`).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell(`A${indexTitleCrypto}`).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FF789FEC'},
    };
    worksheet.addRow({idCrypto: 'ID', nameCrypto: 'NAME', investCrypto: 'INVEST', dateCrypto: 'DATE', buyPriceCrypto: 'BUY PRICE', assetNumberCrypto: 'ASSET NUMBER'});
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

const takeOffEmptyOfNumber = (string) => {
  let number = string;
  let lengthString = number.length;
  const symbol = string.split(' ')[--lengthString];
  
  number = number.replaceAll(" ", '');
  number = number.replace(symbol, '');
  return number;
}