import populateTemplateWithGivenData from './populateTemplateWithGivenData';

const simpleTemplate = "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know.";
const templateName = "simpleTemplate";

// -----------------------------------------------------------------------------------------------------------------

test("populateTemplateWithGivenData will fill a template with simple strings as data (regardless of the whitespace in the braces)", () => {
    
    const data = {
        "data1": "testData1",
        "data2": "testData2",
        "data3": "testData3"
    };
    
    const resultText = populateTemplateWithGivenData(data, templateName, simpleTemplate);
    
    expect(typeof resultText).toBe("string");
    expect(resultText).toContain(data.data1);
    expect(resultText).toContain(data.data2);
    expect(resultText).toContain(data.data3);
});

test("populateTemplateWithGivenData will not attempt to resolve calls to other templates", () => {
    
    const data = {
        "data1": "testData1",
        "data2": '{{: "template": "otherTemplate", "data": [{ "data1": "dataHere" }] :}}',
        "data3": "testData3"
    };
    
    const resultText = populateTemplateWithGivenData(data, templateName, simpleTemplate);
    
    expect(typeof resultText).toBe("string");
    expect(resultText).toContain(data.data1);
    expect(resultText).toContain(data.data2);
    expect(resultText).toContain(data.data3);
});

// --------------------------------------------------------------------------------------------

test("populateTemplateWithGivenData will return an error if it cannot find the requested data in the dataObject", () => {
    
    const data = {
        "data1": "testData1",
        // no data2
        "data3": "testData3"
    };
    
	expect(() => {
		populateTemplateWithGivenData(data, templateName, simpleTemplate);
	}).toThrow(Error);
});

test("populateTemplateWithGivenData will return an error if given a data value that is not a string", () => {
    
    const data = {
        "data1": "testData1",
        "data2": 5,
        "data3": "testData3"
    };
    
    expect(() => {
		populateTemplateWithGivenData(data, templateName, simpleTemplate);
	}).toThrow(Error);
});