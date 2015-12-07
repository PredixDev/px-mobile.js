// TODO: All interfaces defined here to ensure modules implement;
import Interface from './interface';

/**
 * All interfaces defined here to ensure modules implement;
 * @type {Object}
 */
const Interfaces = {};

/**
 * Database interface - All database adapters must implement this interface.
 * @interface IDBInterface
 * @type {Interface}
 */
Interfaces.IDBInterface = new Interface('IDBInterface', [
	'getAttachment', 'saveAttachment',
	'get', 'put', 'post', 'remove',
	'allDocs', 'bulkDocs', 'changes'
]);
/**
 * HTTP interface - All HTTP adapters must implement this interface.
 * @interface IHTTPInterface
 * @type {Interface}
 */
Interfaces.IHTTPInterface = new Interface('IHTTPInterface', [
	'get', 'put', 'post', 'delete', 'head', 'request'
]);

export default Interfaces;
