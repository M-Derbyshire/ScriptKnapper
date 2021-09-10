import addDataObjectAdditionsFromTemplate from './addDataObjectAdditionsFromTemplate';

test("addDataObjectAdditionsFromTemplate will return an error if the addition tag doesn't have an end", () => {
    
    const template = 'Test. {+ "newData": "some new data" '; //Not ended with +}
    const dataObject = {
        someData: "some current data"
    };
	
	expect(() => {
		addDataObjectAdditionsFromTemplate(dataObject, template);
	}).toThrow(Exception);
});


test("addDataObjectAdditionsFromTemplate will return an error if the addition tag doesn't contain a valid object", () => {
    
    const template = 'Test. {+ jhsjdkfhjkdhfjshfjkshf +}';
    const dataObject = {
        someData: "some current data"
    };
    
    expect(() => {
		addDataObjectAdditionsFromTemplate(dataObject, template);
	}).toThrow(Exception);
});


test("addDataObjectAdditionsFromTemplate will return the object with both old and new data, when the addition works", () => {
    
    const template = 'Test. {+ "newData": "some new data" +}';
    const dataObject = {
        someData: "some current data"
    };
    
    const result = addDataObjectAdditionsFromTemplate(dataObject, template);
    
    expect(result.hasOwnProperty("someData")).toBeTruthy();
    expect(result.someData).toBe("some current data");
    expect(result.hasOwnProperty("newData")).toBeTruthy();
    expect(result.newData).toBe("some new data");
})


test("addDataObjectAdditionsFromTemplate will return an object with data from multiple tags", () => {
    
    const template = '{+ "newData1": "some new data" +} Test. {+ "newData2": "some other data" +}';
    const dataObject = {
        someData: "some current data"
    };
    
    const result = addDataObjectAdditionsFromTemplate(dataObject, template);
    
    expect(result.hasOwnProperty("someData")).toBeTruthy();
    expect(result.someData).toBe("some current data");
    expect(result.hasOwnProperty("newData1")).toBeTruthy();
    expect(result.newData1).toBe("some new data");
    expect(result.hasOwnProperty("newData2")).toBeTruthy();
    expect(result.newData2).toBe("some other data");
})


test("If the data object already contains this property, addDataObjectAdditionsFromTemplate will replace with the new value", () => {
    
    const template = 'Test. {+ "someData": "some new data" +}';
    const dataObject = {
        someData: "some current data"
    };
    
    const result = addDataObjectAdditionsFromTemplate(dataObject, template);
    
    expect(result.hasOwnProperty("someData")).toBeTruthy();
    expect(result.someData).toBe("some new data");
})