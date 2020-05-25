/*
    Inputs:
        - message: A message to be included in the error.
        - templateName (optional): If this error occurred while working on a 
            template, the template name can be passed here, so the error
            can include it.
        - dataJSONString (optional): The JSON object (parsed to string), that
            contains the data that was being used to populate the template,
            so the error can include it.
            
    Output:
        - This function will return a string.
        - The string will contain the provided message within it.
        - If the templateName was provided, the string will reference this.
        - If the dataJSONString was provided, the string will reference this.
    
*/
function prepareErrorMessage(message, templateName = "", dataJSONString = "")
{
    let result = "TRANSPILATION ERROR\n\nError while transpiling script from provided JSON:\n\n";
    result += message + "\n\n";
    
    if(templateName !== "")
    {
        result += "Error occurred in the following template: " + templateName;
        
        //Only want one line break if dataJSONString has been provided as well,
        //but need to bear in mind that dataJSONString may have been provided
        //without templateName
        result += (dataJSONString === "") ? "\n\n" : "\n";
    }
    
    if(dataJSONString !== "")
    {
        result += "Error occurred with the following markup data: " + dataJSONString;
        result += "\n\n";
    }
    
    result += "Please correct these issues with the provided JSON, and then try again.";
    
    return result;
}

export default prepareErrorMessage;