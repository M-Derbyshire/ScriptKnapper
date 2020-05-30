import feedDataObjectsIntoTemplate from './feedDataObjectsIntoTemplate';

const templateObjects = JSON.parse(String.raw`[
    {"name": "simpleTemplate","template": "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know."},
    {"name": "templateLayer2","template": "this is some more data here: {:data1:}"},
    {"name": "noDataTemplate","template": "I dont need any data."}, 
    {"name": "dataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\" +} addition. {:testProp:}"}, 
    {"name": "badDataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\"  addition."}
]`);



test("feedDataObjectsIntoTemplate will call addDataObjectAdditionsFromTemplate() to add template data-additions to the data object, and then remove the tag", () => {
    
    const templateName = "dataAdditionTemplate";
    
    const thisTemplateObject = templateObjects.filter((template) => template.name === templateName)[0];
    
    const markupObjects = {
        template: templateName,
        data: [{}]
    };
    
    const [resultError, resultText] = feedDataObjectsIntoTemplate(thisTemplateObject, markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).not.toContain('{+ "testProp": "test" +}');
    expect(resultText).toContain("test");
    
});

test("feedDataObjectsIntoTemplate will return an error if addDataObjectAdditionsFromTemplate() returns an error", () => {
    
    const templateName = "badDataAdditionTemplate";
    
    const thisTemplateObject = templateObjects.filter((template) => template.name === templateName)[0];
    
    const markupObjects = {
        template: templateName,
        data: [{}]
    };
    
    const [resultError, resultText] = feedDataObjectsIntoTemplate(thisTemplateObject, markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

// ----------------------------------------------------

test("feedDataObjectsIntoTemplate will insert data that has been passed down from another template", () => {
    
    const templateName = "simpleTemplate";
    
    const thisTemplateObject = templateObjects.filter((template) => template.name === templateName)[0];
    
    const markupObjects = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: '{{: "template": "templateLayer2", "data": [{"data1": "hello, {:data3:}"}] :}}',
                data3: "theData3" 
            }
        ]
    };
    
    const [resultError, resultText] = feedDataObjectsIntoTemplate(thisTemplateObject, markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("hello, theData3");
});

test("feedDataObjectsIntoTemplate will resolve a parameter call correctly following more than one template call.", () => {
    
    //This was a debug in version 1.0, so adding this.
    //If this test fails, check populateTemplate() and see how
    // it is positioning the searchStartIndex after finding a 
    // template call
    
    const templateName = "simpleTemplate";
    const thisTemplateObject = templateObjects.filter((template) => template.name === templateName)[0];
    
    const markupObjects = {
        template: templateName,
        data: [
            { 
                data1: '{{: "template": "templateLayer2", "data": [{"data1": "theData1"}] :}}', 
                data2: '{{: "template": "templateLayer2", "data": [{"data1": "theData2"}] :}}',
                data3: "theData3"
            }
        ]
    };
    
    const [resultError, resultText] = feedDataObjectsIntoTemplate(thisTemplateObject, markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theData1");
    expect(resultText).toContain("theData2");
    expect(resultText).toContain("theData3");
});

// --------------------------------------------------------

test("feedDataObjectsIntoTemplate will return an error returned by populateTemplate()", () => {
    
    const templateName = "simpleTemplate";
    
    const thisTemplateObject = templateObjects.filter((template) => template.name === templateName)[0];
    
    const markupObjects = {
        template: templateName,
        data: [{}] //No data
    };
    
    const [resultError, resultText] = feedDataObjectsIntoTemplate(thisTemplateObject, markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
    
});

test("feedDataObjectsIntoTemplate will return an error returned by resolveInnerTemplateCalls()", () => {
    
    const templateName = "simpleTemplate";
    
    const thisTemplateObject = templateObjects.filter((template) => template.name === templateName)[0];
    
    const markupObjects = {
        template: templateName,
        data: [{
            data1: '{{: "template": "templateLayer2", "data": [{"data1": "theData1"}] ', //incomplete 
            data2: 'theData2',
            data3: "theData3"
        }]
    };
    
    const [resultError, resultText] = feedDataObjectsIntoTemplate(thisTemplateObject, markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
    
});