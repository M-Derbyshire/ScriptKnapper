import buildTemplateJSON from './buildTemplateJSON.js';

const inputBasicTemplate1Name = "test1";
const inputBasicTemplate1 = "test test test test";

const inputBasicTemplate2Name = "test2";
const inputBasicTemplate2 = String.raw`There once was a man from Nantucket.
He had a chicken nugget.
	He ate it neat.
	It tasted sweet.
Then he went and bought a whole bucket.`;
const inputBasicTemplate2Prepared = String.raw`There once was a man from Nantucket.\nHe had a chicken nugget.\n\tHe ate it neat.\n\tIt tasted sweet.\nThen he went and bought a whole bucket.`;

const inputBasicTemplate3Name = "test3";
const inputBasicTemplate3 = String.raw`There once was a man from Nantucket.
He had a chicken nugget.
	He ate it "quick".
	It tasted "sick".
Then he went and bought a whole bucket.`;
const inputBasicTemplate3Prepared = String.raw`There once was a man from Nantucket.\nHe had a chicken nugget.\n\tHe ate it \"quick\".\n\tIt tasted \"sick\".\nThen he went and bought a whole bucket.`;

const inputPreparedTemplateName = "testPrepared";
const inputPreparedTemplate = 'There once was a man from Nantucket.\nHe had a chicken nugget.\n\tHe ate it "quick".\n\tIt tasted "sick".\nThen he went and bought a whole bucket.';


test("buildTemplateJSON() will return an empty array string, if input array has 0 objects", () => {
	
	const result = buildTemplateJSON([]);
	expect(JSON.parse(result)).toEqual([]); //May have a new line, etc
});

test("buildTemplateJSON() will return json in the correct structure, with the given values, for 1 template", () => {
    
    const result = buildTemplateJSON([
		{ templateName: inputBasicTemplate1Name, template: inputBasicTemplate1 }
	]);
	
	expect(result).toEqual('[\n\t{ "name": "' + inputBasicTemplate1Name + '", "template": "' + inputBasicTemplate1 + '" }\n]');
    
});

test("buildTemplateJSON() will return json in the correct structure, with the given values, for all templates", () => {
    
    const result = buildTemplateJSON([
		{ templateName: "test1", template: inputBasicTemplate1 },
		{ templateName: "test2", template: inputBasicTemplate1 },
		{ templateName: "test3", template: inputBasicTemplate1 }
	]);
	
	expect(result).toEqual('[\n\t{ "name": "test1", "template": "' + inputBasicTemplate1 + '" },\n\t{ "name": "test2", "template": "' + inputBasicTemplate1 + '" },\n\t{ "name": "test3", "template": "' + inputBasicTemplate1 + '" }\n]');
    
});

test("buildTemplateJSON() will replace the whitespace, and escape double quotes, in the given templates if templatesAlreadyPrepared is false", () => {
    
    const result = buildTemplateJSON([
		{ templateName: inputBasicTemplate1Name, template: inputBasicTemplate1 },
		{ templateName: inputBasicTemplate2Name, template: inputBasicTemplate2 },
		{ templateName: inputBasicTemplate3Name, template: inputBasicTemplate3 }
	]);
	
	expect(result).toEqual('[\n\t{ "name": "' + inputBasicTemplate1Name + '", "template": "' + inputBasicTemplate1 + '" },\n\t{ "name": "' + inputBasicTemplate2Name + '", "template": "' + inputBasicTemplate2Prepared + '" },\n\t{ "name": "' + inputBasicTemplate3Name + '", "template": "' + inputBasicTemplate3Prepared + '" }\n]');
    
    
});

test("buildTemplateJSON() will not make replacements in the template if templatesAlreadyPrepared is true", () => {
    
    const result = buildTemplateJSON([{ templateName: inputPreparedTemplateName, template: inputPreparedTemplate }], true);
    
	expect(result).toEqual('[\n\t{ "name": "' + inputPreparedTemplateName + '", "template": "' + inputPreparedTemplate + '" }\n]');
	
});