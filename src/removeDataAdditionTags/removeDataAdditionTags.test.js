import removeDataAdditionTags from './removeDataAdditionTags';

test("removeDataAdditionTags will remove any data addition tags it finds in the string, if they're correct.", () => {
    
    const input = '{+ "test": "test1", "test": "test2" +} - testing -{+ "test": "test1", "test": "test2" +}- {+ "test": "test1", "test": "test2" +} ';
    
    const resultText = removeDataAdditionTags(input);
    
    expect(typeof resultText).toBe("string");
    expect(resultText).not.toContain('{+ "test": "test1", "test": "test2" +}');
    
    //Also want to be sure we're not leaving the outer characters of the removed substring.
    expect(resultText).not.toContain('{');
    expect(resultText).not.toContain('}');
    
    //The middle tag is surrounded by hyphens, so this makes sure surrounding text outside the tags isn't affected
    expect(resultText).toContain('--'); 
});

test("removeDataAdditionTags will return an error if the tags are not closed correctly.", () => {
    
    const input = 'Test {+ "test": "testing" not finished ';
    
    
    expect(() => {
		removeDataAdditionTags(input);
	}).toThrow(Exception);
    
});