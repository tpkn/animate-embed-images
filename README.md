# Animate. Embed Images

Module for Adobe Animate that inserts image assets inside js file

Helpful stuff when you need to get single html without external files. Maybe some day Adobe will add this feature.

![preview](https://raw.githubusercontent.com/tpkn/animate-embed-images/master/preview.png)


## Installation
```bash
npm install animate-embed-images
```


## Output example (part of...)
```javascript
lib.properties = {
   width: 300,
   height: 500,
   fps: 24,
   color: "#FFFFFF",
   opacity: 1.00,
   webfonts: {},
   manifest: [
      {type:createjs.AbstractLoader.IMAGE, src:"data:image/png;base64, ... ", id:"Bitmap1"},
      {type:createjs.AbstractLoader.IMAGE, src:"data:image/png;base64, ... ", id:"Bitmap2"},
      {type:createjs.AbstractLoader.IMAGE, src:"data:image/jpg;base64, ... ", id:"Bitmap3"},
   ],
   preloads: []
};
```

## Usage
```javascript
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const {table, getBorderCharacters} = require('table');
const AnimateEmbedImages = require('animate-embed-images');

glob('test/**/!(*.b64).js', (err, files) => {
   for(let i = 0, len = files.length; i < len; i++){
      let js_file = path.join(__dirname, files[i]);
      
      new AnimateEmbedImages(js_file, js_file.replace(/\.(js|html?)$/i, '.b64.$1'))
      .then(data => {
         let table_data = [[chalk.white.bold('N'), chalk.white.bold('SIZE (base64)'), chalk.white.bold('FILE')]];
         let diff_summ = 0;
         for(let i = 0, len = data.images.length; i < len; i++){
            let file = data.images[i];
            let diff = file.b64_size / 1024 || 0;
            diff_summ += diff;

            table_data.push([i + 1, chalk.yellow.bold(diff.toFixed(3) + ' KB'), file.name]);
         }

         console.log('');
         console.log(' ' + chalk.white.bgGreen.bold(' ' + data.message + ': '), chalk.white.bgBlue.bold(' +' + (diff_summ).toFixed(3) + ' KB '), path.basename(data.input_file));
         console.log(table(table_data, {columns: {0: {width: 3}, 1: {width: 15}, 2: {width: 50, truncate: 50}}, border: getBorderCharacters('ramac')}));
      })
      .catch(data => {
         let table_data = [[chalk.white.bold('N'), chalk.white.bold('SIZE'), chalk.white.bold('FILE')]];
         for(let i = 0, len = data.images.length; i < len; i++){
            let file = data.images[i];
            table_data.push([i + 1, '-', chalk.red.bold(file.name)]);
         }

         console.log('');
         console.log(' ' + chalk.white.bgMagenta.bold(' ' + data.message + ': '), path.basename(data.input_file));
         console.log(table(table_data, {columns: {0: {width: 3}, 1: {width: 15}, 2: {width: 50, truncate: 50}}, border: getBorderCharacters('ramac')}));
      });
   }
});
```


Callback data structure:
```code
{
   status         -> {String} 'ok' or 'fail'
   message        -> {String} Any text describing status
   input_file     -> {String} Source js file path
   output_file    -> {String} Output js file path
   js_content     -> {String} Modified js content
   images: [
      {
         name     -> {String} Image file name
         path     -> {String} Image path
         exist    -> {Number} 0 - if image does not exist
         size     -> {Number} Image file size (bytes)
         b64_size -> {Number} The size of the image in base64 format (bytes)
      }
   ]
}
```


## Changelog 
#### 2018-01-17:
- Removed images sorting. That was just for cosmetic purposes at the debug stage.

