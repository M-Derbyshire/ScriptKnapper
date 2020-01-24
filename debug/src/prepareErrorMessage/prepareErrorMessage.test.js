import prepareErrorMessage from './prepareErrorMessage';

test("prepareErrorMessage will return a string, and it will contain the given message.", () => {
    
    const message = "test message";
    
    const result = prepareErrorMessage(message);
    
    expect(result.includes(message)).toBeTruthy();
});

test("prepareErrorMessage's result will contain the given templateName, if one is provided.", () => {
    
    const message = "test message";
    const templateName = "template";
    
    const result = prepareErrorMessage(message, templateName);
    
    expect(result.includes(message)).toBeTruthy();
    expect(result.includes(templateName)).toBeTruthy();
});

test("prepareErrorMessage's result will contain the given dataJSONString, if one is provided.", () => {
    
    const message = "test message";
    const dataJSONString = '{ "data": "test" }';
    
    const result = prepareErrorMessage(message, dataJSONString);
    
    expect(result.includes(message)).toBeTruthy();
    expect(result.includes(dataJSONString)).toBeTruthy();
});