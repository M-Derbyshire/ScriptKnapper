import populateTemplate from './populateTemplate';

const templates = JSON.parse('[{"name": "simpleTemplate","template": "this is { data1 }, and that is {data2}, and over there is {data3 }. Watch out for @ohb and @chb, you know."},{"name": "templateLayer2","template": "this is some more data here: {data1}"}]');

const dummyDataHandlerFunc = (dataObjects, templateObjects, isInnerTemplate = false) => {
    let resultText = "";
    
    for(let dataI = 0; dataI < dataObjects.length; dataI++)
    {
        let [dataError, dataText] = populateTemplate(dataObjects[dataI].data, dataObjects[dataI].template, templateObjects, dummyDataHandlerFunc, isInnerTemplate);
        if (dataError)
        {
            return [dataError, dataText];
        }
        else
        {
            resultText += dataText;
        }
    }
    
    return [false, resultText];
}

// -----------------------------------------------------------------------------------------------------------------

test("populateTemplate will return an error if it cannot find the requested template", () => {
    const data = {
        "data1": "testData1",
        "data2": "testData2",
        "data3": "testData3"
    };
    
    const templateName = "nonexistentTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

// -----------------------------------------------------------------------------------------------------------------

test("populateTemplate will fill a template with simple strings as data (regardless of the whitespace in the braces)", () => {
    
    const data = {
        "data1": "testData1",
        "data2": "testData2",
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    
    expect(resultText).toContain(data.data1);
    expect(resultText).toContain(data.data2);
    expect(resultText).toContain(data.data3);
});

test("populateTemplate will insert data where the property call has been passed down to another template", () => {
    
    const data = {
        "data1": "testData1",
        "data2": '{{ "template": "templateLayer2", "data": [{"data1": "hello, {data3}"}] }}',
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    console.log(resultText);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("hello, testData3");
});

// --------------------------------------------------------------------------------------------

test("populateTemplate will return an error if it cannot find the requested data in the dataObject", () => {
    
    const data = {
        "data1": "testData1",
        // no data2
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("populateTemplate will return an error if given a data value that is not a string", () => {
    
    const data = {
        "data1": "testData1",
        "data2": 5,
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

// -------------------------------------------------------------------------------------------------------

test("populateTemplate will embed the results of another template into the result, when given one (even with other text around it)", () => {
    
    const data = {
        "data1": "testData1",
        "data2": 'testTemplate: {{"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData1" }, { "data1": "theEmbeddedData2" }] }} - This is now the string again. ',
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theEmbeddedData1");
    expect(resultText).toContain("theEmbeddedData2");
});

test("populateTemplate will return an error if a given embedded template request object isn't complete", () => {
    
    const data = {
        "data1": "testData1",
        "data2": 'testTemplate: {{"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData1" THERE SHOULD BE A CLOSE BRACE HERE, { "data1": "theEmbeddedData2" }] }} - This is now the string again. ',
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("populateTemplate will return an error if a given embedded template request object can't be parsed", () => {
    
    const data = {
        "data1": "testData1",
        "data2": "testTemplate: {{ sjdhfsjdhfkjsdhf }} - This is now the string again. ",
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("populateTemplate will return an error if a given embedded template request object doesn't have the right properties", () => {
    
    // No data
    const data1 = {
        "data1": "testData1",
        "data2": 'testTemplate: {{"template": "templateLayer2" }} - This is now the string again. ',
        "data3": "testData3"
    };
    
    // No template
    const data2 = {
        "data1": "testData1",
        "data2": 'testTemplate: {{ "data": [{ "data1": "theEmbeddedData1" }, { "data1": "theEmbeddedData2" }] }} - This is now the string again. ',
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError1, resultText1] = populateTemplate(data1, templateName, templates, dummyDataHandlerFunc);
    const [resultError2, resultText2] = populateTemplate(data2, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError1).toBe("boolean");
    expect(typeof resultText1).toBe("string");
    expect(typeof resultError2).toBe("boolean");
    expect(typeof resultText2).toBe("string");
    
    expect(resultError1).toBeTruthy();
    expect(resultError2).toBeTruthy();
});

// --------------------------------------------------------------------------------------

test("populateTemplate replace any @ohb/@chb in the template or data with open/closing handlebars", () => {
    
    const data = {
        "data1": "testData1",
        "data2": "@ohb testData2 @chb",
        "data3": "testData3"
    };
    
    const templateName = "simpleTemplate";
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).not.toContain("@ohb");
    expect(resultText).not.toContain("@chb");
    expect(resultText).toContain("{");
    expect(resultText).toContain("}");
});

test("populateTemplate will not return { or } in its string if @ohb/@chb haven't been used", () => {
    
    const data = {
        "data1": "testData1"
    };
    
    const templateName = "templateLayer2"; //This template doesn't use @ohb/@chb
    
    const [resultError, resultText] = populateTemplate(data, templateName, templates, dummyDataHandlerFunc);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).not.toContain("{");
    expect(resultText).not.toContain("}");
});