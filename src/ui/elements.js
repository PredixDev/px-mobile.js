// TODO:
/*
The elements class includes all HTML elements compiled as JS.

var template = require("./template.jade");

document.getElementById("my-thing").innerHTML = template({
    localVar: "value",
    anotherOne: "another value"
});
*/
import BaseClass from '../base';
export default class Elements extends BaseClass{
	constructor(id, options){
		super(id, options);
		this.logger.logApi('constructor', id);


	}
}
