const fs = require('fs');
const path = require('path');
const userConfig = require('../user-config');
const rimraf = require("./rimraf");
const cache_folder_name = path.resolve(userConfig.cache_folder_name);
const util = require("../util");

let counter = 0;

function isSubDirectory(parent, child) {
    return path.relative(child, parent).startsWith('..');
}

function del(file){
    if(isSubDirectory(cache_folder_name, file)){
        const stat = fs.statSync(file);
        if(stat.isFile()){
            fs.unlinkSync(file);
        } else {
            //!!todo not empty folder
            try{
                fs.rmdirSync(file);
            }catch(e){
                rimraf(file, (err) =>{
                    if(err){
                        console.error(err);
                    }
                });
            }
        }

        counter++;
        if(counter % 20 === 0){
            console.log("delete:", counter);
        }
    } else {
        throw "try to delete non-cache file";
    }
}

const folders1 = fs.readdirSync(cache_folder_name);
folders1.forEach(p1 => {
    p1 = path.resolve(cache_folder_name, p1);
    const stat = fs.statSync(p1);
    if (stat.isFile()) {
        //nothing
    }else if(stat.isDirectory()){
        let subfiles = fs.readdirSync(p1);
        const noimages = subfiles.filter(e => !util.isImage(e));
        noimages.forEach(e => del(path.resolve(p1,e)));
        
        subfiles = subfiles.filter(e => util.isImage(e));
        util.sortFileNames(subfiles);
        if(subfiles.length > 3){
            for(let ii = 2; ii < subfiles.length; ii++){
                del(path.resolve(p1, subfiles[ii]));
            }
        } else if (subfiles.length === 0){
            del(p1);
        }
    }
});

console.log("done");