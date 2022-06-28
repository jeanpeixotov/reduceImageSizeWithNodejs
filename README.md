# reduceImageSizeWithNodejs

Reduce size of images by quality percent

automation for non-technical people

![fausto](https://c.tenor.com/vdi4CK5kBjsAAAAC/faustao-faust%C3%A3o.gif)

### Tech
* Node 14.x 
* NPM 6.x
* Sheet Plugin
* MinImage Plugin
* Fs & Fs-extra

### Input and Output
  - Input images in rawImages if you want to run with manual input folder
  - Input sheet.xlsx file in root folder if you want to run with sheet automation 
    - Format of sheet - name and link to download of image

  - Output of process going to processedImages


### Instalation

https://nodejs.org/en/download/

### Run the worker

  - Required env - TYPE (sheet or folder)

  - Optional env - SIZE (in Mbs - default 0.1)

Run on bash or prompt inside the project
```bash
TYPE=X npm run worker
```
