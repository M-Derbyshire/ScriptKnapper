import mergeObjects from './mergeObjects';

test("mergeObjects will return an object with the same props/values as the 1 object it's given.", () => {
    
    const singleObject = {
        name: "name",
        age: 5
    }
    const result = mergeObjects([singleObject]);
    
    expect(result).toEqual(singleObject);
    
});

test("mergeObjects will return a completely new object that is a merge of 2 given objects (prioritising the values in the first)", () => {
    
    const priorityObject = {
        name: "NameWillBeMatthew",
        age: 5
    }
    
    const secondaryObject = {
        name: "NameWillNotBeDerek",
        rank: 10
    }
    
    const result = mergeObjects([
        priorityObject,
        secondaryObject
    ]);
    
    expect(result.name).toBe("NameWillBeMatthew");
    expect(result.age).toBe(5);
    expect(result.rank).toBe(10);
	expect(result === priorityObject).toBeFalsy();
	expect(result === secondaryObject).toBeFalsy();
    
});

test("merge objects will not edit the original objects", () => {
	
	const priName = "NameWillBeMatthew";
	const priAge = 5;
	const priorityObject = {
        name: priName,
        age: priAge
    }
    
	const secName = "NameWillNotBeDerek";
	const secRank = 10;
    const secondaryObject = {
        name: secName,
        rank: secRank
    }
    
    mergeObjects([
        priorityObject,
        secondaryObject
    ]);
	
	expect(priorityObject.hasOwnProperty("name")).toBeTruthy();
	expect(priorityObject.hasOwnProperty("age")).toBeTruthy();
	expect(priorityObject.name).toEqual(priName);
	expect(priorityObject.age).toEqual(priAge);
	expect(Object.keys(priorityObject).length).toBe(2);
	
	expect(secondaryObject.hasOwnProperty("name")).toBeTruthy();
	expect(secondaryObject.hasOwnProperty("rank")).toBeTruthy();
	expect(secondaryObject.name).toEqual(secName);
	expect(secondaryObject.rank).toEqual(secRank);
	expect(Object.keys(secondaryObject).length).toBe(2);
});

test("mergeObjects will return an object that is a merge of 3 given objects (prioritising the values by their order)", () => {
    
    const firstObject = {
        name: "NameWillBeMatthew",
        age: 5
    }
    
    const secondaryObject = {
        name: "NameWillNotBeDerek",
        age: 25,
        rank: 20
    }
    
    const thirdObject = {
        name: "NameWillNotBeJohn",
        rank: 10
    }
    
    const result = mergeObjects([
        firstObject,
        secondaryObject,
        thirdObject
    ]);
    
    expect(result.name).toBe("NameWillBeMatthew");
    expect(result.age).toBe(5);
    expect(result.rank).toBe(20);
    
});