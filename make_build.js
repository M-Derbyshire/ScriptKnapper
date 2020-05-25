//--silent or -s arguments can be used to overwrite the current build file without a warning

const fs = require('fs');
const readline = require('readline-sync');
const inSilentMode = (process.argv[2] === "--silent" || process.argv[2] === "-s");
const logIfNotSilent = (message) => { if(!inSilentMode) console.log(message); }
let config;

try 
{
    config = JSON.parse(fs.readFileSync("./build_config.json", "utf-8")); //Won't cache like require
}
catch(err)
{
    console.log("Error loading build_config.json: " + err);
    process.exit(1);
}


const exitIfDirectoryNotAccessible = (path, directoryType) => {
    try{
        fs.accessSync(path);
    }
    catch(err)
    {
        console.log(`Sorry, but the configured ${directoryType} directory either doesn't exist, or you do not have the correct permissions to access it.`);
        process.exit(2);
    }
};

exitIfDirectoryNotAccessible(config.sourceDirectory, "source");
exitIfDirectoryNotAccessible(config.buildDirectory, "build");




//Do we want to just overwrite the current build file?
if(fs.existsSync(config.buildDirectory + "/" + config.buildFileName) && !inSilentMode)
{
    let overwritePermission = "";
    
    while(overwritePermission !== 'y' && overwritePermission !== 'n')
    {
        overwritePermission = readline.question(`The build file (${config.buildDirectory}/${config.buildFileName}) already exists. Do you want to overwrite it? `);
        overwritePermission = overwritePermission.toLowerCase();
    }
    
    if(overwritePermission === "n")
    {
        console.log("Build has been cancelled.");
        process.exit(0);
    }
}



//Load in all of the src .js files (not including tests)
const loadSourceFilesIntoArray = (path) => { //recursively go through folders and get js files
    
    let srcFileContents = [];
    let fullDirectoryList = fs.readdirSync(path);
    
    fullDirectoryList.forEach((item) => {
        
        if(fs.lstatSync(path + "/" + item).isDirectory())
        {
            srcFileContents.push(...loadSourceFilesIntoArray(path + "/" + item));
        }
        else
        {
            if(!item.endsWith(".test.js")) //don't include tests
            {
                let fullFilePath = path + "/" + item;
                logIfNotSilent("Loading " + fullFilePath);
                srcFileContents.push(fs.readFileSync(fullFilePath, "utf-8"));
            }
        }
    });
    
    return srcFileContents;
};

const srcFiles = loadSourceFilesIntoArray(config.sourceDirectory);




//Remove any comments from the files, if the config says to do so. Also remove imports and exports.
let buildLines = []; //This will be an array of lines, to make handling import/export/comment removal easier
srcFiles.forEach((currentFile) => {
    
    //first, find and get rid of multi-line comments, if we need to
    if(config.removeMultiLineComments)
    {
        while(currentFile.includes("/*"))
        {
            let commentStart = currentFile.indexOf("/*");
            let commentLength = currentFile.substring(commentStart).indexOf("*/");
            currentFile = currentFile.substring(0, commentStart) + currentFile.substring(commentStart + commentLength + 2);
        }
    }
    
    //Now split the file into lines, but ignore the import lines (and maybe also single line comments)
    let fileLines = currentFile.split(/\r?\n/);
    fileLines.forEach((line) => {
        if(!line.startsWith("import") && !line.startsWith("export") && (!config.removeSingleLineComments || !line.startsWith("//")))
        {
            //Lines may still contain single line comments at the ends
            if(line.includes("//") && config.removeSingleLineComments)
            {
                line = line.substring(0, line.indexOf("//"));
            }
            
            buildLines.push(line);
        }
    });
    
    buildLines.push("\n\n"); //add a couple of line breaks after each file
});




//We want to add in the lines for the opening comment.
//Technically it's not necessary to split the opening comment into lines, but we will so that the
//buildLines array still contains what its name says it does.
buildLines.unshift("/*\n", ...config.openingComment.split(/\r?\n/), "\n*/");
logIfNotSilent("Build file is now ready to be saved.");





//Now save the new build file (if it already exists, replace it)
try{
    fs.writeFileSync(config.buildDirectory + "/" + config.buildFileName, buildLines.join("\n"));
}
catch(err)
{
    console.log("Error saving new build file: " + err);
}

logIfNotSilent("Build successful.");