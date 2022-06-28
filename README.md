# reduceImageSizeWithNodejs

Reduce size of images by quality percent

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

### Run the worker

  - Optional env - TYPE (sheet or folder - default sheet)

  - Optional env - SIZE (in Mbs - default 0.1)

```bash
TYPE=X npm run worker
```

![alt text](https://i.postimg.cc/x8kFf89V/Captura-de-Tela-2022-06-28-a-s-13-34-15.png)

