import resolveInnerTemplateCalls from './resolveInnerTemplateCalls';

const templateObjects = JSON.parse(String.raw`[
    {"name": "simpleTemplate","template": "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know."},
    {"name": "templateLayer2","template": "this is some more data here: {:data1:}"},
    {"name": "noDataTemplate","template": "I dont need any data."}, 
    {"name": "dataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\" +} addition. {:testProp:}"}, 
    {"name": "badDataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\"  addition."}
]`);



test("resolveInnerTemplateCalls will embed the results of an inner template into the result, when given one (returning results for all data objects passed)", () => {
    
    const dataObject = { 
        data1: "theData1"
    };
    
    const currentText = 'testTemplate: {{:"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData1" }, { "data1": "theEmbeddedData2" }] :}} - This is now the string again.';
    
    const resultText = resolveInnerTemplateCalls(currentText, dataObject, templateObjects);
    
    expect(typeof resultText).toBe("string");
    expect(resultText).toBe("testTemplate: this is some more data here: theEmbeddedData1this is some more data here: theEmbeddedData2 - This is now the string again.");
});



test("resolveInnerTemplateCalls will embed the results of a template call within a property, that's within an inner template call, into the result", () => {
    
    const dataObject = { 
        data1: "theData1", 
        embedLayer3Data: ' - {{: "template": "templateLayer2", "data": [{ "data1": "theDeepEmbeddedData" }] :}} - '
    };
    
    const currentText = '{{:"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData" }, { "data1": "{:embedLayer3Data:}" }] :}}';
    
    const resultText = resolveInnerTemplateCalls(currentText, dataObject, templateObjects);
    
    expect(typeof resultText).toBe("string");
    expect(resultText).toBe("this is some more data here: theEmbeddedDatathis is some more data here:  - this is some more data here: theDeepEmbeddedData - ");
});



test("resolveInnerTemplateCalls will return an error if a given template request object isn't complete", () => {
    
    const dataObject = { 
        data1: "theData1"
    };
    
    const currentText = 'testTemplate: {{:"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData1" THERE SHOULD BE A CLOSE BRACE HERE, { "data1": "theEmbeddedData2" }] :}} - This is now the string again. ';
    
	const willThrow = () => {
		resolveInnerTemplateCalls(currentText, dataObject, templateObjects);
	};
	
    expect(willThrow).toThrow(Error);
	expect(willThrow).toThrow(/Embedded template object is invalid/);
});



test("resolveInnerTemplateCalls will return an error if a given template request object can't be parsed", () => {
    
    const dataObject = { 
        data1: "theData1"
    };
    
    const currentText = "testTemplate: {{: sjdhfsjdhfkjsdhf :}} - This is now the string again. ";
    
	const willThrow = () => {
		resolveInnerTemplateCalls(currentText, dataObject, templateObjects);
	};
	
    expect(willThrow).toThrow(Error);
	expect(willThrow).toThrow(/Embedded template object is invalid/);
});

test("resolveInnerTemplateCalls will return an error if a given template request object has an unclosed inner-template call", () => {
    
    const dataObject = { 
        data1: "theData1"
    };
    
    const currentText = "testTemplate: {{: \"template\": \"templateLayer2\", \"data\": \"fjsfskdhf\" - Didn't close that remplate. ";
    
	const willThrow = () => {
		resolveInnerTemplateCalls(currentText, dataObject, templateObjects);
	};
	
    expect(willThrow).toThrow(Error);
	expect(willThrow).toThrow(/Embedded template object is invalid or incomplete/);
});
