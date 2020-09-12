import replaceSubstrings from '../replaceSubstrings/replaceSubstrings';

/*
    Inputs:
        - templates: An array of objects. Each object will have 2 properties:
			a "templateName" and a "template" (which is the text of the template).
		- templatesAlreadyPrepared: A boolean value. Has the template text already
			been prepared?
        
    Output:
        - This function will return a JSON string, which will contain all of the
			given templates, in the structure required by scriptKnapperMain(). 
			If templatesAlreadyPrepared is false, double quote characters will be 
			escaped, and whitespace characters (such as tabs and new-lines, 
			but not spaces) will be replaced with escape codes.
    
*/

function buildTemplateJSON(templates, templatesAlreadyPrepared = false)
{
	let result = "[";
	
	templates.forEach(template => {
		
		let templateText = template.template;
		
		if(!templatesAlreadyPrepared)
		{
			templateText = replaceSubstrings(
				templateText,
				[
					{ from: "\t", to: String.raw`\t` },
					{ from: "\v", to: String.raw`\v` },
					{ from: "\r", to: String.raw`\r` },
					{ from: "\n", to: String.raw`\n` },
					{ from: '"', to: String.raw`\"` }
				]
			);
		}
		
		//If this isn't the first element in the array, add a comma after the previous element
		if(result.charAt(result.length - 1) === "}") result += ",";
		
		result += '\n\t{ "name": "' + template.templateName + '", "template": "' + templateText + '" }';
	});
	
	return result + "\n]";
}

export default buildTemplateJSON;