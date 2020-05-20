import findObjectStringLength from './findObjectStringLength';

test("findObjectStringLength will return the correct length of the object in a string", ()=> {
    
    const objectText = "{: 'data': { 'a': 'hello', 'b': 'goodbye' } :} goodbye";
    
    const result = findObjectStringLength(objectText);
    
    expect(result).toBe(46);
    
});

// -------------------------------------------------------------------------------------

test("findObjectStringLength will return -1 if given an incomplete object string", ()=> {
    
    const objectText = "{: 'data': { 'a': 'hello', 'b': 'goodbye' :}";
    
    const result = findObjectStringLength(objectText);
    
    expect(result).toBe(-1);
    
});

test("findObjectStringLength will return -1 if given an empty string, or one without any braces", ()=> {
    
    const objectText1 = "hello";
    const objectText2 = "";
    
    const result1 = findObjectStringLength(objectText1);
    const result2 = findObjectStringLength(objectText2);
    
    expect(result1).toBe(-1);
    expect(result2).toBe(-1);
    
});

// -------------------------------------------------------------------------------------

test("findObjectStringLength will return the correct length for a given single-layered object string", () => {
    
    const objectText = "{ 'foo': 'hello', 'bar': 'bye' }";
    
    const result = findObjectStringLength(objectText);
    
    expect(result).toBe(objectText.length);
    
});

test("findObjectStringLength will return the correct length for a given multi-layered object string", () => {
    
    const objectText = "{ 'foo': { 'bar': { 'baz': 'hello' } } }";
    
    const result = findObjectStringLength(objectText);
    
    expect(result).toBe(objectText.length);
    
});