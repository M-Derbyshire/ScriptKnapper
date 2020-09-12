import replaceSubstrings from '../replaceSubstrings/replaceSubstrings';

/*
    Inputs:
        - passedTemplateString: The string to be changed.
        - whitespaceChange: How should the whitespace (not including space 
                characters) in the string be handled? There are 4 options:
                    "none": Whitespace will not be changed.
                    "remove": Whitespace will just be removed.
                    "spaceReplace": Whitespace will be replaced with
                        space characters.
                    "escapeCodeReplace": Whitespace will be replaced with
                        escape codes (\n, \t, etc).
        - escapeDoubleQuotes: A boolean value. Should double-quote characters
                be escaped?
        - replaceTags: A boolean value. Should ScriptKnapper tags be replaced
                with their respective replacement strings?
            
    Output:
        - This function will return a string, that has been changed
            based on the input settings.
    
*/

function prepareTemplateString(passedTemplateString, whitespaceChange = "none", 
    escapeDoubleQuotes = false, replaceTags = false)
{
    let replacementOptions = []; //Add options to be given to the replaceSubstrings function.
    
    
    if(whitespaceChange !== "none")
    {
        if(whitespaceChange === "remove")
        {
            replacementOptions.push(
                { from: "\t", to: "" },
                { from: "\v", to: "" },
                { from: "\r", to: "" },
                { from: "\n", to: "" },
            );
        } 
        else if(whitespaceChange === "spaceReplace")
        {
            replacementOptions.push(
                { from: "\t", to: " " },
                { from: "\v", to: " " },
                { from: "\r", to: " " },
                { from: "\n", to: " " },
            );
        }
        else if(whitespaceChange === "escapeCodeReplace")
        {
            replacementOptions.push(
                { from: "\t", to: String.raw`\t` },
                { from: "\v", to: String.raw`\v` },
                { from: "\r", to: String.raw`\r` },
                { from: "\n", to: String.raw`\n` },
            );
        }
    }
    
    
    if(escapeDoubleQuotes)
    {
        replacementOptions.push(
            { from: '"', to: String.raw`\"` }
        );
    }
    
    if(replaceTags)
    {
        //The double braces need to be first (otherwise, "{:" will be replaced before "{{:",
        //which would result with "{{:" becoming "{@ohb:")
        replacementOptions.push(
            { from: "{{:", to: "@odhb:" },
            { from: ":}}", to: "@cdhb:" },
            { from: "{:", to: "@ohb:" },
            { from: ":}", to: "@chb:" },
            { from: "{+", to: "@ohb+" },
            { from: "+}", to: "@chb+" }
        );
    }
    
    
    return replaceSubstrings(passedTemplateString, replacementOptions);
}

export default prepareTemplateString;