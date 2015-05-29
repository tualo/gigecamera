## Regonizeletter Command Line Tool

This commandline tool that reads an image, and searches for address boxes and barcodes. If found the results be output as JSON.

# Usage

    regonizeletter --filename myimage.tiff

# Options

Regonizeletter uses environment variables for configuration.


    OCR_LANGUAGE deu
    OCR_DEBUG 0
    OCR_DEBUG_TIMEOUT 15000
    OCR_NITERS 30
    OCR_RELATIVEAREAMINIMUM 0.01
    OCR_RELATIVEAREAMAXIMUM 0.09
    OCR_CANNY_THRESH_LOW 150
    OCR_CANNY_THRESH_HIGH 255
    OCR_IMAGE_HIGH_SCALE 0.6
    OCR_ADDRESS_BLOCK_RATIO 0.5
    OCR_CODE_BLOCK_RATIO 0.75
