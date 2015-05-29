
var variables = {
  "OCR_LANGUAGE": "deu",
  "OCR_DEBUG": 0,
  "OCR_DEBUG_TIMEOUT": 15000,
  "OCR_NITERS": 30,
  "OCR_RELATIVEAREAMINIMUM": 0.01,
  "OCR_RELATIVEAREAMAXIMUM": 0.1,
  "OCR_CANNY_THRESH_LOW": 150,
  "OCR_CANNY_THRESH_HIGH": 255,
  "OCR_IMAGE_HIGH_SCALE": 0.6,
  "OCR_ADDRESS_BLOCK_RATIO": 0.3,
  "OCR_CODE_BLOCK_RATIO": 0.4,
  "OCR_MIN_TEXTBLOCK_SIZE": 100,
  "OCR_OVERDRAW_BARCODES": 1,
  "OCR_IGNORE_STRING": "IIII:llll:mmm:nuvgn:vwvw:ii:oo:uu:aa:Telefon:0361-43"
}

// read env
for(var name in variables){
  if (variables.hasOwnProperty(name)){
    if (typeof process.env[name]!=='undefined'){
      variables[name] = process.env[name];
    }
  }
}

exports.variables = variables;
