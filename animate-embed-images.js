/*!
 * Animate Embed Images, http://tpkn.me/
 */

const fs = require('fs');
const path = require('path');
const base64 = require('base64-img');

function AnimateEmbedImages(input_file, output_file){
   return new Promise((resolve, reject) => {
      let folder = input_file.replace(path.basename(input_file), '');
      let file_name, file_path, file_size, b64_img, b64_size;

      let images_list = [];
      let images_rule = /{(src(\s+)?\:(\s+)?)(['"]([^}]+?)['"])(.+?})/ig;

      fs.readFile(input_file, 'utf8', (err, data) => {
         if(err) return reject({status: 'fail', message: 'Can\'t open file', input_file: input_file, output_file: output_file});
         
         // Before doing some hard stuff, lets check if all images are exist
         let temp_obj;
         while((temp_obj = images_rule.exec(data)) !== null) {
            file_name = path.basename(temp_obj[5]);
            file_path = path.join(folder, temp_obj[5]);
            
            if(!fs.existsSync(file_path)){
               images_list.push({name: file_name, path: file_path});
            }
         }

         if(images_list.length){
            return reject({status: 'fail', message: 'Missing some images', input_file: input_file, output_file: output_file, images: images_list});
         }


         // Now the fun part!
         data = data.replace(images_rule, (match, p1, p2, p3, p4, p5, p6) => {
            file_name = path.basename(p5);
            file_path = path.join(folder, p5);
            file_size = fs.statSync(file_path).size;

            b64_img = base64.base64Sync(file_path);
            b64_size = Buffer.byteLength(b64_img, 'utf8');

            images_list.push({name: file_name, path: file_path, exist: 1, size: file_size, b64_size: b64_size});
            
            return '{type:createjs.AbstractLoader.IMAGE, ' + p1 + '"' + b64_img + '"' + p6;
         });


         if(images_list.length){
            if(typeof output_file !== 'string'){
               resolve({status: 'ok', message: 'Done', input_file: input_file, output_file: output_file, js_content: data, images: images_list});
            }else{
               fs.writeFile(output_file, data, 'utf8', err => {
                  if(err) return reject({status: 'fail', message: 'Can\'t write file', input_file: input_file, output_file: output_file});

                  resolve({status: 'ok', message: 'Done', input_file: input_file, output_file: output_file, js_content: data, images: images_list});
               });
            }
         }else{
            reject({status: 'fail', message: 'No images were found', input_file: input_file, output_file: output_file, images: images_list});
         }
      });
   });
}

module.exports = AnimateEmbedImages;
