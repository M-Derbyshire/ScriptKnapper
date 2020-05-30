import resolveAllMarkupObjects from './resolveAllMarkupObjects';

const templateObjects = JSON.parse(String.raw`[
    {"name": "simpleTemplate","template": "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know."},
    {"name": "templateLayer2","template": "this is some more data here: {:data1:}"},
    {"name": "noDataTemplate","template": "I dont need any data."}, 
    {"name": "dataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\" +} addition. {:testProp:}"}, 
    {"name": "badDataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\"  addition."}
]`);

//-----------------------------------------------------------------------------------

test("resolveAllMarkupObjects will return results for each markup object it is given, and for each data object within those", () => {
    
    const templateName = "simpleTemplate";
    
    const markup1 = {
        template: templateName,
        data: [
            { data1: "theData1", data2: "theData2", data3: "theData3" },
            { data1: "theData4", data2: "theData5", data3: "theData6" },
        ]
    };
    
    const markup2 = {
        template: templateName,
        data: [
            { data1: "theData7", data2: "theData8", data3: "theData9" }
        ]
    };
    
    const markupObjects = [
        markup1,
        markup2
    ];
    
    const [resultError, resultText] = resolveAllMarkupObjects(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theData1");
    expect(resultText).toContain("theData2");
    expect(resultText).toContain("theData3");
    expect(resultText).toContain("theData4");
    expect(resultText).toContain("theData5");
    expect(resultText).toContain("theData6");
    expect(resultText).toContain("theData7");
    expect(resultText).toContain("theData8");
    expect(resultText).toContain("theData9");
});

test("resolveAllMarkupObjects will generate a template once, with an empty data object, if no data is given for it", () => {
    
    const templateName = "noDataTemplate";
    
    //Empty data array
    const markupObjects1 = [{
        template: templateName,
        data: []
    }];
    
    //No data property
    const markupObjects2 = [{
        template: templateName
    }];
    
    const [resultError1, resultText1] = resolveAllMarkupObjects(markupObjects1, templateObjects);
    expect(typeof resultError1).toBe("boolean");
    expect(typeof resultText1).toBe("string");
    expect(resultError1).toBeFalsy();
    expect(resultText1).toContain("I dont need any data."); //Found in the "noDataTemplate" template
    
    const [resultError2, resultText2] = resolveAllMarkupObjects(markupObjects2, templateObjects);
    expect(typeof resultError2).toBe("boolean");
    expect(typeof resultText2).toBe("string");
    expect(resultError2).toBeFalsy();
    expect(resultText2).toContain("I dont need any data.");
});

//-----------------------------------------------------------------------------------

test("resolveAllMarkupObjects will return an error caught by the checkForMarkupObjectError function", () => {
    
    //No template
    const markupObjects = [{
        data: [{}]
    }];
    
    const [resultError, resultText] = resolveAllMarkupObjects(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("resolveAllMarkupObjects will return an error if feedDataObjectsIntoTemplate() returns one", () => {
    
    //No data passed into this template
    const markupObjects = [{
        template: "simpleTemplate",
        data: [{}]
    }];
    
    const [resultError, resultText] = resolveAllMarkupObjects(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
    
});